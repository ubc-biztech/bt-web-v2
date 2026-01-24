import { UserProfile } from "@/types";
import Image from "next/image";

interface ProfileHeaderProps {
  profile: UserProfile;
}

export default function ProfileHeader({ profile }: ProfileHeaderProps) {
  const fullName = `${profile.fname} ${profile.lname}`;
  const isPartner = profile.type === "Partner";
  const showProfilePicture = profile.profilePictureURL && profile.viewableMap?.profilePictureURL !== false;
  const showPronouns = profile.pronouns && profile.viewableMap?.pronouns !== false;

  return (
    <div className="flex flex-col items-center gap-4 py-6">
      {/* Avatar with gradient border */}
      <div className="relative">
        <div className="absolute inset-0 rounded-full bg-gradient-to-br from-[#6299ff] to-[#EAE5D4] p-[3px]">
          <div className="w-full h-full rounded-full bg-[#0A1428]" />
        </div>
        <div className="relative w-28 h-28 rounded-full bg-gradient-to-br from-[#6299ff] to-[#EAE5D4] p-[3px]">
          <div className="w-full h-full rounded-full overflow-hidden bg-[#0A1428]">
            {showProfilePicture ? (
              <Image
                src={profile.profilePictureURL!}
                alt={fullName}
                width={112}
                height={112}
                className="w-full h-full object-cover"
                unoptimized
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-3xl font-medium text-white/60">
                {profile.fname[0]}
                {profile.lname[0]}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Name */}
      <h1 className="text-2xl font-medium bg-gradient-to-br from-[#6299ff] to-[#EAE5D4] bg-clip-text text-transparent">
        {fullName}
      </h1>

      {/* Pronouns & Type Badge */}
      <div className="flex items-center gap-3">
        {showPronouns && (
          <span className="text-sm text-[#778191]">{profile.pronouns}</span>
        )}
        <span
          className={`px-3 py-1 text-xs font-mono rounded-full border ${
            isPartner
              ? "bg-[#4972EF]/20 border-[#4972EF]/50 text-[#4972EF]"
              : "bg-white/10 border-white/30 text-white/80"
          }`}
        >
          {isPartner ? "PARTNER" : "ATTENDEE"}
        </span>
      </div>
    </div>
  );
}
