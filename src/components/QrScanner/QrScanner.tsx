import React from "react";
import { QrProps } from "./types";
import { useEffect, useState } from "react";
import { isMobile } from "@/util/isMobile";
import QrDesktop from "./QrDesktop";
import QrMobile from "./QrMobile";

const QrCheckIn: React.FC<QrProps> = ({
  event,
  rows,
  isQrReaderToggled,
  setQrReaderToggled,
}) => {
  const [isMobileDevice, setIsMobileDevice] = useState(false);
  useEffect(() => {
    const userAgent = navigator.userAgent;
    setIsMobileDevice(isMobile(userAgent));
  }, [navigator.userAgent]);

  return (
    <>
      {isMobileDevice ? (
        <QrMobile
          event={event}
          rows={rows}
          isQrReaderToggled={isQrReaderToggled}
          setQrReaderToggled={setQrReaderToggled}
        />
      ) : (
        <QrDesktop
          event={event}
          rows={rows}
          isQrReaderToggled={isQrReaderToggled}
          setQrReaderToggled={setQrReaderToggled}
        />
      )}
    </>
  );
};

export default QrCheckIn;
