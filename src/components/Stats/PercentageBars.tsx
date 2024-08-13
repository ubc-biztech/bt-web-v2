import React, { useState, useEffect } from "react";
import { statsColors as colors } from "@/constants/statsColors";

interface DataItem {
  [key: string]: number;
}

const mockData: DataItem[] = [
  { checkedIn: 110 },
  { registered: 200 },
  { incomplete: 18 },
  { cancelled: 10 },
];

const calculateBarPercentages = (
  data: DataItem[],
  total: number
): { [key: string]: number } => {
  const percentages: { [key: string]: number } = {};

  data.forEach((item) => {
    const [key, value] = Object.entries(item)[0];
    percentages[key] = (value / total) * 100;
  });
  return percentages;
};

const getColorForIndex = (index: number): string => {
  return colors[index % colors.length];
};

const PercentageBars = () => {
  const [total, setTotal] = useState(0);
  const [percentages, setPercentages] = useState<{ [key: string]: number }>({});

  useEffect(() => {
    const totalValue = mockData.reduce(
      (sum, obj) => sum + Object.values(obj)[0],
      0
    );
    setTotal(totalValue);
    setPercentages(calculateBarPercentages(mockData, totalValue));
  }, []);

  return (
    <div>
      <div className="flex h-[50px] w-full mb-3 pt-6">
        {Object.entries(percentages).map(([key, percentage], index) => (
          <div
            key={key}
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
          {Object.keys(percentages).map((key, index) => (
            <div key={key} className="flex items-center mr-5 text-xs">
              <div
                className="w-4 h-4 mr-2 rounded-[2px]"
                style={{
                  backgroundColor: getColorForIndex(index),
                }}
              />
              <span>{key}</span>
            </div>
          ))}
        </div>
        <p className="ml-auto self-end font-600">
          Total registered: {total}
        </p>
      </div>
    </div>
  );
};

export default PercentageBars;
