import React, { useEffect, useState } from "react";
import { Chart } from "react-google-charts";
import { debounce } from "lodash";

interface PieChartProps {
  data: { label: string; value: number }[];
  title?: string;
  width?: number;
  height?: number;
}

const PieChart: React.FC<PieChartProps> = ({
  data,
  title,
  width = "100%",
  height = "100%",
}) => {
  // Format the data for Google Charts
  const chartData = [
    ['Label', 'Value'],
    ...data.map(item => [item.label, item.value]),
  ];

  // Re-render the chart component when window is resized horizontally
  const [key, setKey] = useState(0);
  const [prevWidth, setPrevWidth] = useState(0);

  useEffect(() => {
    setPrevWidth(window.innerWidth);

    const handleResize = debounce(() => {
      const newWidth = window.innerWidth;
      if (newWidth < prevWidth) {
        setKey(key + 1);
      }
      setPrevWidth(newWidth);
    }, 25);

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [prevWidth]);

  const options = {
    backgroundColor: 'transparent',
    pieHole: 0.4,
    slices: [
      { color: '#8AD1C2' },
      { color: '#9F8AD1' },
      { color: '#D18A99' },
      { color: '#D1C68A' },
      { color: '#8AD1A9' },
      { color: '#8A96D1' },
      { color: '#D1A68A' },
    ],
    pieSliceText: 'percentage',
    legend: {
      alignment: 'center',
      textStyle: {
        color: 'white',
        bold: false,
        fontName: 'Poppins'
      }
    },
    title,
    titleTextStyle: {
      fontSize: '18rem',
      bold: true,
      alignment: 'left',
      color: 'white',
      fontName: 'Poppins'
    },
    tooltip: {
      textStyle: {
        color: 'black', 
        bold: false, 
        fontName: 'Poppins'
      }, 
      showColorCode: true
    },
    chartArea: {
      left: "0%",
      top: "5%",
      width: "100%",
      height: "100%",
    },
    fontName: 'Poppins'
  };

  return (
    <Chart
      key={key}
      chartType="PieChart"
      data={chartData}
      options={options}
      width={width}
      height={height}
    />
  );
};

export default PieChart;