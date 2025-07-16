import React from "react";
import {
  Share,
  ExternalLink,
  School,
  BookOpen,
  Building,
  Calendar,
  LinkIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

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

const userProfile: UserProfile = {
  firstName: "Firstname",
  lastName: "Lastname",
  school: "UBC",
  major: "BUCS",
  faculty: "Commerce",
  year: "4",
  hobbies: ["Rock Climbing", "Basketball"],
  bio: "Curious and motivated student exploring the world of tech through hands-on projects and collaboration. Passionate about learning, building, and growing with like-minded peers in a supportive community.",
  links: {
    website: "https://google.com",
    linkedin: "https://linkedin.com/",
  },
  questions: {
    one: {
      question: "What is your favourite [example question]",
      answer:
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam",
    },
    two: {
      question: "What is your favourite [example question]",
      answer:
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam",
    },
  },
};

const HobbyTag = ({ hobby }: { hobby: string }) => (
  <span className="bg-green-600 text-biztech-green border-biztech-green border bg-biztech-green/20 px-3 py-1 rounded-full text-sm">
    {hobby}
  </span>
);

interface IconButtonProps {
  label: string;
  subtitle?: string;
  icon?: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  onClick?: () => void;
  className?: string;
}

const IconButton: React.FC<IconButtonProps> = ({
  label,
  subtitle,
  icon: Icon = Share,
  onClick,
  className = "",
}) => {
  const baseClasses =
    "px-4 py-2 h-fit rounded-lg flex items-center gap-2 transition-colors text-pale-blue shadow-[inset_0_0_12px_rgba(255,255,255,0.1)] bg-navbar-tab-hover-bg border-border-blue border";

  return (
    <Button className={`${baseClasses} ${className}`} onClick={onClick}>
      <Icon />
      <div className="text-left text-xs">
        {label}
        {subtitle && <p className="text-sm opacity-75">{subtitle}</p>}
      </div>
    </Button>
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
          <p className="text-sm opacity-75 truncate">{url}</p>
        </div>
      </Button>
    </Link>
  );
};

const GenericCard = ({
  title,
  children,
  isCollapsible,
}: {
  title: string;
  children: React.ReactNode;
  isCollapsible: boolean;
}) => (
  <div className="bg-primary-color rounded-lg p-6 shadow-[inset_0_0_26.59px_rgba(255,255,255,0.1)] border-border-blue border">
    <div className="flex items-center justify-between mb-4">
      <h2 className="text-lg font-semibold">{title}</h2>
      <svg
        className="w-5 h-5 text-slate-400"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M19 9l-7 7-7-7"
        />
      </svg>
    </div>
    {children}
  </div>
);

const ProfilePage = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 text-white p-8 gap-8 min-h-screen">

      <div className="flex flex-col justify-center items-center col-span-1 gap-8">
        <div className="place-items-center">
          <div className="w-32 h-32 bg-desat-navy rounded-full mx-auto mb-4 flex items-center justify-center">
            <span className="text-3xl font-medium text-slate-600">FL</span>
          </div>
          <h1 className="text-center text-xl font-semibold mb-2">
            {userProfile.firstName} {userProfile.lastName}
          </h1>
          <p className="text-slate-400 mb-4">BizTech Member</p>

          <IconButton
            icon={Share}
            label="Share Profile"
            onClick={() => console.log("Share clicked")}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <LinkButton
            linkIcon={ExternalLink}
            label="LinkedIn"
            url={userProfile.links.linkedin}
          />

          <LinkButton
            linkIcon={LinkIcon}
            label="Website"
            url={userProfile.links.website}
          />
        </div>
      </div>

      <div className="col-span-2 space-y-4">
        {/* Member Profile Section */}
        <GenericCard title="Member Profile" isCollapsible={false}>
          <div>
            <p className="text-slate-300 text-sm mb-4">
              Curious and motivated student exploring the world of tech through
              hands-on projects and collaboration. Passionate about learning,
              building, and growing with like-minded peers in a supportive
              community.
            </p>

            <div className="mb-4">
              <span className="text-sm text-slate-400">Hobbies:</span>
              <div className="flex gap-2 mt-1">
                <HobbyTag hobby="Rock Climbing" />
                <HobbyTag hobby="Basketball" />
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <School size={16} className="text-slate-400" />
                <span className="text-sm">School: UBC</span>
              </div>
              <div className="flex items-center gap-3">
                <BookOpen size={16} className="text-slate-400" />
                <span className="text-sm">Major: BUCS</span>
              </div>
              <div className="flex items-center gap-3">
                <Building size={16} className="text-slate-400" />
                <span className="text-sm">Faculty: Commerce</span>
              </div>
              <div className="flex items-center gap-3">
                <Calendar size={16} className="text-slate-400" />
                <span className="text-sm">Year: 4</span>
              </div>
            </div>
          </div>
        </GenericCard>

        {/* Q&A Section */}
        <GenericCard title="Q&A" isCollapsible={false}>
          <div className="space-y-4">
            <div className="bg-slate-800 rounded-lg p-4">
              <p className="text-sm text-slate-300 mb-2">
                Q: {userProfile.questions.one.question}
              </p>
              <p className="text-sm text-slate-400">
                {userProfile.questions.one.answer}
              </p>
            </div>

            <div className="bg-slate-800 rounded-lg p-4">
              <p className="text-sm text-slate-300 mb-2">
                Q: {userProfile.questions.two.question}
              </p>
              <p className="text-sm text-slate-400">
                {userProfile.questions.two.answer}
              </p>
            </div>
          </div>
        </GenericCard>
      </div>
    </div>
  );
};

export default ProfilePage;
