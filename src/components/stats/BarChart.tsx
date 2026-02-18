import { StatsChartData } from "@/types/types";
import debounce from "lodash/debounce";
import React, { useEffect, useState } from "react";
import { Chart } from "react-google-charts";

interface BarChartProps {
  data: StatsChartData[];
  title?: string;
  width?: number | string;
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
      height: "70%",
    },
    colors: ["#C4D5FF"],
    legend: { position: "none" },
    title,
    titleTextStyle: {
      fontSize: "18rem",
      bold: true,
      alignment: "left",
      color: "white",
    },
    tooltip: {
      textStyle: {
        color: "black",
        bold: false,
      },
      showColorCode: true,
    },
    vAxis: {
      baselineColor: "#C4D5FF",
      textStyle: {
        fontSize: "16rem",
        alignment: "left",
        color: "#C4D5FF",
      },
      gridlines: {
        color: "#8997B8",
        count: -1, // not sure if we want to paramaterize this or no
      },
      minorGridlines: {
        color: "#8997B8",
      },
    },
    hAxis: {
      baselineColor: "#C4D5FF",
      textStyle: {
        fontSize: "16rem",
        alignment: "left",
        color: "#C4D5FF",
      },
      gridlines: {
        color: "#8997B8",
        count: -1,
      },
      minorGridlines: {
        color: "#8997B8",
      },
    },
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
