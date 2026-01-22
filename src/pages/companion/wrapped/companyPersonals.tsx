"use client";

import { useEffect, useState, MouseEvent } from "react";
import {
  motion,
  useMotionValue,
  animate,
} from "framer-motion";
import { useRouter } from "next/navigation";
import { COMPANION_EMAIL_KEY } from "@/constants/companion";
import { fetchBackend } from "@/lib/db";
import Image from "next/image";

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
  const [companyProfilePictures, setCompanyProfilePictures] = useState<
    string[]
  >([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [isTapped, setIsTapped] = useState(false);
  const router = useRouter();
  const opacity = useMotionValue(1);
  const scale = useMotionValue(1);
  const y = useMotionValue(0);

  const navigateTo = (path: string) => {
    setIsTapped(true);
    animate(opacity, 0, { duration: 0.5 });
    animate(scale, 0.8, { duration: 0.5 });
    animate(y, 20, { duration: 0.5 });
    setTimeout(() => {
      router.push(path);
    }, 800);
  };

  const handleTapNavigation = (e: MouseEvent<HTMLDivElement>) => {
    const screenWidth = window.innerWidth;
    const clickX = e.clientX;
    const isRightSide = clickX > screenWidth * 0.3;

    if (isRightSide) {
      navigateTo("/companion/wrapped/badgePersonals");
    } else {
      navigateTo("/companion/wrapped/taps");
    }
  };

  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        const profileId = localStorage.getItem(COMPANION_EMAIL_KEY);
        if (!profileId) return;

        // Get connections from localStorage
        const storedConnections = JSON.parse(
          localStorage.getItem("connections") || "[]",
        );

        // Extract unique company names
        const companies = new Set<string>();
        storedConnections.forEach((conn: { company: string }) => {
          if (conn.company) companies.add(conn.company);
        });

        const companyList = Array.from(companies);
        setVisitedCompanies(companyList);
        setTotalBooths(companyList.length);

        // Fetch profile pictures for each company
        fetchCompanyProfilePictures(companyList);
      } catch (error) {
        console.error("Error processing company data:", error);
      }
    };

    fetchCompanies();
  }, []);

  const fetchCompanyProfilePictures = async (companyList: string[]) => {
    const profilePictures: string[] = [];
    await Promise.all(
      companyList.map(async (company) => {
        try {
          const data = await fetchBackend({
            endpoint: `/profiles/${company.toLowerCase().replace(/[^a-zA-Z]/g, "")}`,
            method: "GET",
            authenticatedCall: false,
          });
          if (data && data.profilePictureURL) {
            profilePictures.push(data.profilePictureURL);
          }
        } catch (error) {
          console.error(
            `Error fetching profile picture for ${company}:`,
            error,
          );
        }
      }),
    );
    setCompanyProfilePictures(profilePictures);
  };

  return (
    <motion.div
      className="fixed inset-0 flex flex-col items-center justify-center p-6 space-y-4 cursor-pointer overflow-hidden"
      onClick={handleTapNavigation}
      initial={{ opacity: 0, scale: 0.9, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      style={{ opacity, scale, y }}
      exit={{ opacity: 0, scale: 0.9, y: 20 }}
    >
        {/* Text: You visited */}
        <motion.p className="text-white text-lg font-satoshi font-medium text-center">
          You connected with
        </motion.p>

        {/* Booth Count */}
        <motion.h1 className="text-white text-6xl font-satoshi font-bold drop-shadow-[0_0_20px_#4488FF]">
          {companyProfilePictures.length}
        </motion.h1>

        {/* Subtext */}
        <motion.p className="text-white text-lg font-satoshi font-medium text-center">
          {totalBooths === 1 ? "company" : "companies"}
        </motion.p>

        {/* Company Grid Container */}
        <motion.div
          className="bg-[#111827] rounded-lg p-6 shadow-lg w-[85%] max-w-md"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
        >
          <p className="text-white text-sm font-satoshi font-bold mb-4">
            Companies
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            {companyProfilePictures.map((url, index) => (
              <div
                key={index}
                className="bg-white p-2 rounded-full border border-gray-700"
              >
                <Image
                  src={url}
                  alt="Company Logo"
                  width={50}
                  height={50}
                  className="rounded-full"
                />
              </div>
            ))}
          </div>
      </motion.div>
    </motion.div>
  );
};

export default BoothSummary;
