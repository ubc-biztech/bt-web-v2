import { UserProfile } from "@/types";
import BluePrintButton from "../BluePrintButton";
import { Linkedin, ExternalLink } from "lucide-react";

interface ProfileLinksProps {
  profile: UserProfile;
}

export default function ProfileLinks({ profile }: ProfileLinksProps) {
  const hasLinks = profile.linkedIn || profile.additionalLink;

  if (!hasLinks) return null;

  return (
    <div className="flex flex-col gap-3">
      {profile.linkedIn && (
        <a
          href={
            profile.linkedIn.startsWith("http")
              ? profile.linkedIn
              : `https://${profile.linkedIn}`
          }
          target="_blank"
          rel="noopener noreferrer"
          className="w-full"
        >
          <BluePrintButton className="w-full justify-center py-3">
            <Linkedin size={18} />
            <span>Connect on LinkedIn</span>
          </BluePrintButton>
        </a>
      )}

      {profile.additionalLink && (
        <a
          href={
            profile.additionalLink.startsWith("http")
              ? profile.additionalLink
              : `https://${profile.additionalLink}`
          }
          target="_blank"
          rel="noopener noreferrer"
          className="w-full"
        >
          <BluePrintButton className="w-full justify-center py-3 bg-transparent border-white/30">
            <ExternalLink size={18} />
            <span>View Portfolio</span>
          </BluePrintButton>
        </a>
      )}
    </div>
  );
}
