import React from "react";
import Box from "./Box";
import Button from "./Button";
import { Pen } from "lucide-react";

interface ProjectGridProps {
    team_name: string;
    team_status: string;
    onClick: () => void;
}

const ProjectGrid: React.FC<ProjectGridProps> = ({
    team_name,
    team_status,
    onClick
}) => {
    return (
        <>
            <div className="w-full h-48">
                <Box
                    innerShadow={20}
                    className={`flex flex-col justify-center pl-5`}
                >
                    <div className="flex flex-col gap-2">
                        <header className="text-md">{team_name}</header>
                        <span className="text-sm text-[#898BC3]">
                            {team_status}
                        </span>
                    </div>

                    <Button
                        label="EDIT SCORE"
                        Icon={Pen}
                        className={`hover:bg-[#FFFFFF] hover:text-[#000000] bg-[#41437D] text-[#FFFFFF] w-56 h-10 mt-5`}
                        onClick={onClick}
                    />
                </Box>
            </div>
        </>
    );
};

export default ProjectGrid;