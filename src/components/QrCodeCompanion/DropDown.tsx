import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

import { Dispatch, FC, SetStateAction } from "react";

interface DropDownTabProps {
  value: string | number;
  placeholder: string;
  nullVal: any;
  valueChange: Dispatch<SetStateAction<any>>;
  options: any[];
  className?: string;
}

const DropDownTab: FC<DropDownTabProps> = ({ value, placeholder, nullVal, valueChange, options, className }) => {
  return (
    <Select onValueChange={valueChange}>
      <SelectTrigger
        className={`w-[180px] h-full px-4 text-white bg-[#293553] py-2.5 !ring-offset-0 ring-0 focus:ring-0 grow focus:border-biztech-green ${className} font-400`}
      >
        <SelectValue placeholder={placeholder}>{value === nullVal ? placeholder : value}</SelectValue>
      </SelectTrigger>
      <SelectContent className='bg-dark-slate border-2 border-y-login-page-bg focus:bg-none !p-0 max-h-[200px]'>
        {options.map((op) => (
          <SelectItem className='w-full focus:border-2 focus:bg-navbar-tab-hover-bg focus:border-biztech-green' value={op} key={op}>
            {op}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

export default DropDownTab;
