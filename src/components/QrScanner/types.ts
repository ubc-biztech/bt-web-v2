import { Dispatch, SetStateAction } from "react";
import { Attendee } from "../RegistrationTable/columns";

export interface QrProps {
  event: { id: string; year: string };
  rows: Attendee[];
  isQrReaderToggled: boolean;
  setQrReaderToggled: Dispatch<SetStateAction<boolean>>;
}
