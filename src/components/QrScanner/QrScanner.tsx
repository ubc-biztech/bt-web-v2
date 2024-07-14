import React from "react";
import { useEffect, useState } from "react";
import QrReader from "react-qr-reader";
import { REGISTRATION_STATUS } from "@/constants/registrations";

interface QrProps {
  event: { id: string; year: string };
  rows?: { id: string; [x: string | number | symbol]: unknown }[];
}

// paperRoot: {
//     borderRadius: "4px",
//     marginBottom: "5px",
//     overflowX: "auto"
//   },
//   qrRoot: {
//     borderRadius: "4px",
//     padding: "10px"
//   },
//   qrOutput: {
//     marginTop: "10px",
//     marginBottom: "10px",
//     textAlign: "center"
//   }

// an enumeration for the stages of QR code scanning
const QR_SCAN_STAGE = {
  SCANNING: "SCANNING",
  FAILED: "FAILED",
  SUCCESS: "SUCCESS",
};

// facing mode for the camera
const CAMERA_FACING_MODE = {
  FRONT: "user",
  BACK: "environment",
};

const QrCheckIn: React.FC<QrProps> = (props) => {
  // const classes = useStyles(); this needs to be rewritten
  const [visible, setVisible] = useState(false);
  const defaultQrCode = {
    data: "",
  };
  const [qrCode, setQrCode] = useState(defaultQrCode);
  const [qrScanStage, setQrScanStage] = useState(QR_SCAN_STAGE.SCANNING);
  const [cameraFacingMode, setCameraFacingMode] = useState(
    CAMERA_FACING_MODE.BACK
  );
  const [checkInName, setCheckInName] = useState("");
  const [error, setError] = useState("");

  const flipCamera = () => {
    if (cameraFacingMode === CAMERA_FACING_MODE.FRONT) {
      setCameraFacingMode(CAMERA_FACING_MODE.BACK);
    } else {
      setCameraFacingMode(CAMERA_FACING_MODE.FRONT);
    }
  };
  const [qrCodeText, setQrCodeText] = useState<string>("");
  const handleScanQR = (data: { text: string }) => {
    // conditional check may be necessary to prevent re-scans of the same QR code, but this implementation is unintuitive
    // when wanting to re-scan (requires a manual reset)
    // if (data.data !== qrCode.data) setQrCode(data);
    if (data) {
      console.log("Scanned QR Code Data: ", data);
      if ("text" in data) {
        console.log("Scanned QR Code Text: ", data.text);
        setQrCodeText(data.text); // Update qrCodeText state
      } else {
        console.log("Scanned QR Code does not contain text property");
      }
    } else {
      console.log("No QR Code Scanned Data");
    }
  };

  // DONT NEED THIS IN NEW DEPENDENCY
  const cycleQrScanStage = (stage, ms) => {
    setQrScanStage(stage);
    setTimeout(() => {
      setQrScanStage(QR_SCAN_STAGE.SCANNING);
    }, ms);
  };

  const emailCheck = (email: string) => {
    return /(.+)@(.+){2,}\.(.+){2,}/.test(email);
  };

  // checks if the QR code is valid whenever the QR code is changed
  useEffect(() => {
    const checkInUser = (id, fname) => {
      const body = {
        eventID: props.event.id,
        year: props.event.year,
        registrationStatus: REGISTRATION_STATUS.CHECKED_IN,
      };

      // update the registration status of the user to checked in
      fetchBackend(`/registrations/${id}/${fname}`, "PUT", body);

      setQrCode(defaultQrCode);

      // wait 10 seconds, then reset the scan stage
      cycleQrScanStage(QR_SCAN_STAGE.SUCCESS, 8000);

      // refresh the entire table to reflect change
      // props.refresh();
    };

    if (
      !qrCode ||
      qrCodeText === "" ||
      typeof qrCodeText !== "string" ||
      qrScanStage !== QR_SCAN_STAGE.SCANNING
    )
      return;

    // data is arranged: email;event_id;year
    // id is the array of the data split by ";"
    const id = qrCodeText.split(";");
    const userID = id[0];
    const eventIDAndYear = id[1] + ";" + id[2];
    const userFName = id[3];

    // validate event ID and year as the current event
    if (eventIDAndYear !== props.event.id + ";" + props.event.year) {
      cycleQrScanStage(QR_SCAN_STAGE.FAILED, 8000);

      // if there are not 4 and first item is not an email, then the QR code is invalid
      if (id.length !== 4 && !emailCheck(userID)) {
        setError("Invalid BizTech QR code.");
      } else {
        setError("Please check that your QR code is for this event.");
      }
      return;
    }

    const user = props.rows?.filter((row) => row.id === userID)[0];

    if (!user) {
      cycleQrScanStage(QR_SCAN_STAGE.FAILED, 6000);
      setError("Person is not registered for this event.");
      return;
    }
    // fetchBackend(
    //   `/events/${props.event.id}/${props.event.year.toString()}?${params}`,
    //   "GET"
    // )
    //   .then((users) => {
    //     // filter the users to get the one with the same id
    //     const user = users.filter((user) => user.id === userID)[0];

    //     if (!user) {
    //       cycleQrScanStage(QR_SCAN_STAGE.FAILED, 6000);
    //       setError("Person is not registered for this event.");
    //       return;
    //     }

    // get the person's name
    setCheckInName(
      `${user.firstName ? user.firstName : user.fname} ${
        user.lastName ? user.lastName : user.lname
      } (${userID})`
    );

    // If the user is already checked in, show an error
    if (user.registrationStatus === REGISTRATION_STATUS.CHECKED_IN) {
      cycleQrScanStage(QR_SCAN_STAGE.FAILED, 5000);
      setError("Person is already checked in.");
      return;
    } else if (user.registrationStatus === REGISTRATION_STATUS.CANCELLED) {
      cycleQrScanStage(QR_SCAN_STAGE.FAILED, 5000);
      setError("Person had their registration cancelled. Cannot check-in.");
      return;
    } else if (user.registrationStatus === REGISTRATION_STATUS.WAITLISTED) {
      cycleQrScanStage(QR_SCAN_STAGE.FAILED, 5000);
      setError("Person is on the waitlist. Cannot check-in.");
      return;
    }
    checkInUser(userID, userFName);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [qrCodeText]);

  return (
    <Paper className={classes.qrRoot}>
      {/* Toggle QR Scanner */}
      <div style={styles.toggleContainer}>
        <Link
          onClick={() => setVisible(!visible)}
          style={styles.toggleQrScanner}
        >
          <img src={QRIcon} alt="QR Icon" style={styles.qrIcon} />
          Toggle QR Scanner for Check-In
        </Link>
      </div>

      {visible && (
        <div className={classes.qrOutput}>
          <Alert
            variant="filled"
            severity={
              qrScanStage === QR_SCAN_STAGE.SUCCESS
                ? "success"
                : qrScanStage === QR_SCAN_STAGE.SCANNING
                ? "info"
                : "error"
            }
          >
            {qrScanStage === QR_SCAN_STAGE.SUCCESS
              ? `Checked-in successfully for ${checkInName}! Your attendance table will be updated shortly.`
              : qrScanStage === QR_SCAN_STAGE.SCANNING
              ? "Ready to scan a QR code to check-in. 😎"
              : `🚨 ERROR: ${error}`}
          </Alert>

          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <QrReader
              containerStyle={styles.qrCodeVideo}
              onResult={handleScanQR}
              constraints={{
                facingMode: cameraFacingMode,
              }}
              scanDelay={250}
            />
          </div>

          <div>
            {/* Manually reset scanner */}
            <Link
              onClick={() => {
                setQrCode(defaultQrCode);
                setQrScanStage(QR_SCAN_STAGE.SCANNING);
              }}
            >
              Manually Reset Scanner
            </Link>

            <Link> | </Link>

            {/* Flip camera */}
            <Link onClick={() => flipCamera()}>Switch Camera</Link>
          </div>

          <div>
            {/* Last person who was scanned */}
            <Typography variant="body2">
              Last scanned: {checkInName || "None"}
            </Typography>
          </div>
        </div>
      )}
    </Paper>
  );
};
