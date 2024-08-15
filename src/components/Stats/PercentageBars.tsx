import React, { useState, useEffect } from "react";
import { StatsChartData } from "@/types";

interface PercentageBarsProps {
  data: StatsChartData[];
}

export const barColors = ['#A0C86E', '#75CFF5', '#E75A7C', '#FFC960', '#C082D6', '#7F94FF', '#EB8273']

const calculateBarPercentages = (
  data: StatsChartData[],
  total: number
) => {
  const percentages: { [key: string]: number } = {};

  data.forEach((item) => {
    const { label, value } = item;
    percentages[label] = (value / total) * 100;
  });
  return percentages;
};

const getColorForIndex = (index: number): string => {
  return barColors[index % barColors.length];
};

const PercentageBars: React.FC<PercentageBarsProps> = ({ data }) => {
  const [total, setTotal] = useState(0);
  const [percentages, setPercentages] = useState<{ [key: string]: number }>({});

  useEffect(() => {
    const totalValue = data.reduce((sum, item) => sum + item.value, 0);
    setTotal(totalValue);
    setPercentages(calculateBarPercentages(data, totalValue));
  }, [data]);

  return (
    <div>
      <div className="flex h-[50px] w-full mb-3 pt-6">
        {Object.entries(percentages).map(([label, percentage], index) => (
          <div
            key={label}
            className="flex items-center justify-center relative"
            style={{
              flex: `0 0 ${percentage}%`,
              backgroundColor: getColorForIndex(index),
              borderTopLeftRadius: index === 0 ? "4px" : "0",
              borderBottomLeftRadius: index === 0 ? "4px" : "0",
              borderTopRightRadius:
                index === Object.entries(percentages).length - 1 ? "4px" : "0",
              borderBottomRightRadius:
                index === Object.entries(percentages).length - 1 ? "4px" : "0",
            }}
          >
            <div className="absolute top-[-25px] left-[50%] text-white text-sm font-medium translate-x-[-50%]">
              {percentage.toFixed(1)}%
            </div>
          </div>
        ))}
      </div>
      <div className="flex items-center w-full text-white">
        <div className="flex flex-wrap">
          {Object.keys(percentages).map((label, index) => (
            <div key={label} className="flex items-center mr-5 text-xs">
              <div
                className="w-4 h-4 mr-2 rounded-[2px]"
                style={{
                  backgroundColor: getColorForIndex(index),
                }}
              />
              <span>{label}</span>
            </div>
          ))}
        </div>
        <p className="ml-auto self-end font-600">Total registered: {total}</p>
      </div>
    </div>
  );
};

export default PercentageBars;
