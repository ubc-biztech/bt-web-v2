import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/router";
import { fetchAuthSession, fetchUserAttributes } from "@aws-amplify/auth";
import { zodResolver } from "@hookform/resolvers/zod";
import { fetchBackend } from "@/lib/db";
import { getQueryString } from "@/util/url";
import Link from "next/link";
import PageLoadingState from "@/components/Common/PageLoadingState";
import { useForm, FormProvider } from "react-hook-form";
import MembershipFormSection, {
  MembershipFormValues,
} from "@/components/SignUpForm/MembershipFormSection";
import { useToast } from "@/components/ui/use-toast";
import { Toaster } from "@/components/ui/toaster";
import {
  membershipValidationSchema,
  MEMBERSHIP_FORM_DEFAULTS,
} from "@/components/SignUpForm/membershipFormSchema";
import { checkMembership } from "@/lib/membership";
import { ArrowLeft, UserRound } from "lucide-react";
import { ensureAuthenticatedUser } from "@/lib/user";

const Membership: React.FC = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUser, setIsUser] = useState(false);

  const router = useRouter();
  const { toast } = useToast();
  const hasRedirectedRef = useRef(false); // prevent double-redirect

  const methods = useForm<MembershipFormValues>({
    resolver: zodResolver(membershipValidationSchema),
    defaultValues: MEMBERSHIP_FORM_DEFAULTS,
  });

  useEffect(() => {
    let cancelled = false;

    const checkUserAndGetEmail = async () => {
      if (!router.isReady) return;
      let userEmail = "";

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
        userEmail = attributes?.email || "";
        if (!userEmail) {
          if (!hasRedirectedRef.current) {
            hasRedirectedRef.current = true;
            await router.replace("/login");
          }
          return;
        }

        setEmail(userEmail);
        methods.setValue("email", userEmail);
        await ensureAuthenticatedUser();
      } catch (error) {
        // Treat any error as unauthenticated -> go to login
        if (!hasRedirectedRef.current) {
          hasRedirectedRef.current = true;
          await router.replace("/login");
        }
        return;
      }

      // Membership and user records are checked independently.
      try {
        const [hasMembership, userExists] = await Promise.all([
          checkMembership(userEmail),
          fetchBackend({
            endpoint: `/users/check/${userEmail}`,
            method: "GET",
            authenticatedCall: false,
          }),
        ]);

        if (hasMembership) {
          const redirectUrl = getQueryString(router.query.redirect) ?? "/";
          if (!hasRedirectedRef.current) {
            hasRedirectedRef.current = true;
            await router.replace(redirectUrl);
          }
          return;
        }

        // Not a member -> render form
        setIsUser(userExists === true);
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
      admin: email.toLowerCase().endsWith("@ubcbiztech.com"),
    };

    try {
      await fetchBackend({
        endpoint: "/profiles",
        method: "POST",
        data: { ...values },
      });

      if (userBody.admin) {
        await fetchBackend({
          endpoint: "/members/grant",
          method: "POST",
          data: {
            email: userBody.email,
            firstName: userBody.fname,
            lastName: userBody.lname,
            studentNumber: userBody.studentId,
            education: userBody.education,
            pronouns: userBody.gender,
            levelOfStudy: userBody.year,
            faculty: userBody.faculty,
            major: userBody.major,
            internationalStudent: userBody.international,
            previousMember: userBody.prev_member,
            dietaryRestrictions: userBody.diet,
            referral: values.referral,
            topics: topicsString,
          },
        });

        const redirectUrl = getQueryString(router.query.redirect) ?? "/";
        window.location.assign(redirectUrl);
        return;
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
      toast({
        variant: "destructive",
        title: "An error occurred. Please try again.",
      });
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
      <Toaster />
      <div className="flex min-h-screen flex-1 flex-col justify-center py-8 px-4 sm:px-6 lg:px-8 bg-bt-blue-600">
        <form
          className="max-w-xl mx-auto mt-12 px-4"
          onSubmit={methods.handleSubmit(onSubmit)}
        >
          <div className="space-y-6">
            <div className="border-b border-white/10 pb-6 text-center">
              <h2 className="text-base font-semibold leading-7 text-white">
                Create your user!
              </h2>
              <p className="mt-8 text-sm leading-6 text-white">
                Create an account to sign up for our events and become a BizTech
                member.
              </p>

              <div className="mt-6 rounded-lg border border-bt-blue-300 bg-bt-blue-500/40 p-4 text-left">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-bt-green-300/40 text-bt-green-300">
                    <UserRound
                      aria-hidden="true"
                      className="h-6 w-6"
                      strokeWidth={2}
                    />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold leading-6 text-white">
                      Not a member?
                    </h3>
                    <p className="text-xs leading-5 text-bt-blue-0">
                      Attend eligible events as a guest.
                    </p>
                  </div>
                </div>

                <Link
                  href={getQueryString(router.query.redirect) ?? "/events"}
                  className="mt-4 flex w-full items-center justify-center gap-2 rounded-md bg-bt-green-300 px-3 py-2 text-sm font-semibold text-bt-blue-500 shadow-sm hover:bg-bt-green-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bt-green-0 focus-visible:ring-offset-2 focus-visible:ring-offset-bt-blue-600"
                >
                  <UserRound
                    aria-hidden="true"
                    className="h-5 w-5"
                    strokeWidth={2}
                  />
                  <span>Continue as Guest</span>
                </Link>
              </div>

              <Link
                href="/login?clearAuth=1"
                className="mx-auto mt-4 inline-flex items-center gap-2 text-xs text-bt-blue-100 hover:text-white focus-visible:outline-none focus-visible:underline"
              >
                <ArrowLeft
                  aria-hidden="true"
                  className="h-4 w-4"
                  strokeWidth={2}
                />
                <span>Back to Login Page</span>
              </Link>
            </div>

            <MembershipFormSection
              control={methods.control}
              watch={methods.watch}
              disableEmail={true}
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
