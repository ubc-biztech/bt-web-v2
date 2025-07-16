import React, { Dispatch, SetStateAction } from "react";
import { X, Share, Copy, MessageCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { toast } from "../ui/use-toast";
import { cn } from "@/lib/utils";

const ShareProfileDrawer = ({
  isOpen,
  setIsOpen,
}: {
  isOpen: boolean;
  setIsOpen: Dispatch<SetStateAction<boolean>>;
}) => {
  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "UBC BizTech",
          text: "Check out this profile!",
          url: window.location.href,
        });
      } catch (err) {
        console.error("Share failed:", err);
      }
    } else {
      alert("Sharing is not supported on this device/browser.");
    }
  };

  const closeDrawer = () => {
    setIsOpen(false);
  };

  const copyLink = () => {
    const profileUrl = "https://example.com/profile";
    navigator.clipboard.writeText(profileUrl);
    toast({ title: "[test] Link copied to clipboard!" });
  };

  const getAnimationProps = (isMobile: boolean) => ({
    initial: isMobile ? { y: "100%" } : { opacity: 0, scale: 0.95 },
    animate: isMobile ? { y: 0 } : { opacity: 1, scale: 1 },
    exit: isMobile ? { y: "100%" } : { opacity: 0, scale: 0.95 },
    transition: isMobile
      ? { duration: 0.3, ease: "easeInOut" }
      : { duration: 0.2, ease: "easeOut" },
  });

  const QRCodeSection = ({
    className,
    onClick,
  }: {
    className?: string;
    onClick?: (e: any) => void;
  }) => (
    <div className={cn("place-items-center w-full h-fit", className)}>
      <div
        className="place-items-center pb-4 h-fit w-fit bg-white relative rounded-lg"
        onClick={onClick}
      >
        <div className="relative">
          <Image
            src="/assets/images/qr-example.svg"
            alt="QR Code Example"
            width={256}
            height={256}
            className="w-full h-full object-cover"
          />
          <p className="text-center text-black font-semibold">
            Your Profile QR Code
          </p>
          <div className="absolute inset-0 bg-gradient-to-br from-sat-blue to-dark-sat-blue mix-blend-plus-lighter opacity-70 m-2"></div>
        </div>
      </div>
    </div>
  );

  const DrawerHeader = () => (
    <div className="flex items-center justify-between">
      <h5 className="text-left font-medium text-white">Share your Profile</h5>
      <button
        onClick={closeDrawer}
        className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white hover:bg-opacity-10 transition-colors"
      >
        <X className="w-5 h-5 text-white" />
      </button>
    </div>
  );

  const ShareActions = () => (
    <div className="flex flex-row gap-4">
      <div className="text-center place-items-center">
        <button
          onClick={handleShare}
          className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center mb-2"
        >
          <Share className="w-6 h-6 text-white" />
        </button>
        <span className="text-sm text-white">Share via</span>
      </div>

      <div className="text-center place-items-center">
        <button
          onClick={copyLink}
          className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center mb-2"
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

            {/* Mobile Layout */}
            <motion.div
              className="fixed inset-x-0 bottom-0 z-[100] md:hidden"
              {...getAnimationProps(true)}
              onClick={closeDrawer}
            >
              <QRCodeSection
                className="mb-16"
                onClick={(e) => e.stopPropagation()}
              />
              <div
                className="bg-biztech-navy shadow-[inset_0_0_24px_rgba(255,255,255,0.1)] rounded-t-3xl w-screen mx-auto p-6 space-y-4"
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
                className="bg-biztech-navy shadow-[inset_0_0_12px_rgba(255,255,255,0.1)] rounded-2xl w-fit p-8 space-y-4"
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
