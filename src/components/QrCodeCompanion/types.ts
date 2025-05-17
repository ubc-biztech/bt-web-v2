export const QrType = {
  any: "Any",
  partner: "Partner",
  workshop: "Workshop",
  booth: "Booth",
};

export type QR = {
  id: string;
  isActive: boolean;
  "eventID;year": string;
  data?: { partnerID?: string; linkedin?: string; workshopID?: string };
  points: number;
  updatedAt: number;
  isUnlimitedScans: boolean;
  createdAt: number;
  type?: "Partner" | "Workshop" | "Booth";
};
