import React, { useState } from "react";
import { HistoryIcon, PanelsTopLeft } from "lucide-react";
import History from "./judges/History";
import Rounds from "./judges/Rounds";

// TODO : replace this with actual data from api req {team/judge/feedback/{judgeID}}
const sampleJudgeFeedback = 
{
    message: "Scores retrieved successfully",
    scores: {
        "1": [
            {
                round: "1",
                judgeID: "judge123",
                scores:     {
                    metric1: { N: "1" },
                    metric2: { N: "2" },
                    metric3: { N: "3" },
                    metric4: { N: "4" },
                    metric5: { N: "5" },
                },
                teamName: "Team 1",
                feedback:
                    "Great presentation, well researched. Could use more work on the usability.",
                createdAt: "2024-03-17T10:30:00Z",
            },
            {
                round: "1",
                judgeID: "judge123",
                scores:     {
                    metric1: { N: "3" },
                    metric2: { N: "2" },
                    metric3: { N: "5" },
                    metric4: { N: "4" },
                    metric5: { N: "5" },
                },
                teamName: "Team 2",
                feedback: "Great presentation, well researched. Could use more work on the usability.",
                createdAt: "2024-03-17T10:45:00Z",
            },
            {
                round: "1",
                judgeID: "judge123",
                scores:     {
                    metric1: { N: "5" },
                    metric2: { N: "2" },
                    metric3: { N: "3" },
                    metric4: { N: "4" },
                    metric5: { N: "5" },
                },
                teamName: "Team 3",
                feedback: "Great presentation, well researched. Could use more work on the usability.",
                createdAt: "2024-03-17T11:00:00Z",
            },
            {
                round: "1",
                judgeID: "judge123",
                scores:     {
                    metric1: { N: "2" },
                    metric2: { N: "2" },
                    metric3: { N: "3" },
                    metric4: { N: "2" },
                    metric5: { N: "1" },
                },
                teamName: "Team 4",
                feedback: "Great presentation, well researched. Could use more work on the usability.",
                createdAt: "2024-03-17T11:00:00Z",
            },
        ],
        "2": [
            {
                round: "1",
                judgeID: "judge123",
                scores:     {
                    metric1: { N: "3" },
                    metric2: { N: "2" },
                    metric3: { N: "5" },
                    metric4: { N: "4" },
                    metric5: { N: "5" },
                },
                teamName: "Team 2",
                feedback: "Great presentation, well researched. Could use more work on the usability.",
                createdAt: "2024-03-17T10:45:00Z",
            },
            {
                round: "2",
                judgeID: "judge123",
                scores:     {
                    metric1: { N: "0" },
                    metric2: { N: "2" },
                    metric3: { N: "3" },
                    metric4: { N: "4" },
                    metric5: { N: "5" },
                },
                teamName: "Team 3",
                feedback: "Great presentation, well researched. Could use more work on the usability.",
                createdAt: "2024-03-17T11:00:00Z",
            },
        ],
    },
};

const Judges = () => {
    const [page, setPage] = useState("rounds");

    // TODO : Fetch judge's past feedback {GET /judge/{judge_id}/submissions}

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

                {page === "history" && (
                    <History feedback={sampleJudgeFeedback.scores} />
                )}
                {page === "rounds" && (
                    <Rounds feedback={sampleJudgeFeedback.scores} />
                )}
            </div>
        </div>
    );
};

export default Judges;
