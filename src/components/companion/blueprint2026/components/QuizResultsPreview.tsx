import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import { useState, useRef, useEffect } from "react";
import { X, QrCode } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import QRCode from "qrcode";
import BluePrintCard from "./BluePrintCard";
import { Button } from "@/components/ui/button";
import { useQuizReport } from "@/queries/quiz";
import { useUserProfile, getProfileId } from "@/queries/userProfile";

function QRCodeModal({
  isOpen,
  onClose,
  profileUrl,
}: {
  isOpen: boolean;
  onClose: () => void;
  profileUrl: string;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const generateQR = async () => {
      try {
        if (canvasRef.current && profileUrl) {
          await QRCode.toCanvas(canvasRef.current, profileUrl, {
            width: 200,
            margin: 2,
            color: {
              dark: "#000000",
              light: "#ffffff",
            },
          });
          setError(null);
        }
      } catch (err) {
        setError("Failed to generate QR code");
        console.error("QR Code generation error:", err);
      }
    };

    if (isOpen) {
      generateQR();
    }
  }, [profileUrl, isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            className="fixed inset-0 bg-black/60 z-[99] backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            className="fixed inset-0 z-[100] flex items-center justify-center p-4"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
          >
            <div
              className="bg-[#0A1428] border border-white/20 rounded-2xl p-6 max-w-sm w-full shadow-xl"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-white">
                  Your Profile QR Code
                </h3>
                <button
                  onClick={onClose}
                  className="w-8 h-8 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition-colors"
                >
                  <X className="w-5 h-5 text-white" />
                </button>
              </div>

              {/* QR Code */}
              <div className="flex flex-col items-center gap-4">
                <div className="bg-white p-3 rounded-lg">
                  {error ? (
                    <div className="w-[200px] h-[200px] flex items-center justify-center">
                      <p className="text-red-500 text-sm text-center">
                        {error}
                      </p>
                    </div>
                  ) : (
                    <canvas ref={canvasRef} />
                  )}
                </div>
                <p className="text-sm text-white/60 text-center">
                  Let others scan this QR code to connect with you
                </p>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

export default function QuizResultsPreview() {
  const router = useRouter();
  const { eventId, year } = router.query;
  const [showQRModal, setShowQRModal] = useState(false);

  const { data: quizReport, isLoading: quizLoading } = useQuizReport();
  const { data: userProfile, isLoading: profileLoading } = useUserProfile();

  const hasQuizResults = !quizLoading && quizReport !== null;
  const profileId = userProfile?.compositeID
    ? getProfileId(userProfile.compositeID)
    : null;

  const domain =
    typeof window !== "undefined"
      ? window.location.origin
      : "https://v2.ubcbiztech.com";
  const profileUrl = profileId ? `${domain}/profile/${profileId}?scan=true` : "";

  // Show loading state while checking quiz status
  if (quizLoading) {
    return (
      <BluePrintCard className="min-h-36">
        <div className="flex flex-col">
          <p className="text-lg">BluePrint Career Quiz</p>
          <p className="text-xs opacity-60 -mt-1">Loading...</p>
        </div>
      </BluePrintCard>
    );
  }

  // User has NOT taken the quiz - show QR code button
  if (!hasQuizResults) {
    return (
      <>
        <BluePrintCard className="min-h-36">
          <div className="flex flex-col">
            <p className="text-lg">Share Your Profile</p>
            <p className="text-xs opacity-60 -mt-1">
              Let others scan to connect with you
            </p>
            <Button
              className="mt-4 bg-[#4972EF] text-white rounded-full w-fit text-xs flex items-center gap-2"
              onClick={() => setShowQRModal(true)}
              disabled={!profileId || profileLoading}
            >
              <QrCode size={14} />
              View Your QR Code
            </Button>
          </div>
          <Image
            src="/assets/blueprint/quiz-staircase.png"
            height={256}
            width={256}
            alt="Staircase"
            className="absolute bottom-0 right-0 rounded-sm"
          />
        </BluePrintCard>

        {profileUrl && (
          <QRCodeModal
            isOpen={showQRModal}
            onClose={() => setShowQRModal(false)}
            profileUrl={profileUrl}
          />
        )}
      </>
    );
  }

  // User HAS taken the quiz - show quiz results button
  return (
    <BluePrintCard className="min-h-36">
      <div className="flex flex-col">
        <p className="text-lg">BluePrint Career Quiz</p>
        <p className="text-xs opacity-60 -mt-1">
          {" "}
          View your career assessment results
        </p>
        <Link href={`/events/${eventId}/${year}/companion/MBTI`}>
          <Button className="mt-4 bg-[#4972EF] text-white rounded-full w-fit text-xs">
            View your assessment
          </Button>
        </Link>
      </div>
      <Image
        src="/assets/blueprint/quiz-staircase.png"
        height={256}
        width={256}
        alt="Staircase"
        className="absolute bottom-0 right-0 rounded-sm"
      />
    </BluePrintCard>
  );
}
