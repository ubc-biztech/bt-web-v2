// <-- ProjectRow Component --> //
// * Generic Row entries for judges and teams to access rubrics * //

import React from "react";
import Box from "./Box";
import Button from "./Button";
import { ArrowUpRight, Pen, User } from "lucide-react";

interface ProjectRowPropsBase {
    team_name: string; // * team name
    team_status: string; // * status (e.g. "Completed @ {date}", "CURRENTLY PRESENTING", etc.)
    read_only: boolean; // * if read_only is true,
    onClick: () => void; // * functions to call when button is clicked
}

interface ReadOnlyProps extends ProjectRowPropsBase {
    read_only: true; // * read_only is true
    presenting?: never; // Prevents `presenting` when `read_only` is true
}

interface WriteEnabledProps extends ProjectRowPropsBase {
    read_only: false; // * read_only is false
    presenting: boolean; // presenting is true
}

type ProjectRowProps = ReadOnlyProps | WriteEnabledProps;

// ? usage: (read_only)
// <ProjectRow
//     team_name="Team Name"
//     team_status="Status"
//     read_only={true}
//     onClick={() => console.log("clicked")}
// />

// ? usage: (write_enabled)
// <ProjectRow
//     team_name="Team Name"
//     team_status="Status"
//     read_only={false}
//     presenting={true}
//     onClick={() => console.log("clicked")}

// Capitalize team name helper
const capitalizeTeamName = (name: string) => {
    return name.toUpperCase();
};

const ProjectRow: React.FC<ProjectRowProps> = ({
    team_name,
    team_status,
    read_only,
    presenting = false,
    onClick,
}) => {
    return (
        <div className="w-full h-32">
            <Box
                innerShadow={20}
                className={`flex flex-row justify-between items-center pl-5`}
            >
                <div className="flex flex-col gap-2">
                    <div className="flex flex-row gap-2 items-center">
                        <User size={20} />
                        <header className="text-md">{capitalizeTeamName(team_name)}</header>
                    </div>
                    <span className="text-sm text-[#898BC3]">
                        {team_status}
                    </span>
                </div>
                {read_only ? (
                    <Button
                        label={"VIEW GRADING RUBRIC"}
                        Icon={ArrowUpRight}
                        className={`hover:bg-[#FFFFFF] hover:text-[#000000] bg-[#41437D] text-[#FFFFFF] w-56 h-14 mr-10`}
                        onClick={onClick}
                    />
                ) : (
                    <Button
                        label={presenting ? "BEGIN JUDGING" : "EDIT SCORE"}
                        Icon={presenting ? ArrowUpRight : Pen}
                        className={`hover:bg-[#FFFFFF] hover:text-[#000000] bg-[#41437D] text-[#FFFFFF] w-56 h-14 mr-10`}
                        onClick={onClick}
                    />
                )}
            </Box>
        </div>
    );
};

export default ProjectRow;
