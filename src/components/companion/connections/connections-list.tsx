import React from "react";
import { SectionCard } from "@/components/ui/section-card";
import { CompanionConnectionRow } from "./connection-row";

export interface Connection {
  userID: string;
  obfuscatedID: string;
  createdAt: Date;
  fname: string;
  lname: string;
  major?: string;
  year?: string;
  title?: string;
  company?: string;
  profilePic?: string;
  "eventID;year": string;
}

interface ConnectionsListProps {
  connections: Connection[];
  totalCount?: number;
}

export const ConnectionsList: React.FC<ConnectionsListProps> = ({
  connections,
  totalCount,
}) => {
  return (
    <SectionCard title="Connections" viewAllLink="/companion/connections">
      <div className="space-y-4">
        {totalCount && totalCount > 0 ? (
          <>
            {connections.map((connection) => (
              <CompanionConnectionRow
                key={connection.obfuscatedID}
                connection={connection}
              />
            ))}
            {totalCount && totalCount > connections.length && (
              <p className="text-center text-[#808080] text-xs mt-2 font-redhat">
                + {totalCount - connections.length} MORE
              </p>
            )}
          </>
        ) : (
          <>
            <p className="font-redhat font-thin text-[14px] flex justify-center text-center">
              NO CONNECTIONS YET
            </p>
            <p className="font-redhat font-thin text-[14px] flex justify-center text-center">
              TAP YOUR FIRST NFC TO START
            </p>
          </>
        )}
      </div>
    </SectionCard>
  );
};
