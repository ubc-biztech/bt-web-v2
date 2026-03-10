// MODIFIED FROM STATS

import { StatsChartData } from "@/types/types";
import { debounce } from "lodash";
import React, { useEffect, useState } from "react";
import { Chart } from "react-google-charts";

interface BarChartProps {
  data: StatsChartData[];
  title?: string;
  width?: number;
  height?: number;
}

const BarChart: React.FC<BarChartProps> = ({
  data,
  title,
  width = "100%",
  height = "100%",
}) => {
  const chartData = [
    ["Label", "Value"],
    ...data.map((item) => [item.label, item.value]),
  ];

  // Re-render the chart component when window is resized horizontally
  const [windowWidth, setWindowWidth] = useState<number | null>(null);
  useEffect(() => {
    setWindowWidth(window.innerWidth);
    const handleResize = debounce(() => {
      setWindowWidth(window.innerWidth);
    }, 25);
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const options = {
    backgroundColor: "transparent",
    chartArea: {
      width: "80%",
      height: "60%",
    },
    colors: ["#ADAFE4"],
    legend: { position: "none" },
    title,
    titleTextStyle: {
      fontSize: "0rem",
      bold: false,
      alignment: "left",
      color: "white",
      fontName: "IBM Plex Sans",
    },
    tooltip: {
      textStyle: {
        color: "black",
        bold: false,
        fontName: "IBM Plex Sans",
      },
      showColorCode: true,
    },
    vAxis: {
      baselineColor: "#ADAFE4",
      textStyle: {
        fontSize: "16rem",
        alignment: "left",
        color: "#ADAFE4",
        fontName: "IBM Plex Sans",
      },
      gridlines: {
        color: "#1B1C39",
        count: -1, // not sure if we want to paramaterize this or no
      },
      minorGridlines: {
        color: "#1B1C39",
      },
    },
    hAxis: {
      baselineColor: "#ADAFE4",
      textStyle: {
        fontSize: "16rem",
        alignment: "left",
        color: "#ADAFE4",
        fontName: "IBM Plex Sans",
      },
      gridlines: {
        color: "#8997B8",
        count: -1,
      },
      minorGridlines: {
        color: "#8997B8",
      },
    },
    fontName: "IBM Plex Sans",
  };

  return (
    <>
      {data.length === 0 ? (
        <div className="flex justify-center text-white">No data available</div>
      ) : (
        <Chart
          key={windowWidth}
          chartType="ColumnChart"
          data={chartData}
          options={options}
          width={width}
          height={height}
        />
      )}
    </>
  );
};

export default BarChart;
