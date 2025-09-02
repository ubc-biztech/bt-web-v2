import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useUserNeedsCard } from "@/hooks/useUserNeedsCard";
import { useNFCSupport } from "@/hooks/useNFCSupport";
import { NFCWriter } from "@/components/NFCWrite/NFCWriter";
import { CellContext } from "@tanstack/react-table";
import { Registration } from "@/types/types";

interface NFCCardCellProps extends CellContext<Registration, unknown> {
  refreshTable: () => Promise<void>;
}

export const NFCCardCell: React.FC<NFCCardCellProps> = ({
  row,
  refreshTable,
}) => {
  const [showNfcWriter, setShowNfcWriter] = useState(false);
  const [profileID, setProfileID] = useState<string | null>(null);
  const [needsCard, setNeedsCard] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  const { checkUserNeedsCard } = useUserNeedsCard();
  const { isNFCSupported, isLoading: nfcCheckLoading } = useNFCSupport();

  const email = row.original.id;
  const firstName = row.original.basicInformation?.fname || "User";

  useEffect(() => {
    const checkCardStatus = async () => {
      if (!email) {
        setIsChecking(false);
        return;
      }

      try {
        const result = await checkUserNeedsCard(email);
        setNeedsCard(result.needsCard);
        setProfileID(result.profileID);
      } catch (error) {
        console.error("Failed to check card status:", error);
        setNeedsCard(false);
      } finally {
        setIsChecking(false);
      }
    };

    checkCardStatus();
  }, [email]);

  const handleWriteToCard = () => {
    setShowNfcWriter(true);
  };

  const closeNfcWriter = () => {
    setShowNfcWriter(false);
  };

  const closeAllNfc = () => {
    setShowNfcWriter(false);
  };

  // Show loading state while checking card status
  if (isChecking || nfcCheckLoading) {
    return (
      <div className="flex items-center justify-center h-8">
        <div className="w-4 h-4 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  // If user doesn't need a card, show nothing
  if (!needsCard) {
    return <span className="text-gray-400">-</span>;
  }

  // Case 1: Device doesn't support NFC - show "Needs Card ⚑"
  if (!isNFCSupported) {
    return (
      <span className="text-orange-600 font-medium flex items-center gap-1">
        Needs Card ⚑
      </span>
    );
  }

  // Case 2: Device supports NFC - show write button
  return (
    <>
      <Button
        onClick={handleWriteToCard}
        variant="outline"
        size="sm"
        className="bg-transparent border-white/20 text-white hover:bg-white/10"
      >
        Write to Card
      </Button>

      {/* NFC Writer Modal */}
      {showNfcWriter && profileID && (
        <NFCWriter
          token={profileID}
          email={email}
          firstName={firstName}
          exit={closeNfcWriter}
          closeAll={closeAllNfc}
          numCards={0}
        />
      )}
    </>
  );
};
