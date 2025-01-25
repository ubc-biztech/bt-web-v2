"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
    MapIcon,
    ListIcon,
    ArrowUpRight,
    ChevronDown,
} from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { CompanionItemRow } from "../ui/companion-item-row";
import NavBarContainer from "./navigation/NavBarContainer";
import { SearchBar } from "./SearchBar";

interface Company {
    id: number;
    name: string;
    logo: string;
    description: string;
    tags: string[];
    profile_url: string;
}

export type SortOption = "Name" | "Date" | "Size" | "Progress";

interface FilterDropdownProps {
    options: SortOption[];
    sortBy: SortOption;
    setSortBy: (sortOption: SortOption) => void;
}

export const FilterDropdown = ({ options, sortBy, setSortBy }: FilterDropdownProps) => {

    const handleSort = (option: SortOption) => {
        setSortBy(option);
        console.log(`Sorting by ${option}`);
    };

    return (
        <div className="rounded-full bg-gradient-to-r from-[#BCC5E3] via-[rgba(200,212,251,0.2)] to-[#BCC5E3] bg-clip-border px-[1px] py-[1px]">
            <div className="inline-flex items-center justify-center rounded-full bg-black pl-2 px-1 py-1 h-full">
                <span className="text-[10px] text-white">Sort by:</span>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button
                            variant="ghost"
                            className="h-5 w-12 px-1 text-[10px] font-normal text-white hover:bg-white/10 text-center focus:ring-0 focus:ring-offset-0"
                            onFocus={(e) => e.target.blur()}
                            onMouseDown={(e) => e.preventDefault()}
                        >
                            <span className="w-full text-left">{sortBy}</span>
                            <ChevronDown className="ml-1 h-3 w-2 shrink-0" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                        align="center"
                        className="min-w-[6rem] mr-6 mt-2"
                    >
                        {options.map((option) => (
                            <DropdownMenuItem
                                key={option}
                                className="text-[10px] justify-between"
                                onSelect={() => handleSort(option)}
                            >
                                {option}
                            </DropdownMenuItem>
                        ))}
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </div>
    );
};

type View = "list" | "map";

const SwapView: React.FC<{
    selectedView: View;
    setSelectedView: React.Dispatch<React.SetStateAction<View>>;
}> = ({ selectedView, setSelectedView }) => {
    return (
        <div className="relative flex items-center justify-between rounded-full w-16 h-8 p-0.5 bg-[#1E2939]">
            <motion.div
                className="absolute bg-white rounded-full w-8 h-7"
                animate={{ x: selectedView === "list" ? "-5%" : "85%" }}
                transition={{ type: "spring", stiffness: 600, damping: 50 }}
            />
            <div
                className={`h-7 w-8 flex items-center justify-center p-0 text-white rounded-full z-10 cursor-pointer`}
                onClick={() => setSelectedView("list")}
                aria-pressed={selectedView === "list"}
            >
                <ListIcon
                    className={`h-4 w-4 ${
                        selectedView === "list" ? "text-black" : "text-white"
                    }`}
                />
            </div>
            <div
                className={`h-7 w-8 flex items-center justify-center p-0 text-white rounded-full z-10 cursor-pointer`}
                onClick={() => setSelectedView("map")}
                aria-pressed={selectedView === "map"}
            >
                <MapIcon
                    className={`h-4 w-4 ${
                        selectedView === "map" ? "text-black" : "text-white"
                    }`}
                />
            </div>
        </div>
    );
};

const CompanyCard = ({ company }: { company: Company }) => {
    return (
        <>
            <div className="flex items-center gap-4">
                <div className="relative w-16 h-16 mr-1 bg-gray-800 rounded-lg overflow-hidden">
                    <Image
                        src={company.logo}
                        alt={company.name}
                        layout="fill"
                        objectFit="contain"
                        className="w-full h-full"
                    />
                </div>
                <div className="xxs:h-26 h-30 flex flex-col items-start justify-start">
                    <span className="text-white text-md xxs:text-lg text-nowrap  font-satoshi">
                        {company.name}
                    </span>
                    <p className="text-[14px] text-[#A0AEC0]">
                        {company.description}
                    </p>
                    <div className="flex flex-wrap gap-2 mt-2">
                        {company.tags.map((tag, index) => (
                            <div
                                key={`${tag}-${index}`}
                                className="px-2 py-0.5 text-white rounded-full text-[8px] outline outline-1 outline-[#A0AEC0]"
                            >
                                {tag}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
            <div className="w-5 h-full flex flex-col items-center justify-start">
                <ArrowUpRight className="h-5 w-5 text-white" />
            </div>
        </>
    );
};

const Map = () => {
    return (
        <div className="flex flex-col items-center justify-center w-full relative">
            <span>Boothing A: 12:20 PM - 1:50PM</span>
            <div className="relative w-[20em] h-[40em] pointer-events-none">
                <Image
                    src={"/maps/startups - foyer.png"}
                    alt="Boothing A"
                    layout="fill"
                    objectFit="contain"
                />
            </div>
            <div className="relative w-[20em] h-[40em] pointer-events-none">
                <Image
                    src={"/maps/big companies - main hallway.png"}
                    alt="Boothing A"
                    layout="fill"
                    objectFit="contain"
                />
            </div>
            <span>Boothing B: 3:00 PM - 4:30PM</span>
            <div className="relative w-[20em] h-[40em] pointer-events-none">
                <Image
                    src={"/maps/big companies - foyer.png"}
                    alt="Boothing B"
                    layout="fill"
                    objectFit="contain"
                />
            </div>
            <div className="relative w-[20em] h-[40em] pointer-events-none">
                <Image
                    src={"/maps/startups - main hallway.png"}
                    alt="Boothing B"
                    layout="fill"
                    objectFit="contain"
                />
            </div>
        </div>
    );
};

interface CompanyListProps {
    companies: Company[];
}

const CompaniesList: React.FC<CompanyListProps> = ({ companies }) => {
    const [selectedView, setSelectedView] = useState<View>("map");
    const [sortBy, setSortBy] = useState<SortOption>("Name");
    const [searchQuery, setSearchQuery] = useState("");
    const handleSearch = (query: string) => {
        setSearchQuery(query);
      };

    return (
        <div className="min-h-screen w-screen bg-gradient-to-b from-[#040C12] to-[#030608] text-white p-6 font-satoshi">
            <NavBarContainer>
                <div className="max-w-4xl mx-auto space-y-6">
                    <header className="text-lg">Companies</header>

                    <div className="w-full h-[1px] bg-[#1D262F]" />
{/* 
                    <div className="flex items-center justify-between gap-2 mb-6 h-8">
                        <SearchBar onSearch={handleSearch}/>
                        <FilterDropdown options={["Name", "Size"]} setSortBy={setSortBy} sortBy={sortBy}/>
                        <SwapView
                            selectedView={selectedView}
                            setSelectedView={setSelectedView}
                        />
                    </div> */}

                    <div className="space-y-4">
                        {/* <div
                            className={`transition-opacity duration-500 ${
                                selectedView === "list"
                                    ? "opacity-100"
                                    : "opacity-0"
                            }`}
                        >
                            {selectedView === "list" &&
                                companies
                                .filter((company) => {
                                    return (!searchQuery || company.name.toLowerCase().includes(searchQuery.toLowerCase()))
                                })
                                .sort((a: Company, b: Company) => {
                                      if (sortBy === "Size") {
                                        // Assumes that the first character of the description will contain the number of delegates
                                        // e.g. "3 delegates in attendance"
                                        return parseInt(a.description[0]) - parseInt(b.description[0]);
                                      } else if (sortBy === "Name") {
                                        return a.name.localeCompare(b.name);
                                      }
                                      return 0;
                                })
                                .map((company) => (
                                    <CompanionItemRow
                                        href={`/companion/company/${company.profile_url}`}
                                        key={company.id}
                                    >
                                        <CompanyCard company={company} />
                                    </CompanionItemRow>
                                ))}
                        </div> */}

                        <div
                            className={`transition-opacity duration-500 ${
                                selectedView === "map"
                                    ? "opacity-100"
                                    : "opacity-0"
                            }`}
                        >
                            {/* {selectedView === "map" && <Map />} */}
                            <Map></Map>
                        </div>
                    </div>
                </div>
            </NavBarContainer>
        </div>
    );
};

export default CompaniesList;
// BCC5E3
