"use client";

import { useEffect, useState } from "react";
import { motion, useMotionValue, useTransform, animate, AnimatePresence } from 'framer-motion';
import NavBarContainer from "@/components/companion/navigation/NavBarContainer";
import { useRouter } from "next/navigation";
import { COMPANION_EMAIL_KEY } from "@/constants/companion";

// Component for the company name badges
const CompanyBadge = ({ name }: { name: string }) => (
    <motion.div
        className="bg-gray-800 text-white px-4 py-2 rounded-full text-sm"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
    >
        {name}
    </motion.div>
);

interface BoothSummaryProps {
    isPartner: boolean;
}

const BoothSummary = ({ isPartner }: BoothSummaryProps) => {
    const [visitedCompanies, setVisitedCompanies] = useState<string[]>([]);
    const [totalBooths, setTotalBooths] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const [searchQuery, setSearchQuery] = useState("");
    const [isTapped, setIsTapped] = useState(false)
    const router = useRouter()
    const opacity = useMotionValue(1)
    const scale = useMotionValue(1)
    const y = useMotionValue(0)

    const handleTap = () => {
        setIsTapped(true)
        animate(opacity, 0, { duration: 0.5 })
        animate(scale, 0.8, { duration: 0.5 })
        animate(y, 20, { duration: 0.5 })
        setTimeout(() => {
            router.push("/companion/wrapped/badgePersonals")
        }, 800)
    }

    useEffect(() => {
        const fetchCompanies = async () => {
            try {
                const profileId = localStorage.getItem(COMPANION_EMAIL_KEY);
                if (!profileId) return;

                // Get connections from localStorage
                const storedConnections = JSON.parse(localStorage.getItem("connections") || "[]");

                // Extract unique company names
                const companies = new Set<string>();
                storedConnections.forEach((conn: { company: string }) => {
                    if (conn.company) companies.add(conn.company);
                });

                // Update state
                setVisitedCompanies(Array.from(companies));
                setTotalBooths(companies.size);
            } catch (error) {
                console.error("Error processing company data:", error);
            }
        };

        fetchCompanies();
    }, []);

    return (
        <NavBarContainer isPartner={isPartner}>
            <motion.div
                className="fixed inset-0 flex flex-col items-center justify-center bg-gradient-to-b from-[#040C12] to-[#030608] p-6 space-y-4 cursor-pointer"
                onClick={handleTap}
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                style={{ opacity, scale, y }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
            >
                {/* Text: You visited */}
                <motion.p className="text-white text-lg font-medium text-center">
                    You connected with
                </motion.p>

                {/* Booth Count */}
                <motion.h1 className="text-white text-6xl font-bold drop-shadow-[0_0_20px_#4488FF]">
                    {totalBooths}
                </motion.h1>

                {/* Subtext */}
                <motion.p className="text-white text-lg font-medium text-center">
                    {totalBooths === 1 ? "company" : "companies"}
                </motion.p>


                {/* Company Grid Container */}
                <motion.div
                    className="bg-[#111827] rounded-lg p-6 shadow-lg w-[85%] max-w-md"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8 }}
                >
                    <p className="text-white text-sm font-bold mb-4">Companies</p>
                    <div className="flex flex-wrap justify-center gap-3">
                        {visitedCompanies.slice(0, 9).map((company, index) => (
                            <CompanyBadge key={index} name={company} />
                        ))}
                    </div>
                </motion.div>

                {/* Final Text */}
                <motion.p className="text-white text-lg font-medium text-center italic">
                    You had a preference for the <span className="font-bold">big companies</span>.
                    Way to aim high! *TODO: Comeback to fix
                </motion.p>
            </motion.div>
        </NavBarContainer>
    );
};

export default BoothSummary;
