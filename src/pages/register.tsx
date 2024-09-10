import React, { useState } from "react";
import { useRouter } from "next/router";
import { signUp, signInWithRedirect } from "@aws-amplify/auth";
import { fetchBackend } from "@/lib/db";

const Register: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [errors, setErrors] = useState<{
    emailError: string;
    passwordError: React.ReactNode;
    confirmPasswordError: string;
    fullNameError: string;
  }>({
    emailError: "",
    passwordError: "",
    confirmPasswordError: "",
    fullNameError: ""
  });
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

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
    } else if (value.length < 6) {
      error = "Password must be at least 6 characters";
    }
    return error;
  };

  const validateConfirmPassword = (value: string) => {
    let error = "";
    if (value !== password) {
      error = "Passwords do not match";
    }
    return error;
  };

  const validateName = (value: string) => {
    return value.trim() === "" ? "This field is required" : "";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const emailError = validateEmail(email);
    const passwordError = validatePassword(password);
    const confirmPasswordError = validateConfirmPassword(confirmPassword);
    const fullNameError = validateName(fullName);

    setErrors({
      emailError,
      passwordError,
      confirmPasswordError,
      fullNameError
    });

    if (emailError || passwordError || confirmPasswordError || fullNameError) {
      return; // Exit early if there are validation errors
    }

    setIsLoading(true);

    try {
      // Amplify signUp process
      const result = await signUp({
        username: email,
        password: password,
        options: {
          userAttributes: {
            name: fullName,
            email: email // Ensure email is included in the attributes
          },
          autoSignIn: true
        }
      });

      console.log("User signed up successfully:", result);

      // Redirect to verification page (if email verification is enabled in Cognito)
      router.push(`/verify?email=${email}`);
    } catch (error: any) {
      console.error("Error during sign-up", error);
      handleAuthErrors(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      console.log("Initiating Google sign-in...");
      await signInWithRedirect({
        provider: "Google"
      });
      console.log("Google sign-in redirect initiated.");
    } catch (error: any) {
      console.error("Error initiating Google sign-in:", error);
    }
  };

  const handleAuthErrors = (error: any) => {
    let emailError = "";
    let passwordError: React.ReactNode = "";
    let confirmPasswordError = "";
    let fullNameError = "";

    switch (error.code) {
      case "UsernameExistsException":
        emailError = "This email is already registered.";
        break;
      case "InvalidPasswordException":
        passwordError = "Password does not meet the requirements.";
        break;
      default:
        passwordError = error.message;
        break;
    }

    setErrors({
      emailError,
      passwordError,
      confirmPasswordError,
      fullNameError
    });
  };

  return (
    <div className="flex min-h-screen flex-1 flex-col justify-center py-8 sm:px-6 lg:px-8 bg-login-page-bg">
      <div className="mt-4 mx-8 sm:mx-auto sm:w-full sm:max-w-[480px] bg-login-form-card rounded-lg">
        <div className="bg-dark-slate px-6 py-12 shadow sm:rounded-lg sm:px-12">
          <div className="sm:mx-auto sm:w-full sm:max-w-md">
            <img
              className="mx-auto h-24 w-auto"
              src="https://i.ibb.co/s11md5S/Biztech-Logo-1.png"
              alt="BizTech Logo"
            />
            <h2 className="mt-6 text-center text-2xl font-[600] leading-9 tracking-tight text-white-blue mb-6">
              Register
            </h2>
            <h2 className="mt-6 text-center text-sm font-[400] leading-9 tracking-tight text-white-blue mb-4">
              Already have an account? &nbsp;
              <a
                href="/login"
                className="text-biztech-green hover:text-dark-green font-semibold"
              >
                Login here.
              </a>
            </h2>
          </div>
          <form className="space-y-4" onSubmit={handleSubmit}>
            {/* Full Name */}
            <div>
              <label
                htmlFor="fullName"
                className="block text-sm font-400 leading-6 text-white-blue"
              >
                Full Name
              </label>
              <div className="mt-2">
                <input
                  id="fullName"
                  name="fullName"
                  type="text"
                  autoComplete="fullName"
                  required
                  placeholder="Full Name"
                  className="text-black block w-full rounded-md border-0 py-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder pl-4 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                />
                {errors.fullNameError && (
                  <div className="text-red-500 text-sm">
                    {errors.fullNameError}
                  </div>
                )}
              </div>
            </div>

            {/* Email */}
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

            {/* Password */}
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-400 leading-6 text-white-blue"
              >
                Password
              </label>
              <div className="mt-2">
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="new-password"
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

            {/* Confirm Password */}
            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-400 leading-6 text-white-blue"
              >
                Confirm Password
              </label>
              <div className="mt-2">
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  autoComplete="new-password"
                  required
                  placeholder="Re-enter password"
                  className="text-black block w-full rounded-md border-0 py-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder pl-4 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
                {errors.confirmPasswordError && (
                  <div className="text-red-500 text-sm">
                    {errors.confirmPasswordError}
                  </div>
                )}
              </div>
            </div>

            {/* Submit */}
            <div>
              <button
                type="submit"
                className="mt-8 flex w-full justify-center rounded-md bg-biztech-green px-3 py-2 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-dark-green focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
              >
                <p className="text-login-form-card">Sign up</p>
              </button>
            </div>

            {isLoading && <div className="mt-4">Signing up...</div>}
          </form>

          {/* Google Sign-in */}
          <div>
            <div className="relative mt-7 flex items-center justify-center">
              <div className="flex-grow border-t border-white-blue"></div>
              <span className="px-4 text-sm font-medium leading-6 text-white-blue">
                Or
              </span>
              <div className="flex-grow border-t border-white-blue"></div>
            </div>

            <div className="mt-7 grid grid-cols-1 gap-4">
              <a
                href="#"
                className="flex w-full items-center justify-center gap-3 rounded-md bg-white-blue px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-desat-navy focus-visible:ring-transparent"
                onClick={handleGoogleSignIn}
              >
                <svg className="h-5 w-5" aria-hidden="true" viewBox="0 0 24 24">
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
                  Sign up with Google
                </span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
