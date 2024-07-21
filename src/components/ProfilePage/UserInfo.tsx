import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import TextIcon from "./TextIcon";
import { ProfileRow, ProfileField } from "./ProfileRow";
import * as Separator from "@radix-ui/react-separator";
import EditIcon from "../../../public/assets/icons/pencil_icon.svg";
import { MemberStatus, Profile } from "@/types";
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

const extractInitials = (name: string) => {
  const names = name.split(" ").filter(Boolean);
  const initials = names.map((name) => name.charAt(0).toUpperCase()).join("");
  return initials;
};

export const UserInfo = ({ profile }: { profile: Profile | null }) => {
  return (
    <div className=" bg-profile-card-bg flex p-6 rounded-md gap-6 w-[45%]">
      <div className="flex flex-col items-center">
        <Avatar className="h-24 w-24">
          <AvatarImage src={profile?.image || ""} />
          <AvatarFallback>
            {profile?.name ? extractInitials(profile?.name) : ""}
          </AvatarFallback>
        </Avatar>
        <Link href="">
          <p className="text-center text-baby-blue mt-2 text-xs">Edit</p>
        </Link>
      </div>
      <div className="flex flex-col grow">
        <TextIcon
          text={<h4 className="text-biztech-green">User Profile</h4>}
          icon={EditIcon}
          iconSize={28}
          iconAtEnd={true}
        />
        <Separator.Root className="SeparatorRoot my-3 mx-0 bg-profile-separator-bg h-[0.5px]" />
        <ProfileRow>
          <ProfileField field="Name" value={profile?.name || ""} />
          <ProfileField field="Pronouns" value={profile?.pronouns || ""} />
        </ProfileRow>
        <ProfileRow>
          <ProfileField field="School" value={profile?.school || ""} />
          <ProfileField
            field="Student Number"
            value={profile?.studentId || ""}
          />
        </ProfileRow>
        <ProfileRow>
          <ProfileField field="Year of Study" value={profile?.year || ""} />
          <ProfileField
            field="Dietary Restrictions"
            value={profile?.dietary || ""}
          />
        </ProfileRow>
        <ProfileRow>
          <ProfileField field="Faculty" value={profile?.faculty || ""} />
          <ProfileField field="Major" value={profile?.major || ""} />
        </ProfileRow>
        <Separator.Root className="SeparatorRoot my-2 mx-0 bg-profile-separator-bg h-[0.5px]" />
        <ProfileField
          className="mt-3 mb-3"
          field="Email"
          value={profile?.email || ""}
        />
        <div className="w-1/2 text-white my-3">
          <h6 className="text-sm text-baby-blue">Membership Status</h6>
          {profile?.status && (
            <TextIcon
              text={
                <p className="text-xs font-poppins">{profile?.status || ""}</p>
              }
              icon={renderStatusIcon(profile?.status)}
              iconSize={16}
            />
          )}
        </div>
      </div>
    </div>
  );
};
