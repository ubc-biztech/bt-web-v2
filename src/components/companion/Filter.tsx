interface FilterProps {
  filterOptions: string[];
  setSelectedFilterOption: (value: number) => void;
  selectedFilterOption: number;
}

const selectedStyle = "bg-white text-[#00071D]";
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
                    rounded-full h-12 gap-2 px-4 items-center"
      >
        {filterOptions.map((option, index) => (
          <div
            key={index}
            className={`px-3 rounded-full py-1 ${
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
