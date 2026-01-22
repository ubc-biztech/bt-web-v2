"use client";

import { useEffect, useState, MouseEvent } from "react";
import { Line } from "react-chartjs-2";
import {
  Chart,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { COMPANION_EMAIL_KEY } from "@/constants/companion";
import { useRouter } from "next/navigation";
import {
  motion,
  useMotionValue,
  animate,
} from "framer-motion";
import { useWrappedData } from "@/hooks/useWrappedData";

// Register chart.js components
Chart.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
);

interface ConnectionsSummaryProps {
  isPartner: boolean;
}

const ConnectionsSummary = ({ isPartner }: ConnectionsSummaryProps) => {
  const router = useRouter();
  // Wrapped data available but unused for now
  const { data: wrappedData } = useWrappedData();
  const [connectionsByHour, setConnectionsByHour] = useState<
    { hour: string; count: number }[]
  >([]);
  const [totalConnections, setTotalConnections] = useState(0);
  const [mostActiveHour, setMostActiveHour] = useState<string>("");
  const [isTapped, setIsTapped] = useState(false);
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
      navigateTo("/companion/wrapped/companyPersonals");
    } else {
      navigateTo("/companion/wrapped/firstConnection");
    }
  };

  useEffect(() => {
    const fetchConnections = async () => {
      try {
        const profileId = localStorage.getItem(COMPANION_EMAIL_KEY);
        if (!profileId) return;

        // Get connections from localStorage
        const storedConnections = JSON.parse(
          localStorage.getItem("connections") || "[]",
        );

        // Parse timestamps and group by hour
        const hourlyCounts: Record<number, number> = {};

        storedConnections.forEach((conn: { createdAt: string }) => {
          const date = new Date(parseInt(conn.createdAt, 10)); // Convert milliseconds to JS Date
          const hour = date.getHours(); // Extract hour (0-23)

          if (hourlyCounts[hour]) {
            hourlyCounts[hour]++;
          } else {
            hourlyCounts[hour] = 1;
          }
        });

        // Fill in missing hours with 0 count
        const fullHours = Array.from({ length: 7 }, (_, i) => {
          const hour = i + 11; // Starts from 11 AM
          const period = hour >= 12 ? "PM" : "AM"; // Determine AM or PM
          const formattedHour = hour > 12 ? hour - 12 : hour; // Convert 13+ to 1-11
          return {
            hour: `${formattedHour} ${period}`,
            count: hourlyCounts[hour] || 0, // Default to 0 if missing
          };
        });

        // Find most active hour
        const mostActive = fullHours.reduce(
          (max, item) => (item.count > max.count ? item : max),
          { hour: "", count: 0 },
        );

        // Update state
        setConnectionsByHour(fullHours);
        setTotalConnections(storedConnections.length);
        setMostActiveHour(mostActive.hour);
      } catch (error) {
        console.error("Error processing connections data:", error);
      }
    };

    fetchConnections();
  }, []);

  // Chart.js Data
  const chartData = {
    labels: connectionsByHour.map((data) => data.hour),
    datasets: [
      {
        label: "Connections",
        data: connectionsByHour.map((data) => data.count),
        borderColor: "#4488FF",
        backgroundColor: "rgba(68, 136, 255, 0.2)",
        pointBackgroundColor: "#4488FF",
        pointBorderColor: "#ffffff",
        borderWidth: 3,
        tension: 0.4, // Smoother line
        pointRadius: 5,
      },
    ],
  };

  // Chart.js Options
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      x: {
        ticks: { color: "#ffffff" },
        grid: { display: false },
      },
      y: {
        ticks: {
          color: "#ffffff",
          stepSize: 1,
          beginAtZero: true,
          precision: 0, // Forces whole numbers
        },
        grid: { color: "#2E2E2E" },
      },
    },
  };

  return (
    <motion.div
      className="fixed inset-0 flex flex-col items-center justify-center px-4 py-6 space-y-4 cursor-pointer overflow-hidden"
      onClick={handleTapNavigation}
      initial={{ opacity: 0, scale: 0.9, y: 10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      style={{ opacity, scale, y }}
      exit={{ opacity: 0, scale: 0.9, y: 10 }}
    >
        {/* Header */}
        <motion.p className="text-white text-lg font-satoshi font-medium text-center">
          You made
        </motion.p>

        {/* Connection Count */}
        <motion.h1 className="text-white text-6xl font-satoshi font-bold drop-shadow-[0_0_20px_#4488FF]">
          {totalConnections}
        </motion.h1>

        {/* Subtext */}
        <motion.p className="text-white text-lg font-satoshi font-medium text-center">
          <span className="underline">connections</span> at BluePrint.
        </motion.p>

        {/* Chart Container */}
        <motion.div
          className="bg-[#111827] rounded-lg p-6 shadow-lg w-[85%] max-w-md h-160"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
        >
          <p className="text-white text-sm font-satoshi font-bold mb-2">
            Connections by Hour
          </p>
          <div className="h-48">
            <Line data={chartData} options={chartOptions} />
          </div>
        </motion.div>

        {/* Most Active Hour */}
        {totalConnections > 0 && (
          <motion.p className="text-white text-lg font-satoshi font-medium text-center">
            You networked the most around{" "}
            <span className="font-satoshi font-bold">{mostActiveHour}</span>.
          </motion.p>
      )}
    </motion.div>
  );
};

export default ConnectionsSummary;
