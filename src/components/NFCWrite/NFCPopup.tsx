import React, { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import { NFCWriter } from "./NFCWriter";
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

export const NfcPopup: React.FC<NfcPopupProps> = ({
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
        />
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
            exit={exit}
          />
        </div>
      )}
    </>
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
    <div className="flex flex-col items-center justify-center h-screen w-full bg-black/50 backdrop-blur-[10px] fixed top-0 left-0 right-0 bottom-0 text-white z-[998] px-4 text-center">
      <div className="flex flex-col items-center justify-center gap-5 max-w-sm w-full p-5">
        <div className="max-w-[300px] text-balance bg-white/[0.168] p-4 rounded-xl mb-5 text-base leading-relaxed">
          {name} does not have a Membership Card. Press copy and paste into an
          NFC writing app.
        </div>

        <div className="bg-white/10 p-4 rounded-lg border border-white/20 font-mono text-sm break-all max-w-full text-left text-white/90">
          {nfcUrl}
        </div>

        <button
          onClick={copyToClipboard}
          className={`cursor-pointer flex items-center justify-center gap-2 py-3 px-4 rounded-lg transition-all duration-200 font-medium min-w-[160px] border ${
            copied
              ? "text-emerald-400 bg-emerald-400/10 border-emerald-400"
              : "text-blue-500 bg-blue-500/10 border-blue-500"
          }`}
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
        </button>
      </div>

      <button
        onClick={exit}
        className="bg-white/[0.168] border border-white/[0.204] w-28 h-10 flex items-center justify-center text-white text-xl cursor-pointer shadow-[inset_2px_2px_10px_rgba(255,255,255,0.2)] rounded-[50px] absolute bottom-24 left-1/2 transform -translate-x-1/2 px-4"
      >
        close
      </button>
    </div>
  );
};

const NfcPopupContent = ({
  name,
  image,
  openWriter,
  exit,
}: {
  name: string;
  image?: string;
  openWriter: () => void;
  exit: () => void;
}) => {
  return (
    <div className="flex flex-col items-center justify-center h-screen w-full bg-black/50 backdrop-blur-[10px] fixed top-0 left-0 right-0 bottom-0 text-white z-[998] px-4 text-center">
      {/* Animated Rings */}
      <div className="absolute top-20 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[450px] h-[450px] pointer-events-none z-[500] flex items-center justify-center transition-all duration-500 ease-in-out">
        <div className="absolute top-0 left-0 w-full h-full rounded-full pointer-events-none bg-gradient-radial from-blue-400/32 via-blue-600/11 to-transparent opacity-22 animate-pulse" />
        <div className="absolute top-[12.5%] left-[12.5%] w-3/4 h-3/4 rounded-full pointer-events-none bg-gradient-radial from-blue-400/32 via-blue-600/11 to-transparent opacity-35 animate-pulse animation-delay-200" />
        <div className="absolute top-[22.5%] left-[22.5%] w-[55%] h-[55%] rounded-full pointer-events-none bg-gradient-radial from-blue-400/32 via-blue-600/11 to-transparent opacity-50 animate-pulse animation-delay-400" />
        <div className="absolute top-[32.5%] left-[32.5%] w-[35%] h-[35%] rounded-full pointer-events-none bg-gradient-radial from-blue-400/32 via-blue-600/11 to-transparent opacity-70 animate-pulse animation-delay-600" />
      </div>

      {/* Profile Image */}
      <div className="w-[110px] aspect-square rounded-full absolute top-8 left-1/2 transform -translate-x-1/2 z-[1000] bg-cyan-300 grid place-items-center overflow-hidden bg-cover bg-center bg-no-repeat transition-all duration-500 ease-in-out">
        <Image
          src={image || "/assets/icons/profile_icon.svg"}
          alt="profile"
          fill
          sizes="100vw"
          className="object-cover"
        />
      </div>

      <div className="mt-32 mb-8 text-lg">
        {name} does not have a membership card.
      </div>

      <button
        onClick={openWriter}
        className="bg-white/[0.168] border border-white/[0.204] w-28 h-10 flex items-center justify-center text-white text-xl cursor-pointer shadow-[inset_2px_2px_10px_rgba(255,255,255,0.2)] rounded-[50px] px-4"
      >
        Write to Card
      </button>

      <button
        onClick={exit}
        className="bg-white/[0.168] border border-white/[0.204] w-28 h-10 flex items-center justify-center text-white text-xl cursor-pointer shadow-[inset_2px_2px_10px_rgba(255,255,255,0.2)] rounded-[50px] absolute bottom-24 left-1/2 transform -translate-x-1/2 px-4"
      >
        close
      </button>
    </div>
  );
};
