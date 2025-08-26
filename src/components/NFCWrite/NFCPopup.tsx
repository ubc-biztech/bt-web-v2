import React, { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import NFCWriter from "./NFCWriter";
import styles from "./writer.module.css";
import { useNFCSupport } from "@/hooks/useNFCSupport";

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
    <>
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
        <DeviceNotSupported name={firstName} exit={exit} />
      ) : (
        <div>
          <NfcPopupContent
            name={firstName}
            image={profileImage}
            openWriter={openWriter}
          />
        </div>
      )}
    </>
  );
};

const DeviceNotSupported = ({
  name,
  exit,
}: {
  name: string;
  exit: () => void;
}) => {
  return (
    <div className={styles.nfcPopupContent}>
      <div>
        {name} does not have a Membership Card.
        <br></br>
        Refer them to an exec with an android device to help.
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
