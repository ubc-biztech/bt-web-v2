"use client"
import { motion, useMotionValue, animate, AnimatePresence } from "framer-motion"
import { Users2 } from "lucide-react"
import { GradientText } from "@/components/ui/gradient-text"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { useState } from "react"
import NavBarContainer from "@/components/companion/navigation/NavBarContainer"
import Events from "../../../constants/companion-events"

interface WrappedPageProps {
  isPartner: boolean;
}

const WrappedPage = ({ isPartner }: WrappedPageProps) => {
  const router = useRouter()
  const [isTapped, setIsTapped] = useState(false)

  const opacity = useMotionValue(1)
  const scale = useMotionValue(1)
  const y = useMotionValue(0)

  const handleTap = () => {
    setIsTapped(true)
    animate(opacity, 0, { duration: 0.5 })
    animate(scale, 0.8, { duration: 0.5 })
    animate(y, 20, { duration: 0.5 })
    setTimeout(() => {
      router.push("/companion/wrapped/bpSummary")
    }, 800)
  }

  return (
    <NavBarContainer isPartner={isPartner}>
      <AnimatePresence>
        <motion.div
          className="min-h-screen bg-gradient-to-b from-[#040C12] to-[#030608] flex flex-col items-center justify-between p-6 cursor-pointer"
          onClick={handleTap}
          style={{ opacity, scale, y }}
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ duration: 0.5 }}
        >


          {/* Main Content */}
          <motion.div
            className="flex-1 flex flex-col items-center justify-center -mt-20"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="relative w-[200px] h-[200px] flex items-center justify-center mb-4">
              {/* Glow effect behind the logo */}
              <motion.div
                className="absolute inset-0 rounded-full bg-[#4488FF] blur-[60px] opacity-20"
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.2, 0.3, 0.2],
                }}
                transition={{
                  duration: 4,
                  repeat: Number.POSITIVE_INFINITY,
                  ease: "easeInOut",
                }}
              />

              {/* Top-left bowtie */}
              <motion.div
                className="absolute top-1/4 -left-8 -rotate-45 z-10 scale-125"
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1.25 }}
                transition={{ delay: 0.3 }}
              >
                <div className="relative">
                  <div className="w-16 h-4 bg-[#4488FF] rounded-full shadow-[0_0_15px_#4488FF] transform -skew-x-12" />
                  <div className="w-10 h-16 bg-[#4488FF] rounded-full absolute -right-2 -top-6 shadow-[0_0_15px_#4488FF] transform -skew-x-12" />
                  <div className="w-4 h-10 bg-[#4488FF] rounded-full absolute left-3 top-0 shadow-[0_0_15px_#4488FF]" />
                </div>
              </motion.div>

              {/* Bottom-right bowtie */}
              <motion.div
                className="absolute bottom-1/4 -right-8 rotate-135 z-10 scale-125"
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1.25 }}
                transition={{ delay: 0.3 }}
              >
                <div className="relative">
                  <div className="w-16 h-4 bg-[#4488FF] rounded-full shadow-[0_0_15px_#4488FF] transform -skew-x-12" />
                  <div className="w-10 h-16 bg-[#4488FF] rounded-full absolute -right-2 -top-6 shadow-[0_0_15px_#4488FF] transform -skew-x-12" />
                  <div className="w-4 h-10 bg-[#4488FF] rounded-full absolute left-3 top-0 shadow-[0_0_15px_#4488FF]" />
                </div>
              </motion.div>

              {/* Logo container with rotation */}
              <motion.div
                className="relative w-full h-full flex items-center justify-center"
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
              >
                {/* Circle behind logo */}
                <div className="absolute inset-0 border-2 border-[#4488FF] rounded-full shadow-[0_0_20px_#4488FF]" />

                {/* Logo */}
                <Image
                  src={Events[0].options.BiztechLogo || "/placeholder.svg"}
                  alt={`${Events[0].options.title} Logo`}
                  width={1000}
                  height={400}
                  quality={100}
                  className="w-3/5 relative drop-shadow-[0_0_15px_#4488FF]"
                  priority
                />
              </motion.div>
            </div>

            <div className="text-center space-y-1">
              <motion.h1
                className="text-white text-6xl font-bold tracking-tight drop-shadow-[0_0_20px_#4488FF]"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
              >
                <span style={{ color: "#4488FF" }}>Blue</span>
                <span className="text-white">Print</span>
              </motion.h1>
              <motion.p
                className="text-white text-3xl italic font-serif drop-shadow-[0_0_20px_#4488FF]"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
              >
                Wrapped
              </motion.p>
            </div>
          </motion.div>

          {/* Footer */}
          <motion.div
            className="flex flex-col items-center gap-3 mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1 }}
          >
            <motion.div
              className="w-12 h-12 flex items-center justify-center"
              style={{ filter: "drop-shadow(0px 0px 15px rgba(208, 234, 255, 0.75))" }}
              animate={{ y: [0, -10, 0] }}
              transition={{
                duration: 2,
                repeat: Number.POSITIVE_INFINITY,
                ease: "easeInOut",
              }}
            >
              <svg width="124" height="148" viewBox="0 0 124 148" fill="none" xmlns="http://www.w3.org/2000/svg">
                <g filter="url(#filter0_d_2664_29408)">
                  <path d="M41.952 50.1082C41.818 46.4282 43.956 39.1402 50.18 36.0962C52.748 34.5362 59.792 32.1202 66.528 36.4242C73.168 40.6642 73.616 46.9122 74.032 50.0642" stroke="white" stroke-width="6" stroke-linecap="round" stroke-linejoin="round" />
                  <path d="M82.6644 114.004C82.4804 107.46 82.8924 106.812 83.3724 105.356C83.8524 103.9 87.1964 98.6524 88.3804 94.9004C92.2124 82.7644 88.6404 80.1804 83.8804 76.7404C78.6004 72.9244 69.1044 71.0284 64.1644 71.4484V52.0924C64.1644 48.8004 61.0084 46.1044 57.6364 46.1044C54.2644 46.1044 51.1684 48.8004 51.1684 52.0924V85.3404L44.2884 79.3804C42.0524 77.0044 38.4564 76.7644 36.0004 78.9204C34.8808 79.892 34.1758 81.2554 34.0304 82.7304C33.8842 84.2055 34.3088 85.6805 35.2164 86.8524L39.7404 92.7084M39.7404 92.7084C40.7164 93.9484 41.8044 95.3484 43.0444 96.9884M39.7404 92.7084L43.0444 96.9884M39.7404 92.7084C37.7404 90.1724 36.2324 88.3284 34.9324 86.4964M50.9804 114.004V110.592C51.1284 106.380 47.9924 103.632 43.9044 98.1364L43.0444 96.9884M43.0444 96.9884L47.1364 102.292" stroke="white" stroke-width="6" stroke-linecap="round" stroke-linejoin="round" />
                </g>
                <defs>
                  <filter id="filter0_d_2664_29408" x="-16" y="-4" width="156" height="156" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
                    <feFlood flood-opacity="0" result="BackgroundImageFix" />
                    <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha" />
                    <feOffset />
                    <feGaussianBlur stdDeviation="15" />
                    <feComposite in2="hardAlpha" operator="out" />
                    <feColorMatrix type="matrix" values="0 0 0 0 0.813889 0 0 0 0 0.919352 0 0 0 0 1 0 0 0 0.75 0" />
                    <feBlend mode="hard-light" in2="BackgroundImageFix" result="effect1_dropShadow_2664_29408" />
                    <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_2664_29408" result="shape" />
                  </filter>
                </defs>
              </svg>


            </motion.div>
            <p className="text-white text-xl font-light">Tap to start.</p>
          </motion.div>
        </motion.div>

      </AnimatePresence>
    </NavBarContainer>
  )
}

export default WrappedPage