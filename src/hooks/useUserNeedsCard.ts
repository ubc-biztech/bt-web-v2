import { useState } from "react";
import { fetchBackend } from "@/lib/db";

/**
 * Custom hook to check if a user needs an NFC membership card
 * @param userID - The user's email/ID
 * @returns Object containing:
 *   - needsCard: boolean indicating if user needs a card
 *   - memberUUID: string | null - the user's profile ID if they need a card
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
    memberUUID: string | null;
  }> => {
    setIsLoading(true);
    setError(null);
    try {
      const member = await fetchBackend({
        endpoint: `/members/${userID}`,
        method: "GET",
      });

      if (!member) {
        // User is not a member, hence no need for card
        // redundant check, incase the API endpoints updates or returns null.
        console.log(`${userID} is not a member`);
        return { needsCard: false, memberUUID: null };
      }

      if (member.cardCount) {
        // User already has a card, no need for new one
        return { needsCard: false, memberUUID: null };
      }

      // User needs a card
      return { needsCard: true, memberUUID: member.profileID };
    } catch (e: any) {
      // Handle 404 errors specifically (user not found)
      // user is not a member, hence no need for card
      if (e?.status === 404) {
        console.log(`${userID} is not a member`);
        return { needsCard: false, memberUUID: null };
      }

      // Handle other errors
      const errorMessage = "Failed to check member status";
      setError(errorMessage);
      console.error(errorMessage, e);

      // On error, assume user doesn't need a card for now (fail-safe)
      return { needsCard: false, memberUUID: null };
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
