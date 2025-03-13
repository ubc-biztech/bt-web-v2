import Box from "@/components/ui/productX/box";
import React, { useState } from "react";
import { HistoryIcon, PanelsTopLeft } from "lucide-react";

const Judges = () => {
    const [page, setPage] = useState("rounds");
    return (
        <div className="w-full px-10">
            <div className="flex flex-col">
                <header className="mt-16 text-lg font-ibm">
                    JUDGING DASHBOARD
                </header>
                <div className="border-b-2 border-[#41437D] mt-6 flex flex-row">
                    <div
                        className={`w-24 h-10 border-b-2 ${
                            page === "rounds"
                                ? "border-[#4CC8BD] text-[#4CC8BD]"
                                : "border-[#41437D] text-[#41437D]"
                        } -mb-[2px] flex flex-row items-center justify-center gap-1 cursor-pointer`}
                        onClick={() => setPage("rounds")}
                    >
                        <PanelsTopLeft
                            size={16}
                            color={page === "rounds" ? "#4CC8BD" : "#41437D"}
                        />
                        Rounds
                    </div>
                    <div
                        className={`w-24 h-10 border-b-2 ${
                            page === "history"
                                ? "border-[#4CC8BD] text-[#4CC8BD]"
                                : "border-[#41437D] text-[#41437D]"
                        } -mb-[2px] flex flex-row items-center justify-center gap-1 cursor-pointer`}
                        onClick={() => setPage("history")}
                    >
                        <HistoryIcon
                            size={16}
                            color={page === "history" ? "#4CC8BD" : "#41437D"}
                        />
                        History
                    </div>
                </div>
                <Box
                    width={32}
                    height={32}
                    className="mt-10 select-none"
                    selectableEffects={true}
                    hoverEffects={true}
                >
                    ProductX2025
                </Box>
            </div>
        </div>
    );
};

export default Judges;
