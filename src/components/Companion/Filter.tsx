interface FilterProps {
  filterOptions: string[];
  setSelectedFilterOption: (value: number) => void;
  selectedFilterOption: number;
}

const selectedStyle = "bg-white text-[#00071D] h-6";
const unselectedStyle = "text-white";

const Filter: React.FC<FilterProps> = ({
  filterOptions,
  setSelectedFilterOption,
  selectedFilterOption,
}) => {
  return (
    <div className="justify-center flex">
      <div
        className="flex bg-gradient-to-b from-[#11151F] to-[#1E2939] 
                    rounded-full items-center text-[12px] h-full"
      >
        {filterOptions.map((option, index) => (
          <div
            key={index}
            className={`px-[10px] rounded-full py-1 flex items-center justify-center ${
              index === selectedFilterOption ? selectedStyle : unselectedStyle
            }`}
            onClick={() => setSelectedFilterOption(index)}
          >
            {option}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Filter;
