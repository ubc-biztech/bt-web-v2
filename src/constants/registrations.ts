export const ATTENDEE_TABLE_TYPE = "attendee";
export const PARTNER_TABLE_TYPE = "partner";
export const APPLICATION_TABLE_TYPE = "applicationView";
export const REGISTRATION_STATUS_KEY = "registrationStatus";
export const APPLICATION_STATUS_KEY = "applicationStatus";

// const styles = {
//   stats: {
//     width: "100%",
//     display: "flex",
//     margin: "6px",
//     cursor: "pointer"
//   },
//   stat: {
//     margin: "10px"
//   },
//   container: {
//     marginRight: "30px",
//     "& .MuiTableRoot": {
//       position: "sticky"
//     },
//     width: "100%",
//     height: "calc(100vh - 32px)",
//     overflow: "auto"
//   },
//   table: {
//     display: "grid",
//     overflowX: "auto",
//     color: COLORS.FONT_COLOR,
//     background: COLORS.LIGHT_BACKGROUND_COLOR
//   },
//   qrCodeVideo: {
//     width: "300px",
//     height: "300px",
//     display: "flex",
//     justifyContent: "center",
//     alignItems: "center"
//   },
//   toggleQrScanner: {
//     fontSize: "1.5rem",
//     fontWeight: "bold"
//   },
//   qrIcon: {
//     width: "20px",
//     height: "20px",
//     display: "flex-inline",
//     justifyContent: "center",
//     alignItems: "center",
//     paddingTop: "4px",
//     paddingLeft: "2px",
//     paddingRight: "2px"
//   },
//   ellipsis: {
//     maxWidth: 200,
//     whiteSpace: "nowrap",
//     overflow: "hidden",
//     textOverflow: "ellipsis"
//   },
//   toggleContainer: {
//     display: "flex",
//     justifyContent: "left",
//     alignItems: "bottom"
//   }
// };

export const REGISTRATION_STATUS = {
  REGISTERED: "registered",
  CHECKED_IN: "checkedIn",
  WAITLISTED: "waitlist",
  CANCELLED: "cancelled",
  INCOMPLETE: "incomplete"
};
export const REGISTRATION_LABELS = {
  registered: "Registered",
  checkedIn: "Checked In",
  waitlist: "Waitlisted",
  cancelled: "Cancelled",
  incomplete: "Incomplete",
  1: "1st Year",
  2: "2nd Year",
  3: "3rd Year",
  4: "4th Year",
  5: "5th+ Year"
};
export const EMAIL_REGEX = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

// (
//   <Paper className={classes.qrRoot}>
//     {/* Toggle QR Scanner */}
//     <div style={styles.toggleContainer}>
//       <Link
//         onClick={() => setVisible(!visible)}
//         style={styles.toggleQrScanner}
//       >
//         <img src={QRIcon} alt="QR Icon" style={styles.qrIcon} />
//         Toggle QR Scanner for Check-In
//       </Link>
//     </div>

//     {visible && (
//       <div className={classes.qrOutput}>
//         <Alert
//           variant="filled"
//           severity={
//             qrScanStage === QR_SCAN_STAGE.SUCCESS
//               ? "success"
//               : qrScanStage === QR_SCAN_STAGE.SCANNING
//               ? "info"
//               : "error"
//           }
//         >
//           {qrScanStage === QR_SCAN_STAGE.SUCCESS
//             ? `Checked-in successfully for ${checkInName}! Your attendance table will be updated shortly.`
//             : qrScanStage === QR_SCAN_STAGE.SCANNING
//             ? "Ready to scan a QR code to check-in. 😎"
//             : `🚨 ERROR: ${error}`}
//         </Alert>

//         <div
//           style={{
//             display: "flex",
//             justifyContent: "center",
//             alignItems: "center",
//           }}
//         >
//           <QrReader
//             containerStyle={styles.qrCodeVideo}
//             onResult={handleScanQR}
//             constraints={{
//               facingMode: cameraFacingMode,
//             }}
//             scanDelay={250}
//           />
//         </div>

//         <div>
//           {/* Manually reset scanner */}
//           <div
//             onClick={() => {
//               setQrCode(defaultQrCode);
//               setQrScanStage(QR_SCAN_STAGE.SCANNING);
//             }}
//           >
//             Manually Reset Scanner
//           </div>

//           <div> | </div>

//           {/* Flip camera */}
//           <div onClick={() => flipCamera()}>Switch Camera</div>
//         </div>

//         <div>
//           {/* Last person who was scanned */}
//           <Typography variant="body2">
//             Last scanned: {checkInName || "None"}
//           </Typography>
//         </div>
//       </div>
//     )}
//   </Paper>
// );