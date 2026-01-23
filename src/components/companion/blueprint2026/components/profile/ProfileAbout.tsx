import { UserProfile } from "@/types";
import BluePrintCard from "../BluePrintCard";
import { Sparkles } from "lucide-react";

interface ProfileAboutProps {
  profile: UserProfile;
}

export default function ProfileAbout({ profile }: ProfileAboutProps) {
  const hasDescription = !!profile.description;
  const hasHobbies = profile.hobby1 || profile.hobby2;

  if (!hasDescription && !hasHobbies) return null;

  return (
    <BluePrintCard>
      {hasDescription && (
        <>
          <div className="text-md font-medium mb-2">
            About {profile.fname}
          </div>
          <div className="h-[0.5px] w-full bg-gradient-to-r from-transparent via-white to-transparent mb-4" />
          <p className="text-sm text-white/80 leading-relaxed mb-4">
            {profile.description}
          </p>
        </>
      )}

      {hasHobbies && (
        <>
          {hasDescription && (
            <div className="h-[0.5px] w-full bg-gradient-to-r from-transparent via-white/30 to-transparent my-4" />
          )}
          <div className="flex items-center gap-2 mb-3">
            <Sparkles size={16} className="text-[#6299ff]" />
            <span className="text-md font-medium">Hobbies & Interests</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {profile.hobby1 && (
              <span className="px-3 py-1.5 text-sm bg-white/10 border border-white/20 rounded-full text-white/80">
                {profile.hobby1}
              </span>
            )}
            {profile.hobby2 && (
              <span className="px-3 py-1.5 text-sm bg-white/10 border border-white/20 rounded-full text-white/80">
                {profile.hobby2}
              </span>
            )}
          </div>
        </>
      )}
    </BluePrintCard>
  );
}
