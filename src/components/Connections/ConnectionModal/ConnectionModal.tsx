import React, { useState } from "react";
import Image from "next/image";
import { X, Users, ScanLine } from "lucide-react";
import { BiztechProfile } from "@/components/ProfilePage/BizCardComponents";
import { fetchBackend } from "@/lib/db";
import { toast } from "@/components/ui/use-toast";
import { useRouter } from "next/router";
import { postQuestEvent } from "@/queries/quests";

interface ConnectionModalProps {
  profileData: BiztechProfile;
  profileID: string;
  signedIn: boolean;
  isVisible: boolean;
  onClose: () => void;
}

const ConnectionModal: React.FC<ConnectionModalProps> = ({
  profileData,
  profileID,
  signedIn,
  isVisible,
  onClose,
}) => {
  const [isConnecting, setIsConnecting] = useState(false);
  const router = useRouter();

  if (!isVisible) return null;

  const handleConnect = async (e: React.MouseEvent) => {
    e.preventDefault();

    if (!signedIn) {
      await router.push(`/login?redirect=/profile/${profileID}?scan=true`);
    }

    try {
      setIsConnecting(true);
      const response = await fetchBackend({
        endpoint: "/interactions/",
        data: {
          eventType: "CONNECTION",
          eventParam: profileID,
        },
        method: "POST",
      });

      if (response) {
        const cachedEvent = localStorage.getItem("activeEvent");
        const [, , eventIdAndYear] = cachedEvent?.split("#") || [];
        const [eventId, eventYear] = eventIdAndYear?.split(";") || [];

        postQuestEvent({
          type: "connection",
          argument: {
            recommended: false,
            profileId: profileID,
          },
        }, eventId, eventYear).catch((error) => {
          console.warn("Quest event failed", error);
        });

        toast({
          title: "Success",
          description: `Connected with ${profileData.fname} ${profileData.lname}!`,
        });
        onClose();
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to make connection. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsConnecting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm z-50 flex items-center justify-center p-4 sm:p-6"
      onClick={onClose}
    >
      <div
        className="bg-[#131F3B] rounded-2xl p-4 sm:p-6 w-full max-w-sm mx-4 relative border border-[#374566]"
        style={{
          boxShadow: "inset 0 0 48px rgba(255, 255, 255, 0.1)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-3 right-3 sm:top-4 sm:right-4 text-white/60 hover:text-white transition-colors"
        >
          <X size={18} className="sm:w-5 sm:h-5" />
        </button>

        <div className="text-center mb-4 sm:mb-6 mt-2 sm:mt-4">
          <div className="flex justify-center mb-2">
            <ScanLine className="text-[#BDC8E3] w-6 h-6 sm:w-8 sm:h-8" />
          </div>
          <h3 className="text-[#BDC8E3] text-xs sm:text-sm font-medium tracking-wide font-urbanist">
            BIZCARD SCANNED
          </h3>
        </div>

        <div className="text-center mb-6 sm:mb-8">
          <div className="relative w-20 h-20 sm:w-24 sm:h-24 mx-auto mb-3 sm:mb-4">
            <div className="w-full h-full rounded-full overflow-hidden bg-gray-300 border-2 border-white/20">
              <Image
                src={
                  profileData.profilePictureURL
                    ? profileData.profilePictureURL
                    : "/assets/biztech_logo.svg"
                }
                alt={`${profileData.fname} ${profileData.lname}`}
                width={96}
                height={96}
                className="object-cover"
              />
            </div>
          </div>

          <h2 className="text-white text-lg sm:text-xl font-semibold mb-1">
            {profileData.fname} {profileData.lname}
          </h2>
          <p className="text-[#BDC8E3] text-xs sm:text-sm font-medium font-urbanist">
            {profileData.profileType === "PARTNER"
              ? `${profileData.company}, ${profileData.position} · ${profileData.pronouns}`
              : `${profileData.year}, ${profileData.major} · ${profileData.pronouns}`}
          </p>
        </div>

        <div className="flex justify-center">
          <button
            className="w-[140px] h-[48px] sm:w-[155px] sm:h-[56px] bg-[#BDC8E3] bg-opacity-20 border border-[#BDC8E3] text-[#BDC8E3] rounded-lg font-medium hover:bg-[#BDC8E3]/10 transition-colors flex items-center justify-center gap-2 text-sm sm:text-base disabled:opacity-50 disabled:cursor-not-allowed p-4 py-6"
            onClick={async (e) => {
              await handleConnect(e);
            }}
            disabled={isConnecting}
          >
            {signedIn && (
              <Users size={14} className="text-[#BDC8E3] sm:w-4 sm:h-4" />
            )}
            {(() => {
              if (isConnecting) return "Connecting...";
              if (signedIn) return "Connect";
              return "Login to Connect";
            })()}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConnectionModal;
