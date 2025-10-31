import React from "react";
import { QrProps } from "./types";
import { useEffect, useState } from "react";
import { CirclePlayIcon } from "lucide-react";
import { CircleAlert } from "lucide-react";
import { CheckCircle2 } from "lucide-react";
import { ChevronsUp } from "lucide-react";
import { QrReader } from "react-qr-reader";
import {
  REGISTRATION_STATUS,
  QR_SCAN_STAGE,
  CAMERA_FACING_MODE,
  SCAN_CYCLE_DELAY,
} from "@/constants/registrations";
import NoCamera from "../../../public/assets/icons/nocamera_icon.svg";
import { Result } from "@zxing/library";
import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import { fetchBackend } from "@/lib/db";
import { NfcPopup } from "../NFCWrite/NFCPopup";
import { useUserNeedsCard } from "@/hooks/useUserNeedsCard";

/**
 * MAIN EVENT CHECK-IN COMPONENT
 * This component handles QR code-based check-ins for event participants.
 * It scans QR codes containing participant information and validates them before checking in.
 *
 * Check-in Process:
 * 1. Scans QR code with format: email;event_id;year;first_name
 * 2. Validates participant is registered for the event
 * 3. Checks registration status (prevents duplicate check-ins)
 * 4. Updates registration status to "checkedIn" via API call
 * 5. Checks if user needs NFC membership card
 * 6. If needed, launches NFC writer modal (NFCPopup)
 * 7. Provides visual feedback for success/failure states
 */

// an enumeration for the stages of QR code scanning
export const QrCheckIn: React.FC<QrProps> = ({
  event,
  rows,
  isQrReaderToggled,
  setQrReaderToggled,
}) => {
  // State for QR code scanning and processing
  const defaultQrCode = {
    data: "",
  };
  const [qrCode, setQrCode] = useState(defaultQrCode);
  const [qrCodeText, setQrCodeText] = useState<string>("");
  const [qrScanStage, setQrScanStage] = useState(QR_SCAN_STAGE.SCANNING);
  const [cameraFacingMode, setCameraFacingMode] = useState(
    CAMERA_FACING_MODE.BACK,
  );
  const [checkInName, setCheckInName] = useState("none");
  const [error, setError] = useState("");

  // NFC popup state - controls when to show membership card writing interface
  const [showNfcPopup, setShowNfcPopup] = useState(false);

  // Main QR code processing effect - triggers when QR text is scanned
  useEffect(() => {
    if (
      !qrCode ||
      qrCodeText === "" ||
      typeof qrCodeText !== "string" ||
      qrScanStage !== QR_SCAN_STAGE.SCANNING
    )
      return;

    // Parse QR code data: email;event_id;year;first_name
    const id = qrCodeText.split(";");
    const userID = id[0];
    const eventIDAndYear = id[1] + ";" + id[2];
    const userFName = id[3];

    // Validate the scanned QR code before proceeding
    if (!isCheckInValid(id, userID, eventIDAndYear)) {
      return;
    }

    // Process the check-in asynchronously
    (async () => {
      await checkInUser(userID, userFName);
    })();
  }, [qrCodeText]);

  // Cleanup effect - resets all state when QR reader is toggled off
  useEffect(() => {
    if (!isQrReaderToggled) {
      setQrScanStage(QR_SCAN_STAGE.SCANNING);
      setShowNfcPopup(false);
      setQrCode(defaultQrCode);
      setQrCodeText("");
      setCheckInName("none");
      setError("");
    }
  }, [isQrReaderToggled]);

  // Helper function to determine CSS classes based on scan stage
  const scanStateClassName = (scanStage: string) => {
    switch (scanStage) {
      case QR_SCAN_STAGE.SUCCESS:
        return "bg-bt-green-300";

      case QR_SCAN_STAGE.SCANNING:
        return "bg-bt-green-300";

      case QR_SCAN_STAGE.FAILED:
        return "bg-[#cc0000]";

      default:
        return "bg-bt-green-300";
    }
  };

  // Validates if the scanned QR code is valid for check-in
  const isCheckInValid = (
    id: string[],
    userID: string,
    eventIDAndYear: string,
  ): boolean => {
    // Check if QR code is for the correct event and year
    if (eventIDAndYear !== event.id + ";" + event.year) {
      cycleQrScanStage(QR_SCAN_STAGE.FAILED, 8000);

      // Validate QR code format and email structure
      if (id.length !== 4 && !emailCheck(userID)) {
        setError("Invalid BizTech QR code.");
      } else {
        setError("Please check that your QR code is for this event.");
      }
      return false;
    }

    // Find user in registration data
    const user = rows?.filter((row) => row.id === userID)[0];

    if (!user) {
      cycleQrScanStage(QR_SCAN_STAGE.FAILED, 6000);
      setError("Person is not registered for this event.");
      return false;
    }

    // Set the user's display name for UI feedback
    setCheckInName(`${user.fname} ${user.basicInformation.lname} (${userID})`);

    // Check various registration statuses that prevent check-in
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

  // Returns appropriate text based on current scan stage
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

  // Returns appropriate icon based on current scan stage
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

  // Toggles between front and back camera
  const flipCamera = () => {
    if (cameraFacingMode === CAMERA_FACING_MODE.FRONT) {
      setCameraFacingMode(CAMERA_FACING_MODE.BACK);
    } else {
      setCameraFacingMode(CAMERA_FACING_MODE.FRONT);
    }
  };

  // Handles QR code scan results from the camera
  const handleScanQR = (result: Result | null | undefined) => {
    // Note: Prevents re-scanning same QR code, but requires manual reset
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

  // Cycles QR scanner through different stages with automatic reset
  // Similar to tapping a Compass Card - shows feedback then returns to scanning
  const cycleQrScanStage = (stage: string, ms: number) => {
    setQrScanStage(stage);
    setTimeout(() => {
      setQrScanStage(QR_SCAN_STAGE.SCANNING);
    }, ms);
  };

  // Validates email format using regex
  const emailCheck = (email: string) => {
    return /(.+)@(.+){2,}\.(.+){2,}/.test(email);
  };

  // Core check-in function - updates registration status and handles NFC card needs
  const checkInUser = async (id: string, fname: string) => {
    // Prepare API request body for check-in
    const body = {
      eventID: event.id,
      year: parseInt(event.year),
      registrationStatus: REGISTRATION_STATUS.CHECKED_IN,
    };

    try {
      // Update user's registration status to "checkedIn"
      await fetchBackend({
        endpoint: `/registrations/${id}/${fname}`,
        method: "PUT",
        data: body,
      });

      setShowNfcPopup(true);
    } catch (e: any) {
      if (e.status === 409) {
        setError("The user is not registered for this event.");
      } else {
        setError("Internal Server Error, Registration Failed");
      }
      cycleQrScanStage(QR_SCAN_STAGE.FAILED, 8000);
    }

    // Reset QR code state for next scan
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
            {/* Mobile status display */}
            <div
              className={`${scanStateClassName(qrScanStage)} w-full font-size text-lg p-3 rounded-[10px] flex flex-row space-x-3 md:hidden`}
            >
              {scanStateIcon()}
              <p className="font-600">{scanStateText()}</p>
            </div>

            {/* QR code scanner camera view */}
            <div className="w-full md:w-[450px] relative">
              <Image
                className="rounded-[10px]"
                src={NoCamera}
                fill
                alt="no-camera"
              />
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

            {/* Right sidebar with controls and status */}
            <div className="grow w-full md:h-[450px] flex flex-col md:justify-between md:space-y-3">
              {/* Desktop status display */}
              <div
                className={`${scanStateClassName(qrScanStage)} w-full font-size text-lg p-3 rounded-[10px] hidden space-x-3 md:flex md:flex-row`}
              >
                {scanStateIcon()}
                <p className="font-600">{scanStateText()}</p>
              </div>
              <div className="p-3 px-5 shrink bg-bt-blue-300 rounded-[10px]">
                <h2 className="text-white pb-2 text-lg md:text-xl">
                  QR Code Check-in
                </h2>
                <p className="pb-3">Last Scanned: {checkInName}</p>
                <p
                  className="text-bt-green-300 underline pb-3"
                  onClick={() => {
                    setQrCode(defaultQrCode);
                    setQrScanStage(QR_SCAN_STAGE.SCANNING);
                  }}
                >
                  Reset Scanner
                </p>
                <p
                  className="text-bt-green-300 underline pb-3"
                  onClick={() => flipCamera()}
                >
                  Flip Camera Horizontally
                </p>
              </div>

              {/* Collapse button */}
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

            {/* NFC popup for membership card writing */}
            {showNfcPopup && (
              <NfcPopup
                firstName={qrCodeText.split(";")[3]}
                email={qrCodeText.split(";")[0]}
                uuid={""}
                exit={() => {
                  setShowNfcPopup(false);
                  // Show success message for 3 seconds after NFC popup closes
                  cycleQrScanStage(QR_SCAN_STAGE.SUCCESS, 3000);
                }}
                numCards={0}
              />
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
