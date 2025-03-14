import Box from "@/components/ui/productX/box";
import Button from "@/components/ui/productX/button";
import { Plus } from "lucide-react";
import React, { useEffect } from "react";

const judgingRubric = {
    TECHNICALITY: [
        "Has the team produced an MVP (Minimum Viable Product) with working features? Are the core use cases of their solution implemented?",
        "Has the team produced an MVP (Minimum Viable Product) with working features? Are the core use cases of their solution implemented?",
        "Has the team produced an MVP (Minimum Viable Product) with working features? Are the core use cases of their solution implemented?",
        "Has the team produced an MVP (Minimum Viable Product) with working features? Are the core use cases of their solution implemented?",
        "Has the team produced an MVP (Minimum Viable Product) with working features? Are the core use cases of their solution implemented?",
    ],
    BUSINESS: [
        "Has the team produced an MVP (Minimum Viable Product) with working features? Are the core use cases of their solution implemented?",
        "Has the team produced an MVP (Minimum Viable Product) with working features? Are the core use cases of their solution implemented?",
        "Has the team produced an MVP (Minimum Viable Product) with working features? Are the core use cases of their solution implemented?",
        "Has the team produced an MVP (Minimum Viable Product) with working features? Are the core use cases of their solution implemented?",
        "Has the team produced an MVP (Minimum Viable Product) with working features? Are the core use cases of their solution implemented?",
    ],
    "DESIGN + UX": [
        "Has the team produced an MVP (Minimum Viable Product) with working features? Are the core use cases of their solution implemented?",
        "Has the team produced an MVP (Minimum Viable Product) with working features? Are the core use cases of their solution implemented?",
        "Has the team produced an MVP (Minimum Viable Product) with working features? Are the core use cases of their solution implemented?",
        "Has the team produced an MVP (Minimum Viable Product) with working features? Are the core use cases of their solution implemented?",
        "Has the team produced an MVP (Minimum Viable Product) with working features? Are the core use cases of their solution implemented?",
    ],

    PRESENTATION: [
        "Has the team produced an MVP (Minimum Viable Product) with working features? Are the core use cases of their solution implemented?",
        "Has the team produced an MVP (Minimum Viable Product) with working features? Are the core use cases of their solution implemented?",
        "Has the team produced an MVP (Minimum Viable Product) with working features? Are the core use cases of their solution implemented?",
        "Has the team produced an MVP (Minimum Viable Product) with working features? Are the core use cases of their solution implemented?",
        "Has the team produced an MVP (Minimum Viable Product) with working features? Are the core use cases of their solution implemented?",
    ],
};

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
    grades: any[];
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
    useEffect(() => {
        document.body.style.overflow = "hidden";

        return () => {
            document.body.style.overflow = "auto";
        };
    }, []);
    return (
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
                    <span>Last Edited: {lastEdited}</span>
                    <span>|</span>
                    <span
                        className="underline cursor-pointer z-50"
                        onClick={() => {
                            showRubric(false);
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
                        key={index}
                        className="flex flex-row items-end justify-center p-8"
                    >
                        <span className="text-lg">{rating}</span>
                    </div>
                ))}
                {Object.keys(judgingRubric).map((category, index) => {
                    const rubricCategory =
                        category as keyof typeof judgingRubric; // Explicit type assertion

                    return (
                        <>
                            <div
                                key={index}
                                className="text-lg w-full h-56 flex items-center justify-end p-8"
                            >
                                {category}
                            </div>
                            {judgingRubric[rubricCategory].map(
                                (question, index) => (
                                    <div className="w-full h-56" key={index}>
                                        <Box
                                            width={32}
                                            height={32}
                                            fitToParent
                                            hoverEffects
                                            selectableEffects
                                            key={index}
                                            className="flex flex-col  text-center p-4 pt-8"
                                        >
                                            {question}
                                        </Box>
                                    </div>
                                )
                            )}
                        </>
                    );
                })}
            </figure>

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
                            onClick={() => {}}
                        />
                    </div>
                    <div className="w-full flex flex-row items-center justify-between mb-56 mt-12">
                        <div className="flex flex-col text-[#898BC3] gap-2">
                            <span className="text-lg text-white">TOTAL SCORE: N/A</span>
                            <span>Technicality: 4/5</span>
                            <span>Business: 4/5</span>
                            <span>Design + UX: N/A</span>
                            <span>Presentation: N/A</span>
                        </div>
                        <div className="flex flex-row gap-2">
                            <Button
                                label="CANCEL"
                                Icon={null}
                                className="hover:text-[#000000] bg-[#FF4262] border border-[#FF4262] text-[#FF4262] w-24 h-10 hover:bg-opacity-100 bg-opacity-0"
                                onClick={() => {}}
                            />
                            <Button
                                label="SUBMIT SCORE"
                                Icon={null}
                                className="hover:text-[#000000] hover:bg-white bg-[#198E7C] border border-[#198E7C] text-white w-36 h-10"
                                onClick={() => {}}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Rubric;
