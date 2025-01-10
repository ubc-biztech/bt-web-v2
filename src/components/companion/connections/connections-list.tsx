import React from 'react';
import { SectionCard } from '@/components/ui/section-card';
import { CompanionConnectionRow } from './connection-row';

interface Connection {
  id: string;
  name: string;
  role: string;
  avatarInitials: string;
  avatarColor?: string;
}

interface ConnectionsListProps {
  connections: Connection[];
  totalCount?: number;
}

export const ConnectionsList: React.FC<ConnectionsListProps> = ({ 
  connections,
  totalCount
}) => {
  return (
    <SectionCard title="Recent Connections" viewAllLink="/companion/connections">
      <div className="space-y-4">
        {connections.map((connection, index) => (
          <CompanionConnectionRow key={index} {...connection} />
        ))}
        {totalCount && totalCount > connections.length && (
          <p className="text-center text-[#808080] text-xs mt-2 font-redhat">
            + {totalCount - connections.length} MORE
          </p>
        )}
      </div>
    </SectionCard>
  );
}; 