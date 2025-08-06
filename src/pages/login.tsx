import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import {
  signIn,
  signInWithRedirect,
  fetchUserAttributes,
  resendSignUpCode,
} from "@aws-amplify/auth";
import { fetchBackend } from "@/lib/db";
import Link from "next/link";
import { CheckCircle, XCircle } from "lucide-react";

const Login: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<{
    emailError: string;
    passwordError: React.ReactNode;
    confirmationError: string;
  }>({
    emailError: "",
    passwordError: "",
    confirmationError: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [showResend, setShowResend] = useState(false); // New state to show resend button
  const [isResending, setIsResending] = useState(false); // New state for resend loading
  const [discordId, setDiscordId] = useState(""); // State to store Discord ID if needed
  const [statusPage, setStatusPage] = useState("login"); // One of: "login", "success", "error"
  const router = useRouter();

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);

    searchParams.forEach((value, key) => {
      if (key === "error") {
        setErrors((prevErrors) => ({
          ...prevErrors,
          confirmationError: value,
        }));
      }

      if (key === "discordId") {
        setDiscordId(value);
      }
    });
  }, []);

  useEffect(() => {
    const checkUserProfile = async () => {
      try {
        const currentUser = await fetchUserAttributes();
        if (currentUser) {
          const email = currentUser.email;
          try {
            const userProfile = await fetchBackend({
              endpoint: `/users/${email}`,
              method: "GET",
            });

            if (userProfile) {
              router.push("/");
            }
          } catch (err: any) {
            if (err.status === 404) {
              router.push("/membership");
            } else {
              console.error("Error fetching user profile:", err);
            }
          }
        }
      } catch (error) {
        console.log("User not authenticated or an error occurred:", error);
      }
    };

    checkUserProfile();
  }, [router]);

  const validateEmail = (value: string) => {
    let error = "";
    if (!value) {
      error = "Email is required";
    } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(value)) {
      error = "Please enter a valid email address";
    }
    return error;
  };

  const validatePassword = (value: string) => {
    let error = "";
    if (!value) {
      error = "Password is required";
    }
    return error;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const emailError = validateEmail(email);
    const passwordError = validatePassword(password);
    setIsLoading(true);

    if (emailError || passwordError) {
      setErrors({ emailError, passwordError, confirmationError: "" });
    } else {
      try {
        const user = await signIn({
          username: email,
          password: password,
        });

        if (user.nextStep?.signInStep === "CONFIRM_SIGN_UP") {
          // User has not confirmed their email yet
          setShowResend(true);
          setErrors({
            emailError: "",
            passwordError: "",
            confirmationError: "Please verify your email before signing in.",
          });
          setIsLoading(false);
          return;
        }

        // Now, we check if the user has a profile in the backend before redirecting
        try {
          const userProfile = await fetchBackend({
            endpoint: `/users/${email}`,
            method: "GET",
          });

          if (userProfile && discordId) {
            // User is a member and wants to link their Discord account
            try {
              console.log("Linking Discord account...");
              await fetchBackend({
                endpoint: `/bots/discord/account/mapping`,
                method: "POST",
                data: {
                  email,
                  discordId,
                },
                authenticatedCall: false,
              });

              console.log("Discord account linked successfully");
              setStatusPage("success");
            } catch (error) {
              console.log("Discord verification failed:", error);
              setStatusPage("error");
            }
          } else if (userProfile) {
            // User is a member, redirect to home page
            router.push("/");
          }
        } catch (err: any) {
          if (err.status === 404) {
            // User is signed in but does not have a profile, redirect to membership
            console.log("User profile not found, redirecting to membership.");
            router.push("/membership");
          } else {
            console.error("Error fetching user profile:", err);
          }
        }
      } catch (error: any) {
        console.error("Error signing in", error);
        handleAuthErrors(error);
      }
    }
    setIsLoading(false);
  };

  const handleGoogleSignIn = async () => {
    try {
      await signInWithRedirect({
        provider: "Google",
      });
    } catch (error: any) {
      console.error("Error initiating Google sign-in:", error);
    }
  };

  const handleAuthErrors = (error: any) => {
    let emailError = "";
    let passwordError: React.ReactNode = "";

    switch (error.code) {
      case "UserNotConfirmedException":
        setShowResend(true);
        emailError = "Your account has not been verified yet.";
        break;
      case "UserNotFoundException":
        emailError = "Incorrect username or password.";
        break;
      case "NotAuthorizedException":
        passwordError = "Incorrect username or password.";
        break;
      default:
        passwordError = error.message;
        break;
    }

    setErrors({ emailError, passwordError, confirmationError: "" });
  };

  const handleResendVerification = async () => {
    setIsResending(true);
    setErrors((prevErrors) => ({
      ...prevErrors,
      confirmationError: "",
    }));
    try {
      await resendSignUpCode({ username: email });
      setErrors((prevErrors) => ({
        ...prevErrors,
        confirmationError:
          "Verification email resent. Please check your inbox.",
      }));
    } catch (error) {
      setErrors((prevErrors) => ({
        ...prevErrors,
        confirmationError:
          "Failed to resend verification email. Please try again.",
      }));
      console.error("Error resending verification email:", error);
    }
    setIsResending(false);
  };

  return (
    <div className="flex min-h-screen flex-1 flex-col justify-center py-8 sm:px-6 lg:px-8 bg-login-page-bg">
      <div className="mt-4 mx-8 sm:mx-auto sm:w-full sm:max-w-[480px] bg-login-form-card rounded-lg">
        {statusPage === "login" ? (
          <div className="bg-dark-slate px-6 py-12 shadow sm:rounded-lg sm:px-12">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
              <img
                className="mx-auto h-24 w-auto"
                src="https://i.ibb.co/s11md5S/Biztech-Logo-1.png"
                alt="BizTech Logo"
              />
              <h2 className="mt-6 text-center text-2xl font-[600] leading-9 tracking-tight text-white-blue mb-6">
                {discordId ? `Verify your Discord` : `Sign in`}
              </h2>
              <h2 className="mt-6 text-center text-sm font-[400] leading-9 tracking-tight text-white-blue mb-4">
                New to UBC BizTech? &nbsp;
                <Link
                  href="/register"
                  className="text-biztech-green hover:text-dark-green font-semibold"
                >
                  Create an account.
                </Link>
              </h2>
            </div>
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-400 leading-6 text-white-blue"
                >
                  Email
                </label>
                <div className="mt-2">
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    placeholder="user@example.com"
                    className="text-black block w-full rounded-md border-0 py-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder pl-4 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                  {errors.emailError && (
                    <div className="text-red-500 text-sm">
                      {errors.emailError}
                    </div>
                  )}
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center w-full mt-2">
                  <label
                    htmlFor="password"
                    className="block text-sm font-400 leading-6 text-white-blue"
                  >
                    Password
                  </label>
                  <div className="text-sm leading-6">
                    <Link
                      href="/forgot-password"
                      className="font-semibold text-biztech-green hover:text-dark-green"
                    >
                      Forgot password?
                    </Link>
                  </div>
                </div>
                <div className="mt-2">
                  <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="current-password"
                    required
                    placeholder="Enter 6 characters or more"
                    className="text-black block w-full rounded-md border-0 py-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder pl-4 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  {errors.passwordError && (
                    <div className="text-red-500 text-sm">
                      {errors.passwordError}
                    </div>
                  )}
                </div>
              </div>

              {errors.confirmationError && (
                <div className="text-yellow-500 text-sm">
                  {errors.confirmationError}
                </div>
              )}

              {showResend && (
                <button
                  type="button"
                  onClick={handleResendVerification}
                  disabled={isResending}
                  className="mt-4 w-full rounded-md bg-biztech-green px-3 py-2 text-sm font-semibold text-login-form-card shadow-sm hover:bg-dark-green"
                >
                  {isResending ? "Resending..." : "Resend Verification Email"}
                </button>
              )}

              <div>
                <button
                  type="submit"
                  className="flex w-full justify-center rounded-md bg-biztech-green px-3 py-2 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-dark-green focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                >
                  <p className="text-login-form-card">Sign in</p>
                </button>
              </div>

              {isLoading && <div className="mt-4">Signing in...</div>}
            </form>

            <div>
              <div className="relative mt-7 flex items-center justify-center">
                <div className="flex-grow border-t border-white-blue"></div>
                <span className="px-4 text-sm font-medium leading-6 text-white-blue">
                  Or
                </span>
                <div className="flex-grow border-t border-white-blue"></div>
              </div>

              <div className="mt-7 grid grid-cols-2 gap-4">
                <a
                  href="#"
                  className="flex w-full items-center justify-center gap-3 rounded-md bg-white-blue px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-desat-navy focus-visible:ring-transparent"
                  onClick={handleGoogleSignIn}
                >
                  <svg
                    className="h-5 w-5"
                    aria-hidden="true"
                    viewBox="0 0 24 24"
                  >
                    <path
                      d="M12.0003 4.75C13.7703 4.75 15.3553 5.36002 16.6053 6.54998L20.0303 3.125C17.9502 1.19 15.2353 0 12.0003 0C7.31028 0 3.25527 2.69 1.28027 6.60998L5.27028 9.70498C6.21525 6.86002 8.87028 4.75 12.0003 4.75Z"
                      fill="#EA4335"
                    />
                    <path
                      d="M23.49 12.275C23.49 11.49 23.415 10.73 23.3 10H12V14.51H18.47C18.18 15.99 17.34 17.25 16.08 18.1L19.945 21.1C22.2 19.01 23.49 15.92 23.49 12.275Z"
                      fill="#4285F4"
                    />
                    <path
                      d="M5.26498 14.2949C5.02498 13.5699 4.88501 12.7999 4.88501 11.9999C4.88501 11.1999 5.01998 10.4299 5.26498 9.7049L1.275 6.60986C0.46 8.22986 0 10.0599 0 11.9999C0 13.9399 0.46 15.7699 1.28 17.3899L5.26498 14.2949Z"
                      fill="#FBBC05"
                    />
                    <path
                      d="M12.0004 24.0001C15.2404 24.0001 17.9654 22.935 19.9454 21.095L16.0804 18.095C15.0054 18.82 13.6204 19.245 12.0004 19.245C8.8704 19.245 6.21537 17.135 5.2654 14.29L1.27539 17.385C3.25539 21.31 7.3104 24.0001 12.0004 24.0001Z"
                      fill="#34A853"
                    />
                  </svg>
                  <span className="text-sm leading-6 text-login-form-card font-500">
                    Google
                  </span>
                </a>

                <a
                  href="#"
                  className="flex w-full items-center justify-center gap-2 rounded-md bg-white-blue px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-desat-navy focus-visible:ring-transparent"
                >
                  <img
                    src="https://i.ibb.co/0VtyXLD/Frame-3.png"
                    className="w-8 h-auto"
                  />
                  <span className="text-sm leading-6 text-login-form-card font-500">
                    Guest
                  </span>
                </a>
              </div>
            </div>
          </div>
        ) : statusPage === "success" ? (
          <div className="bg-dark-slate px-6 py-12 shadow sm:rounded-lg sm:px-12 text-white">
            <div className="px-6 py-12 rounded-2xl text-center max-w-md w-full">
              <div className="flex justify-center mb-8 text-green-600">
                <CheckCircle className="h-24 w-24 text-secondary-color" />
              </div>
              <h2 className="mt-6 text-center text-2xl font-[600] leading-9 tracking-tight text-white-blue mb-6">
                Successfully linked accounts
              </h2>
              <p className="mt-2 text-white">
                Your discord account was successfully linked to your membership.
              </p>

                <div className="mt-6">
                  <a
                    href="/"
                    className="flex w-full justify-center rounded-md bg-biztech-green px-3 py-2 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-dark-green focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                  >
                    <p className="text-login-form-card">Go to Dashboard</p>
                  </a>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-dark-slate px-6 py-12 shadow sm:rounded-lg sm:px-12 text-white">
              <div className="px-6 py-12 rounded-2xl text-center max-w-md w-full">
                <div className="flex justify-center mb-8 text-green-600">
                  <XCircle className="h-24 w-24 text-[#FF4262]" />
                </div>
                <h2 className="mt-6 text-center text-2xl font-[600] leading-9 tracking-tight text-white-blue mb-6">
                  Failed to linked accounts
                </h2>
                <p className="mt-2 text-white">
                  We couldn&apos;t link your Discord account to your membership. Please try again later or contact server admins.
                </p>

              <div className="mt-6">
                <a
                  href="/"
                  className="flex w-full justify-center rounded-md bg-[#FF4262] px-3 py-2 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-[#df3a55] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                >
                  <p className="text-login-form-card">Go to Dashboard</p>
                </a>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Login;
