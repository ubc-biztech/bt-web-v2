import React, { useState } from "react";
import { BadgeCheck, PanelsTopLeft } from "lucide-react";
import Dashboard from "./user/Dashboard";
import Scores from "./user/Scores";

const dummyRounds = [
    {
        name: "ROUND 1",
        selected: true,
        filterFinalists: false,
    },
    {
        name: "FINAL ROUND",
        selected: false,
        filterFinalists: true,
    },
];

const dummyData = [
    {
        team: "Team 4 - Project Name",
        date: "3:41 PM",
        status: "graded",
        room: "Room 1",
        grades: {
            "Originality & Creativity": 5,
            "Technical Implementation": 4,
            "User Experience (UX)": 5,
            "Problem-Solving": 5,
            "Presentation & Communication": 5,
        },
        comments: [],
        round: 1,
    },
    {
        team: "Team 4 - Project Name",
        date: "3:42 PM",
        status: "current",
        room: "Room 2",
        grades: {
            "Originality & Creativity": 5,
            "Technical Implementation": 4,
            "User Experience (UX)": 5,
            "Problem-Solving": 5,
            "Presentation & Communication": 5,
        },
        comments: [],
        round: 2,
    },
];
const User = () => {
    const [page, setPage] = useState("dashboard");

    return (
        <div className="w-full px-10">
            <div className="flex flex-col">
                <header className="mt-16 text-lg font-ibm">
                    {dummyData[0].team} - OVERVIEW
                </header>
                <div className="border-b-2 border-[#41437D] mt-6 flex flex-row">
                    <div
                        className={`w-24 h-10 border-b-2 ${
                            page === "dashboard"
                                ? "border-[#4CC8BD] text-[#4CC8BD]"
                                : "border-[#41437D] text-[#41437D]"
                        } -mb-[2px] flex flex-row items-center justify-center gap-1 cursor-pointer`}
                        onClick={() => {
                            setPage("dashboard");
                        }}
                    >
                        <PanelsTopLeft
                            size={16}
                            color={page === "dashboard" ? "#4CC8BD" : "#41437D"}
                        />
                        Dashboard
                    </div>
                    <div
                        className={`w-24 h-10 border-b-2 ${
                            page === "scores"
                                ? "border-[#4CC8BD] text-[#4CC8BD]"
                                : "border-[#41437D] text-[#41437D]"
                        } -mb-[2px] flex flex-row items-center justify-center gap-1 cursor-pointer`}
                        onClick={() => setPage("scores")}
                    >
                        <BadgeCheck
                            size={16}
                            color={page === "scores" ? "#4CC8BD" : "#41437D"}
                        />
                        Scores
                    </div>
                </div>

                {/* Conditionally render pages */}

                {page === "dashboard" && (
                    <Dashboard data={dummyData} rounds={dummyRounds} />
                )}
                {page === "scores" && (
                    <Scores data={dummyData} rounds={dummyRounds} />
                )}
            </div>
        </div>
    );
};

export default User;
