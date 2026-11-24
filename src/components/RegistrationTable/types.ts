import { BiztechEvent } from "@/types/types";
import { ColumnDef } from "@tanstack/react-table";
import type { Dispatch, SetStateAction } from "react";
import type { RegistrationStatusUpdate } from "@/lib/registrationQuery";

export interface DataTableProps<T> {
  data: T[];
  setData: Dispatch<SetStateAction<T[]>>;
  refreshTable: () => Promise<void>;
  applyRegistrationStatuses: (updates: RegistrationStatusUpdate[]) => void;
  dynamicColumns: ColumnDef<T>[];
  eventId: string;
  year: string;
  eventData: BiztechEvent;
}

export type SortingState = any[];
export type ColumnFiltersState = any[];
