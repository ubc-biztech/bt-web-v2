import Link from "next/link";
import { Button } from "../ui/button";
import { GenericCard } from "../Common/Cards";

export default function HeaderCard({
  fname,
  lname,
  userRole,
}: {
  fname?: string;
  lname?: string;
  userRole: string;
}) {
  const userInitials = `${fname?.[0] || ""}${lname?.[0] || ""}`.toUpperCase();

  return (
    <GenericCard className="w-full flex flex-row items-center justify-between">
      <div className="flex flex-row gap-8 items-center">
        <div className="w-24 h-24 bg-events-baby-blue rounded-full flex items-center justify-center">
          <span className="text-2xl font-medium text-biztech-navy">
            {userInitials}
          </span>
        </div>
        <div>
          <h3>
            {fname} {lname}
          </h3>
          <h5 className="text-pale-blue">{userRole}</h5>
        </div>
      </div>
      <Link href="/profile/edit">
        <Button className="justify-self-end bg-signup-input-border">
          {" "}
          View your NFC Profile{" "}
        </Button>
      </Link>
    </GenericCard>
  );
}
