import React, { Dispatch, SetStateAction } from "react";
import { useEffect, useState } from "react";
import { isMobile } from "@/util/isMobile";
import QrDesktop from "./QrDesktop";
import QrMobile from "./QrMobile";

interface QrProps {
  event: { id: string; year: string };
  rows?: {
    id: string;
    firstname: string;
    lastname: string;
    [x: string | number | symbol]: unknown;
  }[];
  visible: boolean; // requires useState from parent so the QR can be toggled from a button elsewhere in the parent
  setVisible: Dispatch<SetStateAction<boolean>>;
}

const QrCheckIn: React.FC<QrProps> = ({ event, rows, visible, setVisible }) => {
  const [isMobileDevice, setIsMobileDevice] = useState(false);
  useEffect(() => {
    const userAgent = navigator.userAgent;
    setIsMobileDevice(isMobile(userAgent));
  }, []);

  return (
    <>
      {isMobileDevice ? (
        <QrMobile
          event={event}
          rows={rows}
          visible={visible}
          setVisible={setVisible}
        />
      ) : (
        <QrDesktop
          event={event}
          rows={rows}
          visible={visible}
          setVisible={setVisible}
        />
      )}
    </>
  );
};

export default QrCheckIn;
