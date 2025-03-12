import { Dispatch, SetStateAction } from "react";
import { Attendee } from "@/types/types";

export interface QrProps {
  event: { id: string; year: string };
  rows: Attendee[];
  isQrReaderToggled: boolean;
  setQrReaderToggled: Dispatch<SetStateAction<boolean>>;
}
