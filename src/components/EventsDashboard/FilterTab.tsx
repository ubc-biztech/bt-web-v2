import { ListIcon, LucideProps } from "lucide-react";
import { ForwardRefExoticComponent, RefAttributes } from "react";

const filterStates = {
  all: "all",
  saved: "saved",
};

export const FilterTab: React.FC<{
  title: string;
  filter: string;
  filterState: string;
  handleUiClick: (s: string) => void;
  Icon: ForwardRefExoticComponent<Omit<LucideProps, "ref"> & RefAttributes<SVGSVGElement>>;
}> = ({ title, filter, filterState, handleUiClick, Icon }) => (
  <div
    className={`bg-events-card-bg p-2 h-[46px] rounded-lg flex flex-row grow shrink justify-center space-x-2 items-center lg:px-20 cursor-pointer ${
      filterState === filter ? "!bg-events-baby-blue" : ""
    }`}
    onClick={() => handleUiClick(filter)}
  >
    <Icon height={20} width={20} className={`${filterState === filter ? "text-events-user-card-bg fill-current" : ""}`} />{" "}
    <p className={`${filterState === filter ? "text-events-user-card-bg" : ""} text-nowrap`}>{title}</p>
  </div>
);
