import { UserProfile } from "@/types";
import BluePrintButton from "../BluePrintButton";
import { Linkedin, ExternalLink, FileText } from "lucide-react";
import { ensureAbsoluteUrl } from "@/util/profile";

interface ProfileLinksProps {
  profile: UserProfile;
}

export default function ProfileLinks({ profile }: ProfileLinksProps) {
  const showResume =
    profile.resumeURL && profile.viewableMap?.resumeURL === true;
  const hasLinks = profile.linkedIn || profile.additionalLink || showResume;

  if (!hasLinks) return null;

  return (
    <div className="flex flex-col gap-3">
      {profile.linkedIn && (
        <a
          href={ensureAbsoluteUrl(profile.linkedIn)}
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
          href={ensureAbsoluteUrl(profile.additionalLink)}
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

      {showResume && (
        <a
          href={ensureAbsoluteUrl(profile.resumeURL!)}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full"
        >
          <BluePrintButton className="w-full justify-center py-3 bg-transparent border-white/30">
            <FileText size={18} />
            <span>Resume</span>
          </BluePrintButton>
        </a>
      )}
    </div>
  );
}
