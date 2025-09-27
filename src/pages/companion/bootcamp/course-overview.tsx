import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Loading from "@/components/Loading";
import { ArrowLeft, Play, LogOut } from "lucide-react";

interface Video {
  id: string;
  title: string;
  duration: string;
  description: string;
  thumbnailUrl: string;
}

const CourseOverview = () => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [videos, setVideos] = useState<Video[]>([]);

  useEffect(() => {
    const mockVideos: Video[] = [
      {
        id: "1",
        title: "Introduction to HTML",
        duration: "24 minutes",
        description: "Short description of video here",
        thumbnailUrl: "/api/placeholder/150/100"
      },
      {
        id: "2", 
        title: "Introduction to HTML",
        duration: "24 minutes",
        description: "Short description of video here",
        thumbnailUrl: "/api/placeholder/150/100"
      },
      {
        id: "3",
        title: "Introduction to HTML", 
        duration: "24 minutes",
        description: "Short description of video here",
        thumbnailUrl: "/api/placeholder/150/100"
      }
    ];

    setVideos(mockVideos);
    setIsLoading(false);
  }, []);

//   const handleBack = () => {
//     router.push('/companion/bootcamp');
//   };

  if (isLoading) {
    return (
      <div className="mt-[-90px]">
        <Loading />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0D172C]">
      {/* header */}
      <header className="bg-[#1B253D] border-b border-[#A2B1D5] px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-white font-urbanist font-semibold text-lg">UBC BizTech</span>
          </div>
          
          <button className="flex items-center gap-2 text-[#A2B1D5] hover:text-white transition-colors font-urbanist font-medium text-sm">
            <LogOut className="w-4 h-4" />
            <span>Logout</span>
          </button>
        </div>
      </header>

      <div className="text-white p-4 sm:p-6">
        <div className="flex items-center gap-4 mb-6 pl-2">
          {/* <button 
            // onClick={handleBack}
            className="flex items-center justify-center w-10 h-10 bg-[#1B253D] border border-[#A2B1D5] rounded-lg hover:bg-[#1B253D]/80 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-white" />
          </button> */}
          <div>
            <h1 className="text-[28px] sm:text-[32px] font-urbanist font-semibold text-white">Course Overview</h1>
            <p className="text-[#A2B1D5] mt-1 text-[14px] font-urbanist font-medium">Course Name Here</p>
          </div>
        </div>

        <div className="h-[1px] mb-6 bg-[#A2B1D5] opacity-30 m-2"></div>

        {/* video container */}
        <div className="mx-auto w-full">
          <div className="bg-[#1B253D] border border-[#A2B1D5] rounded-2xl p-6">
            <div className="space-y-6">
              {videos.map((video, index) => (
                <div 
                  key={video.id}
                  className="flex items-center gap-6 p-4 bg-[#0D172C] border border-[#A2B1D5] rounded-lg hover:bg-[#0D172C]/80 cursor-pointer transition-colors"
                >
                  {/* thumbnail */}
                  <div className="relative w-32 h-20 bg-[#1B253D] border border-[#A2B1D5] rounded-lg flex items-center justify-center flex-shrink-0">
                    <div className="w-8 h-8 bg-[#A2B1D5] rounded-full flex items-center justify-center">
                      <Play className="w-4 h-4 text-[#1B253D] ml-0.5" />
                    </div>
                    <div className="absolute bottom-2 right-2 bg-[#0D172C] px-2 py-1 rounded text-[10px] font-urbanist font-medium text-[#A2B1D5]">
                      {video.duration.split(' ')[0]} min
                    </div>
                  </div>

                  <div className="flex-1">
                    <h3 className="text-[18px] font-urbanist font-semibold text-white mb-1">
                      {index + 1}. {video.title}
                    </h3>
                    <p className="text-[12px] font-urbanist font-medium text-[#A2B1D5] mb-2">
                      {video.duration}
                    </p>
                    <p className="text-[14px] font-urbanist font-medium text-[#A2B1D5]">
                      {video.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseOverview;