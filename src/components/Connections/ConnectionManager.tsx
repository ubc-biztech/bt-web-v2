import React, { useState } from "react";
import { useRouter } from "next/router";
import ConnectionModal from "./ConnectionModal/ConnectionModal";
import NFCScanner from "./NFCScanner/NFCScanner";

const ConnectionManager: React.FC = () => {
  const [modalVisible, setModalVisible] = useState(false);
  const [scanData, setScanData] = useState<any>(null);
  const router = useRouter()
  const [isClosing, setIsClosing] = useState(false);

  const handleScanDetected = (params: any) => {
    if (isClosing) return;
    setScanData(params);
    setModalVisible(true);
  };

  const handleCloseModal = () => {
    setIsClosing(true);
    setModalVisible(false);
    setScanData(null);
    
    const currentQuery = { ...router.query };
    delete currentQuery.scan;
    delete currentQuery.profileId;
    delete currentQuery.eventId;
    
    router.replace(
      {
        pathname: router.pathname,
        query: currentQuery,
      },
      undefined,
      { shallow: true }
    ).then(() => {
      setIsClosing(false);
    });
  };

  return (
    <>
      <NFCScanner onScanDetected={handleScanDetected} />
      
      <ConnectionModal 
        isVisible={modalVisible}
        onClose={handleCloseModal}
      />
    </>
  );
};

export default ConnectionManager;