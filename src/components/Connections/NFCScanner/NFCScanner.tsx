import React, { useEffect, useState, useRef } from "react";
import { useRouter } from "next/router";

interface NFCScannerProps {
  onScanDetected: (params: any) => void;
}

const NFCScanner: React.FC<NFCScannerProps> = ({ onScanDetected }) => {
  const router = useRouter();
  const [isScanning, setIsScanning] = useState(false);
  const processedScanRef = useRef<string | null>(null);

  useEffect(() => {
    const { scan, profileId, eventId } = router.query;
    
    const scanKey = `${profileId}-${eventId}`;
    
    if (scan === 'true' && profileId && processedScanRef.current !== scanKey) {
      console.log('NFC scan detected:', { profileId, eventId });
      processedScanRef.current = scanKey;
      onScanDetected({ profileId, eventId });
    }
  }, [router.query, onScanDetected]);

  return null;
};

export default NFCScanner;