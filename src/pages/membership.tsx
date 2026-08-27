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
import { ArrowLeft } from "lucide-react";
import { ensureAuthenticatedUser, needsOnboarding } from "@/lib/user";
import { User } from "@/types";

const Membership: React.FC = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [checkoutError, setCheckoutError] = useState(false);

  const router = useRouter();
  const isOnboarding = router.pathname === "/onboarding";
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

      // Onboarding is required before optional membership checkout.
      try {
        const hasMembership = await checkMembership(userEmail);

        if (hasMembership && !isOnboarding) {
          const redirectUrl = getQueryString(router.query.redirect) ?? "/";
          if (!hasRedirectedRef.current) {
            hasRedirectedRef.current = true;
            await router.replace(redirectUrl);
          }
          return;
        }

        if (!isOnboarding) {
          const user: User = await fetchBackend({
            endpoint: "/users/self",
            method: "GET",
          });
          if (needsOnboarding(user)) {
            await router.replace("/onboarding?redirect=%2Fmembership");
            return;
          }
          const baseUrl =
            process.env.NEXT_PUBLIC_REACT_APP_STAGE === "local"
              ? "http://localhost:3000/"
              : process.env.NEXT_PUBLIC_REACT_APP_STAGE === "staging"
                ? "https://dev.v2.ubcbiztech.com/"
                : "https://app.ubcbiztech.com/";

          if (user.admin) {
            await fetchBackend({
              endpoint: "/members/grant",
              method: "POST",
              data: {
                email: user.email ?? user.id,
                firstName: user.fname ?? "",
                lastName: user.lname ?? "",
                studentNumber: user.studentId ?? "",
                education: user.education ?? "",
                pronouns: user.gender ?? "",
                levelOfStudy: user.year ?? "",
                faculty: user.faculty ?? "",
                major: user.major ?? "",
                internationalStudent: user.international ?? false,
                previousMember: user.prevMember ?? false,
                dietaryRestrictions: user.diet ?? "None",
                referral: user.referral ?? "",
                topics: (user.topics ?? []).join(","),
              },
            });
            window.location.assign(
              getQueryString(router.query.redirect) ?? "/",
            );
            return;
          }

          const checkoutUrl = await fetchBackend({
            endpoint: "/payments",
            method: "POST",
            data: {
              paymentName: "BizTech Membership",
              paymentImages: ["https://imgur.com/TRiZYtG.png"],
              paymentType: "Member",
              success_url: baseUrl,
              cancel_url: `${baseUrl}membership`,
              education: user.education ?? "",
              student_number: user.studentId ?? "",
              fname: user.fname ?? "",
              lname: user.lname ?? "",
              major: user.major ?? "",
              email: user.email ?? user.id,
              year: user.year ?? "",
              faculty: user.faculty ?? "",
              pronouns: user.gender ?? "",
              diet: user.diet ?? "None",
              prev_member: user.prevMember ?? false,
              international: user.international ?? false,
              referral: user.referral ?? "",
              topics: (user.topics ?? []).join(","),
            },
          });

          window.location.assign(checkoutUrl);
          return;
        }

        // Onboarding remains editable even when it was completed previously.
        setLoading(false);
      } catch (error) {
        if (!isOnboarding) setCheckoutError(true);
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

    try {
      await fetchBackend({
        endpoint: "/profiles",
        method: "POST",
        data: { ...values },
      });

      const redirectUrl = getQueryString(router.query.redirect) ?? "/";
      window.location.assign(redirectUrl);
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

  if (!isOnboarding) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-bt-blue-600 px-4 text-center text-white">
        {checkoutError ? (
          <>
            <p>We couldn&apos;t start membership checkout. Please try again.</p>
            <button
              type="button"
              className="rounded-md bg-bt-green-300 px-4 py-2 font-semibold text-bt-blue-600 hover:bg-bt-green-500"
              onClick={() => router.reload()}
            >
              Try again
            </button>
          </>
        ) : (
          <PageLoadingState />
        )}
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
                Complete your onboarding
              </h2>
              <p className="mt-8 text-sm leading-6 text-white">
                Tell us about yourself to finish setting up your BizTech profile.
              </p>

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
              Complete Onboarding
            </button>
          </div>
        </form>
      </div>
    </FormProvider>
  );
};

export default Membership;
