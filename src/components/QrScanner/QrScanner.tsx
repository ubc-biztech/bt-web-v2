import React from "react";
import { QrProps } from "./types";
import { useEffect, useState } from "react";
import { CirclePlayIcon } from "lucide-react";
import { CircleAlert } from "lucide-react";
import { CheckCircle2 } from "lucide-react";
import { ChevronsUp } from "lucide-react";
import { QrReader } from "react-qr-reader";
import { REGISTRATION_STATUS, QR_SCAN_STAGE, CAMERA_FACING_MODE, SCAN_CYCLE_DELAY } from "@/constants/registrations";
import NoCamera from "../../../public/assets/icons/nocamera_icon.svg";
import { Result } from "@zxing/library";
import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import { fetchBackend } from "@/lib/db";

// an enumeration for the stages of QR code scanning
const QrCheckIn: React.FC<QrProps> = ({ event, rows, isQrReaderToggled, setQrReaderToggled }) => {
  const defaultQrCode = {
    data: "",
  };
  const [qrCode, setQrCode] = useState(defaultQrCode);
  const [qrCodeText, setQrCodeText] = useState<string>("");
  const [qrScanStage, setQrScanStage] = useState(QR_SCAN_STAGE.SCANNING);
  const [cameraFacingMode, setCameraFacingMode] = useState(CAMERA_FACING_MODE.BACK);
  const [checkInName, setCheckInName] = useState("none");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!qrCode || qrCodeText === "" || typeof qrCodeText !== "string" || qrScanStage !== QR_SCAN_STAGE.SCANNING) return;

    // data is arranged: email;event_id;year
    // id is the array of the data split by ";"
    const id = qrCodeText.split(";");
    const userID = id[0];
    const eventIDAndYear = id[1] + ";" + id[2];
    const userFName = id[3];

    if (!isCheckInValid(id, userID, eventIDAndYear)) {
      return;
    }

    checkInUser(userID, userFName);
  }, [qrCodeText]);

  const scanStateClassName = (scanStage: string) => {
    switch (scanStage) {
      case QR_SCAN_STAGE.SUCCESS:
        return "bg-secondary-color";

      case QR_SCAN_STAGE.SCANNING:
        return "bg-secondary-color";

      case QR_SCAN_STAGE.FAILED:
        return "bg-[#cc0000]";

      default:
        return "bg-secondary-color";
    }
  };

  const isCheckInValid = (id: string[], userID: string, eventIDAndYear: string): boolean => {
    if (eventIDAndYear !== event.id + ";" + event.year) {
      cycleQrScanStage(QR_SCAN_STAGE.FAILED, 8000);

      // if there are not 4 and first item is not an email, then the QR code is invalid
      if (id.length !== 4 && !emailCheck(userID)) {
        setError("Invalid BizTech QR code.");
      } else {
        setError("Please check that your QR code is for this event.");
      }
      return false;
    }

    const user = rows?.filter((row) => row.id === userID)[0];

    if (!user) {
      cycleQrScanStage(QR_SCAN_STAGE.FAILED, 6000);
      setError("Person is not registered for this event.");
      return false;
    }

    // get the person's name
    setCheckInName(`${user.fname} ${user.basicInformation.lname} (${userID})`);

    // If the user is already checked in, show an error
    if (user.registrationStatus === REGISTRATION_STATUS.CHECKED_IN) {
      cycleQrScanStage(QR_SCAN_STAGE.FAILED, SCAN_CYCLE_DELAY);
      setError("Person is already checked in.");
      return false;
    } else if (user.registrationStatus === REGISTRATION_STATUS.CANCELLED) {
      cycleQrScanStage(QR_SCAN_STAGE.FAILED, SCAN_CYCLE_DELAY);
      setError("Person had their registration cancelled. Cannot check-in.");
      return false;
    } else if (user.registrationStatus === REGISTRATION_STATUS.WAITLISTED) {
      cycleQrScanStage(QR_SCAN_STAGE.FAILED, SCAN_CYCLE_DELAY);
      setError("Person is on the waitlist. Cannot check-in.");
      return false;
    }

    return true;
  };

  const scanStateText = () => {
    switch (qrScanStage) {
      case QR_SCAN_STAGE.SUCCESS:
        return "Scan successful!";

      case QR_SCAN_STAGE.SCANNING:
        return "Ready to scan!";

      case QR_SCAN_STAGE.FAILED:
        return `Error: ${error}`;

      default:
        return "Ready to scan!";
    }
  };

  const scanStateIcon = () => {
    switch (qrScanStage) {
      case QR_SCAN_STAGE.SUCCESS:
        return <CirclePlayIcon width={40} height={40} />;

      case QR_SCAN_STAGE.SCANNING:
        return <CheckCircle2 width={40} height={40} />;

      case QR_SCAN_STAGE.FAILED:
        return <CircleAlert width={40} height={40} />;

      default:
        return <CheckCircle2 width={40} height={40} />;
    }
  };

  const flipCamera = () => {
    if (cameraFacingMode === CAMERA_FACING_MODE.FRONT) {
      setCameraFacingMode(CAMERA_FACING_MODE.BACK);
    } else {
      setCameraFacingMode(CAMERA_FACING_MODE.FRONT);
    }
  };

  const handleScanQR = (result: Result | null | undefined) => {
    // conditional check may be necessary to prevent re-scans of the same QR code, but this implementation is unintuitive
    // when wanting to re-scan (requires a manual reset)
    // if (data.data !== qrCode.data) setQrCode(data);

    if (!!result) {
      console.log("Scanned QR Code Data: ", result);
      if ("text" in result) {
        console.log("Scanned QR Code Text: ", result.getText());
        setQrCodeText(result.getText());
      } else {
        console.log("Scanned QR Code does not contain text property");
      }
    } else {
      console.log("No QR Code Scanned Data");
    }
  };

  // puts the QR code scanner in a scanning state after a grace period, like tapping your Compass Card
  // stage is type QR_SCAN_STAGE
  const cycleQrScanStage = (stage: string, ms: number) => {
    setQrScanStage(stage);
    setTimeout(() => {
      setQrScanStage(QR_SCAN_STAGE.SCANNING);
    }, ms);
  };

  const emailCheck = (email: string) => {
    return /(.+)@(.+){2,}\.(.+){2,}/.test(email);
  };

  const checkInUser = (id: string, fname: string) => {
    const body = {
      eventID: event.id,
      year: parseInt(event.year),
      registrationStatus: REGISTRATION_STATUS.CHECKED_IN,
    };

    try {
      fetchBackend({ endpoint: `/registrations/${id}/${fname}`, method: "PUT", data: body });
      // wait 10 seconds, then reset the scan stage
      cycleQrScanStage(QR_SCAN_STAGE.SUCCESS, 8000);
    } catch (e) {
      setError("Internal Server Error, Registration Failed");
      // wait 10 seconds, then reset the scan stage
      cycleQrScanStage(QR_SCAN_STAGE.FAILED, 8000);
    }

    setQrCode(defaultQrCode);
  };

  return (
    <>
      <AnimatePresence mode="wait">
        {isQrReaderToggled && (
          <motion.div
            className={`flex flex-col space-y-2 items-center p-3 md:flex-row md:space-x-3`}
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -100, opacity: 0 }}
            transition={{
              type: "tween",
              ease: "easeInOut",
              duration: 0.3,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={`${scanStateClassName(qrScanStage)} w-full font-size text-lg p-3 rounded-[10px] flex flex-row space-x-3 md:hidden`}>
              {scanStateIcon()}
              <p className="font-600">{scanStateText()}</p>
            </div>

            <div className="w-full md:w-[450px] relative">
              <Image className="rounded-[10px]" src={NoCamera} fill alt="no-camera" />
              <QrReader
                onResult={handleScanQR}
                className="object-cover w-full md:w-[450px] flex justify-center items-center"
                constraints={{
                  facingMode: cameraFacingMode,
                }}
                videoStyle={{ objectFit: "cover", borderRadius: "10px" }}
                scanDelay={250}
              />
            </div>

            <div className="grow w-full md:h-[450px] flex flex-col md:justify-between md:space-y-3">
              <div className={`${scanStateClassName(qrScanStage)} w-full font-size text-lg p-3 rounded-[10px] hidden space-x-3 md:flex md:flex-row`}>
                {scanStateIcon()}
                <p className="font-600">{scanStateText()}</p>
              </div>
              <div className="p-3 px-5 shrink bg-navbar-tab-hover-bg rounded-[10px]">
                <h2 className="text-white pb-2 text-lg md:text-xl">QR Code Check-in</h2>
                <p className="pb-3">Last Scanned: {checkInName}</p>
                <p
                  className="text-secondary-color underline pb-3"
                  onClick={() => {
                    setQrCode(defaultQrCode);
                    setQrScanStage(QR_SCAN_STAGE.SCANNING);
                  }}
                >
                  Reset Scanner
                </p>
                <p className="text-secondary-color underline pb-3" onClick={() => flipCamera()}>
                  Flip Camera Horizontally
                </p>
              </div>
              <div className="grow md:pt-10 flex flex-row content-end justify-center pb-3 space-x-2 mt-3 items-end">
                <ChevronsUp width={20} height={20} />
                <div
                  className="text-center underline"
                  onClick={() => {
                    setQrReaderToggled(false);
                  }}
                >
                  Collapse Qr Scanner
                </div>
                <ChevronsUp width={20} height={20} />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default QrCheckIn;
