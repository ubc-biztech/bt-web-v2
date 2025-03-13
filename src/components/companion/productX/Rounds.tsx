import Box from "@/components/ui/productX/box";
import Button from "@/components/ui/productX/button";
import { motion } from "framer-motion";
import { ArrowUpRight, Pen } from "lucide-react";
import CornerBorderWrapper from "@/components/ui/productX/corner-box";

const fadeInUpVariant = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: {
        duration: 0.8,
        ease: [0.6, -0.05, 0.01, 0.99],
    },
};

interface ProjectBoxProps {
    team: string;
    date: string;
    presenting: boolean;
}

const ProjectBox: React.FC<ProjectBoxProps> = ({ team, date, presenting }) => {
    return (
        <div className="w-full h-32">
            <Box
                width={100}
                height={20}
                fitToParent={true}
                className={`flex flex-row justify-between items-center pl-5`}
            >
                <Button
                    label={presenting ? "BEGIN JUDGING" : "EDIT SCORE"}
                    Icon={presenting ? ArrowUpRight : Pen}
                    className={`hover:bg-[#FFFFFF] hover:text-[#000000] bg-[#41437D] text-[#FFFFFF] w-56 h-14 mr-10`}
                    onClick={() => {}}
                />
                <div className="flex flex-col gap-2">
                    <header className="text-md">{team}</header>
                    <span className="text-sm text-[#898BC3]">{date}</span>
                </div>
            </Box>
        </div>
    );
};

interface RoundsProps {
    data: any[];
}

const rounds = [
    {
        name: "ROUND 1",
        selected: true,
    },
    {
        name: "ROUND 2",
        selected: false,
    },
    {
        name: "ROUND 3",
        selected: false,
    },
];

const Rounds: React.FC<RoundsProps> = ({ data }) => {
    return (
        <motion.div {...fadeInUpVariant} className="flex flex-row mt-10 gap-8">
            <div className="w-36 flex flex-col gap-5">
                {rounds.map((round, index) => (
                    <CornerBorderWrapper selected={round.selected} key={index}>
                        <div
                            className="w-36 h-16 flex flex-row items-center justify-center"
                            style={{
                                boxShadow: `inset 0 0 36px rgba(39, 40, 76, 1)`,
                            }}
                        >
                            <span
                                className={`text-md ${
                                    round.selected
                                        ? "text-white"
                                        : "text-[#656795]"
                                }`}
                            >
                                {round.name}
                            </span>
                        </div>
                    </CornerBorderWrapper>
                ))}
            </div>
            <div className="w-full flex flex-col gap-5">
                {data.map(
                    (team, index) =>
                        team.status === "current" && (
                            <ProjectBox
                                key={index}
                                team={team.team}
                                date={"CURRENTLY PRESENTING • " + team.room}
                                presenting={team.status === "current"}
                            />
                        )
                )}
                <div className="my-4 text-[#3D3E63] flex flex-row items-center">
                    <span>RECENT HISTORY</span>
                    <figure className="ml-2 w-56 h-[1px] bg-[#3D3E63]" />
                </div>
                {data.map(
                    (team, index) =>
                        team.status != "current" && (
                            <ProjectBox
                                key={index}
                                team={team.team}
                                date={"CURRENTLY PRESENTING • " + team.room}
                                presenting={team.status === "current"}
                            />
                        )
                )}
            </div>
        </motion.div>
    );
};

export default Rounds;
