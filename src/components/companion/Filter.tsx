interface FilterProps {
  options: string[];
  setOption: (value: number) => void;
  option: number;
}

const selectedStyle = "bg-white text-[#00071D]";
const unselectedStyle = "text-white";

const Filter: React.FC<FilterProps> = ({ options, setOption, option }) => {
  return (
    <div className="justify-center flex">
      <div
        className="flex bg-gradient-to-b from-[#11151F] to-[#1E2939] 
                    rounded-full h-12 gap-2 px-4 items-center"
      >
        {options.map((opt, index) => (
          <div
            key={index}
            className={`px-3 rounded-full py-1 ${
              index === option ? selectedStyle : unselectedStyle
            }`}
            onClick={() => setOption(index)}
          >
            {opt}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Filter;
