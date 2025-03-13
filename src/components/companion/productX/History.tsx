import Box from "@/components/ui/productX/box";
import Button from "@/components/ui/productX/button";
import { motion } from "framer-motion";
import { Pen } from "lucide-react";

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
}

const ProjectBox: React.FC<ProjectBoxProps> = ({
    team,
    date,
}) => {
    return (
        <div className="w-full h-48">
            <Box
                width={100}
                height={20}
                fitToParent={true}
                className={`flex flex-col justify-center pl-5`}
            >
                <div className="flex flex-col gap-2">
                    <header className="text-md">{team}</header>
                    <span className="text-sm text-[#898BC3]">{date}</span>
                </div>

                <Button
                    label="EDIT SCORE"
                    Icon={Pen}
                    className={`hover:bg-[#FFFFFF] hover:text-[#000000] bg-[#41437D] text-[#FFFFFF] w-56 h-10 mt-5`}
                    onClick={() => {}}
                />
            </Box>
        </div>
    );
};

interface HistoryProps {
    data: any[];
}

const History: React.FC<HistoryProps> = ({ data }) => {
    const judge_day = "MAR 7 ";
    return (
        <motion.div {...fadeInUpVariant} className="flex flex-col">
            <header className="mt-16 text-lg font-ibm">ROUND 1</header>
            <div className="grid grid-cols-4 gap-5 mt-10">
                {data.map(
                    (team, index) =>
                        (team.status === "completed" ||
                            team.status === "updated") && (
                            <div key={index}>
                                <ProjectBox
                                    team={team.team}
                                    date={
                                        (team.status === "completed"
                                            ? "COMPLETED "
                                            : "LAST UPDATED ") +
                                        judge_day +
                                        team.date +
                                        " • " +
                                        team.room
                                    }
                                />
                            </div>
                        )
                )}
            </div>
            <header className="mt-16 text-lg font-ibm">ROUND 2</header>
            <div className="grid grid-cols-4 gap-5 mt-10">
                {data.map(
                    (team, index) =>
                        team.finalist === true && (
                            <div key={index}>
                                <ProjectBox
                                    team={team.team}
                                    date={
                                        (team.status === "completed"
                                            ? "COMPLETED "
                                            : "LAST UPDATED ") +
                                        judge_day +
                                        team.date +
                                        " • " +
                                        team.room
                                    }
                                />
                            </div>
                        )
                )}
            </div>
        </motion.div>
    );
};

export default History;