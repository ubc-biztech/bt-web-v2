"use client";

import NavBarContainer from "@/components/companion/navigation/NavBarContainer";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  motion,
  useMotionValue,
  useTransform,
  animate,
  AnimatePresence,
} from "framer-motion";
import Image from "next/image";
import ExecsPhoto from "../../../assets/2025/blueprint/postExecs.jpg";
import NavbarLogo from "../../../assets/2025/blueprint/navbar_logo.png";
import { WRAPPED_BACKDROP_STYLE } from "@/constants/wrapped";

interface WrapUpProps {
  isPartner: boolean;
}

const WrapUp = ({ isPartner }: WrapUpProps) => {
  const [isTapped, setIsTapped] = useState(false);
  const router = useRouter();
  const opacity = useMotionValue(1);
  const scale = useMotionValue(1);
  const y = useMotionValue(0);

  const handleTap = () => {
    setIsTapped(true);
    animate(opacity, 0, { duration: 0.5 });
    animate(scale, 0.8, { duration: 0.5 });
    animate(y, 20, { duration: 0.5 });
    setTimeout(() => {
      router.push("/companion");
    }, 800);
  };

  return (
    <NavBarContainer isPartner={isPartner}>
      <motion.div
        className="min-h-screen flex flex-col items-center px-4 pb-6 space-y-6 cursor-pointer"
        onClick={handleTap}
        initial={{ opacity: 0, scale: 0.9, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        style={{
          ...WRAPPED_BACKDROP_STYLE,
          opacity,
          scale,
          y,
          paddingTop: "1rem",
        }} // Removes extra top space
        exit={{ opacity: 0, scale: 0.9, y: 10 }}
      >
        {/* Title */}
        <motion.h1 className="text-white text-4xl font-satoshi font-bold drop-shadow-[0_0_20px_#4488FF]">
          That&apos;s a wrap
        </motion.h1>

        {/* Click Prompt Text */}
        <motion.p
          className="text-white text-sm font-satoshi font-medium text-center"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          Click the photo to see more!
        </motion.p>

        {/* Exec Team Photo (Clickable) */}
        <a
          href="https://drive.google.com/drive/folders/1v_ebcvtWl1aWiLWyGvZPEQRhN0ZQSfYk"
          target="_blank"
          rel="noopener noreferrer"
          className="w-[80%] max-w-md"
        >
          <motion.div
            className="w-full rounded-lg overflow-hidden shadow-lg border-2 border-[#4488FF] cursor-pointer"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <Image
              src={ExecsPhoto}
              alt="Executive Team Photo"
              layout="responsive"
              width={800}
              height={400}
              className="rounded-lg"
            />
          </motion.div>
        </a>

        {/* Thanks Message */}
        <motion.p
          className="text-white text-lg font-satoshi font-medium text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
        >
          Thanks for coming to
        </motion.p>

        {/* BluePrint Logo */}
        <div className="relative w-60 h-20">
          <Image
            src={NavbarLogo}
            alt="BluePrint Logo"
            layout="fill"
            className="object-contain"
            priority
          />
        </div>

        {/* Final Goodbye Message */}
        <div className="w-full overflow-visible px-4">
          <motion.p
            className="font-satoshi text-white text-lg italic text-center whitespace-nowrap"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2 }}
          >
            Same time next year?
          </motion.p>
        </div>
      </motion.div>
    </NavBarContainer>
  );
};

export default WrapUp;
