import React from "react";
import { Avatar } from "@/components/ui/avatar";
import { CompanionItemRow } from "@/components/ui/companion-item-row";
import { Connection } from "./connections-list";
import { AvatarFallback, AvatarImage } from "@radix-ui/react-avatar";

export const CompanionConnectionRow: React.FC<{
  connection: Connection;
}> = ({ connection }) => {
  const role =
    connection?.major && connection?.year // check if connection is attendee (has major and year)
      ? `${connection?.major}, ${connection?.year}`
      : connection?.title && connection?.company // else check if connection is delegate
      ? `${connection?.title}, ${connection?.company}`
      : "";
  const avatarInitials =
    connection.fname && connection.lname
      ? `${connection.fname[0].toUpperCase()}${connection.lname[0].toUpperCase()}`
      : "";
  const fullName = `${connection.fname} ${connection.lname}`;
  return (
    <CompanionItemRow
      href={`/companion/profile/${connection.obfuscatedID}`}
    >
      <div className="flex items-center space-x-3">
        <Avatar
          className={`flex w-8 h-8 bg-primary-color items-center justify-center`}
        >
          <AvatarImage src={connection?.profilePic} />
          <AvatarFallback>{avatarInitials}</AvatarFallback>
        </Avatar>
        <div>
          <p className="text-[22px] font-medium text-white">{fullName}</p>
          <p className="text-[#808080] text-[12px] font-redhat">{role}</p>
        </div>
      </div>
      <span className="text-base text-white/70">↗</span>
    </CompanionItemRow>
  );
}; 