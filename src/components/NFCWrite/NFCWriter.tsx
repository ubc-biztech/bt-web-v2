import React, { useEffect, useRef, useState, useMemo } from "react";
import "./writer.css";

/* type token as string */
type NFCWriterProps = {
  token: string;
  exit: () => void;
  closeAll: () => void;
  profileSrc?: string;
  successSubtext?: string;
  failurePrimary?: string;
  failureSecondary?: string;
};

type Status = "ready" | "writing" | "success" | "error" | "not_supported";

/**
 * Narrowed types for Web NFC with optionality to avoid DOM lib coupling
 * on the server (Vercel/Next.js). We only use the fields we need.
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
  exit,
  profileSrc,
  closeAll,
  successSubtext,
  failurePrimary = "Unable to Write!",
  failureSecondary = "Please find a Dev Team member.",
}: NFCWriterProps) => {
  const [status, setStatus] = useState<Status>("ready");
  const [errorMessage, setErrorMessage] = useState<string>("");
  const timeoutIdRef = useRef<number | null>(null);
  const readerRef = useRef<NDEFReaderLike | null>(null);
  const mountedRef = useRef<boolean>(false);

  // Visual classes (copied from NFCWriterDupe)
  const isSuccess = status === "success";
  const isError = status === "error";
  const ringClass = useMemo(() => {
    if (isSuccess) return "rings rings--success";
    if (isError) return "rings rings--error";
    return "rings";
  }, [isSuccess, isError]);

  const profileClass = useMemo(() => {
    if (isSuccess) return "profileImage profileImage--success";
    if (isError) return "profileImage profileImage--error";
    return "profileImage";
  }, [isSuccess, isError]);

  useEffect(() => {
    mountedRef.current = true;
    startNfcWrite();
    return () => {
      mountedRef.current = false;
      if (timeoutIdRef.current !== null) {
        window.clearTimeout(timeoutIdRef.current);
        timeoutIdRef.current = null;
      }
      if (readerRef.current) {
        try {
          readerRef.current.removeEventListener("reading", onReading);
          readerRef.current.removeEventListener("readingerror", onReadingError);
        } catch {
          // ignore
        }
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const clearOpTimeout = () => {
    if (timeoutIdRef.current !== null) {
      window.clearTimeout(timeoutIdRef.current);
      timeoutIdRef.current = null;
    }
  };

  const setOpTimeout = () => {
    clearOpTimeout();
    timeoutIdRef.current = window.setTimeout(() => {
      setStatus("error");
      setErrorMessage("Operation timed out. Please try again.");
    }, 10000);
  };

  const onReading = async (_event: NDEFReadingEventLike) => {
    try {
      const ndef = readerRef.current;
      if (!ndef) return;
      await ndef.write({
        records: [{ recordType: "text", data: token }],
      });
      clearOpTimeout();
      if (!mountedRef.current) return;
      setStatus("success");
      window.setTimeout(() => {
        if (mountedRef.current) exit();
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

  const onReadingError = () => {
    clearOpTimeout();
    if (!mountedRef.current) return;
    setStatus("error");
    setErrorMessage("Error reading NFC tag");
  };

  const startNfcWrite = async () => {
    if (typeof window === "undefined") {
      return;
    }
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
      const NDEFReaderCtor = (
        window as unknown as {
          NDEFReader: new () => NDEFReaderLike;
        }
      ).NDEFReader;
      const ndef = new NDEFReaderCtor();
      readerRef.current = ndef;
      setOpTimeout();
      await ndef.scan();
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
    <div className="writerContainer">
      {/* Visuals for ready/writing/success/error */}
      {(status === "ready" ||
        status === "writing" ||
        status === "success" ||
        status === "error") && (
        <>
          <div className={ringClass}>
            <div className="ring" />
            <div className="ring" />
            <div className="ring" />
            <div className="ring" />
          </div>
          <div className={profileClass}>
            {profileSrc ? (
              <img src={profileSrc} alt="Profile" />
            ) : (
              <span className="profileInitials"> </span>
            )}
          </div>
        </>
      )}
      {/* Status messages */}
      {status === "ready" && (
        <div className="statusMessage">
          <img className="card-image" src="/card.png" alt="Card" />
          Hold Card Close to Your Device
        </div>
      )}
      {status === "writing" && (
        <div className="statusMessage">
          <img className="card-image" src="/card.png" alt="Card" />
          Hold Card Close to Your Device
        </div>
      )}
      {status === "success" && (
        <div className="statusMessage success successMessage">
          <div className="successTitle">Success!</div>
          <div className="successSubtext">
            {successSubtext ?? "Hand the card to Leshawn."}
          </div>
        </div>
      )}
      {status === "error" && (
        <div className="statusMessage failure failureMessage">
          <div className="failureTitle">{failurePrimary}</div>
          <div className="failureSubtext">
            {failureSecondary}
            <br />
            {errorMessage ? errorMessage : ""}
          </div>
        </div>
      )}
      {status === "not_supported" && (
        <div className="statusMessage error">
          NFC is not supported on this device
        </div>
      )}
      {/* Bottom buttons */}
      <div className="bottomActions">
        {status === "error" && (
          <button
            className="secondaryButton"
            onClick={() => setStatus("ready")}
          >
            Try Again
          </button>
        )}
        <button className="cancelButton" onClick={exit}>
          Done
        </button>
      </div>
    </div>
  );
};

export default NFCWriter;
