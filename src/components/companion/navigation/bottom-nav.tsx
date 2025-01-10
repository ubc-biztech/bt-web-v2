import React from 'react';
import Link from 'next/link';
import { Home, Users, Trophy, User } from 'lucide-react';
import { AnimatedBorder } from '@/components/ui/animated-border';

const navItems = [
  { href: '/companion', icon: Home },
  { href: '/companion/connections', icon: Users },
  { href: '/companion/badges', icon: Trophy },
  { href: '/companion/profile', icon: User }
];

export const BottomNav: React.FC = () => {
  return (
    <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 w-[calc(100%-64px)] max-w-md">
      <AnimatedBorder rounded="rounded-full" padding="1px">
        <div className="bg-black rounded-full p-4">
          <div className="flex justify-around items-center">
            {navItems.map(({ href, icon: Icon }) => (
              <Link 
                key={href}
                href={href} 
                className="flex flex-col items-center text-white hover:text-gray-300 transition-colors"
              >
                <Icon className="w-8 h-8 mb-1" />
              </Link>
            ))}
          </div>
        </div>
      </AnimatedBorder>
    </div>
  );
}; 