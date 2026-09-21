import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { fetchAuthSession, fetchUserAttributes } from "@aws-amplify/auth";
import { ArrowLeft } from "lucide-react";
import PageLoadingState from "@/components/Common/PageLoadingState";
import { Toaster } from "@/components/ui/toaster";
import { useToast } from "@/components/ui/use-toast";
import { fetchBackend } from "@/lib/db";
import { checkMembership } from "@/lib/membership";
import { ensureAuthenticatedUser, needsOnboarding } from "@/lib/user";
import { getMembershipHref, getSafeRedirect } from "@/util/url";
import type { User } from "@/types";

export default function Membership() {
  const router = useRouter();
  const { toast } = useToast();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [verificationFailed, setVerificationFailed] = useState(false);
  const hasRedirected = useRef(false);
  const returnPath = getSafeRedirect(router.query.redirect);
  const membershipHref = getMembershipHref(returnPath);
  const checkoutReturn = router.query.checkout === "success";
  const resumeHref = checkoutReturn
    ? `${membershipHref}${membershipHref.includes("?") ? "&" : "?"}checkout=success`
    : membershipHref;

  useEffect(() => {
    if (!router.isReady) return;
    let cancelled = false;

    async function loadUser() {
      try {
        const session = await fetchAuthSession();
        if (!session.tokens?.accessToken) throw new Error("Unauthenticated");

        const attributes = await fetchUserAttributes();
        if (!attributes.email) throw new Error("Missing email");

        await ensureAuthenticatedUser();
        const [membershipStatus, appUser] = await Promise.all([
          checkMembership(attributes.email).catch((error) => {
            if (checkoutReturn) return false;
            throw error;
          }),
          fetchBackend({ endpoint: "/users/self", method: "GET" }),
        ]);

        if (cancelled) return;
        let hasMembership = membershipStatus;
        // Stripe can return before its webhook creates the membership. Never
        // treat the query flag as payment proof or offer another checkout here.
        for (
          let attempt = 0;
          checkoutReturn && !hasMembership && attempt < 15;
          attempt++
        ) {
          await new Promise((resolve) => window.setTimeout(resolve, 2000));
          if (cancelled) return;
          hasMembership = await checkMembership(attributes.email).catch(
            () => false,
          );
        }
        if (cancelled) return;
        if (hasMembership) {
          hasRedirected.current = true;
          await router.replace(returnPath);
          return;
        }

        if (checkoutReturn) {
          setVerificationFailed(true);
          return;
        }

        if (needsOnboarding(appUser)) {
          hasRedirected.current = true;
          await router.replace(
            `/onboarding?redirect=${encodeURIComponent(resumeHref)}`,
          );
          return;
        }

        setUser(appUser);
      } catch {
        if (!hasRedirected.current) {
          hasRedirected.current = true;
          await router.replace(
            `/login?redirect=${encodeURIComponent(resumeHref)}`,
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadUser();
    return () => {
      cancelled = true;
    };
  }, [router, returnPath, checkoutReturn, resumeHref]);

  async function startCheckout() {
    if (!user || isSubmitting) return;
    setIsSubmitting(true);

    try {
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
        window.location.assign(returnPath);
        return;
      }

      const baseUrl =
        process.env.NEXT_PUBLIC_REACT_APP_STAGE === "local"
          ? "http://localhost:3000/"
          : process.env.NEXT_PUBLIC_REACT_APP_STAGE === "staging"
            ? "https://dev.v2.ubcbiztech.com/"
            : "https://app.ubcbiztech.com/";
      const successUrl = new URL(membershipHref, baseUrl);
      successUrl.searchParams.set("checkout", "success");
      const checkoutUrl = await fetchBackend({
        endpoint: "/payments",
        method: "POST",
        data: {
          paymentName: "BizTech Membership",
          paymentImages: ["https://imgur.com/TRiZYtG.png"],
          paymentType: "Member",
          success_url: successUrl.href,
          cancel_url: new URL(membershipHref, baseUrl).href,
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
    } catch (error) {
      console.error("Failed to start membership checkout:", error);
      toast({
        variant: "destructive",
        title: "We couldn't start membership checkout. Please try again.",
      });
      setIsSubmitting(false);
    }
  }

  if (checkoutReturn) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-bt-blue-600 px-6 text-center text-white">
        <h1 className="text-2xl font-semibold">
          {verificationFailed
            ? "Membership is still processing"
            : "Confirming your membership…"}
        </h1>
        <p className="max-w-md text-bt-blue-0" role="status">
          {verificationFailed
            ? "We couldn't verify your membership yet. Please check again in a moment. Don't pay again."
            : "We'll take you back to where you left off as soon as your membership is ready."}
        </p>
        {verificationFailed && (
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="rounded-md bg-[#3b93f7] px-5 py-3 font-semibold focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
          >
            Check again
          </button>
        )}
      </div>
    );
  }

  if (loading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-bt-blue-600">
        <PageLoadingState />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-bt-blue-600 px-4 text-white">
      <Toaster />
      <div className="w-full max-w-lg rounded-lg bg-bt-blue-400 px-6 py-10 text-center shadow-lg sm:px-12">
        <h1 className="text-2xl font-semibold">Become a BizTech member</h1>
        <p className="mt-4 text-sm leading-6 text-bt-blue-0">
          Your profile is ready. Continue to Stripe to purchase your membership
          and unlock member-only features.
        </p>

        <button
          type="button"
          onClick={startCheckout}
          disabled={isSubmitting}
          className="mt-8 flex w-full justify-center rounded-md bg-[#3b93f7] px-3 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-[#147fdd] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#3b93f7] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting
            ? "Starting checkout..."
            : user.admin
              ? "Create Membership"
              : "Proceed to Payment"}
        </button>

        <Link
          href={returnPath}
          className="mx-auto mt-5 inline-flex items-center gap-2 text-sm text-bt-blue-100 hover:text-white"
        >
          <ArrowLeft aria-hidden="true" className="h-4 w-4" />
          Back to the app
        </Link>
      </div>
    </div>
  );
}
