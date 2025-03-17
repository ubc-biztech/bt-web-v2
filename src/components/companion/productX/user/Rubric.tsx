import Box from "@/components/ui/productX/box";
import Button from "@/components/ui/productX/button";
import {fetchRubricContents, fetchMetrics, ScoringMetric, defaultScoring} from "@/constants/productx-scoringMetrics";
import { TriangleAlert, X } from "lucide-react";
import React, { useEffect, useState } from "react";

const judgingRatings = [
    "1 - Poor",
    "2 - Fair",
    "3 - Average",
    "4 - Good",
    "5 - Excellent",
];

interface RubricProps {
    round: string;
    team: string;
    gradedStatus: string;
    lastEdited: string;
    grades: ScoringMetric;
    showRubric: (arg0: boolean) => void;
}

const Rubric: React.FC<RubricProps> = ({
    round,
    team,
    gradedStatus,
    lastEdited,
    grades,
    showRubric,
}) => {
    const metrics = fetchMetrics(); // constants/productx-scoringMetrics.ts
    const [modal, setModal] = useState(false);
    const [scoring, setScoring] = useState<ScoringMetric>(
        grades || defaultScoring
    );
    const judgingRubric = fetchRubricContents(metrics);
    useEffect(() => {
        document.body.style.overflow = "hidden";

        return () => {
            document.body.style.overflow = "auto";
        };
    }, []); // disabled scroll when rubric is overlayed

    const confirmExit = () => {
        if (JSON.stringify(scoring) !== JSON.stringify(grades)) {
            setModal(true);
        } else {
            showRubric(false);
        }
    }; // confirm exit if there are unsaved changes

    // kill me

    return (
        <>
            <div className="top-0 left-0 w-screen h-screen scroll overflow-y-auto fixed z-30 bg-[#020319] flex flex-col items-center px-14">
                <div className="w-full flex flex-row justify-between mt-36">
                    <div className="flex flex-row gap-5 items-center">
                        <header className="text-xl">
                            {round}: {team}
                        </header>

                        {/* Tags */}
                        {gradedStatus === "Graded" ? (
                            <span className="text-[#4CC8BD] border-[#4CC8BD] border bg-[#23655F] bg-opacity-70 px-4 rounded-full h-10 flex flex-row items-center justify-center">
                                GRADED
                            </span>
                        ) : (
                            <span className="text-[#FF4262] border-[#FF4262] border bg-[#A43B4C] bg-opacity-70 px-4 rounded-full h-10 flex flex-row items-center justify-center">
                                UNGRADED
                            </span>
                        )}
                    </div>
                    <div className="flex flex-row gap-3 items-center text-[#898BC3]">
                        <span>{lastEdited}</span>
                        <span>|</span>
                        <span
                            className="underline cursor-pointer z-50"
                            onClick={() => {
                                confirmExit();
                            }}
                        >
                            Return to Home
                        </span>
                    </div>
                </div>

                {/* Divider */}
                <div className="w-full h-[1px] bg-[#41437D] mt-3">&nbsp; </div>

                {/* Grid */}
                <figure className="w-full grid grid-cols-6 grid-rows-5 gap-0 -mt-12">
                    <div />
                    {judgingRatings.map((rating, index) => (
                        <div
                            key={`${rating}-${index}`}
                            className="flex flex-row items-end justify-center p-8"
                        >
                            <span className="text-lg">{rating}</span>
                        </div>
                    ))}

                    {/* For every category.... */}
                    {Object.keys(judgingRubric).map((categoryKey, index) => {
                        const category =
                            categoryKey as keyof typeof judgingRubric;

                        const setRating = (rating: number) => {
                            if (scoring[category] === rating) {
                                setScoring((prevState) => ({
                                    ...prevState,
                                    [category]: 0,
                                }));
                            } else {
                                setScoring((prevState) => ({
                                    ...prevState,
                                    [category]: rating,
                                }));
                            }
                        };

                        return (
                            <>
                                <div
                                    key={`category-${categoryKey}-${index}`}
                                    className="text-lg w-full h-56 flex items-center justify-end p-8"
                                >
                                    {category}
                                </div>

                                {/* For every criteria.... */}
                                {judgingRubric[category].map(
                                    (question, pos) => {
                                        const rating = pos + 1;
                                        return (
                                            <div
                                                className="w-full h-56 text-[14px]"
                                                key={`${categoryKey}-question-${pos}`}
                                            >
                                                <Box
                                                    width={32}
                                                    height={32}
                                                    fitToParent
                                                    hoverEffects
                                                    selectableEffects
                                                    selected={
                                                        scoring[category] ===
                                                        rating
                                                    }
                                                    key={index}
                                                    handleClick={() => {
                                                        setRating(rating);
                                                    }}
                                                    className="flex flex-col  text-center p-4 pt-8"
                                                >
                                                    {question}
                                                </Box>
                                            </div>
                                        );
                                    }
                                )}
                            </>
                        );
                    })}
                </figure>

                {/* Comments */}
                <div className="w-full flex flex-row items-start justify-start mt-24">
                    <div className="text-lg w-1/5 h-36 flex items-center justify-end">
                        <span className="mr-8">COMMENTS</span>
                    </div>
                    <div className="w-full flex flex-col gap-5">
                        <div className="w-full h-36">
                            <Box
                                width={42}
                                height={42}
                                fitToParent
                                className="text-md p-4"
                            >
                                Has the team produced an MVP (Minimum Viable
                                Product) with working features? Are the core use
                                cases of their solution implemented?
                            </Box>
                        </div>
                        <div className="w-full h-12">
                            <Button
                                label="+ ADD ADDITIONAL COMMENTS"
                                Icon={null}
                                className="hover:text-[#000000] bg-[#41437D] border border-dashed border-[#41437D] text-[#41437D] w-full h-10 hover:bg-opacity-100 bg-opacity-0"
                                onClick={() => {
                                    // TODO : add comments post
                                }}
                            />
                        </div>
                        <div className="w-full flex flex-row items-center justify-between mb-56 mt-12">
                            <div className="flex flex-col text-[#898BC3] gap-2">
                                <span className="text-lg text-white">
                                    TOTAL SCORE:{" "}
                                    {metrics.every(
                                        (metric) =>
                                            scoring[metric] !== undefined
                                    )
                                        ? metrics.reduce(
                                              (total, metric) =>
                                                  total + scoring[metric],
                                              0
                                          )
                                        : "N/A"}
                                </span>
                                {metrics.map((metric) => (
                                    <span key={metric}>
                                        {`${metric}: ${
                                            scoring[metric] || "N/A"
                                        }`}
                                    </span>
                                ))}
                            </div>
                            <div className="flex flex-row gap-2">
                                <Button
                                    label="CANCEL"
                                    Icon={null}
                                    className="hover:text-[#000000] bg-[#FF4262] border border-[#FF4262] text-[#FF4262] w-24 h-10 hover:bg-opacity-100 bg-opacity-0"
                                    onClick={() => {
                                        confirmExit();
                                    }}
                                />
                                <Button
                                    label="SUBMIT SCORE"
                                    Icon={null}
                                    className="hover:text-[#000000] hover:bg-white bg-[#198E7C] border border-[#198E7C] text-white w-36 h-10"
                                    onClick={() => {
                                        // TODO : make put request to api
                                    }}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Confirm if you want to discard unsaved changes modal */}
            <div
                className={`top-0 left-0 w-screen h-screen scroll overflow-y-auto fixed z-30 bg-black ${
                    modal
                        ? "opacity-100 bg-opacity-50 pointer-events-auto backdrop-blur-sm"
                        : " backdrop-blur-0 opacity-0 pointer-events-none"
                } flex flex-col items-center justify-center transition duration-500 ease-in-out`}
            >
                <div className="w-[40em] h-64">
                    <Box
                        width={100}
                        height={20}
                        fitToParent
                        className="flex flex-col items-center justify-start p-8"
                    >
                        <div className="w-full flex flex-row justify-end h-4">
                            <X
                                size={20}
                                color="#ADAFE4"
                                className="cursor-pointer"
                                onClick={() => {
                                    setModal(false);
                                }}
                            />
                        </div>
                        <div className="flex flex-row gap-2">
                            <TriangleAlert size={24} />
                            <span>
                                WARNING: Are you sure you want to leave this
                                page?
                            </span>
                        </div>

                        <span className="text-[#ADAFE4] mt-8">
                            All grading progress will be lost.
                        </span>
                        <div className="flex flex-row gap-2 mt-8">
                            <Button
                                label="EXIT PAGE"
                                Icon={null}
                                className="hover:text-[#000000] bg-[#FF4262] border border-[#FF4262] text-[#FF4262] w-24 h-10 hover:bg-opacity-100 bg-opacity-0"
                                onClick={() => {
                                    showRubric(false);
                                }}
                            />
                            <Button
                                label="BACK TO GRADING"
                                Icon={null}
                                className="hover:text-[#000000] hover:bg-white bg-[#198E7C] border border-[#198E7C] text-white w-44 h-10"
                                onClick={() => {
                                    setModal(false);
                                }}
                            />
                        </div>
                    </Box>
                </div>
            </div>
        </>
    );
};

export default Rubric;
