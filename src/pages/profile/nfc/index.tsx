import React, { useState } from "react";
import {
  Share,
  ExternalLink,
  School,
  BookOpen,
  Building,
  Calendar,
  LinkIcon,
} from "lucide-react";
import ShareProfileDrawer from "@/components/ProfilePage/ShareProfileDrawer";
import {
  DisplayUserField,
  HobbyTag,
  IconButton,
  LinkButton,
  UserProfile,
} from "@/components/ProfilePage/BizCardComponents";
import { GenericCardNFC } from "@/components/Common/Cards";

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

const UserExternalLinks = () => (
  <div className="grid md:grid-cols-1 grid-cols-2 lg:grid-cols-2 gap-4">
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
);

const ProfilePage = () => {
  const [isDrawerOpen, setDrawerOpen] = useState(false);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 text-white px-4 py-8 md:p-8 md:gap-8 min-h-screen space-y-6 md:space-y-0">
      <div className="flex flex-col justify-center items-center col-span-1 gap-4">
        <div className="place-items-center w-fit">
          <div className="w-32 h-32 bg-events-baby-blue rounded-full mx-auto mb-4 flex items-center justify-center">
            <span className="text-3xl font-medium text-biztech-navy">FL</span>
          </div>
          <h1 className="text-center text-xl font-semibold mb-2">
            {userProfile.firstName} {userProfile.lastName}
          </h1>
          <p className="text-pale-blue mb-4">BizTech Member</p>

          <IconButton
            icon={Share}
            label="Share Profile"
            onClick={() => setDrawerOpen(true)}
          />
        </div>

        <div className="hidden md:block">
          <UserExternalLinks />
        </div>
      </div>

      <div className="flex flex-col justify-center col-span-2 space-y-6">
        {/* Member Profile Section */}
        <GenericCardNFC
          title={`About ${userProfile.firstName}`}
          isCollapsible={false}
        >
          <div className="space-y-4">
            <p className="text-pale-blue text-sm">
              Curious and motivated student exploring the world of tech through
              hands-on projects and collaboration. Passionate about learning,
              building, and growing with like-minded peers in a supportive
              community.
            </p>

            <div className="inline-flex flex-wrap items-center gap-2">
              <span className="text-sm text-pale-blue">Hobbies:</span>
              <div className="flex flex-wrap gap-2">
                <HobbyTag hobby="Rock Climbing" />
                <HobbyTag hobby="Basketball" />
              </div>
            </div>

            <div className="border-border-blue border-[0.5px]" />

            <div className="space-y-3">
              <DisplayUserField
                icon={School}
                fieldName="School"
                fieldValue={userProfile.school}
              />
              <DisplayUserField
                icon={BookOpen}
                fieldName="Major"
                fieldValue={userProfile.major}
              />
              <DisplayUserField
                icon={Building}
                fieldName="Faculty"
                fieldValue={userProfile.faculty}
              />
              <DisplayUserField
                icon={Calendar}
                fieldName="Year"
                fieldValue={userProfile.year}
              />
            </div>
          </div>
        </GenericCardNFC>

        <div className="block md:hidden">
          <UserExternalLinks />
        </div>

        {/* Q&A Section */}
        <GenericCardNFC isCollapsible={false}>
          <div className="space-y-4">
            <div className="rounded-lg">
              <p className="text-sm text-pale-blue mb-2">
                Q: {userProfile.questions.one.question}
              </p>
              <p className="text-sm">{userProfile.questions.one.answer}</p>
            </div>

            <div className="border-border-blue border-[0.5px]" />

            <div className="rounded-lg">
              <p className="text-sm text-pale-blue mb-2">
                Q: {userProfile.questions.two.question}
              </p>
              <p className="text-sm">{userProfile.questions.two.answer}</p>
            </div>
          </div>
        </GenericCardNFC>
      </div>

      <ShareProfileDrawer isOpen={isDrawerOpen} setIsOpen={setDrawerOpen} />
    </div>
  );
};

export default ProfilePage;
