import React from 'react';
import { motion, useMotionValue, useTransform, animate } from 'framer-motion';
import { Connection } from './connections/connections-list';
import { Badge } from '@/pages/companion/badges';
import NavBarContainer from './navigation/NavBarContainer';
import { AnimatedBorder } from '@/components/ui/animated-border';
import Link from 'next/link';
import { ComponentType } from "react";
import { Registration } from '@/pages/companion';
import { useUserRegistration } from '@/pages/companion';

interface CompanionHomeProps {
  ChildComponent: ComponentType<any>;
}

const Counter = ({ value }: { value: number }) => {
  const count = useMotionValue(value <= 10 ? value : 0);
  const rounded = useTransform(count, (latest) => Math.round(latest));

  React.useEffect(() => {
    if (value <= 10) {
      count.set(value);
      return;
    }

    const animation = animate(count, value, {
      type: "spring",
      stiffness: 100,
      damping: 30,
      restDelta: 0.001,
      onComplete: () => {
        // Ensure we land exactly on the target number
        count.set(value);
      }
    });

    return animation.stop;
  }, [value]);

  return (
    <div style={{ display: "inline-block" }}>
      <motion.span>{rounded}</motion.span>
    </div>
  );
};

const WrappedBanner = () => {
  return (
    <Link href="/companion/wrapped" className="block w-full">
      <AnimatedBorder className="w-full" padding="0px">
        <div className="relative w-full h-[300px] rounded-[11px] overflow-hidden bg-gradient-to-br from-[#030B13] to-[#1E3A8A] cursor-pointer transform transition-transform hover:scale-[1.02]">
          {/* Video Background */}
          <div className="absolute inset-0">
            <video
              autoPlay
              loop
              muted
              playsInline
              className="w-full h-full object-cover opacity-60"
            >
              <source
                src="/videos/wrapped-bg.mp4"
                type="video/mp4"
              />
            </video>
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
          </div>
          
          {/* Content */}
          <div className="relative z-10 h-full flex flex-col justify-between items-center text-center p-8">
            <div /> {/* Empty div for spacing */}
            <div className="space-y-2">
              <div className="text-lg font-bold text-white">Your <span className="text-[#ADCAF5]">Blue</span>Print Wrapped</div>
              <p className="text-white/80">Check out how you got your start.</p>
            </div>
            <button className="bg-[#4B9CFF] hover:bg-[#3B7FFF] text-white w-fit px-8 py-3 rounded-full font-medium transition-colors">
              Let&apos;s go
            </button>
          </div>
        </div>
      </AnimatedBorder>
    </Link>
  );
};

const CompanionHome: React.FC<CompanionHomeProps> = ({
  ChildComponent
}) => {

  const { userRegistration } = useUserRegistration();
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

  return (
    <NavBarContainer isPartner={userRegistration?.isPartner} userName={`${userRegistration?.basicInformation?.fname} ${userRegistration?.basicInformation?.lname}`}>
      <ChildComponent />
    </NavBarContainer>
  );
};

export default CompanionHome; 