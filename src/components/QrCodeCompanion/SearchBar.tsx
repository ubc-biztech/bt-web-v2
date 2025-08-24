import { SearchIcon } from "lucide-react";
import { ChangeEvent } from "react";

export const SearchBar: React.FC<{
  handleChange: (e: ChangeEvent<HTMLInputElement>) => void;
  searchField: string;
}> = ({ handleChange, searchField }) => (
  <div className="basis-[100%] lg:basis-1/3 relative w-full lg:w-[400px]">
    <div className="absolute inset-y-0 start-0 flex items-center ps-3.5">
      <SearchIcon width={15} height={15} color="#6578A8" />
    </div>
    <input
      type="text"
      className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:bt-blue-400-500 block w-full ps-10 p-2.5  dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:focus:ring-blue-500 dark:focus:bt-blue-400-500 text-bt-blue-600"
      placeholder="Search by Event ID"
      value={searchField}
      onChange={handleChange}
    />
  </div>
);
