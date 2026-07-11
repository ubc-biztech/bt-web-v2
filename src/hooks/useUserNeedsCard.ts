import { useState } from "react";
import { fetchBackend } from "@/lib/db";

type MemberCardRecord = {
  cardCount?: number;
  profileID?: string | null;
};

type UserProfileRecord = {
  profileID?: string | null;
};

/**
 * Custom hook to check if a user needs an NFC membership card
 * @param userID - The user's email/ID
 * @returns Object containing:
 *   - needsCard: boolean indicating if user needs a card
 *   - profileID: string | null - the user's profile ID if they need a card
 *   - isLoading: boolean indicating if the check is in progress
 *   - error: string | null - error message if the check failed
 */
export const useUserNeedsCard = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const checkUserNeedsCard = async (
    userID: string,
  ): Promise<{
    needsCard: boolean;
    profileID: string | null;
  }> => {
    setIsLoading(true);
    setError(null);

    try {
      const member = (await fetchBackend({
        endpoint: `/members/${userID}`,
        method: "GET",
      })) as MemberCardRecord | null;

      if (!member) {
        // User is not a member, hence no need for card
        // redundant check, incase the API endpoints updates or returns null.
        console.log(`${userID} is not a member`);
        return { needsCard: false, profileID: null };
      }

      let profileID = member.profileID ?? null;
      if (!profileID) {
        const user = (await fetchBackend({
          endpoint: `/users/${userID}`,
          method: "GET",
        })) as UserProfileRecord | null;
        profileID = user?.profileID ?? null;
      }

      if (!profileID) {
        setError("Member does not have a profile ID yet");
        return { needsCard: false, profileID: null };
      }

      if (member.cardCount && member.cardCount > 0) {
        return { needsCard: false, profileID };
      }

      // User needs a card
      return { needsCard: true, profileID };
    } catch (e: any) {
      // Handle 404 errors specifically (user not found)
      // user is not a member, hence no need for card
      if (e?.status === 404) {
        console.log(`${userID} is not a member`);
        return { needsCard: false, profileID: null };
      }

      // Handle other errors
      const errorMessage = "Failed to check member status";
      setError(errorMessage);
      console.error(errorMessage, e);

      // On error, assume user doesn't need a card for now (fail-safe)
      return { needsCard: false, profileID: null };
    } finally {
      setIsLoading(false);
    }
  };

  return {
    checkUserNeedsCard,
    isLoading,
    error,
  };
};
