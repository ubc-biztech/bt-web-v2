import React from 'react';
import Link from 'next/link';
import { Avatar } from '@/components/ui/avatar';
import { SectionCard } from '@/components/ui/section-card';

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
          <Link href={`/companion/profile/${connection.id}`} key={index}>
            <div className="relative flex items-center justify-between my-4 p-2.5 rounded-xl transition-colors border border-white/30 hover:bg-white/10">
              <div className="flex items-center space-x-3">
                <Avatar className={`w-8 h-8 bg-${connection.avatarColor || 'blue-500'}`}>
                  <span className="text-sm font-medium">{connection.avatarInitials}</span>
                </Avatar>
                <div>
                  <p className="text-lg font-medium text-white">{connection.name}</p>
                  <p className="text-[#808080] text-xs font-redhat">{connection.role}</p>
                </div>
              </div>
              <span className="text-base text-white/70">↗</span>
            </div>
          </Link>
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