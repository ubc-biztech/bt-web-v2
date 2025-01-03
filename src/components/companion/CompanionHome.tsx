import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar } from '@/components/ui/avatar';
import { ChevronRight, Menu, Home, Users, Trophy, User, Users2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import NavbarLogo from '@/assets/2025/blueprint/navbar_logo.png';

interface Badge {
  name: string;
  description: string;
}

interface Connection {
  id: string;
  name: string;
  role: string;
  avatarInitials: string;
  avatarColor?: string;
}

interface CompanionHomeProps {
  userName: string;
  connectionCount: number;
  badgeCount: number;
  badges: Badge[];
  recentConnections: Connection[];
}

const CompanionHome: React.FC<CompanionHomeProps> = ({
  userName,
  connectionCount,
  badgeCount,
  badges,
  recentConnections,
}) => {
  const [isSideNavOpen, setIsSideNavOpen] = useState(false);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: "easeOut"
      }
    }
  };

  const gradientStyle = {
    background: 'linear-gradient(-60deg, #87CEEB, #0055b3, #87CEEB, #003d80)',
    backgroundSize: '400% 400%',
    animation: 'nameGradient 6s ease infinite',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    display: 'inline-block',
    fontWeight: 700
  };

  return (
    <div className="relative flex flex-col min-h-screen bg-black text-white font-satoshi p-8">
      <style jsx global>{`
        @keyframes nameGradient {
          0% { background-position: 0% 50% }
          50% { background-position: 100% 50% }
          100% { background-position: 0% 50% }
        }
        
        @keyframes borderAnimation {
          0% { background-position: 0% 50% }
          50% { background-position: 100% 50% }
          100% { background-position: 0% 50% }
        }

        .animated-border {
          background: linear-gradient(
            90deg,
            rgba(255, 255, 255, 0.05) 0%,
            rgba(255, 255, 255, 0.1) 25%,
            rgba(255, 255, 255, 0.15) 50%,
            rgba(255, 255, 255, 0.1) 75%,
            rgba(255, 255, 255, 0.05) 100%
          );
          background-size: 200% 100%;
          animation: borderAnimation 10s linear infinite;
        }
      `}</style>

      {/* Header */}
      <motion.div 
        className="flex justify-between items-center p-6"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          duration: 0.6,
          ease: "easeOut",
          delay: 0.1
        }}
      >
        <div className="relative w-32 h-8">
          <Image
            src={NavbarLogo}
            alt="BluePrint Logo"
            fill
            className="object-contain"
            priority
          />
        </div>
        <button 
          onClick={() => setIsSideNavOpen(true)}
          className="p-2 hover:bg-[#1C1C1C] rounded-lg transition-colors"
        >
          <Menu className="w-6 h-6 text-white" />
        </button>
      </motion.div>

      {/* Side Navigation */}
      <div 
        className={cn(
          "fixed inset-0 bg-black/50 backdrop-blur-sm z-40 transition-opacity duration-300",
          isSideNavOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        onClick={() => setIsSideNavOpen(false)}
      />
      <div 
        className={cn(
          "fixed top-0 right-0 w-80 h-full bg-black/60 backdrop-blur-xl border-l border-white/10 z-50 transform transition-transform duration-300 ease-in-out",
          isSideNavOpen ? "translate-x-0" : "translate-x-full"
        )}
      >
        {/* Center content vertically with flex */}
        <div className="flex flex-col justify-center h-full p-8">
          {/* Right-aligned logo */}
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
            <Link 
              href="/companion" 
              className="flex flex-row-reverse items-center gap-3 text-[22px] py-2 text-white hover:text-gray-300 transition-colors"
            >
              <span className="text-lg">↗</span>
              Home
            </Link>
            <Link 
              href="/companion/profile" 
              className="flex flex-row-reverse items-center gap-3 text-[22px] py-2 text-white hover:text-gray-300 transition-colors"
            >
              <span className="text-lg">↗</span>
              User Profile
            </Link>
            <Link 
              href="/companion/connections" 
              className="flex flex-row-reverse items-center gap-3 text-[22px] py-2 text-white hover:text-gray-300 transition-colors"
            >
              <span className="text-lg">↗</span>
              Connections
            </Link>
            <Link 
              href="/companion/companies" 
              className="flex flex-row-reverse items-center gap-3 text-[22px] py-2 text-white hover:text-gray-300 transition-colors"
            >
              <span className="text-lg">↗</span>
              Companies
            </Link>
            <Link 
              href="/companion/faq" 
              className="flex flex-row-reverse items-center gap-3 text-[22px] py-2 text-white hover:text-gray-300 transition-colors"
            >
              <span className="text-lg">↗</span>
              FAQ
            </Link>
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <motion.div 
        className="flex-1 px-2 pb-24 space-y-8"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Welcome Section */}
        <motion.div className="p-5 rounded-3xl" variants={itemVariants}>
          <div className="text-[28px] font-medium mb-3 text-white">
            Welcome, <span style={gradientStyle}>{userName}</span>
          </div>
          <div className="text-[#808080] text-[28px] font-satoshi flex items-center flex-wrap gap-x-2">
            You&apos;ve made 
            <span className="text-white font-medium font-satoshi inline-flex items-center gap-2">
              <Users2 className="w-6 h-6" strokeWidth={1.5} />
              {connectionCount} connections
            </span> 
            and collected{' '}
            <span className="text-white font-medium font-satoshi inline-flex items-center gap-2">
              <Trophy className="w-6 h-6" strokeWidth={1.5} />
              {badgeCount} badges
            </span> 
            so far.
          </div>
        </motion.div>

        {/* Badges Section */}
        <motion.div variants={itemVariants}>
          <div className="p-[1px] rounded-2xl animated-border">
            <Card className="bg-black rounded-2xl p-8">
              <div className="flex justify-between items-center mb-4">
                <p className="text-[22px] font-satoshi font-bold text-white">Badges</p>
                <Link href="/companion/badges">
                  <div className="p-[1px] rounded-full animated-border">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="relative text-white hover:bg-[#2A2A2A] transition-all rounded-full py-2.5 px-4 font-redhat tracking-wider text-xs font-[300] backdrop-blur-sm flex items-center gap-1.5 border border-white/40"
                    >
                      <span className="translate-y-[1px]">VIEW ALL</span>
                      <span className="text-base translate-y-[1px]">↗</span>
                    </Button>
                  </div>
                </Link>
              </div>
              <div className="space-y-3">
                {badges.map((badge, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    <span className="text-base mt-1 text-white">✦</span>
                    <div className="flex flex-col sm:flex-row sm:items-center w-full sm:justify-between gap-1">
                      <p className="text-sm font-medium text-white">{badge.name}</p>
                      <p className="text-[#808080] text-xs">{badge.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </motion.div>

        {/* Recent Connections Section */}
        <motion.div variants={itemVariants}>
          <div className="p-[1px] rounded-2xl animated-border">
            <Card className="bg-black rounded-2xl p-8">
              <div className="flex justify-between items-center mb-4">
                <span className="text-[22px] font-satoshi font-bold text-white">Recent Connections</span>
                <Link href="/companion/connections">
                  <div className="p-[1px] rounded-full animated-border">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="relative text-white hover:bg-[#2A2A2A] transition-all rounded-full py-2.5 px-4 font-redhat tracking-wider text-xs font-[300] backdrop-blur-sm flex items-center gap-1.5 border border-white/40"
                    >
                      <span className="translate-y-[1px]">VIEW ALL</span>
                      <span className="text-base translate-y-[1px]">↗</span>
                    </Button>
                  </div>
                </Link>
              </div>
              <div className="space-y-4">
                {recentConnections.map((connection, index) => (
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
                <p className="text-center text-[#808080] text-xs mt-2 font-redhat">+ 16 MORE</p>
              </div>
            </Card>
          </div>
        </motion.div>
      </motion.div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 w-[calc(100%-64px)] max-w-md">
        <div className="p-[1px] rounded-full animated-border">
          <div className="bg-black rounded-full p-4">
            <div className="flex justify-around items-center">
              <Link href="/companion" className="flex flex-col items-center text-white hover:text-gray-300 transition-colors">
                <Home className="w-8 h-8 mb-1" />
              </Link>
              <Link href="/companion/connections" className="flex flex-col items-center text-white hover:text-gray-300 transition-colors">
                <Users className="w-8 h-8 mb-1" />
              </Link>
              <Link href="/companion/badges" className="flex flex-col items-center text-white hover:text-gray-300 transition-colors">
                <Trophy className="w-8 h-8 mb-1" />
              </Link>
              <Link href="/companion/profile" className="flex flex-col items-center text-white hover:text-gray-300 transition-colors">
                <User className="w-8 h-8 mb-1" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompanionHome; 