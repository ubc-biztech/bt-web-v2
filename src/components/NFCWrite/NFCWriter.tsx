import React, { useEffect, useRef, useState, useMemo } from "react";
import { fetchBackend } from "@/lib/db";
import { generateNfcProfileUrl } from "@/util/nfcUtils";
import { useNFCSupport } from "@/hooks/useNFCSupport";
import { useUserNeedsCard } from "@/hooks/useUserNeedsCard";
import Image from "next/image";

/**
 * NFCWriter Component
 * Handles the actual NFC tag writing process using Web NFC API
 * Shows visual feedback during writing and success/error states
 */

type NFCWriterProps = {
  token?: string;
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
  token: profileID,
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
  const [token, setToken] = useState<string>(profileID || "");
  const [errorMessage, setErrorMessage] = useState<string>("");
  const { isNFCSupported, isLoading } = useNFCSupport();
  const { checkUserNeedsCard } = useUserNeedsCard();

  // Reference to timeout for operation timeout handling
  const timeoutIdRef = useRef<number | null>(null);

  // Reference to NFC reader instance
  const readerRef = useRef<NDEFReaderLike | null>(null);

  // Tracks if component is still mounted (prevents state updates after unmount)
  const mountedRef = useRef<boolean>(false);

  // Visual styling classes based on current status
  const isSuccess = status === "success";
  const isError = status === "error" || status === "non_member";

  const nfcUrl = generateNfcProfileUrl(token);

  // Helper component for consistent status rendering
  const StatusContent = ({
    children,
    hasImage = false,
    imageSrc = "/assets/icons/nfc_write_icon.png",
    imageAlt = "Card",
  }: {
    children: React.ReactNode;
    hasImage?: boolean;
    imageSrc?: string;
    imageAlt?: string;
  }) => (
    <div className="absolute w-full left-1/2 top-[65%] transform -translate-x-1/2 gap-2 pointer-events-none z-[1000] text-center px-8">
      {hasImage && (
        <div className="mb-4">
          <Image
            className="w-[70px] h-[70px] object-cover mx-auto"
            src={imageSrc}
            alt={imageAlt}
            width={70}
            height={70}
          />
        </div>
      )}
      <div className="text-sm font-medium max-w-xs mx-auto leading-relaxed">
        {children}
      </div>
    </div>
  );

  // Helper component for success/error states with larger text
  const StatusMessage = ({
    title,
    subtitle,
  }: {
    title: string;
    subtitle?: string;
  }) => (
    <div className="absolute w-full left-1/2 top-[65%] transform -translate-x-1/2 gap-2 pointer-events-none z-[1000] text-center px-8">
      <div className="text-xl font-extrabold tracking-wide">{title}</div>
      {subtitle && (
        <div className="opacity-95 text-sm max-w-sm mx-auto leading-relaxed mt-2 text-wrap">
          {subtitle}
        </div>
      )}
    </div>
  );

  const ringClass = useMemo(() => {
    const baseClasses =
      "absolute top-[25%] left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] pointer-events-none z-[500] flex items-center justify-center transition-all duration-500";
    if (isSuccess) return `${baseClasses} top-[30%] w-[400px] h-[400px]`;
    if (isError) return `${baseClasses} top-[30%] w-[400px] h-[400px]`;
    return baseClasses;
  }, [isSuccess, isError]);

  const profileClass = useMemo(() => {
    const baseClasses =
      "w-[90px] aspect-square rounded-full absolute bt-bt-blue-400 top-[25%] left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-[1000] bg-bt-blue-200 grid place-items-center overflow-hidden transition-all duration-500";
    if (isSuccess)
      return `${baseClasses} top-[30%] w-[100px] bg-bt-green-200 shadow-[0_30px_90px_rgba(45,209,125,0.4)] bg-green-500`;
    if (isError)
      return `${baseClasses} top-[30%] w-[100px] bg-bt-red-200 shadow-[0_30px_90px_rgba(212,74,74,0.35)] bg-red-500`;
    return baseClasses;
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
      if (token === "" || !token) {
        const check = await checkUserNeedsCard(email);
        setToken(check.profileID ?? "");
        if (!check.profileID) {
          setStatus("non_member");
          return;
        }

        if (!check.needsCard) {
          setStatus("completed");
        } else {
          setStatus("writing");
        }
      } else {
        setStatus("writing");
      }

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
    <div className="flex flex-col items-center justify-center h-screen w-screen bg-black/50 backdrop-blur-[10px] fixed top-0 left-0 text-white z-[1000] pb-16 overflow-hidden">
      {(status === "ready" ||
        status === "writing" ||
        status === "completed" ||
        status === "success" ||
        status === "error") && (
        <>
          {/* Animated rings that change color based on status */}
          <div className={ringClass}>
            <div
              className={`absolute top-0 left-0 w-full h-full rounded-full pointer-events-none opacity-[0.22] ring-animation ring-1 transition-all duration-500 ${
                isSuccess
                  ? "bg-gradient-to-b from-green-400/14 to-green-600/6 opacity-90"
                  : isError
                    ? "bg-gradient-to-b from-red-500/19 to-red-700/9 opacity-90"
                    : "bg-gradient-radial from-blue-400/32 to-blue-800/11"
              }`}
            />
            <div
              className={`absolute w-3/4 h-3/4 left-[12.5%] top-[12.5%] rounded-full pointer-events-none opacity-[0.35] ring-animation ring-2 transition-all duration-500 ${
                isSuccess
                  ? "bg-gradient-to-b from-green-400/14 to-green-600/6 opacity-90"
                  : isError
                    ? "bg-gradient-to-b from-red-500/19 to-red-700/9 opacity-90"
                    : "bg-gradient-radial from-blue-400/32 to-blue-800/11"
              }`}
            />
            <div
              className={`absolute w-[55%] h-[55%] left-[22.5%] top-[22.5%] rounded-full pointer-events-none opacity-50 ring-animation ring-3 transition-all duration-500 ${
                isSuccess
                  ? "bg-gradient-to-b from-green-400/14 to-green-600/6 opacity-90"
                  : isError
                    ? "bg-gradient-to-b from-red-500/19 to-red-700/9 opacity-90"
                    : "bg-gradient-radial from-blue-400/32 to-blue-800/11"
              }`}
            />
            <div
              className={`absolute w-[35%] h-[35%] left-[32.5%] top-[32.5%] rounded-full pointer-events-none opacity-70 ring-animation ring-4 transition-all duration-500 ${
                isSuccess
                  ? "bg-gradient-to-b from-green-400/14 to-green-600/6 opacity-90"
                  : isError
                    ? "bg-gradient-to-b from-red-500/19 to-red-700/9 opacity-90"
                    : "bg-gradient-radial from-blue-400/32 to-blue-800/11"
              }`}
            />
          </div>

          <div className={profileClass}>
            <Image
              src={"/assets/biztech_logo.svg"}
              alt="Profile"
              fill
              className="object-cover"
            />
          </div>
        </>
      )}

      {status === "ready" && (
        <StatusContent hasImage={true}>
          Hold Card Close to Your Device
        </StatusContent>
      )}

      {status === "completed" && (
        <StatusContent hasImage={true}>
          User has already been assigned NFC, only write if necessary
        </StatusContent>
      )}

      {status === "writing" && (
        <StatusContent hasImage={true}>
          Hold Card Close to Your Device
        </StatusContent>
      )}

      {status === "success" && (
        <StatusMessage
          title="Success!"
          subtitle={successSubtext ?? "Hand the card to " + firstName}
        />
      )}

      {status === "error" && (
        <StatusMessage
          title={failurePrimary}
          subtitle={`${failureSecondary}${errorMessage ? `\n${errorMessage}` : ""}`}
        />
      )}

      {status === "not_supported" && (
        <StatusContent>
          <span className="text-red-400">
            NFC is not supported on this device
          </span>
        </StatusContent>
      )}

      {status === "non_member" && (
        <StatusContent>
          <span className="text-red-400">
            User is not a member, cannot write profile
          </span>
        </StatusContent>
      )}

      {status === "loading" && (
        <StatusContent hasImage={true}>Checking NFC Support...</StatusContent>
      )}

      <div className="absolute bottom-12 left-0 right-0 flex gap-3 justify-center z-[1200]">
        {status === "error" && (
          <button
            className="bg-white/24 border border-white/28 w-30 h-10 flex items-center justify-center text-white text-lg cursor-pointer rounded-full p-2"
            onClick={() => setStatus("ready")}
          >
            Try Again
          </button>
        )}

        <button
          className="bg-white/168 border border-white/204 w-28 h-10 flex items-center justify-center text-white text-xl cursor-pointer shadow-[inset_2px_2px_10px_rgba(255,255,255,0.2)] rounded-full p-2"
          onClick={closeAll}
        >
          Done
        </button>
      </div>
    </div>
  );
};
