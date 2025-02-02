"use client";

import NavBarContainer from "@/components/companion/navigation/NavBarContainer";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { motion, useMotionValue, useTransform, animate, AnimatePresence } from 'framer-motion';
import Image from "next/image";
import ExecsPhoto from "../../../assets/2025/blueprint/postExecs.jpg";

interface WrapUpProps {
    isPartner: boolean;
}

const WrapUp = ({ isPartner }: WrapUpProps) => {
    const [isTapped, setIsTapped] = useState(false)
    const router = useRouter()
    const opacity = useMotionValue(1)
    const scale = useMotionValue(1)
    const y = useMotionValue(0)

    const handleTap = () => {
        setIsTapped(true)
        animate(opacity, 0, { duration: 0.5 })
        animate(scale, 0.8, { duration: 0.5 })
        animate(y, 20, { duration: 0.5 })
        setTimeout(() => {
            router.push("/companion")
        }, 800)
    }

    return (
        <NavBarContainer isPartner={isPartner}>
            <motion.div
                className="fixed inset-0 flex flex-col items-center justify-center bg-gradient-to-b from-[#040C12] to-[#030608] p-6 space-y-8 cursor-pointer"
                onClick={handleTap}
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                style={{ opacity, scale, y }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
            >
                {/* Title */}
                <motion.h1 className="text-white text-4xl font-bold drop-shadow-[0_0_20px_#4488FF]">
                    That&apos;s a wrap
                </motion.h1>

                {/* Exec Team Photo */}
                <motion.div
                    className="w-[80%] max-w-md rounded-lg overflow-hidden shadow-lg border-2 border-[#4488FF]"
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

                {/* Thanks Message */}
                <motion.p
                    className="text-white text-lg font-medium text-center"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8 }}
                >
                    Thanks for coming to
                </motion.p>

                {/* BluePrint Logo with STRONGER Glow */}
                <motion.h1
                    className="text-white text-5xl font-bold tracking-tight relative"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1 }}
                >
                    <motion.span
                        className="text-[#4488FF]"
                        animate={{
                            textShadow: [
                                "0px 0px 15px rgba(68, 136, 255, 0.7)",
                                "0px 0px 25px rgba(68, 136, 255, 1)",
                                "0px 0px 15px rgba(68, 136, 255, 0.7)",
                            ],
                        }}
                        transition={{
                            repeat: Infinity,
                            repeatType: "reverse",
                            duration: 2,
                            ease: "easeInOut",
                        }}
                    >
                        Blue
                    </motion.span>
                    <motion.span
                        className="text-white"
                        animate={{
                            textShadow: [
                                "0px 0px 10px rgba(255, 255, 255, 0.6)",
                                "0px 0px 20px rgba(255, 255, 255, 1)",
                                "0px 0px 10px rgba(255, 255, 255, 0.6)",
                            ],
                        }}
                        transition={{
                            repeat: Infinity,
                            repeatType: "reverse",
                            duration: 2,
                            ease: "easeInOut",
                        }}
                    >
                        Print
                    </motion.span>
                </motion.h1>

                {/* Final Goodbye Message */}
                <motion.p
                    className="text-white text-lg italic text-center"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.2 }}
                >
                    Same time next year?
                </motion.p>
            </motion.div>
        </NavBarContainer>
    );
};

export default WrapUp;
