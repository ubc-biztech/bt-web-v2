import React from "react";
import { Chart } from "react-google-charts";

interface BarChartProps {
  data: { label: string; value: number }[];
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
      fontName: "Poppins",
    },
    tooltip: {
      textStyle: {
        color: "black",
        bold: false,
        fontName: "Poppins",
      },
      showColorCode: true,
    },
    vAxis: {
      baselineColor: "#C4D5FF",
      textStyle: {
        fontSize: "16rem",
        alignment: "left",
        color: "#C4D5FF",
        fontName: "Poppins",
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
        fontName: "Poppins",
      },
      gridlines: {
        color: "#8997B8",
        count: -1,
      },
      minorGridlines: {
        color: "#8997B8",
      },
    },
    fontName: "Poppins",
  };

  return (
    <Chart
      chartType="ColumnChart"
      data={chartData}
      options={options}
      width={width}
      height={height}
    />
  );
};

export default BarChart;
