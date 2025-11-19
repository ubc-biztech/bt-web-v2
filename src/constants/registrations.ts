export const ATTENDEE_TABLE_TYPE = "attendee";
export const PARTNER_TABLE_TYPE = "partner";
export const APPLICATION_TABLE_TYPE = "applicationView";
export const REGISTRATION_STATUS_KEY = "registrationStatus";
export const APPLICATION_STATUS_KEY = "applicationStatus";

export const QR_SCAN_STAGE = {
  SCANNING: "SCANNING",
  FAILED: "FAILED",
  SUCCESS: "SUCCESS",
};

// facing mode for the camera
export const CAMERA_FACING_MODE = {
  FRONT: "user",
  BACK: "environment",
};

// cycle delay in MS
export const SCAN_CYCLE_DELAY = 5000;

// REGISTRATION STATUS CONSTANTS: Define all possible states for participant registrations
// CHECKED_IN is the key status that indicates a participant has been successfully checked into an event
// This status can be set either through QR code scanning or manual updates in the registration table
export const REGISTRATION_STATUS = {
  REGISTERED: "registered",
  CHECKED_IN: "checkedIn",
  WAITLISTED: "waitlist",
  CANCELLED: "cancelled",
  INCOMPLETE: "incomplete",
  ACCEPTEDCOMPLETE: "acceptedComplete",
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
  5: "5th+ Year",
};

export const EMAIL_REGEX =
  /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
