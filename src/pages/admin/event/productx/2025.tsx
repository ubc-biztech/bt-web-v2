import { TeamScoreCard } from "@/components/companion/productX/TeamScoreCard";
import { TeamResponse } from "@/components/companion/productX/types";
import { fetchBackend } from "@/lib/db";
import { Award, BarChart3, Users, X } from "lucide-react";
import { NextPage } from "next";
import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { JudgeResponse } from "@/components/companion/productX/types";
import { result } from "lodash";

const ProductX: NextPage = () => {
  const [results, setResults] = useState<TeamResponse[]>([]);
  const [activeTab, setActiveTab] = useState<string>("scores");
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [selectedTeam, setSelectedTeam] = useState<TeamResponse | null>(null);
  const [selectedJudge, setSelectedJudge] = useState<string>("");

  useEffect(() => {
    const fetchData = async () => {
      const response: TeamResponse[] = await fetchBackend({ endpoint: "/team/scores-all", method: "GET", authenticatedCall: false });
      setResults(response);
      console.log(results);
    };

    fetchData();
  }, []);

  const handleTeamClick = (team: TeamResponse) => {
    setSelectedTeam(team);
    if (team.judges.length > 0) {
      setSelectedJudge(team.judges[0]);
    }
    setModalOpen(true);
  };

  const getSelectedJudgeResponse = (): JudgeResponse | undefined => {
    return selectedTeam?.originalResponses.find((response) => response.judge === selectedJudge);
  };

  return (
    <div className='w-full px-10 bg-[#13132D] min-h-screen text-white'>
      <div className='flex flex-col'>
        <header className='mt-16 text-lg font-ibm'>PRODUCT X 2025 RESULTS</header>

        <div className='border-b-2 border-[#41437D] mt-6 flex flex-row'>
          <div
            className={`w-24 h-10 border-b-2 ${
              activeTab === "scores" ? "border-[#4CC8BD] text-[#4CC8BD]" : "border-[#41437D] text-[#41437D]"
            } -mb-[2px] flex flex-row items-center justify-center gap-1 cursor-pointer`}
            onClick={() => setActiveTab("scores")}
          >
            <BarChart3 size={16} color={activeTab === "scores" ? "#4CC8BD" : "#41437D"} />
            Scores
          </div>
          <div
            className={`w-24 h-10 border-b-2 ${
              activeTab === "winners" ? "border-[#4CC8BD] text-[#4CC8BD]" : "border-[#41437D] text-[#41437D]"
            } -mb-[2px] flex flex-row items-center justify-center gap-1 cursor-pointer`}
            onClick={() => setActiveTab("winners")}
          >
            <Award size={16} color={activeTab === "winners" ? "#4CC8BD" : "#41437D"} />
            Winners
          </div>
        </div>

        {activeTab === "scores" && (
          <div className='mt-8'>
            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
              {results.map((team, index) => (
                <div key={team.teamID} onClick={() => handleTeamClick(team)} className='cursor-pointer'>
                  <TeamScoreCard teamData={team} rank={index + 1} />
                </div>
              ))}
            </div>

            {results.length === 0 && (
              <div className='flex flex-col items-center justify-center py-20 text-[#8A8CB1]'>
                <BarChart3 size={48} className='mb-4 opacity-50' />
                <p className='text-lg text-white'>No team scores available yet</p>
              </div>
            )}
          </div>
        )}

        {activeTab === "winners" && (
          <div className='mt-8'>
            {results.length > 0 ? (
              <div className='flex flex-col gap-8'>
                {/* Top 3 Winners */}
                <div className='flex flex-col items-center'>
                  <h2 className='text-xl font-ibm mb-8 text-[#4CC8BD]'>TOP PERFORMERS</h2>
                  <div className='flex flex-col md:flex-row gap-6 w-full justify-center'>
                    {results.slice(0, Math.min(3, results.length)).map((team, idx) => (
                      <div
                        key={team.teamID}
                        className={`bg-[#1E1F3D] border-2 ${
                          idx === 0 ? "border-yellow-500" : idx === 1 ? "border-gray-400" : "border-amber-700"
                        } rounded-lg p-6 flex flex-col items-center max-w-xs w-full`}
                      >
                        <div
                          className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 ${
                            idx === 0
                              ? "bg-yellow-900 text-yellow-300"
                              : idx === 1
                              ? "bg-gray-800 text-gray-300"
                              : "bg-amber-900 text-amber-300"
                          }`}
                        >
                          <Award size={32} />
                        </div>
                        <span
                          className={`text-sm font-bold ${idx === 0 ? "text-yellow-300" : idx === 1 ? "text-gray-300" : "text-amber-300"}`}
                        >
                          {idx === 0 ? "1ST PLACE" : idx === 1 ? "2ND PLACE" : "3RD PLACE"}
                        </span>
                        <h3 className='text-lg font-bold mt-2 text-center text-white text-clip text-wrap'>{team.teamName}</h3>
                        <p className='mt-2 text-[#4CC8BD] font-mono'>Z-Score: {team.zScoreWeighted.toFixed(3)}</p>
                        <p className='mt-4 text-sm text-[#8A8CB1]'>
                          Judged by{" "}
                          {team.judges.reduce((prev, curr) => {
                            return `${curr}, ${prev}`;
                          })}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className='flex flex-col items-center justify-center py-20 text-[#8A8CB1]'>
                <Award size={48} className='mb-4 opacity-50' />
                <p className='text-lg text-white'>Winners will be announced soon</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Score Details Modal */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className='bg-[#1E1F3D] text-white border-[#41437D] max-w-2xl'>
          <DialogHeader>
            <DialogTitle className='text-xl font-ibm text-[#4CC8BD]'>{selectedTeam?.teamName} - Detailed Scores</DialogTitle>
            <DialogClose className='absolute right-4 top-4 text-white hover:text-white'></DialogClose>
          </DialogHeader>

          {selectedTeam && (
            <div className='mt-4'>
              <div className='mb-6'>
                <h3 className='text-[#8A8CB1] mb-2'>Select Judge</h3>
                <Select value={selectedJudge} onValueChange={setSelectedJudge}>
                  <SelectTrigger className='w-full bg-[#13132D] border-[#41437D] text-white'>
                    <SelectValue placeholder='Select a judge' className='text-white' />
                  </SelectTrigger>
                  <SelectContent className='bg-[#13132D] border-[#41437D] text-white'>
                    {selectedTeam.judges.map((judge) => (
                      <SelectItem key={judge} value={judge} className='focus:bg-[#41437D] focus:text-white'>
                        {judge}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {getSelectedJudgeResponse() && (
                <div className='bg-[#13132D] p-6 rounded-lg border border-[#41437D]'>
                  <h3 className='text-lg font-bold mb-4 text-[#4CC8BD]'>Scores from {selectedJudge}</h3>
                  <div className='grid grid-cols-2 gap-4'>
                    <div className='flex justify-between items-center'>
                      <span className='text-[#8A8CB1]'>Metric 1:</span>
                      <span className='font-mono text-white'>{getSelectedJudgeResponse()?.metric1}</span>
                    </div>
                    <div className='flex justify-between items-center'>
                      <span className='text-[#8A8CB1]'>Metric 2:</span>
                      <span className='font-mono text-white'>{getSelectedJudgeResponse()?.metric2}</span>
                    </div>
                    <div className='flex justify-between items-center'>
                      <span className='text-[#8A8CB1]'>Metric 3:</span>
                      <span className='font-mono text-white'>{getSelectedJudgeResponse()?.metric3}</span>
                    </div>
                    <div className='flex justify-between items-center'>
                      <span className='text-[#8A8CB1]'>Metric 4:</span>
                      <span className='font-mono text-white'>{getSelectedJudgeResponse()?.metric4}</span>
                    </div>
                    <div className='flex justify-between items-center'>
                      <span className='text-[#8A8CB1]'>Metric 5:</span>
                      <span className='font-mono text-white'>{getSelectedJudgeResponse()?.metric5}</span>
                    </div>
                  </div>
                </div>
              )}

              <div className='mt-6 bg-[#13132D] p-4 rounded-lg border border-[#41437D]'>
                <h3 className='text-sm font-bold mb-2 text-[#8A8CB1]'>Overall Z-Score</h3>
                <p className='text-lg font-mono text-[#4CC8BD]'>{selectedTeam.zScoreWeighted.toFixed(3)}</p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProductX;
