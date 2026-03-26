export interface Badge {
  questID: string;
  "eventID;year": string;
  threshold: number;
  progress: number;
  badgeName: string;
  description: string;
  userID: string;
  isComplete: boolean;
}

export interface Connection {
  compositeID: string;
  fname: string;
  pronouns: string;
  year: string;
  createdAt: number;
  connectionID: string;
  major: string;
  lname: string;
  type: string;
  connectionType?: "PARTNER" | "EXEC" | "ATTENDEE";
}
