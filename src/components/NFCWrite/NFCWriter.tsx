import React, { useEffect, useRef, useState, useMemo } from "react";
import { fetchBackend } from "@/lib/db";
import styles from "./writer.module.css";

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
    if (isSuccess) return `${styles.rings} ${styles["rings--success"]}`;
    if (isError) return `${styles.rings} ${styles["rings--error"]}`;
    return styles.rings;
  }, [isSuccess, isError]);

  // Dynamic profile image styling for visual feedback
  const profileClass = useMemo(() => {
    if (isSuccess)
      return `${styles.profileImage} ${styles["profileImage--success"]}`;
    if (isError)
      return `${styles.profileImage} ${styles["profileImage--error"]}`;
    return styles.profileImage;
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
    <div className={styles.writerContainer}>
      {/* Visual feedback elements - animated rings and profile image */}
      {(status === "ready" ||
        status === "writing" ||
        status === "success" ||
        status === "error") && (
        <>
          {/* Animated rings that change color based on status */}
          <div className={ringClass}>
            <div className={styles.ring} />
            <div className={styles.ring} style={{ animationDelay: "0.2s" }} />
            <div className={styles.ring} style={{ animationDelay: "0.4s" }} />
            <div className={styles.ring} style={{ animationDelay: "0.6s" }} />
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
        <div className={styles.statusMessage}>
          <img
            className={styles["card-image"]}
            src="/assets/icons/nfc_write_icon.png"
            alt="Card"
          />
          Hold Card Close to Your Device
        </div>
      )}

      {status === "writing" && (
        <div className={styles.statusMessage}>
          <img
            className={styles["card-image"]}
            src="/assets/icons/nfc_write_icon.png"
            alt="Card"
          />
          Hold Card Close to Your Device
        </div>
      )}

      {status === "success" && (
        <div className={`${styles.statusMessage} ${styles.successMessage}`}>
          <div className={styles.successTitle}>Success!</div>
          <div className={styles.successSubtext}>
            {successSubtext ?? "Hand the card to " + firstName}
          </div>
        </div>
      )}

      {status === "error" && (
        <div className={`${styles.statusMessage} ${styles.failureMessage}`}>
          <div className={styles.failureTitle}>{failurePrimary}</div>
          <div className={styles.failureSubtext}>
            {failureSecondary}
            <br />
            {errorMessage ? errorMessage : ""}
          </div>
        </div>
      )}

      {status === "not_supported" && (
        <div className={`${styles.statusMessage} ${styles.error}`}>
          NFC is not supported on this device
        </div>
      )}

      {/* Action buttons at bottom */}
      <div className={styles.bottomActions}>
        {/* Retry button - only shown on error */}
        {status === "error" && (
          <button
            className={styles.secondaryButton}
            onClick={() => setStatus("ready")}
          >
            Try Again
          </button>
        )}

        {/* Done button - always visible */}
        <button className={styles.cancelButton} onClick={exit}>
          Done
        </button>
      </div>
    </div>
  );
};

export default NFCWriter;
