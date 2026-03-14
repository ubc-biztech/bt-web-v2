import { useState, useEffect } from "react";
import Image from "next/image";
import Loading from "@/components/Loading";
import { ArrowRight, Play, CheckCircle, LogOut } from "lucide-react";
import { useRouter } from "next/router";
import { courseVideos, Video } from "../../../constants/bootcamp/video";
import { isVideoCompleted } from "../../../constants/bootcamp/videoProgress";

const BootCamp = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [videos, setVideos] = useState<Video[]>([]);
  const router = useRouter();

  useEffect(() => {
    setVideos(courseVideos);
    setIsLoading(false);
  }, []);

  const completedVideos = videos.filter((video) =>
    isVideoCompleted(video.id),
  ).length;
  const totalVideos = videos.length;

  const handleOpenCourse = () => {
    router.push("/companion/bootcamp/course-overview");
  };

  const handleMostRecent = () => {
    const nextVideo = videos.find((v) => !isVideoCompleted(v.id)) || videos[0];
    router.push(`/companion/bootcamp/videopage?videoId=${nextVideo.id}`);
  };
  if (isLoading) {
    return (
      <div className="mt-[-90px]">
        <Loading />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0D172C]">
      <header className="bg-[#1B253D] border-b border-[#A2B1D5] px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* TODO: cant find logo asset lmao  */}
            <span className="text-white font-urbanist font-semibold text-lg">
              UBC BizTech
            </span>
          </div>

          {/* TODO: logout */}
          {/* <button className="flex items-center gap-2 text-[#A2B1D5] hover:text-white transition-colors font-urbanist font-medium text-sm">
            <LogOut className="w-4 h-4" />
            <span>Logout</span>
          </button> */}
        </div>
      </header>

      <div className="text-white p-4 sm:p-6">
        <div className="flex items-center justify-between mb-6 pl-2">
          <div>
            <h1 className="text-[28px] sm:text-[32px] font-urbanist font-semibold text-white">
              Boot Camp
            </h1>
            <p className="text-[#A2B1D5] mt-1 text-[14px] font-urbanist font-medium">
              HelloHacks 2025
            </p>
          </div>
        </div>

        <div className="h-[1px] m-2 mb-6 bg-[#A2B1D5] opacity-30"></div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-8xl mx-auto p-2">
          {/* up next modal */}
          <div className="bg-[#1B253D] border border-[#A2B1D5] rounded-2xl p-6">
            <h2 className="text-[22px] font-urbanist font-semibold text-[#BDC8E3] mb-6">
              Up Next
            </h2>

            <div className="relative aspect-video bg-[#0D172C] rounded-lg mb-6 border border-[#A2B1D5] overflow-hidden">
              {(() => {
                const nextVideo =
                  videos.find((v) => !isVideoCompleted(v.id)) || videos[0];
                return nextVideo ? (
                  <>
                    <Image
                      src={`https://img.youtube.com/vi/${nextVideo.youtubeId}/maxresdefault.jpg`}
                      alt={nextVideo.title}
                      fill
                      className="object-cover"
                    />
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                      <div className="w-20 h-20 bg-[#1B253D] border border-[#A2B1D5] rounded-full flex items-center justify-center">
                        <div className="w-16 h-16 bg-[#0D172C] rounded-full flex items-center justify-center">
                          <Play
                            onClick={handleMostRecent}
                            className="w-8 h-8 text-white ml-1"
                          />
                        </div>
                      </div>
                    </div>
                  </>
                ) : null;
              })()}
            </div>

            {(() => {
              const nextVideo =
                videos.find((v) => !isVideoCompleted(v.id)) || videos[0];
              return nextVideo ? (
                <>
                  <h3 className="text-[20px] font-urbanist font-semibold text-white mb-2">
                    {nextVideo.title}
                  </h3>
                  <p className="text-[14px] text-[#A2B1D5] font-urbanist font-medium mb-6">
                    {completedVideos}/{totalVideos}
                  </p>
                </>
              ) : null;
            })()}

            <button
              onClick={handleOpenCourse}
              className="w-full bg-[#22C55E] hover:bg-[#16A34A] text-black font-urbanist font-semibold py-3 px-6 rounded-full transition-colors flex items-center justify-center gap-2"
            >
              <span>Open Course</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* course overview modal */}
          <div className="bg-[#1B253D] border border-[#A2B1D5] rounded-2xl p-6">
            <h2 className="text-[22px] font-urbanist font-semibold text-[#BDC8E3] mb-6">
              Course Overview
            </h2>

            <div className="space-y-3 mb-8">
              {videos.map((video, index) => (
                <div
                  key={video.id}
                  onClick={() =>
                    router.push(
                      `/companion/bootcamp/videopage?videoId=${video.id}`,
                    )
                  }
                  className="flex items-center gap-4 p-4 bg-[#0D172C] hover:bg-[#0D172C]/80 rounded-lg border border-[#A2B1D5] cursor-pointer transition-colors"
                >
                  {isVideoCompleted(video.id) ? (
                    <CheckCircle className="w-5 h-5 text-[#22C55E] flex-shrink-0" />
                  ) : (
                    <div className="w-5 h-5 border-2 border-[#A2B1D5] rounded flex-shrink-0" />
                  )}

                  <span className="text-[14px] font-urbanist font-medium text-[#BDC8E3] ">
                    {index + 1}. {video.title}
                  </span>
                </div>
              ))}
            </div>

            <div className="space-y-3">
              <div className="w-full bg-[#0D172C] rounded-full h-2 border border-[#A2B1D5]">
                <div
                  className="bg-[#22C55E] h-full rounded-full transition-all duration-500"
                  style={{ width: `${(completedVideos / totalVideos) * 100}%` }}
                />
              </div>
              <p className="text-[12px] text-[#A2B1D5] font-urbanist font-medium">
                You have completed {completedVideos}/{totalVideos} videos in
                this course
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BootCamp;
