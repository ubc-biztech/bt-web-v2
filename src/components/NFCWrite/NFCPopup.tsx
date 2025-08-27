import React, { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import { NFCWriter } from "./NFCWriter";
import { Portal } from "./Portal";
import styles from "./writer.module.css";
import { useNFCSupport } from "@/hooks/useNFCSupport";
import { generateNfcProfileUrl } from "@/util/nfcUtils";

// Generates consistent avatar images based on user ID seed
// Uses DiceBear API to create unique but repeatable profile pictures
const generateSeededImage = (seed: string): string => {
  return `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(seed)}`;
};

/**
 * NFC Writing Flow:
 * 1. NFCPopup appears after QR scan determines user needs a card
 * 2. User sees their profile and "Write to Card" button
 * 3. User taps button → NFCPopup disappears, NFCWriter appears
 * 4. NFCWriter handles actual NFC tag writing
 * 5. On completion → NFCWriter disappears, returns to QR scanner
 */

type NfcPopupProps = {
  firstName: string;
  email: string;
  uuid: string;
  image?: string;
  exit: () => void;
  numCards: number;
};

const NfcPopup: React.FC<NfcPopupProps> = ({
  firstName,
  email,
  uuid,
  image,
  exit,
  numCards,
}: NfcPopupProps) => {
  const [showWriter, setShowWriter] = useState(false);
  const { isNFCSupported } = useNFCSupport();

  const profileImage = useMemo(() => {
    return image || generateSeededImage(uuid);
  }, [image, uuid]);

  const openWriter = () => {
    setShowWriter(true);
  };
  // returns to popup view
  const closeWriter = () => {
    setShowWriter(false);
  };

  // Closes both popup and writer, returns to QR scanner
  const closeAll = () => {
    setShowWriter(false);
    exit();
  };

  return (
    <Portal>
      {showWriter && (
        <NFCWriter
          token={uuid}
          firstName={firstName}
          email={email}
          exit={closeWriter}
          profileSrc={profileImage}
          closeAll={closeAll}
          numCards={numCards}
        ></NFCWriter>
      )}

      {/* Show appropriate content based on device support */}
      {!isNFCSupported ? (
        <DeviceNotSupported name={firstName} exit={exit} token={uuid} />
      ) : (
        <div>
          <NfcPopupContent
            name={firstName}
            image={profileImage}
            openWriter={openWriter}
          />
        </div>
      )}
    </Portal>
  );
};

const DeviceNotSupported = ({
  name,
  exit,
  token,
}: {
  name: string;
  exit: () => void;
  token: string;
}) => {
  const nfcUrl = generateNfcProfileUrl(token);

  const [copied, setCopied] = useState(false);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(nfcUrl);
      setCopied(true);
      // Reset the copied state after 2 seconds
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy to clipboard:", err);
    }
  };

  return (
    <div className={styles.nfcPopupContent}>
      <div className={styles.deviceNotSupportedContent}>
        <div className={styles.nfcPopupTitle}>
          {name} does not have a Membership Card. Press copy and paste into an
          NFC writing app.
        </div>
        <div
          onClick={copyToClipboard}
          className={styles.copyButton}
          style={{
            color: copied ? "#10B981" : "#007AFF",
            backgroundColor: copied
              ? "rgba(16, 185, 129, 0.1)"
              : "rgba(0, 122, 255, 0.1)",
            border: `1px solid ${copied ? "#10B981" : "#007AFF"}`,
          }}
        >
          {copied ? (
            <>
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M20 6L9 17l-5-5" />
              </svg>
              Copied!
            </>
          ) : (
            <>
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
                <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
              </svg>
              Copy NFC content
            </>
          )}
        </div>
      </div>

      <button onClick={exit} className={styles.glassButton}>
        close
      </button>
    </div>
  );
};

const NfcPopupContent = ({
  name,
  image,
  openWriter,
}: {
  name: string;
  image?: string;
  openWriter: () => void;
}) => {
  return (
    <div className={styles.nfcPopupContent}>
      <div className={styles.profileImage}>
        <Image
          src={image || "/assets/icons/profile_icon.svg"}
          alt="profile"
          fill
          className="object-cover"
        />
      </div>

      <div>{name} does not have a membership card.</div>

      <div onClick={openWriter} className={styles.glassButton}>
        Write to Card
      </div>
    </div>
  );
};

export default NfcPopup;
