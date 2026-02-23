import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/router";
import { fetchAuthSession, fetchUserAttributes } from "@aws-amplify/auth";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { fetchBackend } from "@/lib/db";
import Link from "next/link";
import PageLoadingState from "@/components/Common/PageLoadingState";
import { useForm, FormProvider } from "react-hook-form";
import MembershipFormSection, {
  MembershipFormValues,
} from "@/components/SignUpForm/MembershipFormSection";

const validationSchema = z
  .object({
    email: z.string().email("Invalid email address"),
    firstName: z.string().min(1, "First name is required"),
    lastName: z.string().min(1, "Last name is required"),
    education: z.string().min(1, "Education selection is required"),
    studentNumber: z.string().optional(),
    pronouns: z.string().min(1, "Please select your pronouns"),
    levelOfStudy: z.string().min(1, "Level of study is required"),
    faculty: z.string().min(1, "Faculty is required"),
    major: z.string().min(1, "Major is required"),
    internationalStudent: z
      .string()
      .min(1, "Please specify if you are an international student"),
    previousMember: z
      .string()
      .min(1, "Please specify if you were a previous member"),
    dietaryRestrictions: z.string().min(1, "Dietary restrictions are required"),
    referral: z.string().min(1, "Referral source is required"),
    topics: z.array(z.string()),
  })
  .refine(
    (data) =>
      data.education === "UBC"
        ? !!data.studentNumber && /^\d{8}$/.test(data.studentNumber)
        : true,
    {
      message: "Student number must be an 8 digit number for UBC students",
      path: ["studentNumber"],
    },
  );

const Membership: React.FC = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUser, setIsUser] = useState(false);

  const router = useRouter();
  const hasRedirectedRef = useRef(false); // prevent double-redirect

  const methods = useForm<MembershipFormValues>({
    resolver: zodResolver(validationSchema),
    defaultValues: {
      email: "",
      firstName: "",
      lastName: "",
      education: "",
      studentNumber: "",
      pronouns: "",
      levelOfStudy: "",
      faculty: "",
      major: "",
      internationalStudent: "",
      previousMember: "",
      dietaryRestrictions: "None",
      referral: "",
      topics: [],
    },
  });

  useEffect(() => {
    let cancelled = false;

    const checkUserAndGetEmail = async () => {
      if (!router.isReady) return;

      // auth check, should redirect to /login on error
      try {
        // 1. sign-in check
        const session = await fetchAuthSession();
        const isSignedIn = !!session?.tokens?.accessToken;
        if (!isSignedIn) {
          if (!hasRedirectedRef.current) {
            hasRedirectedRef.current = true;
            await router.replace("/login");
          }
          return;
        }

        // 2.now safe to read attributes
        const attributes = await fetchUserAttributes();
        const userEmail = attributes?.email || "";
        if (!userEmail) {
          if (!hasRedirectedRef.current) {
            hasRedirectedRef.current = true;
            await router.replace("/login");
          }
          return;
        }

        setEmail(userEmail);
        methods.setValue("email", userEmail);
      } catch (error) {
        // Treat any error as unauthenticated -> go to login
        if (!hasRedirectedRef.current) {
          hasRedirectedRef.current = true;
          await router.replace("/login");
        }
        return;
      }

      // backend profile check, should NOT redirect to /login on error
      try {
        // 3.backend profile/membership
        const userProfile = await fetchBackend({
          endpoint: `/users/self`,
          method: "GET",
        });

        if (userProfile?.isMember) {
          const redirectUrl = (router.query.redirect as string) || "/";
          if (!hasRedirectedRef.current) {
            hasRedirectedRef.current = true;
            await router.replace(redirectUrl);
          }
          return;
        }

        // Not a member -> render form
        setIsUser(true);
        setLoading(false);
      } catch (error) {
        // Don't redirect, avoid infinite loop
      } finally {
        if (!cancelled) {
          const t = setTimeout(() => setLoading(false), 1000);
          return () => clearTimeout(t);
        }
      }
    };

    checkUserAndGetEmail();
    const safety = setTimeout(() => setLoading(false), 8000);
    return () => {
      cancelled = true;
      clearTimeout(safety);
    };
  }, [router, methods]);

  const onSubmit = async (values: MembershipFormValues) => {
    setIsSubmitting(true);
    const topicsString = values.topics.join(",");

    const userBody = {
      email,
      fname: values.firstName,
      lname: values.lastName,
      studentId: values.studentNumber,
      gender: values.pronouns,
      education: values.education,
      faculty: values.faculty,
      major: values.major,
      diet: values.dietaryRestrictions || "None",
      year: values.levelOfStudy,
      international: values.internationalStudent === "Yes",
      prev_member: values.previousMember === "Yes",
      isMember: true,
      admin: email.toLowerCase().endsWith("@ubcbiztech.com"),
    };

    try {
      if (userBody.admin) {
        await Promise.all([
          fetchBackend({
            endpoint: "/members",
            method: "POST",
            data: {
              email: userBody.email,
              education: userBody.education,
              first_name: userBody.fname,
              last_name: userBody.lname,
              pronouns: userBody.gender,
              student_number: userBody.studentId,
              faculty: userBody.faculty,
              year: userBody.year,
              major: userBody.major,
              prev_member: userBody.prev_member,
              international: userBody.international,
              topics: topicsString,
              heard_from: values.referral,
              diet: userBody.diet,
              admin: userBody.admin,
            },
          }),
          fetchBackend({
            endpoint: isUser ? `/users/${userBody.email}` : "/users",
            method: isUser ? "PATCH" : "POST",
            data: { ...userBody, admin: undefined },
          }),
        ]);

        await fetchBackend({ endpoint: "/profiles", method: "POST" });
        router.push(`/`);
      } else {
        const paymentBody = {
          paymentName: "BizTech Membership",
          paymentImages: ["https://imgur.com/TRiZYtG.png"],
          paymentType: isUser ? "Member" : "OAuthMember",
          success_url:
            process.env.NEXT_PUBLIC_REACT_APP_STAGE === "local"
              ? "http://localhost:3000/"
              : process.env.NEXT_PUBLIC_REACT_APP_STAGE === "staging"
                ? "https://dev.v2.ubcbiztech.com/"
                : "https://app.ubcbiztech.com/",
          cancel_url:
            (process.env.NEXT_PUBLIC_REACT_APP_STAGE === "local"
              ? "http://localhost:3000/"
              : process.env.NEXT_PUBLIC_REACT_APP_STAGE === "staging"
                ? "https://dev.v2.ubcbiztech.com/"
                : "https://app.ubcbiztech.com/") + "membership",
          education: userBody.education,
          student_number: userBody.studentId,
          fname: userBody.fname,
          lname: userBody.lname,
          major: userBody.major,
          email: userBody.email,
          year: userBody.year,
          faculty: userBody.faculty,
          pronouns: userBody.gender,
          diet: userBody.diet,
          prev_member: userBody.prev_member,
          international: userBody.international,
          referral: values.referral,
          topics: topicsString,
        };

        const response = await fetchBackend({
          endpoint: "/payments",
          method: "POST",
          data: paymentBody,
        });

        window.open(response, "_self");
      }
    } catch (error) {
      console.error("Error during submission:", error);
      alert("An error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <PageLoadingState />
      </div>
    );
  }

  return (
    <FormProvider {...methods}>
      <div className="flex min-h-screen flex-1 flex-col justify-center py-8 px-4 sm:px-6 lg:px-8 bg-bt-blue-600">
        <form
          className="max-w-xl mx-auto mt-12 px-4"
          onSubmit={methods.handleSubmit(onSubmit)}
        >
          <div className="space-y-12">
            <div className="border-b border-white/10 pb-12 text-center">
              <h2 className="text-base font-semibold leading-7 text-white">
                Create your user!
              </h2>
              <p className="mt-8 text-sm leading-6 text-white">
                Create an account to sign up for our events and become a BizTech
                member.
              </p>
              <div className="mt-6 flex flex-row gap-4">
                <Link
                  href="/login?clearAuth=1"
                  className="text-sm leading-6 text-bt-green-300 underline"
                >
                  Back to Login Page
                </Link>
                <Link
                  href={
                    typeof router.query.redirect === "string"
                      ? router.query.redirect
                      : "/events"
                  }
                  className="text-sm leading-6 text-bt-green-300 underline"
                >
                  Continue as Guest
                </Link>
              </div>
            </div>

            <MembershipFormSection
              control={methods.control}
              watch={methods.watch}
            />
          </div>

          <div className="mt-6 flex items-center justify-end gap-x-6">
            <button
              type="submit"
              className="rounded-md bg-bt-green-300 px-3 py-2 text-sm font-semibold text-bt-blue-500 shadow-sm hover:bg-bt-green-500"
              disabled={isSubmitting}
            >
              {email.toLowerCase().endsWith("@ubcbiztech.com")
                ? "Create Membership"
                : "Proceed to Payment"}
            </button>
          </div>
        </form>
      </div>
    </FormProvider>
  );
};

export default Membership;
