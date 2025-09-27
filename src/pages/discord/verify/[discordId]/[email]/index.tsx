"use client";

import Link from "next/link";
import { CheckCircle, XCircle } from "lucide-react";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { fetchBackend } from "@/lib/db";
import { fetchUserAttributes } from "@aws-amplify/auth";
import LoadingSpinner from "@/components/Loading";

const DiscordVerifyStatus: React.FC = () => {
  const router = useRouter();
  const [status, setStatus] = useState<boolean | null>(null);
  const [message, setMessage] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const discordId = router.query.discordId;

  useEffect(() => {
    const verifyDiscordAccount = async () => {
      if (!router.isReady) {
        setIsLoading(true);
        return;
      }

      if (!isLoading) {
        return;
      }

      if (!discordId) {
        setStatus(false);
        setMessage("Missing Discord ID or email parameters.");
        setIsLoading(false);
        return;
      }

      console.log(
        "Verifying Discord account with ID:",
        discordId
      );

      try {
        const attributes = await fetchUserAttributes();
        const email = attributes?.email || "";
        await fetchBackend({
          endpoint: "/discord/account/mapping",
          method: "POST",
          authenticatedCall: true,
          data: {
            discordId: discordId,
            email: email,
          },
        });

        setStatus(true);
        setMessage(
          "Your Discord account was successfully linked to your membership.",
        );
      } catch (error) {
        if (
          error &&
          typeof error === "object" &&
          "status" in error &&
          (error as { status?: number }).status === 409
        ) {
          setMessage(
            "This membership is already linked to another Discord account.",
          );
        } else {
          setMessage(
            "We couldn't link your Discord account to your membership. Please try again later or contact server admins.",
          );
        }
        setStatus(false);
      } finally {
        setIsLoading(false);
      }
    };

    verifyDiscordAccount();
  }, [router.isReady, discordId]);

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (status === true) {
    return (
      <div className="bg-dark-slate px-6 py-12 shadow sm:rounded-lg sm:px-12 text-white w-full h-full flex items-center justify-center">
        <div className="px-6 py-12 rounded-2xl text-center max-w-md w-full">
          <div className="flex justify-center mb-8 text-bt-green-200">
            <CheckCircle className="h-24 w-24 text-bt-green-200" />
          </div>
          <h2 className="mt-6 text-center text-2xl font-[600] tracking-wide leading-9 text-white-blue mb-6">
            Successfully linked accounts
          </h2>
          <p className="mt-2 text-white">{message}</p>

          <div className="mt-6">
            <Link
              href="/"
              className="flex w-full justify-center rounded-md bg-[#8AD96A] px-3 py-2 text-sm font-semibold leading-6 text-white shadow-sm"
            >
              Go to Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full flex items-center justify-center">
      <div className="px-6 py-12 rounded-2xl text-center max-w-md w-full">
        <div className="flex justify-center mb-8 text-red-600">
          <XCircle className="h-24 w-24 text-[#FF4262]" />
        </div>
        <h2 className="mt-6 text-center text-2xl font-[600] leading-9 tracking-tight text-white-blue mb-6">
          Failed to link accounts
        </h2>
        <p className="mt-2 text-white">{message}</p>
        <div className="mt-6">
          <Link
            href="/"
            className="flex w-full justify-center rounded-md bg-[#FF4262] px-3 py-2 text-sm font-semibold leading-6 text-white shadow-sm"
          >
            Go to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
};

export default DiscordVerifyStatus;
