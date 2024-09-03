export const QrType = { any: "Any", partner: "Partner", workshop: "Workshop", booth: "Booth" };

export type QR = {
  id: string;
  isActive: boolean;
  "eventID;year": string;
  data?: {} | PartnerData | WorkshopData;
  points: number;
  updatedAt: number;
  isUnlimitedScans: boolean;
  createdAt: number;
  type?: "Partner" | "Workshop" | "Booth";
};

interface PartnerData {
  partnerID: string;
  linkedin: string;
}

interface WorkshopData {
  workshopID: string;
}
// {
//   "isActive": true,
//   "eventID;year": "blueprint;2024",
//   "data": {},
//   "points": 50,
//   "updatedAt": 1705979716359,
//   "isUnlimitedScans": true,
//   "createdAt": 1705979716359,
//   "id": "IPfx5-multi-test",
//   "type": "Booth"
// }
