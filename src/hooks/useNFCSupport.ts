import { useState, useEffect } from "react";

/**
 * Custom hook to check if the current device supports NFC writing
 * @returns Object containing:
 *   - isNFCSupported: boolean indicating if device supports NFC
 *   - isLoading: boolean indicating if the check is in progress
 */
export const useNFCSupport = () => {
  const [isNFCSupported, setIsNFCSupported] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkNFCSupport = () => {
      if (typeof window === "undefined") {
        setIsNFCSupported(false);
        setIsLoading(false);
        return;
      }

      // Check if Web NFC API is available in browser
      const hasNFC = "NDEFReader" in window;
      setIsNFCSupported(hasNFC);
      setIsLoading(false);
    };

    checkNFCSupport();
  }, []);

  return {
    isNFCSupported,
    isLoading,
  };
};
