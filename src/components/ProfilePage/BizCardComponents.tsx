import { Share } from "lucide-react";
import { Button } from "../ui/button";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface UserQuestionResponse {
  question: string;
  answer: string;
}

interface UserProfile {
  firstName: string;
  lastName: string;
  school: string;
  major: string;
  faculty: string;
  year: string;
  hobbies: string[];
  bio: string;
  links: {
    website: string;
    linkedin: string;
  };
  questions: {
    one: UserQuestionResponse;
    two: UserQuestionResponse;
  };
}

const HobbyTag = ({ hobby }: { hobby: string }) => (
  <span className="text-biztech-green border-biztech-green border bg-biztech-green/10 px-3 py-1 rounded-full text-sm font-medium">
    {hobby}
  </span>
);

interface IconButtonProps {
  label: string;
  subtitle?: string;
  icon?: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  iconPosition?: 'left' | 'right';
  onClick?: () => void;
  className?: string;
}

const IconButton: React.FC<IconButtonProps> = ({
  label,
  subtitle,
  icon: Icon = Share,
  iconPosition = 'left',
  onClick,
  className = "",
}) => {
  const baseClasses =
    "px-4 py-2 h-fit rounded-lg flex items-center gap-2 transition-colors text-pale-blue shadow-[inset_0_0_12px_rgba(255,255,255,0.1)] bg-navbar-tab-hover-bg border-border-blue border";

  return (
    <Button className={cn(`${baseClasses} ${className}`, iconPosition === 'right' && 'flex-row-reverse')} onClick={onClick}>
      <Icon />
      <div className="text-left text-xs">
        {label}
        {subtitle && <p className="text-sm opacity-75">{subtitle}</p>}
      </div>
    </Button>
  );
};

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
      <Icon height={16} width={16} className="text-pale-blue" />
      <span className="text-sm text-pale-blue inline-flex gap-2">
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
      <Button className="w-full px-4 py-2 h-fit rounded-lg flex items-center gap-2 transition-colors text-pale-blue shadow-[inset_0_0_12px_rgba(255,255,255,0.1)] bg-navbar-tab-hover-bg border-border-blue border">
        <LinkIcon className="flex-shrink-0" />
        <div className="text-left min-w-0 flex-1">
          <div className="truncate">{label}</div>
          <p className="text-xs opacity-75 truncate">{url}</p>
        </div>
      </Button>
    </Link>
  );
};

export type { UserQuestionResponse, UserProfile };
export { HobbyTag, IconButton, LinkButton, DisplayUserField };
