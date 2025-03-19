import React, { useState, useEffect } from 'react';
import ProdxBizBot from "@/assets/2025/productx/prodxbizbot.png";
import BigProdX from "@/assets/2025/productx/biglogo.png";
import LoaderCircle from "@/assets/2025/productx/loadercircle.svg";
import Image from "next/image";
import { useRouter } from 'next/router';
import { motion, AnimatePresence } from 'framer-motion';
import { useUserRegistration } from '@/pages/companion';
import { fetchBackend } from '@/lib/db';
import User from '../User';

const TeamCreation: React.FC = () => {
    const { userRegistration } = useUserRegistration();
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [teamID, setTeamID] = useState<string | null>(null);
    const [teamName, setTeamName] = useState("");
    const [teamMembers, setTeamMembers] = useState({
        member1: userRegistration?.id || "",
        member2: '',
        member3: '',
        member4: '',
    });
    const [errors, setErrors] = useState({
        teamName: false,
        member1: false,
        member2: false,
        member3: false,
    });

    useEffect(() => {
        if (userRegistration?.id) {
            setTeamMembers(prev => ({ ...prev, member1: userRegistration.id }));
        }
    }, [userRegistration]);
    

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setTeamMembers(prevState => ({
            ...prevState,
            [name]: value,
        }));

        if (name !== 'member4') {
            setErrors(prevErrors => ({
                ...prevErrors,
                [name]: false,
            }));
        }
    };

    const handleTeamSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Check required fields
        const newErrors = {
            teamName: !teamName.trim(), // Ensure team name isn't empty
            member1: !teamMembers.member1,
            member2: !teamMembers.member2,
            member3: !teamMembers.member3,
        };

        setErrors(newErrors);

        if (Object.values(newErrors).some(error => error)) {
            return;
        }

        const eventYearData = userRegistration?.["eventID;year"];
        if (!eventYearData) {
            console.error("eventID;year is missing in userRegistration");
            setIsLoading(false);
            return;
        }
        const [eventID, year] = eventYearData.split(";");
        const payload = {
            team_name: teamName,
            eventID,
            year: Number(year),
            memberIDs: Object.values(teamMembers).filter(email => email),
        };


        setIsLoading(true);
        console.log("Sending team creation request:", payload);

        try {
            const response = await fetchBackend({
                endpoint: "/team/make",
                method: "POST",
                data: payload,
                authenticatedCall: false,
            });

            console.log("Response:", response);

            if (response?.message === "Successfully created new team.") {
                setTeamID(response?.response.id);
            } else {
                console.error("Error creating team:", response);
            }
        } catch (error) {
            console.error("Error sending request:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const pageVariants = {
        initial: { opacity: 0, y: 20 },
        animate: { opacity: 1, y: 0 },
        exit: { opacity: 0, y: -20 }
    };

    const transition = {
        type: "tween",
        ease: "easeInOut",
        duration: 0.5
    };

    return (
        <div className="fixed inset-0 flex flex-col items-center justify-center bg-[#020319] text-white">
            {teamID ? (
            <User teamID={teamID} />
        ) : (
            <AnimatePresence mode="wait">
                {isLoading && (
                    <motion.div
                        key="loading"
                        initial="initial"
                        animate="animate"
                        exit="exit"
                        variants={pageVariants}
                        transition={transition}
                        className="flex flex-col items-center justify-center absolute inset-0 z-30"
                    >
                        <header className="text-2xl text-white font-ibm mb-8">Building Team...</header>
                        <Image
                            src={LoaderCircle}
                            alt="Loading"
                            width={60}
                            height={60}
                            className="[animation:spin_3s_linear_infinite] brightness-0 invert"
                        />
                    </motion.div>
                )}

                {!isLoading && (
                    <>
                        <motion.div
                            key="team"
                            initial="initial"
                            animate="animate"
                            exit="exit"
                            variants={pageVariants}
                            transition={transition}
                            className="flex flex-col items-center w-full z-20"
                        >
                            <Image
                                src={BigProdX}
                                alt="ProductX Logo"
                                width={315}
                                height={100}
                                className="mb-4"
                            />
                            <header className="text-2xl font-ibm mb-4">
                                Welcome, <span className="text-[#898BC3]">{userRegistration?.basicInformation.fname || "Guest"}</span>
                            </header>
                            <p className="font-ibm mb-8 text-sm text-white text-center">
                                Looks like you haven&apos;t formed a team yet. Let&apos;s get you set up!
                            </p>
                            <form onSubmit={handleTeamSubmit} className="max-w-sm w-full">
                                <div className="font-ibm mb-4">
                                    <input
                                        type="text"
                                        name="teamName"
                                        placeholder="Enter Team Name"
                                        value={teamName}
                                        onChange={(e) => setTeamName(e.target.value)}
                                        className={`w-full p-3 bg-white text-black focus:outline-none focus:ring-2 focus:ring-[#898BC3] placeholder-[#898BC3] ${errors.teamName ? 'border-2 border-[#DE3163]' : ''}`}
                                    />
                                    {errors.teamName && (
                                        <p className="font-ibm text-xs text-[#DE3163] mt-1">Error: Team Name is required</p>
                                    )}
                                </div>
                                <div className="font-ibm mb-4">
                                    <input
                                        type="email"
                                        name="member1"
                                        placeholder="Team Member 1 Email"
                                        value={teamMembers.member1}
                                        readOnly
                                        className={`w-full p-3 bg-white text-black focus:outline-none focus:ring-2 focus:ring-[#898BC3] placeholder-[#898BC3] ${errors.member1 ? 'border-2 border-[#DE3163]' : ''}`}
                                    />
                                    {errors.member1 && (
                                        <p className="font-ibm text-xs text-[#DE3163] mt-1">Error: Field is required</p>
                                    )}
                                </div>
                                <div className="font-ibm mb-4">
                                    <input
                                        type="email"
                                        name="member2"
                                        placeholder="Team Member 2 Email"
                                        value={teamMembers.member2}
                                        onChange={handleChange}
                                        className={`w-full p-3 bg-white text-black focus:outline-none focus:ring-2 focus:ring-[#898BC3] placeholder-[#898BC3] ${errors.member2 ? 'border-2 border-[#DE3163]' : ''}`}
                                    />
                                    {errors.member2 && (
                                        <p className="font-ibm text-xs text-[#DE3163] mt-1">Error: Field is required</p>
                                    )}
                                </div>
                                <div className="font-ibm mb-4">
                                    <input
                                        type="email"
                                        name="member3"
                                        placeholder="Team Member 3 Email"
                                        value={teamMembers.member3}
                                        onChange={handleChange}
                                        className={`w-full p-3 bg-white text-black focus:outline-none focus:ring-2 focus:ring-[#898BC3] placeholder-[#898BC3] ${errors.member3 ? 'border-2 border-[#DE3163]' : ''}`}
                                    />
                                    {errors.member3 && (
                                        <p className="font-ibm text-xs text-[#DE3163] mt-1">Error: Field is required</p>
                                    )}
                                </div>
                                <div className="font-ibm mb-4">
                                    <input
                                        type="email"
                                        name="member4"
                                        placeholder="Team Member 4 Email (Optional)"
                                        value={teamMembers.member4}
                                        onChange={handleChange}
                                        className="w-full p-3 bg-white text-black focus:outline-none focus:ring-2 focus:ring-[#898BC3] placeholder-[#898BC3]"
                                    />
                                </div>
                                <button
                                    type="submit"
                                    className="w-full p-3 font-ibm text-sm font-400 bg-[#198E7C] text-white hover:bg-[#4CC8BD80]"
                                >
                                    CONTINUE
                                </button>
                            </form>
                        </motion.div>

                        <motion.div
                            key="bizbot"
                            initial={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute bottom-0 right-0 w-[800px] h-auto z-50"
                        >
                            <Image
                                src={ProdxBizBot}
                                alt="ProdxBizBot"
                                className="object-contain"
                                width={800}
                                height={800}
                                priority
                            />
                        </motion.div>

                    </>
                )}
            </AnimatePresence>
        )}
        </div>
    );
};

export default TeamCreation;
