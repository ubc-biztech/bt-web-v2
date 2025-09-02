import React, { useEffect, useRef, useState, useMemo } from "react";
import { fetchBackend } from "@/lib/db";
import styles from "./writer.module.css";
import { generateNfcProfileUrl } from "@/util/nfcUtils";
import { useNFCSupport } from "@/hooks/useNFCSupport";
import { useUserNeedsCard } from "@/hooks/useUserNeedsCard";

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
  email: string;
  firstName: string;
  exit: () => void; // close itself
  closeAll: () => void; // Close all modals leading up to and including itself.
  profileSrc?: string;
  successSubtext?: string;
  failurePrimary?: string;
  failureSecondary?: string;
  numCards: number; // Number of cards the user has
};

type Status =
  | "ready"
  | "completed"
  | "writing"
  | "success"
  | "error"
  | "not_supported"
  | "non_member"
  | "loading";

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

export const NFCWriter = ({
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
  const [status, setStatus] = useState<Status>("loading");
  const [token, setToken] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string>("");
  const { isNFCSupported, isLoading } = useNFCSupport();
  const { checkUserNeedsCard } = useUserNeedsCard();

  // Reference to timeout for operation timeout handling
  const timeoutIdRef = useRef<number | null>(null);

  // Reference to NFC reader instance
  const readerRef = useRef<NDEFReaderLike | null>(null);

  // Tracks if component is still mounted (prevents state updates after unmount)
  const mountedRef = useRef<boolean>(false);

  const profileImage = useMemo(() => {
    return profileSrc || generateSeededImage(token);
  }, [profileSrc, token]);

  // Visual styling classes based on current status
  const isSuccess = status === "success";
  const isError = status === "error" || status === "non_member";

  const nfcUrl = generateNfcProfileUrl(token);

  const ringClass = useMemo(() => {
    if (isSuccess) return `${styles.rings} ${styles["rings--success"]}`;
    if (isError) return `${styles.rings} ${styles["rings--error"]}`;
    return styles.rings;
  }, [isSuccess, isError]);

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

    if (isLoading) {
      setStatus("loading");
    } else if (isNFCSupported) {
      setStatus("ready");
      initNfcWriter();
    } else {
      setStatus("not_supported");
    }

    // Cleanup function to prevent memory leaks and state updates after unmount
    return () => {
      mountedRef.current = false;

      if (timeoutIdRef.current !== null) {
        window.clearTimeout(timeoutIdRef.current);
        timeoutIdRef.current = null;
      }

      if (readerRef.current) {
        try {
          readerRef.current.removeEventListener("reading", onReading);
        } catch {
          // Ignore errors during cleanup
        }

        try {
          readerRef.current.removeEventListener("readingerror", onReadingError);
        } catch {
          // Ignore errors during cleanup
        }
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isNFCSupported, isLoading]);

  const clearOpTimeout = () => {
    if (timeoutIdRef.current !== null) {
      window.clearTimeout(timeoutIdRef.current);
      timeoutIdRef.current = null;
    }
  };

  // (10 seconds)
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

      await ndef.write({
        records: [{ recordType: "url", data: nfcUrl }],
      });

      clearOpTimeout();
      if (!mountedRef.current) return;

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
        console.warn("Failed to update card count in database:", error);
      }

      // Auto-close after 3 seconds
      window.setTimeout(() => {
        if (mountedRef.current) closeAll();
      }, 3000);
    } catch (error) {
      clearOpTimeout();
      if (!mountedRef.current) return;

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

  const initNfcWriter = async () => {
    if (typeof window === "undefined") {
      return;
    }

    try {
      const check = await checkUserNeedsCard(email);
      setToken(check.profileID ?? "");

      if (!check.profileID) {
        setStatus("non_member");
        return;
      }

      if (!check.needsCard) {
        setStatus("completed");
      }

      setStatus("writing");

      // Create new NFC reader instance
      const NDEFReaderCtor = (
        window as unknown as {
          NDEFReader: new () => NDEFReaderLike;
        }
      ).NDEFReader;
      const ndef = new NDEFReaderCtor();
      readerRef.current = ndef;

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
      {(status === "ready" ||
        status === "writing" ||
        status === "completed" ||
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

          <div className={profileClass}>
            <img
              src={profileImage}
              alt="Profile"
              className="w-full h-full object-cover"
            />
          </div>
        </>
      )}

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

      {status === "completed" && (
        <div className={styles.statusMessage}>
          <img
            className={styles["card-image"]}
            src="/assets/icons/nfc_write_icon.png"
            alt="Card"
          />
          User has already been assigned NFC, only write if necessary
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

      {status === "non_member" && (
        <div className={`${styles.statusMessage} ${styles.error}`}>
          User is not a member, cannot write profile
        </div>
      )}

      {status === "loading" && (
        <div className={styles.statusMessage}>
          <img
            className={styles["card-image"]}
            src="/assets/icons/nfc_write_icon.png"
            alt="Card"
          />
          Checking NFC Support...
        </div>
      )}

      <div className={styles.bottomActions}>
        {status === "error" && (
          <button
            className={styles.secondaryButton}
            onClick={() => setStatus("ready")}
          >
            Try Again
          </button>
        )}

        <button className={styles.cancelButton} onClick={closeAll}>
          Done
        </button>
      </div>
    </div>
  );
};
