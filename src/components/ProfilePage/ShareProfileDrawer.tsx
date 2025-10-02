import React, {
  Dispatch,
  SetStateAction,
  useEffect,
  useRef,
  useState,
} from "react";
import { X, Share, Copy, MessageCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import QRCode from "qrcode";
import { toast } from "../ui/use-toast";
import { cn } from "@/lib/utils";

const ShareProfileDrawer = ({
  isOpen,
  setIsOpen,
  url,
}: {
  isOpen: boolean;
  setIsOpen: Dispatch<SetStateAction<boolean>>;
  url: string;
}) => {
  const handleShare = async () => {
    if (!navigator.share) {
      toast({ title: "Sharing is not supported on this device/browser." });
      return;
    } else {
      try {
        await navigator.share({
          title: "UBC BizTech",
          text: "Check out this profile!",
          url: url,
        });
      } catch (err) {
        console.error("Share failed:", err);
      }
    }
  };

  const closeDrawer = () => {
    setIsOpen(false);
  };

  const copyLink = () => {
    const profileUrl = url;
    navigator.clipboard.writeText(profileUrl);
    toast({ title: "Profile URL copied to clipboard!" });
  };

  const getAnimationProps = (isMobile: boolean) => ({
    initial: isMobile ? { y: "100%" } : { opacity: 0, scale: 0.95 },
    animate: isMobile ? { y: 0 } : { opacity: 1, scale: 1 },
    exit: isMobile ? { y: "100%" } : { opacity: 0, scale: 0.95 },
    transition: { duration: 0.2, ease: "easeInOut" },
  });

  const QRCodeSection = ({
    className,
    onClick,
    data = url,
    size = 256,
  }: {
    className?: string;
    onClick?: (e: any) => void;
    data?: string;
    size?: number;
  }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
      const generateQR = async () => {
        try {
          if (canvasRef.current && data) {
            await QRCode.toCanvas(canvasRef.current, data, {
              width: size,
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

      generateQR();
    }, [data, size]);

    return (
      <div className={cn("place-items-center w-full h-fit", className)}>
        <div
          className="place-items-center pb-4 h-fit w-fit bg-white relative rounded-lg"
          onClick={onClick}
        >
          <div className="relative">
            {error ? (
              <div
                className="flex items-center justify-center bg-gray-100 rounded"
                style={{ width: size, height: size }}
              >
                <p className="text-red-500 text-sm">{error}</p>
              </div>
            ) : (
              <canvas
                ref={canvasRef}
                className="w-full h-full object-cover rounded"
              />
            )}
            <p className="text-center text-black font-semibold mt-2">
              Profile QR Code
            </p>
            <div className="absolute h-full inset-0 bg-gradient-to-br from-bt-blue-300 to-bt-blue-400 mix-blend-plus-lighter opacity-70 m-2 rounded"></div>
          </div>
        </div>
      </div>
    );
  };

  const DrawerHeader = () => (
    <div className="flex items-center justify-between">
      <h5 className="text-left font-medium text-white">Share this Profile</h5>
      <button
        onClick={closeDrawer}
        className="w-8 h-8 flex items-center justify-center rounded-full bg-bt-blue-0/10 hover:bg-bt-blue-0/20 trasition-colors duration-200"
      >
        <X className="w-5 h-5 text-white" />
      </button>
    </div>
  );

  const ShareActions = () => (
    <div className="flex flex-row gap-4">
      <div className="flex flex-col items-center text-center">
        <button
          onClick={handleShare}
          className="w-12 h-12 bg-bt-blue-0/10 hover:bg-bt-blue-0/20  trasition-colors duration-200 rounded-full flex items-center justify-center mb-2"
        >
          <Share className="w-6 h-6 text-white" />
        </button>

        <span className="text-sm text-white">Share via</span>
      </div>

      <div className="flex flex-col items-center text-center">
        <button
          onClick={copyLink}
          className="w-12 h-12 bg-bt-blue-0/10 hover:bg-bt-blue-0/20 trasition-colors duration-200 rounded-full flex items-center justify-center mb-2"
        >
          <Copy className="w-6 h-6 text-white" />
        </button>
        <span className="text-sm text-white">Copy Link</span>
      </div>
    </div>
  );

  return (
    <div className="flex items-center justify-center">
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Overlay */}
            <motion.div
              className="fixed inset-0 bg-black bg-opacity-50 z-[99] backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={closeDrawer}
            />

            <motion.div
              className="fixed inset-x-0 w-fit h-fit bottom-[60%] mx-auto z-[100] md:hidden"
              initial={{ y: "55%", opacity: 0, scale: 0.95 }}
              animate={{ y: "50%", opacity: 1, scale: 1 }}
              exit={{ y: "55%", opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2, ease: "easeInOut" }}
            >
              <QRCodeSection onClick={(e) => e.stopPropagation()} data={url} />
            </motion.div>

            {/* Mobile Layout */}
            <motion.div
              className="fixed inset-x-0 bottom-0 z-[100] md:hidden"
              {...getAnimationProps(true)}
              onClick={closeDrawer}
            >
              <div
                className="bg-bt-blue-500 shadow-[inset_0_0_24px_rgba(255,255,255,0.1)] rounded-t-3xl w-screen mx-auto p-6 space-y-4"
                onClick={(e) => e.stopPropagation()}
              >
                <DrawerHeader />
                <ShareActions />
              </div>
            </motion.div>

            {/* Desktop Layout */}
            <motion.div
              className="hidden md:flex fixed inset-0 z-[999] items-center justify-center p-4"
              {...getAnimationProps(false)}
              onClick={closeDrawer}
            >
              <div
                className="bg-bt-blue-500 shadow-[inset_0_0_12px_rgba(255,255,255,0.1)] rounded-2xl w-fit p-8 space-y-4"
                onClick={(e) => e.stopPropagation()}
              >
                <DrawerHeader />
                <QRCodeSection />
                <ShareActions />
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ShareProfileDrawer;
