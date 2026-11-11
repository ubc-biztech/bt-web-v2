import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/router";
import {
  signIn,
  signInWithRedirect,
  resendSignUpCode,
  fetchAuthSession,
} from "@aws-amplify/auth";
import Link from "next/link";
import PageLoadingState from "@/components/Common/PageLoadingState";
import { clearCognitoCookies } from "@/lib/dbUtils";
import Image from "next/image";
import { getLoginRedirect } from "@/util/url";
import { AlertCircle, Loader2 } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  AuthErrorCode,
  getSignInErrorCode,
  getSignInErrorMessage,
} from "@/lib/signInError";
import {
  isProductArenaDestination,
  isProductPlusLoginDestination,
} from "@/features/product+/2026/access";
import {
  ensureAuthenticatedUser,
  getAuthenticatedUser,
  needsOnboarding,
} from "@/lib/user";

async function getPostLoginPath(destination: string): Promise<string> {
  if (isProductPlusLoginDestination(destination)) return destination;

  const user = await getAuthenticatedUser();
  return needsOnboarding(user) && !/^\/onboarding(?:[?#]|$)/.test(destination)
    ? `/onboarding?redirect=${encodeURIComponent(destination)}`
    : destination;
}

const LoginForm: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<{
    emailError: string;
    passwordError: string;
    confirmationError: string;
  }>({ emailError: "", passwordError: "", confirmationError: "" });
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [signInError, setSignInError] = useState("");
  const errorRef = useRef<HTMLDivElement>(null);
  const [showResend, setShowResend] = useState(false);
  const [isResending, setIsResending] = useState(false);

  const router = useRouter();
  const audienceDestination = getLoginRedirect(
    router.query.redirect,
    router.query.state,
  );
  const signupHref = isProductArenaDestination(audienceDestination)
    ? `/register?redirect=${encodeURIComponent(audienceDestination)}`
    : "/register";
  const hasRedirectedRef = useRef(false); // prevent double redirects

  useEffect(() => {
    if (signInError) errorRef.current?.focus();
  }, [signInError]);

  const clearAuthState = async () => {
    try {
      clearCognitoCookies();
    } catch (error) {
      console.warn("Error clearing auth state:", error);
    }
  };

  useEffect(() => {
    let cancelled = false;

    async function checkUserProfile() {
      if (!router.isReady) return;

      const authError = router.query.error;
      const clearAuth = router.query.clearAuth;

      if (authError || clearAuth) {
        await clearAuthState();
        setIsLoading(false);
        return;
      }

      // Capture before Amplify completes OAuth and clears the callback URL.
      const destination = getLoginRedirect(
        router.query.redirect,
        router.query.state,
      );
      try {
        const session = await fetchAuthSession();
        const isSignedIn = !!session?.tokens?.accessToken;

        if (!isSignedIn) {
          setIsLoading(false);
          return; // stay on login
        }

        await ensureAuthenticatedUser();

        if (cancelled || hasRedirectedRef.current) return;
        hasRedirectedRef.current = true;
        await router.replace(await getPostLoginPath(destination));
      } catch {
        // treat as signed-out
        await clearAuthState();
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    const t = setTimeout(() => setIsLoading(false), 8000);
    checkUserProfile();

    return () => {
      cancelled = true;
      clearTimeout(t);
    };
  }, [router]);

  const validateEmail = (value: string) => {
    if (!value) return "Email is required";
    if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(value))
      return "Please enter a valid email address";
    return "";
  };

  const validatePassword = (value: string) =>
    !value ? "Password is required" : "";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting || isResending) return;

    const emailError = validateEmail(email);
    const passwordError = validatePassword(password);
    setSignInError("");
    setShowResend(false);
    setErrors({ emailError, passwordError, confirmationError: "" });

    if (emailError || passwordError) {
      return;
    }

    setIsSubmitting(true);
    const destination = getLoginRedirect(
      router.query.redirect,
      router.query.state,
    );
    try {
      const user = await signIn({ username: email, password });
      if (user.nextStep?.signInStep === "CONFIRM_SIGN_UP") {
        setShowResend(true);
        setErrors({
          emailError: "",
          passwordError: "",
          confirmationError: "Please verify your email before signing in.",
        });
        return;
      }

      if (user.nextStep?.signInStep === "RESET_PASSWORD") {
        setSignInError(
          getSignInErrorMessage({
            name: AuthErrorCode.PASSWORD_RESET_REQUIRED,
          }),
        );
        return;
      }

      await ensureAuthenticatedUser();
      await router.replace(await getPostLoginPath(destination));
    } catch (error) {
      console.error("Error signing in", error);
      if (getSignInErrorCode(error) === AuthErrorCode.USER_NOT_CONFIRMED) {
        setShowResend(true);
        setErrors({
          emailError: "",
          passwordError: "",
          confirmationError: "Please verify your email before signing in.",
        });
      } else {
        setSignInError(getSignInErrorMessage(error));
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResendVerification = async () => {
    setIsResending(true);
    setErrors((prev) => ({ ...prev, confirmationError: "" }));
    try {
      await resendSignUpCode({ username: email });
      setErrors((prev) => ({
        ...prev,
        confirmationError:
          "Verification email resent. Please check your inbox.",
      }));
    } catch {
      setErrors((prev) => ({
        ...prev,
        confirmationError:
          "Failed to resend verification email. Please try again.",
      }));
    }
    setIsResending(false);
  };

  const handleGoogleSignIn = async () => {
    setSignInError("");
    try {
      const destination = getLoginRedirect(
        router.query.redirect,
        router.query.state,
      );

      await signInWithRedirect({
        provider: "Google",
        customState: destination === "/" ? undefined : destination,
        options: { prompt: "SELECT_ACCOUNT" },
      });
    } catch (error) {
      console.error("Error initiating Google sign-in:", error);
      setSignInError("Google sign-in couldn’t start. Please try again.");
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <PageLoadingState />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-1 flex-col justify-center bg-gradient-to-b from-[#111a30] to-[#1b253d] py-8 sm:px-6 lg:px-8">
      <div className="mx-5 sm:mx-auto sm:w-full sm:max-w-[456px] rounded-[15px] bg-[#26324d] shadow-[inset_1px_1px_10px_rgba(81,100,149,0.75)]">
        <div className="px-6 py-12 sm:px-[74px]">
          <div className="sm:mx-auto sm:w-full sm:max-w-md">
            <Image
              className="mx-auto"
              height={101}
              width={101}
              src="/assets/biztech_logo.svg"
              alt="BizTech Logo"
              loading="eager"
            />
            <h2 className="mb-3 mt-6 text-center text-[40px] font-semibold leading-tight text-white">
              Sign in
            </h2>
            <h2 className="mt-6 text-center text-sm font-[400] leading-9 tracking-tight text-white mb-4">
              New to UBC BizTech? &nbsp;
              <Link
                href={signupHref}
                className="font-semibold text-[#3b93f7] hover:text-[#71b4ff]"
              >
                Create an account.
              </Link>
            </h2>
          </div>

          <form
            className="space-y-4"
            onSubmit={handleSubmit}
            aria-busy={isSubmitting}
          >
            {signInError && (
              <Alert
                ref={errorRef}
                tabIndex={-1}
                className="border-bt-red-200/30 bg-bt-red-800/30 text-bt-red-0 outline-none focus-visible:ring-2 focus-visible:ring-bt-red-200 [&>svg]:top-[18px] [&>svg]:text-bt-red-200 [&>svg~*]:pl-8"
              >
                <AlertCircle aria-hidden="true" className="h-5 w-5" />
                <AlertTitle className="text-sm font-semibold leading-5 tracking-normal text-bt-red-0">
                  We couldn’t sign you in
                </AlertTitle>
                <AlertDescription className="leading-5">
                  {signInError}
                </AlertDescription>
              </Alert>
            )}
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
                  disabled={isSubmitting || isResending}
                  aria-invalid={!!errors.emailError}
                  aria-describedby={
                    errors.emailError ? "email-error" : undefined
                  }
                  placeholder="user@example.com"
                  className="block w-full rounded-md border-0 py-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder pl-4 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setSignInError("");
                    setShowResend(false);
                    setErrors((prev) => ({
                      ...prev,
                      emailError: "",
                      confirmationError: "",
                    }));
                  }}
                />
                {errors.emailError && (
                  <div
                    id="email-error"
                    className="mt-2 text-[14px] text-bt-red-100"
                  >
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
                    className="font-semibold text-[#3b93f7] hover:text-[#71b4ff]"
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
                  disabled={isSubmitting || isResending}
                  aria-invalid={!!errors.passwordError}
                  aria-describedby={
                    errors.passwordError ? "password-error" : undefined
                  }
                  placeholder="Enter 6 characters or more"
                  className="block w-full rounded-md border-0 py-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder pl-4 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setSignInError("");
                    setErrors((prev) => ({ ...prev, passwordError: "" }));
                  }}
                />
                {errors.passwordError && (
                  <div
                    id="password-error"
                    className="mt-2 text-[14px] text-bt-red-100"
                  >
                    {errors.passwordError}
                  </div>
                )}
              </div>
            </div>

            {errors.confirmationError && (
              <div
                role="status"
                className="text-yellow-300 text-[14px] leading-5"
              >
                {errors.confirmationError}
              </div>
            )}

            {showResend && (
              <button
                type="button"
                onClick={handleResendVerification}
                disabled={isResending || isSubmitting}
                className="mt-4 w-full rounded-md bg-bt-green-300 px-3 py-2 text-sm font-semibold text-bt-blue-400 shadow-sm hover:bg-bt-green-700"
              >
                {isResending ? "Resending..." : "Resend Verification Email"}
              </button>
            )}

            <div>
              <button
                type="submit"
                disabled={isSubmitting || isResending}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#3b93f7] px-3 py-3 text-base font-semibold text-white shadow-sm hover:bg-[#147fdd] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#3b93f7] disabled:cursor-wait disabled:opacity-70"
              >
                {isSubmitting && (
                  <Loader2
                    aria-hidden="true"
                    className="h-4 w-4 animate-spin motion-reduce:animate-none"
                  />
                )}
                <span className="font-semibold text-white">
                  {isSubmitting ? "Signing in…" : "Sign in"}
                </span>
              </button>
            </div>
          </form>

          <div>
            <div className="relative mt-7 flex items-center justify-center">
              <div className="flex-grow border-t border-bt-blue-0"></div>
              <span className="px-4 text-sm font-medium leading-6 text-bt-blue-0">
                Or
              </span>
              <div className="flex-grow border-t border-bt-blue-0"></div>
            </div>

            <div className="mt-7 grid grid-cols-1 gap-4">
              {/* ✅ button instead of Link "#" to avoid Safari ghost nav */}
              <button
                type="button"
                disabled={isSubmitting || isResending}
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
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;
