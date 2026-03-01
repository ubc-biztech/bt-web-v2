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
    <div className="flex flex-col gap-1 min-w-0">
      <span className="inline-flex items-center gap-2 font-medium text-bt-blue-0 shrink-0">
        <Icon className="size-5" aria-hidden />
        <span>{fieldName}</span>
      </span>
      <p
        className="min-w-0 whitespace-normal break-words [overflow-wrap:anywhere] hyphens-auto leading-relaxed line-clamp-3"
        title={value}
      >
        {value ?? "—"}
      </p>
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
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
        {userAttributeFields.map(({ icon, fieldName, value }) => (
          <UserAttributeField
            key={fieldName}
            icon={icon}
            fieldName={fieldName}
            value={value}
          />
        ))}
      </div>
    </GenericCard>
  );
}
