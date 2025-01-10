import React from 'react';
import { Avatar } from '@/components/ui/avatar';
import { CompanionItemRow } from '@/components/ui/companion-item-row';

interface ConnectionRowProps {
  id: string;
  name: string;
  role: string;
  avatarInitials: string;
  avatarColor?: string;
}

export const CompanionConnectionRow: React.FC<ConnectionRowProps> = ({
  id,
  name,
  role,
  avatarInitials,
  avatarColor
}) => {
  return (
    <CompanionItemRow href={`/companion/profile/${id}`}>
      <div className="flex items-center space-x-3">
        <Avatar className={`w-8 h-8 bg-${avatarColor || 'blue-500'}`}>
          <span className="text-sm font-medium">{avatarInitials}</span>
        </Avatar>
        <div>
          <p className="text-[22px] font-medium text-white">{name}</p>
          <p className="text-[#808080] text-[12px] font-redhat">{role}</p>
        </div>
      </div>
      <span className="text-base text-white/70">↗</span>
    </CompanionItemRow>
  );
}; 