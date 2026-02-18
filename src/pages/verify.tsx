import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { resendSignUpCode } from "@aws-amplify/auth";
import Link from "next/link";
import Image from "next/image";

export default function Verify() {
  const router = useRouter();
  const email = router.query.email as string; // Assuming email is passed as a query param
  const [isResending, setIsResending] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [timer, setTimer] = useState<number | null>(null);

  const RESEND_DELAY = 30; // 30 seconds delay before allowing resend

  // Countdown logic
  useEffect(() => {
    let countdownInterval: NodeJS.Timeout | null = null;

    if (timer && timer > 0) {
      countdownInterval = setInterval(() => {
        setTimer((prevTimer) => (prevTimer ? prevTimer - 1 : null));
      }, 1000);
    } else if (timer === 0) {
      setTimer(null); // Reset timer once countdown is over
    }

    return () => {
      if (countdownInterval) {
        clearInterval(countdownInterval);
      }
    };
  }, [timer]);

  const handleResendVerification = async () => {
    setIsResending(true);
    setMessage("");
    setError("");

    try {
      // Call Amplify's resendSignUpCode API
      await resendSignUpCode({ username: email });

      // If successful, show success message and start the countdown
      setMessage("Verification email sent successfully.");
      setTimer(RESEND_DELAY); // Start the countdown
    } catch (err: any) {
      // Handle errors during the resend process
      console.error("Error resending verification email:", err);
      setError("Failed to resend verification email. Please try again.");
    } finally {
      setIsResending(false);
    }
  };

  return (
    <>
      <div className="flex min-h-screen flex-1 bg-bt-blue-600">
        <div className="flex flex-1 flex-col justify-center px-4 py-12 sm:px-6 lg:flex-none lg:px-20 xl:px-24">
          <div className="mx-auto w-full max-w-sm lg:w-96">
            <Image
              className="mx-auto w-auto"
              height={96}
              width={96}
              src="https://i.ibb.co/s11md5S/Biztech-Logo-1.png"
              alt="BizTech Logo"
            />
            <h4 className="text-white font-500 mt-8">
              A verification email was sent to {email}. Please check your inbox!
            </h4>

            {/* Button to Resend Verification Email */}
            <button
              onClick={handleResendVerification}
              disabled={isResending || timer !== null} // Disable if already resending or timer is running
              className={`mt-8 w-full rounded-md px-3 py-2 text-sm font-semibold text-white shadow-sm ${
                isResending || timer !== null
                  ? "bg-[rgba(122,208,64,0.4)] cursor-not-allowed"
                  : "bg-bt-green-300 hover:bg-bt-green-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
              }`}
            >
              {isResending
                ? "Resending..."
                : timer
                  ? `Resend in ${timer}s`
                  : "Resend Verification Email"}
            </button>

            <h2 className="mt-6 text-center text-sm font-[400] leading-9 text-bt-blue-0 mb-4">
              Already verified your email? &nbsp;
              <Link
                href="/login"
                className="text-bt-green-300 hover:text-bt-green-700 font-semibold"
              >
                Login here.
              </Link>
            </h2>
          </div>
        </div>
        <div className="relative hidden w-0 flex-1 lg:block">
          <Image
            alt=""
            src="https://i.postimg.cc/XVbbxK56/DSC03682-1.jpg"
            fill
            sizes="100vw"
            className="absolute inset-0 h-full w-full object-cover"
          />
        </div>
      </div>
    </>
  );
}
