import React, { useState } from "react";
import { useRouter } from "next/router";
import { resetPassword, confirmResetPassword } from "@aws-amplify/auth";
import { IoArrowBack } from "react-icons/io5"; // Importing an arrow icon from react-icons
import Image from "next/image";

export default function ForgotPassword() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState(""); // State for confirm password
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isSendingCode, setIsSendingCode] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);
  const [isCodeSent, setIsCodeSent] = useState(false); // Determines which part of the UI to show

  const handleSendCode = async () => {
    setIsSendingCode(true);
    setMessage("");
    setError("");

    try {
      const response = await resetPassword({ username: email });
      const { nextStep } = response;

      if (nextStep.resetPasswordStep === "CONFIRM_RESET_PASSWORD_WITH_CODE") {
        setIsCodeSent(true);
        setMessage("A verification code was sent to your email.");
      }
    } catch (err: any) {
      setError("Failed to send reset code. Please try again.");
      console.error("Error sending reset code:", err);
    } finally {
      setIsSendingCode(false);
    }
  };

  const handleConfirmPassword = async () => {
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match. Please try again.");
      return;
    }

    setIsConfirming(true);
    setMessage("");
    setError("");

    try {
      await confirmResetPassword({
        username: email,
        confirmationCode: code,
        newPassword: newPassword,
      });

      setMessage(
        "Password reset successfully. You can now log in with your new password.",
      );
      router.push("/login");
    } catch (err: any) {
      setError(
        "Failed to reset password. Please check your code and try again.",
      );
      console.error("Error resetting password:", err);
    } finally {
      setIsConfirming(false);
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

            {!isCodeSent ? (
              // Step 1: Send Code UI
              <>
                <h4 className="text-white font-500 mt-8">
                  Enter your email to receive a password reset code.
                </h4>
                <div className="mt-4">
                  <input
                    type="email"
                    className="block w-full rounded-md border-0 py-2 text-gray-900 shadow-sm placeholder pl-4"
                    placeholder="user@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                  {error && <div className="text-red-500 text-sm">{error}</div>}
                </div>
                <button
                  onClick={handleSendCode}
                  disabled={isSendingCode}
                  className="mt-4 w-full rounded-md bg-bt-green-300 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-bt-green-700"
                >
                  {isSendingCode ? "Sending Code..." : "Send Reset Code"}
                </button>
              </>
            ) : (
              // Step 2: Confirm Code and Set New Password UI
              <>
                <h4 className="text-white font-500 mt-8">
                  Enter the code sent to your email and choose a new password.
                </h4>
                <div className="mt-4">
                  <input
                    type="text"
                    className="block w-full rounded-md border-0 py-2 text-gray-900 shadow-sm placeholder pl-4"
                    placeholder="Verification code"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                  />
                </div>
                <div className="mt-4">
                  <input
                    type="password"
                    className="block w-full rounded-md border-0 py-2 text-gray-900 shadow-sm placeholder pl-4"
                    placeholder="New password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                  />
                </div>
                <div className="mt-4">
                  <input
                    type="password"
                    className="block w-full rounded-md border-0 py-2 text-gray-900 shadow-sm placeholder pl-4"
                    placeholder="Confirm new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                </div>
                {error && <div className="text-red-500 text-sm">{error}</div>}
                <button
                  onClick={handleConfirmPassword}
                  disabled={isConfirming}
                  className="mt-4 w-full rounded-md bg-bt-green-300 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-bt-green-700"
                >
                  {isConfirming ? "Resetting Password..." : "Confirm Password"}
                </button>
              </>
            )}

            {message && (
              <div className="text-green-500 text-sm mt-4">{message}</div>
            )}

            {/* Back to Login button */}
            <div className="mt-6">
              <button
                className="flex items-center justify-center text-bt-green-300 font-semibold hover:text-bt-green-700"
                onClick={() => router.push("/login")}
              >
                <IoArrowBack className="mr-2" /> {/* Back arrow icon */}
                Back to Login
              </button>
            </div>
          </div>
        </div>
        <div className="relative hidden w-0 flex-1 lg:block">
          <Image
            alt=""
            src="https://i.postimg.cc/zq7TT43B/DSC01353-1.jpg"
            className="absolute inset-0 h-full w-full object-cover"
            fill
          />
        </div>
      </div>
    </>
  );
}
