import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

import { Button } from "@/components/ui/button";
import { Dispatch, FC, SetStateAction } from "react";
import { QrType } from "./types";

interface DropDownTabProps {
  value: string | number;
  placeholder: string;
  nullVal: any;
  valueChange: Dispatch<SetStateAction<any>>;
  options: any[];
}

const DropDownTab: FC<DropDownTabProps> = ({ value, placeholder, nullVal, valueChange, options }) => {
  return (
    <Select onValueChange={valueChange}>
      <SelectTrigger className="w-[180px] h-full px-4 text-white bg-dark-slate py-2.5 !ring-offset-0 ring-0 focus:ring-0 grow">
        <SelectValue className="font-400" placeholder={placeholder}>
          {value === nullVal ? placeholder : value}
        </SelectValue>
      </SelectTrigger>
      <SelectContent className="bg-dark-slate">
        {options.map((op) => (
          <SelectItem value={op}>{op}</SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

export default DropDownTab;
