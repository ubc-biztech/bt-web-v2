import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { X } from 'lucide-react';
import { motion, useAnimation, PanInfo } from 'framer-motion';
import { cn } from '@/lib/utils';
import NavbarLogo from '@/assets/2025/blueprint/navbar_logo.png';

interface SideNavProps {
  isOpen: boolean;
  onClose: () => void;
}

const navLinks = [
  { href: '/companion', label: 'Home' },
  { href: '/companion/profile', label: 'User Profile' },
  { href: '/companion/badges', label: 'Badges' },
  { href: '/companion/connections', label: 'Connections' },
  { href: '/companion/companies', label: 'Companies' },
  { href: '/companion/faq', label: 'FAQ' }
];

export const SideNav: React.FC<SideNavProps> = ({ isOpen, onClose }) => {
  const controls = useAnimation();
  
  React.useEffect(() => {
    controls.start({
      x: isOpen ? 0 : "100%",
      transition: { duration: 0.3, ease: "easeInOut" }
    });
  }, [isOpen, controls]);

  const handleDragEnd = async (_: any, info: PanInfo): Promise<void> => {
    const threshold = 100; // pixels to determine swipe
    if (info.offset.x > threshold) {
      await controls.start({ 
        x: "100%",
        transition: { duration: 0.3, ease: "easeInOut" }
      });
      onClose();
    } else {
      await controls.start({ 
        x: 0,
        transition: { duration: 0.3, ease: "easeInOut" }
      });
    }
  };

  return (
    <>
      <div 
        className={cn(
          "fixed inset-0 bg-black/50 backdrop-blur-sm z-40 transition-opacity duration-300",
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        onClick={onClose}
      />
      <motion.div 
        className={cn(
          "fixed top-0 right-0 w-80 h-full bg-black/60 backdrop-blur-xl border-l border-white/10 z-50 touch-pan-y",
          !isOpen && "pointer-events-none"
        )}
        initial={{ x: "100%" }}
        animate={controls}
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.2}
        onDragEnd={handleDragEnd}
        dragDirectionLock
      >
        <button
          onClick={onClose}
          className="absolute top-6 right-6 p-2 rounded-full hover:bg-white/10 transition-colors"
          aria-label="Close navigation"
        >
          <X className="w-6 h-6 text-white" strokeWidth={1.5} />
        </button>

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
      </motion.div>
    </>
  );
}; 