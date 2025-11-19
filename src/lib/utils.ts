import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const formatTimestampUtil = (timestamp: number) => {
  const date = new Date(timestamp);
  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const monthIndex = date.getMonth();
  const month = months[monthIndex];
  const monthPadded = String(monthIndex + 1).padStart(2, "0");
  const day = date.getDate();
  const dayPadded = String(day).padStart(2, "0");
  const year = String(date.getFullYear()).slice(-2);

  const daySuffix =
    day === 1 || day === 21 || day === 31
      ? "st"
      : day === 2 || day === 22
        ? "nd"
        : day === 3 || day === 23
          ? "rd"
          : "th";

  let hours = date.getHours();
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const ampm = hours >= 12 ? "PM" : "AM";
  hours = hours % 12 || 12;
  const time = `${hours}:${minutes}${ampm}`;

  return {
    month,
    monthPadded,
    day,
    dayPadded,
    dayWithSuffix: `${day}${daySuffix}`,
    year,
    time,
  };
};

export const formatTimestamp = (timestamp: number): string => {
  const { monthPadded, dayPadded, year, time } = formatTimestampUtil(timestamp);
  return `${monthPadded}-${dayPadded}-${year} - ${time}`;
};

export const formatPopupTimestamp = (
  timestamp: number,
): { month: string; day: string; time: string } => {
  const { month, dayWithSuffix, time } = formatTimestampUtil(timestamp);
  return { month, day: dayWithSuffix, time };
};
