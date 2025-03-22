import BarChart from "../ui/BarChart";
import Box from "../ui/rubric/RubricCell";
import FadeWrapper from "../ui/FadeAnimationWrapper";
import { User } from "lucide-react";
import { useEffect, useState } from "react";
import { mapMetricsToCategories } from "../constants/rubricContents";
import { ScoringMetric, ScoringRecord, TeamFeedback } from "../types";

// helpers
const aggregateScore = (entry: ScoringRecord) => {
  return Object.values(entry).reduce((sum: number, score: number) => sum + score, 0);
};

const calculateAverageJudgeScore = (team_feedback: TeamFeedback[]) => {
  const totalScores = team_feedback.reduce((sum, entry) => {
    const sumOfMetrics = aggregateScore(entry.scores);
    return sum + sumOfMetrics;
  }, 0);
  const totalJudges = team_feedback.length;
  const averageScore = totalScores / totalJudges;
  return Math.round(averageScore); // round
};

const transformFeedbackToBarChartData = (entries: TeamFeedback[]) => {
  const transformedData = entries.map((entry) => {
    const totalScore = aggregateScore(entry.scores);

    return {
      label: entry.judgeName,
      value: totalScore
    };
  });

  return transformedData;
};

const findBestMetric = (entries: TeamFeedback[]) => {
  let metricScores: Record<string, number> = {}; // Initialize as an empty object

  entries.forEach((entry) => {
    Object.entries(entry.scores).forEach(([metric, score]) => {
      metricScores[metric] = (metricScores[metric] || 0) + score;
    });
  });

  const bestMetric = Object.entries(metricScores).reduce(
    (best, current) => (current[1] > best[1] ? current : best),
    ["", -Infinity] // Default value to prevent errors on empty input
  );

  return bestMetric[0] || null;
};

// Capitalize team name helper
const capitalizeTeamName = (name: string) => {
  return name.toUpperCase();
};

// dashboard

interface DashboardProps {
  team_name: string;
  members: string[];
  flat_records: TeamFeedback[];
  comments: { judgeName: string; category: string; message: string }[];
}

const Dashboard: React.FC<DashboardProps> = ({ team_name, members, flat_records, comments }) => {
  const [entries, setEntries] = useState(flat_records);
  const bestMetric = findBestMetric(flat_records);
  const bestArea = bestMetric ? mapMetricsToCategories[bestMetric as ScoringMetric] : "N/A";

  useEffect(() => {
    setEntries(flat_records);
  }, [flat_records]);

  return (
    <FadeWrapper className='flex flex-col'>
      <div className='w-full flex flex-row mt-5'>
        <div className='w-1/3 h-full  flex flex-col text-[#ADAFE4]'>
          <header className='text-xl text-white'>{capitalizeTeamName(team_name)}</header>
          {members.map((member, index) => (
            <span key={index} className='mt-1'>{member}</span>
          ))}
        </div>
        <div className='w-2/3 h-full flex flex-col gap-4'>
          {/* AVERAGE JUDGE SCORE */}
          <div className='flex flex-row h-44 gap-4'>
            <div className='w-1/3 h-full'>
              <Box innerShadow={20} className='flex flex-col justify-center items-center'>
                <header className='pb-2 text-[#4CC8BD] text-[3.5em] -mt-5'>
                  {calculateAverageJudgeScore(entries)}
                  /25
                </header>
                <span className='text-sm -mt-2'>Raw Average Judge Score</span>
              </Box>
            </div>
            {/* BEST AREA */}
            <div className='w-2/3 h-full'>
              <Box innerShadow={20} className='flex flex-col justify-center items-start pl-16'>
                <div className='flex flex-col justify-center items-start'>
                  <span className='text-md pb-2 -mb-2'>Best Area</span>
                  <header className='text-[#BC88FF] text-[2em]'>{bestArea}</header>
                </div>
              </Box>
            </div>
          </div>
          <div className='flex flex-row h-72 gap-4'>
            {/* BAR CHART */}
            <div className='w-1/2 h-full'>
              <Box innerShadow={20} className='flex flex-col'>
                <span className='text-md text-white mt-4 ml-8 -mb-8'>Scoring Distribution</span>
                <BarChart data={transformFeedbackToBarChartData(entries)} height={300} />
              </Box>
            </div>

            {/* COMMENTS */}
            <div className='w-1/2 h-full'>
              <Box innerShadow={20} className='p-4 pl-8 text-[#898BC3] flex flex-col gap-4'>
                <span className='text-md text-white'>Comments</span>
                {comments
                  .filter((comment) => comment.message.trim() !== "") // Remove empty messages
                  .slice(0, 3) // Take the first 3 non-empty comments
                  .map((comment, index) => (
                    <div key={index} className='flex flex-col text-[12px]'>
                      <div className='flex flex-row gap-1'>
                        <User size={20} />
                        <header className='text-mb'>{comment.judgeName}</header>
                      </div>
                      <span>
                        {comment.category}: {comment.message}
                      </span>
                    </div>
                  ))}
              </Box>
            </div>
          </div>
        </div>
      </div>
    </FadeWrapper>
  );
};

export default Dashboard;
