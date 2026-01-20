import { BookUser, CircleStar } from "lucide-react";

interface SummaryTextProps {
  name: string;
  connectionsMade: number;
  questsComplete: number;
}

export default function SummaryText({
  name,
  connectionsMade,
  questsComplete,
}: SummaryTextProps) {
  return (
    <div className="flex flex-col">
      <span className="text-lg font-medium">
        {" "}
        Welcome,{" "}
        <h3 className="inline text-lg bg-gradient-to-br from-[#6299ff] to-[#EAE5D4] bg-[length:200%_200%] bg-clip-text text-transparent animate-gradient">
          {name}
        </h3>
      </span>
      <span className="text-md text-[#778191]">
        You&apos;ve made{" "}
        <span className="inline-flex items-baseline gap-1 text-white">
          <BookUser size={16} />
          {connectionsMade} connections
        </span>{" "}
        and completed{" "}
        <span className="inline-flex items-baseline gap-1 text-white">
          <CircleStar size={16} className="opacity-80" />
          {questsComplete} quests
        </span>{" "}
        at BluePrint so far.
      </span>
    </div>
  );
}
