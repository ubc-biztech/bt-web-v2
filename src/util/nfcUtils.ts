/**
 * Utility functions for NFC-related operations
 */

/**
 * Generates the appropriate profile URL based on the current environment
 * @param token - The user's profile token/UUID
 * @returns The profile URL for the current environment
 */
export const generateNfcProfileUrl = (token: string): string => {
  const stage = process.env.NEXT_PUBLIC_REACT_APP_STAGE;

  if (stage === "production") {
    return `https://app.ubcbiztech.com/profile/${token}?scan=true`;
  } else if (stage === "local") {
    return `http://localhost:3000/profile/${token}?scan=true`;
  } else {
    // Default to dev/staging
    return `https://dev.app.ubcbiztech.com/profile/${token}?scan=true`;
  }
};
