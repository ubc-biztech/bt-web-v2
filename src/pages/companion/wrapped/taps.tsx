"use client";

import { useEffect, useState } from "react";
import NavBarContainer from "@/components/companion/navigation/NavBarContainer";
import dynamic from "next/dynamic";
import { COMPANION_EMAIL_KEY } from "@/constants/companion";
import { useRouter } from "next/navigation";
import {
  m,
  useMotionValue,
  useTransform,
  animate,
  AnimatePresence,
} from "framer-motion";

const Line = dynamic(() => import("react-chartjs-2").then((mod) => mod.Line), {
  ssr: false,
});

interface ConnectionsSummaryProps {
  isPartner: boolean;
}

const ConnectionsSummary = ({ isPartner }: ConnectionsSummaryProps) => {
  const router = useRouter();
  const [connectionsByHour, setConnectionsByHour] = useState<
    { hour: string; count: number }[]
  >([]);
  const [totalConnections, setTotalConnections] = useState(0);
  const [mostActiveHour, setMostActiveHour] = useState<string>("");
  const [isTapped, setIsTapped] = useState(false);
  const [isChartReady, setIsChartReady] = useState(false);
  const opacity = useMotionValue(1);
  const scale = useMotionValue(1);
  const y = useMotionValue(0);

  const handleTap = () => {
    setIsTapped(true);
    animate(opacity, 0, { duration: 0.5 });
    animate(scale, 0.8, { duration: 0.5 });
    animate(y, 20, { duration: 0.5 });
    setTimeout(() => {
      router.push("/companion/wrapped/companyPersonals");
    }, 800);
  };

  useEffect(() => {
    const registerChart = async () => {
      const {
        Chart,
        CategoryScale,
        LinearScale,
        PointElement,
        LineElement,
        Title,
        Tooltip,
        Legend,
      } = await import("chart.js");

      Chart.register(
        CategoryScale,
        LinearScale,
        PointElement,
        LineElement,
        Title,
        Tooltip,
        Legend,
      );
      setIsChartReady(true);
    };

    registerChart();
  }, []);

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
    <NavBarContainer isPartner={isPartner}>
      <m.div
        className="min-h-screen flex flex-col items-center bg-gradient-to-b from-[#040C12] to-[#030608] px-4 pb-6 space-y-4 cursor-pointer"
        onClick={handleTap}
        initial={{ opacity: 0, scale: 0.9, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }} // Stops pushing content down
        transition={{ duration: 0.5 }}
        style={{ opacity, scale, y, paddingTop: "1rem" }} // Reduces top padding
        exit={{ opacity: 0, scale: 0.9, y: 10 }}
      >
        {/* Header */}
        <m.p className="text-white text-lg font-satoshi font-medium text-center">
          You made
        </m.p>

        {/* Connection Count */}
        <m.h1 className="text-white text-6xl font-satoshi font-bold drop-shadow-[0_0_20px_#4488FF]">
          {totalConnections}
        </m.h1>

        {/* Subtext */}
        <m.p className="text-white text-lg font-satoshi font-medium text-center">
          <span className="underline">connections</span> at BluePrint.
        </m.p>

        {/* Chart Container */}
        <m.div
          className="bg-[#111827] rounded-lg p-6 shadow-lg w-[85%] max-w-md h-160"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
        >
          <p className="text-white text-sm font-satoshi font-bold mb-2">
            Connections by Hour
          </p>
          <div className="h-48">
            {isChartReady ? (
              <Line data={chartData} options={chartOptions} />
            ) : (
              <div className="h-full flex items-center justify-center text-sm text-white/60">
                Loading chart...
              </div>
            )}
          </div>
        </m.div>

        {/* Most Active Hour */}
        {totalConnections > 0 && (
          <m.p className="text-white text-lg font-satoshi font-medium text-center">
            You networked the most around{" "}
            <span className="font-satoshi font-bold">{mostActiveHour}</span>.
          </m.p>
        )}
      </m.div>
    </NavBarContainer>
  );
};

export default ConnectionsSummary;
