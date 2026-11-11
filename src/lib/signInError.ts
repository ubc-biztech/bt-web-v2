export enum AuthErrorCode {
  USER_NOT_FOUND = "UserNotFoundException",
  NOT_AUTHORIZED = "NotAuthorizedException",
  LIMIT_EXCEEDED = "LimitExceededException",
  TOO_MANY_REQUESTS = "TooManyRequestsException",
  TOO_MANY_FAILED_ATTEMPTS = "TooManyFailedAttemptsException",
  PASSWORD_RESET_REQUIRED = "PasswordResetRequiredException",
  NETWORK_ERROR = "NetworkError",
  USER_NOT_CONFIRMED = "UserNotConfirmedException",
}

export function getSignInErrorCode(error: unknown): string | undefined {
  const authError = error as { name?: string; code?: string } | null;
  return authError?.code ?? authError?.name;
}

export function getSignInErrorMessage(error: unknown): string {
  switch (getSignInErrorCode(error)) {
    case AuthErrorCode.USER_NOT_FOUND:
    case AuthErrorCode.NOT_AUTHORIZED:
      return "Check your email and password, then try again.";
    case AuthErrorCode.LIMIT_EXCEEDED:
    case AuthErrorCode.TOO_MANY_REQUESTS:
    case AuthErrorCode.TOO_MANY_FAILED_ATTEMPTS:
      return "Too many attempts. Wait a few minutes, then try again.";
    case AuthErrorCode.PASSWORD_RESET_REQUIRED:
      return "Use “Forgot password?” to reset your password, then sign in.";
    case AuthErrorCode.NETWORK_ERROR:
      return "Check your internet connection, then try again.";
    default:
      return "Please try again. If this continues, refresh the page.";
  }
}
