import { User } from "@/types";
import { GenericCard } from "../Common/Cards";
import {
  Settings,
  Mail,
  GraduationCap,
  Calendar,
  Building2,
  BookOpen,
  Heart,
  LucideIcon,
} from "lucide-react";

interface UserAttributeFieldProps {
  icon: LucideIcon;
  fieldName: string;
  value: string | undefined;
}

const UserAttributeField = ({
  icon: Icon,
  fieldName,
  value,
}: UserAttributeFieldProps) => {
  return (
    <div className="flex flex-row gap-2">
      <span className="flex flex-row items-center gap-3 font-medium text-bt-blue-0">
        {" "}
        <Icon className="w-5 h-5" /> {fieldName}:
      </span>
      <p> {value} </p>
    </div>
  );
};

export default function AttributesCard({
  profileData,
  userRole,
}: {
  profileData: User;
  userRole: string;
}) {
  const userAttributeFields: UserAttributeFieldProps[] = [
    {
      icon: Settings,
      fieldName: "Membership Status",
      value: userRole,
    },
    {
      icon: Mail,
      fieldName: "Email",
      value: profileData.id,
    },
    {
      icon: GraduationCap,
      fieldName: "School",
      value: profileData.education,
    },
    {
      icon: Calendar,
      fieldName: "Year",
      value: profileData.year,
    },
    {
      icon: Building2,
      fieldName: "Faculty",
      value: profileData.faculty,
    },
    {
      icon: BookOpen,
      fieldName: "Major",
      value: profileData.major,
    },
    {
      icon: Heart,
      fieldName: "Dietary Restrictions",
      value: profileData.diet,
    },
  ];

  return (
    <GenericCard title="Personal Information" className="w-full">
      <div className="flex flex-col gap-6">
        {userAttributeFields.map(({ icon, fieldName, value }, index) => (
          <UserAttributeField
            key={index}
            icon={icon}
            fieldName={fieldName}
            value={value}
          />
        ))}
      </div>
    </GenericCard>
  );
}
