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
  title = "Bar Chart",
  width = 600,
  height = 400,
}) => {
  const chartData = [
    ["Label", "Value"],
    ...data.map((item) => [item.label, item.value]),
  ];

  const options = {
    backgroundColor: "transparent",
    chartArea: {
      left: "10%",
      top: "20%",
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
    <div
      className={`bg-login-form-card rounded-md font-poppins`}
      style={{ width: width + "px" }}
    >
      <Chart
        chartType="ColumnChart"
        data={chartData}
        options={options}
        width={width + "px"}
        height={height + "px"}
      />
    </div>
  );
};

export default BarChart;
