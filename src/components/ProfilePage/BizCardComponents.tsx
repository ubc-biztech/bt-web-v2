import { Share } from "lucide-react";
import { Button } from "../ui/button";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface UserQuestionResponse {
  question: string;
  answer: string;
}

interface BiztechProfile {
  compositeID: string;
  profileType: "EXEC" | "ATTENDEE" | "PARTNER";
  fname: string;
  lname: string;
  pronouns: string;
  year: string;
  major: string;
  viewableMap: Record<string, boolean>;
  hobby1?: string;
  hobby2?: string;
  funQuestion1?: string;
  funQuestion2?: string;
  linkedIn?: string;
  profilePictureURL?: string;
  additionalLink?: string;
  description?: string;
}

const HobbyTag = ({ hobby }: { hobby: string }) => (
  <span className="text-bt-green-300 border-bt-green-300 border bg-bt-green-300/10 px-3 py-1 rounded-full text-sm font-medium">
    {hobby}
  </span>
);

interface IconButtonProps {
  label: string;
  subtitle?: string;
  icon?: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  iconPosition?: "left" | "right";
  onClick?: () => void;
  className?: string;
}

const DisplayUserField = ({
  icon: Icon,
  fieldName,
  fieldValue,
}: {
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  fieldName: string;
  fieldValue: string;
}) => {
  return (
    <div className="flex items-center gap-2 font-medium">
      <Icon height={16} width={16} className="text-bt-blue-0" />
      <span className="text-sm text-bt-blue-0 inline-flex gap-2">
        {fieldName}:<p className="text-white">{fieldValue}</p>
      </span>
    </div>
  );
};

const LinkButton = ({
  linkIcon: LinkIcon,
  label,
  url,
}: {
  linkIcon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  label: string;
  url: string;
}) => {
  return (
    <Link href={url} target="_blank" className="w-full">
      <Button className="w-full px-4 py-2 h-fit rounded-lg flex items-center gap-2 transition-colors text-bt-blue-0 shadow-[inset_0_0_12px_rgba(255,255,255,0.1)] bg-bt-blue-300 border-bt-blue-100 border hover:bg-bt-blue-400">
        <LinkIcon className="flex-shrink-0" />
        <div className="text-left min-w-0 flex-1">
          <div className="truncate">{label}</div>
          <p className="text-xs opacity-75 truncate">{url}</p>
        </div>
      </Button>
    </Link>
  );
};

export type { UserQuestionResponse, BiztechProfile };
export { HobbyTag, LinkButton, DisplayUserField };
