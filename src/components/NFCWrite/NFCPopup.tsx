import React, { useState, useEffect, useMemo } from "react";
import NFCWriter from "./NFCWriter";
import styles from "./writer.module.css";

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
  name: string; // User's display name
  userId: string; // User's unique identifier
  image?: string; // Optional profile image URL
  exit: () => void; // Function to close popup and return to QR scanner
  numCards: number; // Number of cards the user has
};

const NfcPopup: React.FC<NfcPopupProps> = ({
  name,
  userId,
  image,
  exit,
  numCards,
}: NfcPopupProps) => {
  // Controls whether to show NFCWriter component
  const [showWriter, setShowWriter] = useState(false);

  // Tracks if current device supports NFC writing
  const [isDeviceSupported, setIsDeviceSupported] = useState(false);

  // Generate consistent profile image if none provided
  const profileImage = useMemo(() => {
    return image || generateSeededImage(userId);
  }, [image, userId]);

  // Check device NFC support on component mount
  useEffect(() => {
    const checkDeviceSupport = () => {
      // Check if Web NFC API is available in browser
      if (!("NDEFReader" in window)) {
        return false;
      }
      return true;
    };

    setIsDeviceSupported(checkDeviceSupport());
  }, []);

  // Opens NFCWriter component for actual tag writing
  const openWriter = () => {
    setShowWriter(true);
  };

  // Returns to popup view from NFCWriter
  const closeWriter = () => {
    setShowWriter(false);
  };

  // Closes both popup and writer, returns to QR scanner
  const closeAll = () => {
    setShowWriter(false);
    exit();
  };

  return (
    <>
      {/* NFCWriter component - handles actual NFC tag writing */}
      {showWriter && (
        <NFCWriter
          token={userId}
          exit={closeWriter}
          profileSrc={profileImage}
          closeAll={closeAll}
          numCards={numCards}
        ></NFCWriter>
      )}

      {/* Show appropriate content based on device support */}
      {!isDeviceSupported ? (
        // Device doesn't support NFC - show manual instructions
        <DeviceNotSupported name={name} manualWrite={false} exit={exit} />
      ) : (
        // Device supports NFC - show writing interface
        <div>
          <NfcPopupContent
            name={name}
            image={profileImage}
            openWriter={openWriter}
          />
        </div>
      )}
    </>
  );
};

// Component shown when device doesn't support NFC
const DeviceNotSupported = ({
  name,
  manualWrite,
  exit,
}: {
  name: string;
  manualWrite: boolean;
  exit: () => void;
}) => {
  return (
    <div className={styles.nfcPopupContent}>
      {manualWrite ? (
        <div>Device not compatible, please find a anroid device to help.</div>
      ) : (
        <div>
          {name} does not have a Membership Card.
          <br></br>
          Refer them to an exec with an android device to help.
        </div>
      )}
      <button onClick={exit} className={styles.glassButton}>
        close
      </button>
    </div>
  );
};

// Main popup content - shows user profile and write button
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
      {/* User's profile picture */}
      <div className={styles.profileImage}>
        <img src={image} alt="profile" />
      </div>

      {/* Instructions for user */}
      <div>
        {name} does not have a membership card. Swipe up to write to card
      </div>

      {/* Button to start NFC writing process */}
      <div onClick={openWriter} className={styles.glassButton}>
        Write to Card
      </div>
    </div>
  );
};

export default NfcPopup;
