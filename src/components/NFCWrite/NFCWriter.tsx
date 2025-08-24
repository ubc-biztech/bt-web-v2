import React, { useEffect, useRef, useState, useMemo } from "react";
import { fetchBackend } from "@/lib/db";

// Generates consistent avatar images based on user ID seed
// Uses DiceBear API to create unique but repeatable profile pictures
const generateSeededImage = (seed: string): string => {
  return `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(seed)}`;
};

/**
 * NFCWriter Component
 * Handles the actual NFC tag writing process using Web NFC API
 * Shows visual feedback during writing and success/error states
 */

type NFCWriterProps = {
  token: string; // User ID to write to NFC tag
  email: string; // User's email
  firstName: string; // User's first name
  exit: () => void; // Return to NFCPopup
  closeAll: () => void; // Close everything, return to QR scanner
  profileSrc?: string; // User's profile image URL
  successSubtext?: string; // Custom success message
  failurePrimary?: string; // Custom primary error message
  failureSecondary?: string; // Custom secondary error message
  numCards: number; // Number of cards the user has
};

// Possible states during NFC writing process
type Status = "ready" | "writing" | "success" | "error" | "not_supported";

/**
 * Type definitions for Web NFC API
 * Narrowed types to avoid DOM lib coupling on server (Vercel/Next.js)
 */
type NDEFReadingEventLike = Event & {
  serialNumber?: string;
  message?: unknown;
};

type NDEFReaderLike = {
  scan: () => Promise<void>;
  write: (data: unknown) => Promise<void>;
  addEventListener: (
    type: "reading" | "readingerror",
    listener: (evt: NDEFReadingEventLike) => void,
  ) => void;
  removeEventListener: (
    type: "reading" | "readingerror",
    listener: (evt: NDEFReadingEventLike) => void,
  ) => void;
};

const NFCWriter = ({
  token,
  email,
  firstName,
  exit,
  profileSrc,
  closeAll,
  successSubtext,
  failurePrimary = "Unable to Write!",
  failureSecondary = "Please find a Dev Team member.",
  numCards,
}: NFCWriterProps) => {
  // Current state of NFC writing process
  const [status, setStatus] = useState<Status>("ready");

  // Error message to display if writing fails
  const [errorMessage, setErrorMessage] = useState<string>("");

  // Reference to timeout for operation timeout handling
  const timeoutIdRef = useRef<number | null>(null);

  // Reference to NFC reader instance
  const readerRef = useRef<NDEFReaderLike | null>(null);

  // Tracks if component is still mounted (prevents state updates after unmount)
  const mountedRef = useRef<boolean>(false);

  // Generate consistent profile image if none provided
  const profileImage = useMemo(() => {
    return profileSrc || generateSeededImage(token);
  }, [profileSrc, token]);

  // Visual styling classes based on current status
  const isSuccess = status === "success";
  const isError = status === "error";

  // Dynamic ring styling for visual feedback
  const ringClass = useMemo(() => {
    if (isSuccess)
      return "absolute top-[38%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-[560px] h-[560px] pointer-events-none z-[500] flex items-center justify-center transition-all duration-500 ease-in-out";
    if (isError)
      return "absolute top-[38%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-[560px] h-[560px] pointer-events-none z-[500] flex items-center justify-center transition-all duration-500 ease-in-out";
    return "absolute top-20 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[450px] h-[450px] pointer-events-none z-[500] flex items-center justify-center transition-all duration-500 ease-in-out";
  }, [isSuccess, isError]);

  // Dynamic profile image styling for visual feedback
  const profileClass = useMemo(() => {
    if (isSuccess)
      return "w-32 aspect-square rounded-full absolute top-[38%] left-1/2 -translate-x-1/2 -translate-y-1/2 z-[1000] bg-green-400 grid place-items-center overflow-hidden bg-cover bg-center bg-no-repeat transition-all duration-500 ease-in-out shadow-[0_30px_90px_rgba(45,209,125,0.4)]";
    if (isError)
      return "w-32 aspect-square rounded-full absolute top-[38%] left-1/2 -translate-x-1/2 -translate-y-1/2 z-[1000] bg-red-400 grid place-items-center overflow-hidden bg-cover bg-center bg-no-repeat transition-all duration-500 ease-in-out shadow-[0_30px_90px_rgba(212,74,74,0.35)]";
    return "w-28 aspect-square rounded-full absolute top-8 left-1/2 -translate-x-1/2 z-[1000] bg-cyan-400 grid place-items-center overflow-hidden bg-cover bg-center bg-no-repeat transition-all duration-500 ease-in-out";
  }, [isSuccess, isError]);

  // Initialize NFC writing process on component mount
  useEffect(() => {
    mountedRef.current = true;
    startNfcWrite();

    // Cleanup function to prevent memory leaks and state updates after unmount
    return () => {
      mountedRef.current = false;

      // Clear any pending timeouts
      if (timeoutIdRef.current !== null) {
        window.clearTimeout(timeoutIdRef.current);
        timeoutIdRef.current = null;
      }

      // Remove event listeners from NFC reader
      if (readerRef.current) {
        try {
          readerRef.current.removeEventListener("reading", onReading);
          readerRef.current.removeEventListener("readingerror", onReadingError);
        } catch {
          // Ignore errors during cleanup
        }
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Clears the operation timeout
  const clearOpTimeout = () => {
    if (timeoutIdRef.current !== null) {
      window.clearTimeout(timeoutIdRef.current);
      timeoutIdRef.current = null;
    }
  };

  // Sets a timeout for the NFC operation (10 seconds)
  const setOpTimeout = () => {
    clearOpTimeout();
    timeoutIdRef.current = window.setTimeout(() => {
      setStatus("error");
      setErrorMessage("Operation timed out. Please try again.");
    }, 10000);
  };

  // Handles successful NFC tag detection and writing
  const onReading = async (_event: NDEFReadingEventLike) => {
    try {
      const ndef = readerRef.current;
      if (!ndef) return;

      // Write user ID to NFC tag as text record
      await ndef.write({
        records: [{ recordType: "text", data: token }],
      });

      clearOpTimeout();
      if (!mountedRef.current) return;

      // Show success state
      setStatus("success");

      // Update user's card count in database (silently handle errors)
      try {
        await fetchBackend({
          endpoint: `/members/${email}`,
          method: "PATCH",
          data: {
            cardCount: numCards + 1,
          },
        });
      } catch (error) {
        // Silently handle API errors - don't affect user experience
        // Log error for debugging purposes only
        console.warn("Failed to update card count in database:", error);
      }

      // Auto-close after 3 seconds
      window.setTimeout(() => {
        if (mountedRef.current) exit();
      }, 3000);
    } catch (error) {
      clearOpTimeout();
      if (!mountedRef.current) return;

      // Show error state with details
      setStatus("error");
      setErrorMessage(
        (error as Error)?.message || "Failed to write to NFC tag",
      );
    }
  };

  // Handles NFC reading errors
  const onReadingError = () => {
    clearOpTimeout();
    if (!mountedRef.current) return;

    setStatus("error");
    setErrorMessage("Error reading NFC tag");
  };

  // Initializes and starts the NFC writing process
  const startNfcWrite = async () => {
    if (typeof window === "undefined") {
      return;
    }

    // Check if device supports Web NFC API
    const hasNFC =
      "NDEFReader" in window &&
      typeof (window as unknown as { NDEFReader?: new () => NDEFReaderLike })
        .NDEFReader === "function";

    if (!hasNFC) {
      setStatus("not_supported");
      return;
    }

    try {
      setStatus("writing");

      // Create new NFC reader instance
      const NDEFReaderCtor = (
        window as unknown as {
          NDEFReader: new () => NDEFReaderLike;
        }
      ).NDEFReader;
      const ndef = new NDEFReaderCtor();
      readerRef.current = ndef;

      // Set operation timeout and start scanning for NFC tags
      setOpTimeout();
      await ndef.scan();

      // Add event listeners for NFC tag detection and errors
      ndef.addEventListener("reading", onReading);
      ndef.addEventListener("readingerror", onReadingError);
    } catch (error) {
      clearOpTimeout();
      setStatus("error");
      setErrorMessage(
        (error as Error)?.message || "Failed to start NFC operation",
      );
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen w-screen bg-black/35 backdrop-blur-md absolute top-0 left-0 text-white z-[1000] pb-16">
      {/* Visual feedback elements - animated rings and profile image */}
      {(status === "ready" ||
        status === "writing" ||
        status === "success" ||
        status === "error") && (
        <>
          {/* Animated rings that change color based on status */}
          <div className={ringClass}>
            <div
              className={`absolute top-0 left-0 w-full h-full rounded-full pointer-events-none ${isSuccess ? "bg-gradient-to-b from-green-400/14 via-green-600/6 to-transparent opacity-90" : isError ? "bg-gradient-to-b from-red-400/19 via-red-600/9 to-transparent opacity-90" : "bg-gradient-radial from-blue-400/32 via-blue-600/11 to-transparent opacity-22"} animate-rings transition-all duration-500 ease-in-out`}
            />
            <div
              className={`absolute w-3/4 h-3/4 left-[12.5%] top-[12.5%] rounded-full pointer-events-none ${isSuccess ? "bg-gradient-to-b from-green-400/14 via-green-600/6 to-transparent opacity-90" : isError ? "bg-gradient-to-b from-red-400/19 via-red-600/9 to-transparent opacity-90" : "bg-gradient-radial from-blue-400/32 via-blue-600/11 to-transparent opacity-35"} animate-rings transition-all duration-500 ease-in-out`}
              style={{ animationDelay: "0.2s" }}
            />
            <div
              className={`absolute w-[55%] h-[55%] left-[22.5%] top-[22.5%] rounded-full pointer-events-none ${isSuccess ? "bg-gradient-to-b from-green-400/14 via-green-600/6 to-transparent opacity-90" : isError ? "bg-gradient-to-b from-red-400/19 via-red-600/9 to-transparent opacity-90" : "bg-gradient-radial from-blue-400/32 via-blue-600/11 to-transparent opacity-50"} animate-rings transition-all duration-500 ease-in-out`}
              style={{ animationDelay: "0.4s" }}
            />
            <div
              className={`absolute w-[35%] h-[35%] left-[32.5%] top-[32.5%] rounded-full pointer-events-none ${isSuccess ? "bg-gradient-to-b from-green-400/14 via-green-600/6 to-transparent opacity-90" : isError ? "bg-gradient-to-b from-red-400/19 via-red-600/9 to-transparent opacity-90" : "bg-gradient-radial from-blue-400/32 via-blue-600/11 to-transparent opacity-70"} animate-rings transition-all duration-500 ease-in-out`}
              style={{ animationDelay: "0.6s" }}
            />
          </div>

          {/* User's profile picture with status-based styling */}
          <div className={profileClass}>
            <img
              src={profileImage}
              alt="Profile"
              className="w-full h-full object-cover"
            />
          </div>
        </>
      )}

      {/* Status messages for different stages */}
      {status === "ready" && (
        <div className="text-xl text-center max-w-full font-medium mb-12 flex flex-col items-center gap-6 z-[1000]">
          <img className="w-24 object-cover" src="/card.png" alt="Card" />
          Hold Card Close to Your Device
        </div>
      )}

      {status === "writing" && (
        <div className="text-xl text-center max-w-full font-medium mb-12 flex flex-col items-center gap-6 z-[1000]">
          <img className="w-24 object-cover" src="/card.png" alt="Card" />
          Hold Card Close to Your Device
        </div>
      )}

      {status === "success" && (
        <div className="text-xl text-center max-w-full font-medium mb-12 flex flex-col items-center gap-6 z-[1000] text-white absolute w-full left-1/2 top-[calc(56%+8px)] -translate-x-1/2 gap-2 pointer-events-none">
          <div className="text-5xl font-extrabold tracking-wide">Success!</div>
          <div className="opacity-95">
            {successSubtext ?? "Hand the card to " + firstName}
          </div>
        </div>
      )}

      {status === "error" && (
        <div className="text-xl text-center max-w-full font-medium mb-12 flex flex-col items-center gap-6 z-[1000] text-white absolute w-full left-1/2 top-[calc(56%+8px)] -translate-x-1/2 gap-2 pointer-events-none">
          <div className="text-5xl font-extrabold tracking-wide">
            {failurePrimary}
          </div>
          <div className="opacity-95">
            {failureSecondary}
            <br />
            {errorMessage ? errorMessage : ""}
          </div>
        </div>
      )}

      {status === "not_supported" && (
        <div className="text-xl text-center max-w-full font-medium mb-12 flex flex-col items-center gap-6 z-[1000] text-red-400">
          NFC is not supported on this device
        </div>
      )}

      {/* Action buttons at bottom */}
      <div className="absolute bottom-12 left-0 right-0 flex gap-3 justify-center z-[1200]">
        {/* Retry button - only shown on error */}
        {status === "error" && (
          <button
            className="bg-white/24 border border-white/28 w-32 h-10 flex items-center justify-center text-white text-lg cursor-pointer rounded-full"
            onClick={() => setStatus("ready")}
          >
            Try Again
          </button>
        )}

        {/* Done button - always visible */}
        <button
          className="bg-white/17 border border-white/20 w-28 h-10 flex items-center justify-center text-white text-xl cursor-pointer shadow-[inset_2px_2px_10px_rgba(255,255,255,0.2)] rounded-full"
          onClick={exit}
        >
          Done
        </button>
      </div>
    </div>
  );
};

export default NFCWriter;
