import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/router";
import Loading from "@/components/Loading";
import { ArrowLeft, LogOut, CheckCircle } from "lucide-react";
import { courseVideos, Video } from "./data/video";
import { markVideoComplete, isVideoCompleted } from "./data/videoProgress";


// interface Video {
//   id: string;
//   title: string;
//   duration: string;
//   description: string;
//   youtubeId: string;
//   isCompleted: boolean;
// }

const VideoPlayer = () => {
    const router = useRouter();
    const { videoId } = router.query;
    const [isLoading, setIsLoading] = useState(true);
    const [currentVideo, setCurrentVideo] = useState<Video | null>(null);
    const [allVideos, setAllVideos] = useState<Video[]>([]);
    const [, setRefresh] = useState(0); // Force re-render when progress updates
    // const iframeRef = useRef<HTMLIFrameEmbedElement>(null);
    // const [, setRefresh] = useState(0);


    useEffect(() => {
        setAllVideos(courseVideos);

        if (videoId) {
            const video = courseVideos.find(v => v.id === videoId);
            setCurrentVideo(video || null);
        }

        setIsLoading(false);
    }, [videoId]);

    const handleMarkComplete = () => {
        if (currentVideo) {
            markVideoComplete(currentVideo.id);
            setRefresh(prev => prev + 1);
        }
    };

    const handleNextVideo = () => {
        if (!currentVideo) return;

        const currentIndex = allVideos.findIndex(v => v.id === currentVideo.id);
        if (currentIndex < allVideos.length - 1) {
            const nextVideo = allVideos[currentIndex + 1];
            router.push(`/companion/bootcamp/videopage?videoId=${nextVideo.id}`);
        }
    };

    const handlePreviousVideo = () => {
        if (!currentVideo) return;

        const currentIndex = allVideos.findIndex(v => v.id === currentVideo.id);
        if (currentIndex > 0) {
            const prevVideo = allVideos[currentIndex - 1];
            router.push(`/companion/bootcamp/videopage?videoId=${prevVideo.id}`);
        }
    };

    const handleBack = () => {
        router.push('/companion/bootcamp/course-overview');
    };

    if (isLoading || !currentVideo) {
        return (
            <div className="mt-[-90px]">
                <Loading />
            </div>
        );
    }

    const currentIndex = allVideos.findIndex(v => v.id === currentVideo.id);
    const isFirstVideo = currentIndex === 0;
    const isLastVideo = currentIndex === allVideos.length - 1;

    return (
        <div className="min-h-screen bg-[#0D172C]">
            <header className="bg-[#1B253D] border-b border-[#A2B1D5] px-6 py-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <span className="text-white font-urbanist font-semibold text-lg">UBC BizTech</span>
                    </div>
                    {/*           
          <button className="flex items-center gap-2 text-[#A2B1D5] hover:text-white transition-colors font-urbanist font-medium text-sm">
            <LogOut className="w-4 h-4" />
            <span>Logout</span>
          </button> */}
                </div>
            </header>

            <div className="text-white p-4 sm:p-6">
                <div className="flex items-center gap-4 mb-6 pl-2">
                    <button
                        onClick={handleBack}
                        className="flex items-center justify-center w-10 h-10 bg-[#1B253D] border border-[#A2B1D5] rounded-lg hover:bg-[#1B253D]/80 transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5 text-white" />
                    </button>
                    <div className="flex-1">
                        <h1 className="text-[28px] sm:text-[32px] font-urbanist font-semibold text-white">
                            {currentIndex + 1}. {currentVideo.title}
                        </h1>
                        <p className="text-[#A2B1D5] mt-1 text-[14px] font-urbanist font-medium">
                            {currentVideo.duration}
                        </p>
                    </div>
                </div>

                <div className="h-[1px] mb-6 bg-[#A2B1D5] opacity-30 m-2"></div>

                <div className="max-w-5xl mx-auto">
                    <div className="bg-[#1B253D] border border-[#A2B1D5] rounded-2xl p-6 mb-6">
                        <div className="relative w-full aspect-video">
                            <iframe
                                src={`https://www.youtube.com/embed/${currentVideo.youtubeId}?enablejsapi=1`}
                                title={currentVideo.title}
                                className="w-full h-full rounded-lg"
                                frameBorder="0"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                            />
                        </div>

                        <div className="mt-4">
                            {isVideoCompleted(currentVideo.id) ? (
                                <div className="flex items-center gap-2 text-[#22C55E]">
                                    <CheckCircle className="w-5 h-5" />
                                    <span className="font-urbanist font-medium text-sm">Video completed!</span>
                                </div>
                            ) : (
                                <button
                                    onClick={handleMarkComplete}
                                    className="w-full bg-[#1B253D] border border-[#A2B1D5] text-white hover:bg-[#1B253D]/80 font-urbanist font-medium py-2 px-4 rounded-lg transition-colors"
                                >
                                    Mark as Complete
                                </button>
                            )}
                        </div>
                    </div>

                    <div className="bg-[#1B253D] border border-[#A2B1D5] rounded-2xl p-6 mb-6">
                        <h2 className="text-[22px] font-urbanist font-semibold text-white mb-3">
                            About this video
                        </h2>
                        <p className="text-[14px] font-urbanist font-medium text-[#A2B1D5]">
                            {currentVideo.description}
                        </p>
                    </div>

                    <div className="flex gap-4 justify-between">
                        <button
                            onClick={handlePreviousVideo}
                            disabled={isFirstVideo}
                            className={`flex-1 py-3 px-6 rounded-full font-urbanist font-semibold transition-colors ${isFirstVideo
                                ? 'bg-[#1B253D] text-[#A2B1D5] cursor-not-allowed opacity-50'
                                : 'bg-[#1B253D] border border-[#A2B1D5] text-white hover:bg-[#1B253D]/80'
                                }`}
                        >
                            Previous Video
                        </button>
                        <button
                            onClick={handleNextVideo}
                            disabled={isLastVideo}
                            className={`flex-1 py-3 px-6 rounded-full font-urbanist font-semibold transition-colors ${isLastVideo
                                ? 'bg-[#1B253D] text-[#A2B1D5] cursor-not-allowed opacity-50'
                                : 'bg-[#22C55E] text-black hover:bg-[#16A34A]'
                                }`}
                        >
                            Next Video
                        </button>
                    </div>

                    {/* playlist at bottom */}
                    <div className="bg-[#1B253D] border border-[#A2B1D5] rounded-2xl p-6 mt-6">
                        <h2 className="text-[22px] font-urbanist font-semibold text-[#BDC8E3] mb-4">
                            Course Videos
                        </h2>
                        <div className="space-y-3">
                            {allVideos.map((video, index) => (
                                <button
                                    key={video.id}
                                    onClick={() => router.push(`/companion/bootcamp/videopage?videoId=${video.id}`)}
                                    className={`w-full flex items-center gap-4 p-4 rounded-lg border transition-colors text-left ${video.id === currentVideo.id
                                        ? 'bg-[#0D172C] border-[#22C55E]'
                                        : 'bg-[#0D172C] border-[#A2B1D5] hover:bg-[#0D172C]/80'
                                        }`}
                                >
                                    {isVideoCompleted(video.id) ? (
                                        <CheckCircle className="w-5 h-5 text-[#22C55E] flex-shrink-0" />
                                    ) : (
                                        <div className="w-5 h-5 border-2 border-[#A2B1D5] rounded flex-shrink-0" />
                                    )}
                                    <span className="text-[14px] font-urbanist font-medium text-[#BDC8E3]">
                                        {index + 1}. {video.title}
                                    </span>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default VideoPlayer;