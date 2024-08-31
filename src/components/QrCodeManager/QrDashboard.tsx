import { ChangeEvent, FC, useState } from "react";
import { SearchBar } from "./SearchBar";

import { QrType } from "./types";
import DropDownTab from "./DropDown";

interface QrDashboardProps {}

export const QrDashboard: FC<QrDashboardProps> = () => {
  const [searchField, setSearchField] = useState("");
  const [qrTypeFilter, setQrTypeFilter] = useState(QrType.any);
  const [yearFilter, setYearFilter] = useState(-1);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setSearchField(e.target.value);
  };
  return (
    <div className="w-full">
      <div className="flex flex-row lg:space-x-2 items-center flex-wrap">
        <SearchBar handleChange={handleChange} searchField={searchField} />
        <div className="flex flex-row space-x-2 w-full lg:w-auto mt-2 lg:mt-0">
          <DropDownTab
            value={qrTypeFilter}
            nullVal={QrType.any}
            placeholder="[By Type]"
            valueChange={setQrTypeFilter}
            options={[QrType.any, QrType.booth, QrType.partner, QrType.workshop]}
          />
          <DropDownTab
            value={yearFilter}
            nullVal={"None"}
            placeholder="[By Year]"
            valueChange={setYearFilter}
            options={[
              "None",
              ...Array(50)
                .fill(null)
                .map((v, i) => {
                  return new Date().getFullYear() - i;
                }),
            ]}
          />
        </div>
      </div>
    </div>
  );
};
