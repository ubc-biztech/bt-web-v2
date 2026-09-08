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
import { getQueryString } from "@/util/url";
import type { User } from "@/types";

export default function Membership() {
  const router = useRouter();
  const { toast } = useToast();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const hasRedirected = useRef(false);

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
        const [hasMembership, appUser] = await Promise.all([
          checkMembership(attributes.email),
          fetchBackend({ endpoint: "/users/self", method: "GET" }),
        ]);

        if (cancelled) return;
        if (hasMembership) {
          hasRedirected.current = true;
          await router.replace(getQueryString(router.query.redirect) ?? "/");
          return;
        }

        if (needsOnboarding(appUser)) {
          hasRedirected.current = true;
          await router.replace("/onboarding?redirect=%2Fmembership");
          return;
        }

        setUser(appUser);
      } catch {
        if (!hasRedirected.current) {
          hasRedirected.current = true;
          await router.replace("/login?redirect=%2Fmembership");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadUser();
    return () => {
      cancelled = true;
    };
  }, [router]);

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
        window.location.assign(getQueryString(router.query.redirect) ?? "/");
        return;
      }

      const baseUrl =
        process.env.NEXT_PUBLIC_REACT_APP_STAGE === "local"
          ? "http://localhost:3000/"
          : process.env.NEXT_PUBLIC_REACT_APP_STAGE === "staging"
            ? "https://dev.v2.ubcbiztech.com/"
            : "https://app.ubcbiztech.com/";
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
    } catch (error) {
      console.error("Failed to start membership checkout:", error);
      toast({
        variant: "destructive",
        title: "We couldn't start membership checkout. Please try again.",
      });
      setIsSubmitting(false);
    }
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
          href={getQueryString(router.query.redirect) ?? "/"}
          className="mx-auto mt-5 inline-flex items-center gap-2 text-sm text-bt-blue-100 hover:text-white"
        >
          <ArrowLeft aria-hidden="true" className="h-4 w-4" />
          Back to the app
        </Link>
      </div>
    </div>
  );
}
