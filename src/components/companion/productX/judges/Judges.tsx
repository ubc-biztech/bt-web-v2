import React, { useState } from "react";
import { HistoryIcon, PanelsTopLeft } from "lucide-react";
import History from "./History";
import Rounds from "./Rounds";

const dummyData = [
    {
        team: "Team 1 - Project Name",
        date: "3:09 PM",
        status: "completed",
        room: "Room 1",
        finalist: true,
    },
    {
        team: "Team 2 - Project Name",
        date: "3:01 PM",
        status: "completed",
        room: "Room 1",
        finalist: true,
    },
    {
        team: "Team 3 - Project Name",
        date: "3:03 PM",
        status: "updated",
        room: "Room 1",
        finalist: true,
    },
    {
        team: "Team 4 - Project Name",
        date: "3:41 PM",
        status: "current",
        room: "Room 1",
        finalist: true,
    },
    {
        team: "Team 5 - Project Name",
        date: "3:22 PM",
        status: "completed",
        room: "Room 1",
        finalist: false,
    },
    {
        team: "Team 6 - Project Name",
        date: "3:12 PM",
        status: "completed",
        room: "Room 1",
        finalist: false,
    },
    {
        team: "Team 7 - Project Name",
        date: "3:26 PM",
        status: "completed",
        room: "Room 1",
        finalist: false,
    },
    {
        team: "Team 8 - Project Name",
        date: "3:35 PM",
        status: "completed",
        room: "Room 1",
        finalist: false,
    },
];

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
                        onClick={() => {
                            setPage("rounds");
                        }}
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

                {/* Conditionally render pages */}

                {page === "history" && <History data={dummyData} />}
                {page === "rounds" && <Rounds data={dummyData} />}
            </div>
        </div>
    );
};

export default Judges;
