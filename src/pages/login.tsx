import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import {
  signIn,
  signInWithRedirect,
  resendSignUpCode,
} from "@aws-amplify/auth";
import { fetchBackend, fetchBackendFromServer } from "@/lib/db";
import Link from "next/link";
import { GetServerSideProps } from "next";
import PageLoadingState from "@/components/Common/PageLoadingState";
import { GetServerSidePropsContext } from "next";
import { ParsedUrlQuery } from "querystring";
import { UnauthenticatedUserError } from "@/lib/dbUtils";
import Image from "next/image";

interface LoginProps {
  redirect?: string;
}

const LoginForm: React.FC<LoginProps> = ({ redirect }) => {
  // All the logic and UI from the current Login component goes here
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
  const [isLoading, setIsLoading] = useState(true);
  const [showResend, setShowResend] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const router = useRouter();

  useEffect(() => {
    async function checkUserProfile() {
      if (!router) return;

      try {
        const userProfile = await fetchBackend({
          endpoint: `/users/self`,
          method: "GET",
        });

        if (userProfile.isMember) {
          await router.push(redirect ? redirect : "/");
          return;
        }

        await router.push("/membership");
      } catch (err: any) {
        if (err.status === 404) {
          await router.push("/membership");
        } else if (err.name !== UnauthenticatedUserError.name) {
          console.error(err);
        }
      }

      setIsLoading(false);
    }

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
          setShowResend(true);
          setErrors({
            emailError: "",
            passwordError: "",
            confirmationError: "Please verify your email before signing in.",
          });
          setIsLoading(false);
          return;
        }
        try {
          const userProfile = await fetchBackend({
            endpoint: `/users/self`,
            method: "GET",
          });
          if (userProfile.isMember) {
            await router.push(redirect ? redirect : "/");
          } else {
            await router.push("/membership");
          }
        } catch (err: any) {
          if (err.status === 404) {
            await router.push("/membership");
          }

          throw err;
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
        customState: redirect ? redirect : undefined,
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

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <PageLoadingState />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-1 flex-col justify-center py-8 sm:px-6 lg:px-8 bg-bt-blue-600">
      <div className="mt-4 mx-8 sm:mx-auto sm:w-full sm:max-w-[480px] bg-bt-blue-400 rounded-lg">
        <div className="bg-bt-blue-400 px-6 py-12 shadow sm:rounded-lg sm:px-12">
          <div className="sm:mx-auto sm:w-full sm:max-w-md">
            <img
              className="mx-auto h-24 w-auto"
              src="https://i.ibb.co/s11md5S/Biztech-Logo-1.png"
              alt="BizTech Logo"
            />
            <h2 className="mt-6 text-center text-2xl font-[600] leading-9 tracking-tight text-white mb-6">
              Sign in
            </h2>
            <h2 className="mt-6 text-center text-sm font-[400] leading-9 tracking-tight text-white mb-4">
              New to UBC BizTech? &nbsp;
              <Link
                href="/register"
                className="text-bt-green-300 hover:text-bt-green-700 font-semibold"
              >
                Create an account.
              </Link>
            </h2>
          </div>
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-400 leading-6 text-white"
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
                  className="block w-full rounded-md border-0 py-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder pl-4 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
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
                  className="block text-sm font-400 leading-6 text-white"
                >
                  Password
                </label>
                <div className="text-sm leading-6">
                  <Link
                    href="/forgot-password"
                    className="font-semibold text-bt-green-300 hover:text-bt-green-700"
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
                  className="block w-full rounded-md border-0 py-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder pl-4 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
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
                className="mt-4 w-full rounded-md bg-bt-green-300 px-3 py-2 text-sm font-semibold text-bt-blue-400 shadow-sm hover:bg-bt-green-700"
              >
                {isResending ? "Resending..." : "Resend Verification Email"}
              </button>
            )}

            <div>
              <button
                type="submit"
                className="flex w-full justify-center rounded-md bg-bt-green-300 px-3 py-2 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-bt-green-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
              >
                <p className="text-bt-blue-400 font-semibold">Sign in</p>
              </button>
            </div>

            {isLoading && <div className="mt-4">Signing in...</div>}
          </form>

          <div>
            <div className="relative mt-7 flex items-center justify-center">
              <div className="flex-grow border-t border-bt-blue-0"></div>
              <span className="px-4 text-sm font-medium leading-6 text-bt-blue-0">
                Or
              </span>
              <div className="flex-grow border-t border-bt-blue-0"></div>
            </div>

            <div className="mt-7 grid grid-cols-2 gap-4">
              <Link
                href="#"
                className="flex w-full items-center justify-center gap-3 rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-neutral-200 focus-visible:ring-transparent"
                onClick={handleGoogleSignIn}
              >
                <Image
                  src={"/assets/icons/google.svg"}
                  alt="Google logo"
                  width={24}
                  height={24}
                />
                <span className="text-sm leading-6 text-login-form-card font-500">
                  Google
                </span>
              </Link>

              <Link
                href="/become-a-member"
                className="flex w-full items-center justify-center gap-2 rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-desat-navy focus-visible:ring-transparent"
              >
                <img
                  src="https://i.ibb.co/0VtyXLD/Frame-3.png"
                  className="w-8 h-auto"
                />
                <span className="text-sm leading-6 text-bt-blue-400 font-500">
                  Guest
                </span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export const getServerSideProps: GetServerSideProps = async (
  context: GetServerSidePropsContext<ParsedUrlQuery>,
) => {
  const { req, res, query } = context;
  const nextServerContext = { request: req, response: res };

  let redirect =
    query && query.redirect && typeof query.redirect === "string"
      ? query.redirect
      : null;

  const stateParam = !Array.isArray(query.state) ? query.state : null;
  if (stateParam && stateParam.split("-").length == 2) {
    redirect = Buffer.from(stateParam.split("-")[1], "hex").toString();
  }

  try {
    const userProfile = await fetchBackendFromServer({
      endpoint: `/users/self`,
      method: "GET",
      nextServerContext,
    });

    if (userProfile?.isMember) {
      return {
        redirect: {
          destination: redirect ? redirect : "/",
          permanent: false,
        },
        props: {},
      };
    }

    if (userProfile) {
      return {
        redirect: {
          destination: "/membership",
          permanent: false,
        },
        props: {},
      };
    }

    return {
      props: { redirect },
    };
  } catch (error: any) {
    if (error.name === UnauthenticatedUserError.name) {
      return {
        props: { redirect },
      };
    }

    if (error.status === 404)
      // membership doesn't exist
      return {
        redirect: {
          destination: "/membership",
          permanent: false,
        },
        props: {},
      };

    console.error("Error fetching from backend");
    return {
      props: { redirect },
    };
  }
};

export default LoginForm;
