import { UserProfile } from "@/types";
import BluePrintCard from "../BluePrintCard";
import { Building2, GraduationCap, Briefcase, Calendar } from "lucide-react";

interface ProfileInfoProps {
  profile: UserProfile;
}

export default function ProfileInfo({ profile }: ProfileInfoProps) {
  const isPartner = profile.type === "Partner";

  if (isPartner) {
    // Partner view: Company & Role
    if (!profile.company && !profile.role) return null;

    return (
      <BluePrintCard>
        <div className="text-md font-medium mb-2">Professional Info</div>
        <div className="h-[0.5px] w-full bg-gradient-to-r from-transparent via-white to-transparent mb-4" />

        <div className="space-y-3">
          {profile.company && (
            <div className="flex items-center gap-3">
              <Building2 size={18} className="text-[#6299ff]" />
              <div>
                <div className="text-xs text-[#778191]">Company</div>
                <div className="text-sm text-white">{profile.company}</div>
              </div>
            </div>
          )}

          {profile.role && (
            <div className="flex items-center gap-3">
              <Briefcase size={18} className="text-[#6299ff]" />
              <div>
                <div className="text-xs text-[#778191]">Role</div>
                <div className="text-sm text-white">{profile.role}</div>
              </div>
            </div>
          )}
        </div>
      </BluePrintCard>
    );
  }

  // Attendee view: Major & Year
  if (!profile.major && !profile.year) return null;

  return (
    <BluePrintCard>
      <div className="text-md font-medium mb-2">Academic Info</div>
      <div className="h-[0.5px] w-full bg-gradient-to-r from-transparent via-white to-transparent mb-4" />

      <div className="space-y-3">
        {profile.major && (
          <div className="flex items-center gap-3">
            <GraduationCap size={18} className="text-[#6299ff]" />
            <div>
              <div className="text-xs text-[#778191]">Major</div>
              <div className="text-sm text-white">{profile.major}</div>
            </div>
          </div>
        )}

        {profile.year && (
          <div className="flex items-center gap-3">
            <Calendar size={18} className="text-[#6299ff]" />
            <div>
              <div className="text-xs text-[#778191]">Year</div>
              <div className="text-sm text-white">{profile.year}</div>
            </div>
          </div>
        )}
      </div>
    </BluePrintCard>
  );
}
