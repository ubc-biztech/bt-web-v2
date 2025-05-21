import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import TextIcon from "./TextIcon";
import { ProfileRow, ProfileField } from "./ProfileRow";
import * as Separator from "@radix-ui/react-separator";
import EditIcon from "../../../public/assets/icons/pencil_icon.svg";
import { MemberStatus, User } from "@/types";
import MemberIcon from "../../../public/assets/icons/member_status_icon.svg";
import NonMemberIcon from "../../../public/assets/icons/non-member_status_icon.svg";
import ExecIcon from "../../../public/assets/icons/exec_status_icon.svg";
import Link from "next/link";

const renderStatusIcon = (status: string) => {
  switch (status) {
    case MemberStatus.Member:
      return MemberIcon;
    case MemberStatus.BizTechExec:
      return ExecIcon;
    default:
      return NonMemberIcon;
  }
};

const extractInitials = (
  firstName: string | undefined,
  lastName: string | undefined,
) => {
  const names = [firstName, lastName].filter(Boolean) as string[];
  const initials = names.map((name) => name.charAt(0).toUpperCase()).join("");
  return initials;
};

export const UserInfo = ({ profile }: { profile: User | null }) => {
  const status = profile?.admin
    ? MemberStatus.BizTechExec
    : profile?.isMember
      ? MemberStatus.Member
      : MemberStatus.NonMember;
  return (
    <div className=" bg-profile-card-bg flex p-6 rounded-md gap-6 w-full flex-col lg:w-[45%] lg:flex-row">
      <div className="flex flex-col items-center">
        <Avatar className="h-24 w-24">
          <AvatarImage src={profile?.image || ""} />
          <AvatarFallback>
            {profile?.fname || profile?.lname
              ? extractInitials(profile?.fname, profile?.lname)
              : ""}
          </AvatarFallback>
        </Avatar>
        {/* <Link href="">
          <p className="text-center text-baby-blue mt-2 text-xs">Edit</p>
        </Link> TO DO: add edit profile functionality */}
      </div>
      <div className="flex flex-col grow">
        <h4 className="text-biztech-green">User Profile</h4>{" "}
        {/* TO DO: add back edit icon and functionality */}
        <Separator.Root className="SeparatorRoot my-3 mx-0 bg-profile-separator-bg h-[0.5px]" />
        <ProfileRow>
          <ProfileField
            field="Name"
            value={`${profile?.fname ?? ""} ${profile?.lname ?? ""}`.trim()}
          />
          <ProfileField field="Pronouns" value={profile?.gender || ""} />
        </ProfileRow>
        <ProfileRow>
          <ProfileField field="School" value={profile?.education || ""} />
          <ProfileField
            field="Student Number"
            value={profile?.studentId || ""}
          />
        </ProfileRow>
        <ProfileRow>
          <ProfileField field="Year of Study" value={profile?.year || ""} />
          <ProfileField
            field="Dietary Restrictions"
            value={profile?.diet || ""}
          />
        </ProfileRow>
        <ProfileRow>
          <ProfileField field="Faculty" value={profile?.faculty || ""} />
          <ProfileField field="Major" value={profile?.major || ""} />
        </ProfileRow>
        <Separator.Root className="SeparatorRoot my-2 mx-0 bg-profile-separator-bg h-[0.5px]" />
        <ProfileField
          className="mt-3 mb-3 w-full"
          field="Email"
          value={profile?.id || ""}
        />
        <div className="text-white my-3 w-full">
          <h6 className="text-sm text-baby-blue">Membership Status</h6>
          <TextIcon
            text={
              <p className="text-xs text-white font-poppins">{status || ""}</p>
            }
            icon={renderStatusIcon(status)}
            iconSize={16}
          />
        </div>
      </div>
    </div>
  );
};
