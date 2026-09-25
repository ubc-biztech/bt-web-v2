export const generateStageURL = (): string => {
  const stage = process.env.NEXT_PUBLIC_REACT_APP_STAGE;

  if (stage === "production") {
    return `https://app.ubcbiztech.com`;
  } else if (stage === "local") {
    return `http://localhost:3000`;
  } else {
    return `https://dev.app.ubcbiztech.com`;
  }
};

export const getQueryString = (
  value: string | string[] | undefined,
): string | undefined => {
  if (typeof value === "string") return value;
  if (Array.isArray(value)) return value[0];
  return undefined;
};

export const getSafeRedirect = (
  value: string | string[] | undefined,
): string => {
  const path = getQueryString(value);
  // Only root-relative app paths may be used as checkout return destinations.
  if (
    !path?.startsWith("/") ||
    path.startsWith("//") ||
    /[\\\x00-\x1f\x7f]/.test(path)
  ) {
    return "/";
  }
  return path;
};

export const getMembershipHref = (
  redirect: string | string[] | undefined,
): string => {
  const path = getSafeRedirect(redirect);
  if (path === "/") return "/membership";
  // Onboarding may already be returning to membership with an event attached.
  if (path === "/membership" || path.startsWith("/membership?")) return path;
  return `/membership?redirect=${encodeURIComponent(path)}`;
};
