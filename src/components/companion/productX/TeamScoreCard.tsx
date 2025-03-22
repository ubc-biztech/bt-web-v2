import { Users } from "lucide-react";
import { TeamResponse } from "./types";

// Capitalize team name helper
const capitalizeTeamName = (name: string) => {
  return name.toUpperCase();
};

export const TeamScoreCard: React.FC<{ teamData: TeamResponse; rank: number }> = ({ teamData, rank }) => {
  return (
    <div className='bg-[#1E1F3D] border border-[#41437D] rounded-lg p-4 hover:border-[#4CC8BD] transition-all'>
      <div className='flex justify-between items-center mb-3'>
        <div className='flex items-center gap-2 overflow-hidden'>
          <span className='bg-[#41437D] text-[#4CC8BD] font-bold rounded-full w-6 h-6 flex items-center justify-center'>{rank}</span>
          <h3 className='font-ibm text-white text-lg'>{capitalizeTeamName(teamData.teamName)}</h3>
        </div>
        <span
          className={`px-3 py-1 rounded-full text-sm font-medium ${
            teamData.zScoreWeighted > 0.5
              ? "bg-green-900 text-green-300"
              : teamData.zScoreWeighted > 0
              ? "bg-blue-900 text-blue-300"
              : "bg-red-900 text-red-300"
          }`}
        >
          Z-Score: {teamData.zScoreWeighted.toFixed(3)}
        </span>
      </div>

      <div className='mt-3 flex items-center gap-2 text-[#8A8CB1]'>
        <Users size={16} />
        <span className='text-sm'>
          {teamData.judges.length} {teamData.judges.length === 1 ? "Judge: " : "Judges: "}{" "}
          {teamData.judges.reduce((prev, curr) => {
            return `${curr}, ${prev}`;
          })}
        </span>
      </div>

      <div className='mt-4'>
        <div className='h-2 bg-[#41437D] rounded-full overflow-hidden'>
          <div className='h-full bg-[#4CC8BD]' style={{ width: `${Math.max(0, Math.min(100, (teamData.zScoreWeighted + 1) * 50))}%` }} />
        </div>
      </div>
    </div>
  );
};
