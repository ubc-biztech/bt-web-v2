import React from "react";
import { Label } from "./label";
import { Input } from "./input";
import { cn } from "@/lib/utils";

interface TimePickerProps {
  date: Date;
  setDate: (date: Date) => void;
  className?: string;
}

export function TimePickerDemo({ date, setDate, className }: TimePickerProps) {
  const minuteRef = React.useRef<HTMLInputElement>(null);
  const hourRef = React.useRef<HTMLInputElement>(null);
  const [period, setPeriod] = React.useState<"AM" | "PM">(
    date.getHours() >= 12 ? "PM" : "AM",
  );

  const hours = date.getHours();
  const minutes = date.getMinutes();

  // Convert 24h to 12h format
  const hour12 = hours % 12 || 12;

  const setHour = (hour: number) => {
    const newDate = new Date(date);
    // Convert 12h to 24h
    const hour24 =
      period === "PM" ? (hour === 12 ? 12 : hour + 12) : hour === 12 ? 0 : hour;
    newDate.setHours(hour24);
    setDate(newDate);
  };

  const setMinute = (minute: number) => {
    const newDate = new Date(date);
    newDate.setMinutes(minute);
    setDate(newDate);
  };

  const togglePeriod = () => {
    const newPeriod = period === "AM" ? "PM" : "AM";
    setPeriod(newPeriod);

    // Adjust hours when changing period
    const newDate = new Date(date);
    const currentHour = newDate.getHours();
    if (newPeriod === "PM" && currentHour < 12) {
      newDate.setHours(currentHour + 12);
    } else if (newPeriod === "AM" && currentHour >= 12) {
      newDate.setHours(currentHour - 12);
    }
    setDate(newDate);
  };

  return (
    <div className={cn("flex items-end gap-2", className)}>
      <div className="grid gap-1 text-center">
        <Label htmlFor="hours" className="text-xs text-white">
          Hours
        </Label>
        <Input
          ref={hourRef}
          id="hours"
          className="w-16 text-center bg-[#3A496D] text-white border-gray-600"
          value={hour12}
          onChange={(e) => {
            const value = parseInt(e.target.value);
            if (value >= 1 && value <= 12) {
              setHour(value);
            }
          }}
          type="number"
          min={1}
          max={12}
        />
      </div>
      <div className="grid gap-1 text-center">
        <Label htmlFor="minutes" className="text-xs text-white">
          Minutes
        </Label>
        <Input
          ref={minuteRef}
          id="minutes"
          className="w-16 text-center bg-[#3A496D] text-white border-gray-600"
          value={minutes.toString().padStart(2, "0")}
          onChange={(e) => {
            const value = parseInt(e.target.value);
            if (value >= 0 && value <= 59) {
              setMinute(value);
            }
          }}
          type="number"
          min={0}
          max={59}
        />
      </div>
      <div className="grid gap-1 text-center">
        <Label htmlFor="period" className="text-xs text-white">
          Period
        </Label>
        <button
          id="period"
          onClick={togglePeriod}
          className="inline-flex h-10 items-center justify-center rounded-md border border-gray-600 bg-[#3A496D] px-3 py-2 text-sm font-medium text-white"
          type="button"
        >
          {period}
        </button>
      </div>
    </div>
  );
}
