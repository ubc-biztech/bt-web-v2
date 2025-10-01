import Link from "next/link";
import { Button } from "../ui/button";
import { GenericCard } from "../Common/Cards";

export default function HeaderCard({
  fname,
  lname,
  userRole,
  isMember,
}: {
  fname?: string;
  lname?: string;
  userRole: string;
  isMember?: boolean;
}) {
  const userInitials = `${fname?.[0] || ""}${lname?.[0] || ""}`.toUpperCase();

  return (
    <GenericCard className="w-full flex flex-col md:flex-row gap-6 md:items-center justify-between">
      <div className="flex flex-row gap-4 md:gap-8 items-center">
        <div className="w-20 h-20 md:w-24 aspect-square md:h-24 bg-bt-blue-100 rounded-full flex items-center justify-center">
          <span className="text-xl font-medium text-bt-blue-500">
            {userInitials}
          </span>
        </div>
        <div>
          <h3 className="md:text-xl text-lg">
            {fname} {lname}
          </h3>
          <h5 className="md:text-md text-sm text-bt-blue-0">{userRole}</h5>
        </div>
      </div>
      <Link href="/profile/edit">
        {isMember && <Button variant="outline"> View your NFC Profile </Button>}
      </Link>
    </GenericCard>
  );
}
