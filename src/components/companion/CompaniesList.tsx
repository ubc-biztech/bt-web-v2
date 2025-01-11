"use client";

import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
    MapIcon,
    ListIcon,
    ArrowUpRight,
    ChevronDown,
    SearchIcon,
} from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import MapPlaceholder from "@/assets/2025/blueprint/map_placeholder.svg";
import { CompanionItemRow } from "../ui/companion-item-row";
import NavBarContainer from "./navigation/NavBarContainer";

interface Company {
    id: number;
    name: string;
    logo: string;
    description: string;
    tags: string[];
    profile_url: string;
}

type SortOption = "Name" | "Date" | "Size";

interface FilterDropdownProps {
    options: SortOption[];
}

const FilterDropdown = ({ options }: FilterDropdownProps) => {
    const [sortBy, setSortBy] = useState<SortOption>("Name");

    const handleSort = (option: SortOption) => {
        setSortBy(option);
        console.log(`Sorting by ${option}`);
    };

    return (
        <div className="inline-flex items-center justify-center space-x-1 rounded-full border border-white px-2 py-1 h-full">
            <span className="text-[10px] text-white">Sort by:</span>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button
                        variant="ghost"
                        className="h-6 w-12 px-1 text-[10px] font-normal text-white hover:bg-white/10 text-center focus:ring-0 focus:ring-offset-0"
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
    );
};

type View = "list" | "map";

const SwapView: React.FC<{
    selectedView: View;
    setSelectedView: React.Dispatch<React.SetStateAction<View>>;
}> = ({ selectedView, setSelectedView }) => {
    return (
        <div className="relative flex items-center justify-between border border-gray-800 rounded-full w-16 h-8 p-0.5">
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

const SearchBar = () => {
    return (
        <div className="relative flex-1 h-full">
            <Input
                type="text"
                placeholder="Search by name"
                className="bg-white text-black pl-8 h-full rounded-full placeholder:text-[12px] text-[12px] placeholder:text-black pr-4 pb-2"
            />

            <SearchIcon className="absolute left-2 top-1/2 transform -translate-y-1/2 text-black w-4 h-4" />
        </div>
    );
};

const CompanyCard = ({ company }: { company: Company }) => {
    return (
        <>
            {" "}
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
                <div className="h-24 flex flex-col items-start justify-start">
                    <span className="text-white text-lg font-satoshi">
                        {company.name}
                    </span>
                    <p className="text-[14px] text-[#A0AEC0]">
                        {company.description}
                    </p>
                    <div className="flex flex-wrap gap-2 mt-2">
                        {company.tags.map((tag) => (
                            <div className="px-2 py-1 text-white rounded-full text-[8px] outline outline-1 outline-[#A0AEC0]">
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
        <div className="flex flex-row items-center justify-center w-full h-[70vh] relative">
            <div className="relative w-4/5 h-full">
                <Image
                    src={MapPlaceholder}
                    alt="Map Placeholder"
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
    const [selectedView, setSelectedView] = useState<View>("list");
    return (
        <div className="min-h-screen bg-black text-white p-6 font-satoshi">
            <NavBarContainer>
                <div className="max-w-4xl mx-auto space-y-6">
                    <header className="mt-20 text-lg">Companies</header>

                    <div className="w-full h-[1px] bg-[#1D262F]" />

                    <div className="flex items-center justify-between gap-2 mb-6 h-8">
                        <SearchBar />
                        <FilterDropdown options={["Name", "Size"]} />
                        <SwapView
                            selectedView={selectedView}
                            setSelectedView={setSelectedView}
                        />
                    </div>

                    <div className="space-y-4">
                        <div
                            className={`transition-opacity duration-500 ${
                                selectedView === "list"
                                    ? "opacity-100"
                                    : "opacity-0"
                            }`}
                        >
                            {selectedView === "list" &&
                                companies.map((company) => (
                                    <CompanionItemRow
                                        href={`/companion/company/${company.profile_url}`}
                                        key={company.id}
                                    >
                                        <CompanyCard company={company} />
                                    </CompanionItemRow>
                                ))}
                        </div>

                        <div
                            className={`transition-opacity duration-500 ${
                                selectedView === "map"
                                    ? "opacity-100"
                                    : "opacity-0"
                            }`}
                        >
                            {selectedView === "map" && <Map />}
                        </div>
                    </div>
                </div>
            </NavBarContainer>
        </div>
    );
};

export default CompaniesList;
// BCC5E3
