import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import NavbarLogo from '@/assets/2025/blueprint/navbar_logo.png';

interface SideNavProps {
  isOpen: boolean;
  onClose: () => void;
}

const navLinks = [
  { href: '/companion', label: 'Home' },
  { href: '/companion/profile', label: 'User Profile' },
  { href: '/companion/connections', label: 'Connections' },
  { href: '/companion/companies', label: 'Companies' },
  { href: '/companion/faq', label: 'FAQ' }
];

export const SideNav: React.FC<SideNavProps> = ({ isOpen, onClose }) => {
  return (
    <>
      <div 
        className={cn(
          "fixed inset-0 bg-black/50 backdrop-blur-sm z-40 transition-opacity duration-300",
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        onClick={onClose}
      />
      <div 
        className={cn(
          "fixed top-0 right-0 w-80 h-full bg-black/60 backdrop-blur-xl border-l border-white/10 z-50 transform transition-transform duration-300 ease-in-out",
          isOpen ? "translate-x-0" : "translate-x-full"
        )}
      >
        <div className="flex flex-col justify-center h-full p-8">
          <div className="flex justify-end mb-8">
            <div className="relative w-40 h-8">
              <Image
                src={NavbarLogo}
                alt="BluePrint Logo"
                fill
                className="object-contain"
                priority
              />
            </div>
          </div>
          
          <div className="h-[1px] bg-white/10 mb-8" />
          
          <nav className="space-y-6">
            {navLinks.map(({ href, label }) => (
              <Link 
                key={href}
                href={href} 
                className="flex flex-row-reverse items-center gap-3 text-[22px] py-2 text-white hover:text-gray-300 transition-colors"
                onClick={onClose}
              >
                <span className="text-lg">↗</span>
                {label}
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </>
  );
}; 