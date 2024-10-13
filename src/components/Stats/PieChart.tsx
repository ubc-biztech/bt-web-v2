import React, { useEffect, useState } from "react";
import { Chart } from "react-google-charts";
import { debounce } from "lodash";
import { StatsChartData } from "@/types/types";
interface PieChartProps {
  data: StatsChartData[];
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
  const [windowWidth, setWindowWidth] = useState<number | null>(null);
  useEffect(() => {
    setWindowWidth(window.innerWidth);
    const handleResize = debounce(() => {
      setWindowWidth(window.innerWidth);
    }, 25);
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

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
    fontName: "Poppins",
  };

  return (
    <>
      {data.length === 0 ? (
        <div className="flex justify-center text-white">No data available</div>
      ) : (
        <Chart
          key={windowWidth}
          chartType="PieChart"
          data={chartData}
          options={options}
          width={width}
          height={height}
        />
      )}
    </>
  );
};

export default PieChart;