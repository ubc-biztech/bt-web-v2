import { Dispatch, SetStateAction } from "react";
import { Registration } from "@/types/types";

export interface QrProps {
  event: { id: string; year: string };
  rows: Registration[];
  isQrReaderToggled: boolean;
  setQrReaderToggled: Dispatch<SetStateAction<boolean>>;
}
