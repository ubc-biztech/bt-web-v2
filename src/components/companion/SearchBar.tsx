import { Input } from "../ui/input";
import { SearchIcon } from "lucide-react";

export const SearchBar = ({ onSearch }: { onSearch: (query: string) => void }) => {

    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const query = event.target.value;
        onSearch(query);
    }

  return (
    <div className="relative flex-1 h-full">
      <Input
        type="text"
        placeholder="Search"
        onChange={handleInputChange}
        className="bg-white text-black pl-8 h-full rounded-full placeholder:text-[12px] text-[12px] placeholder:text-black pr-4 pb-2"
      />
      <SearchIcon className="absolute left-2 top-1/2 transform -translate-y-1/2 text-black w-4 h-4" />
    </div>
  );
};
