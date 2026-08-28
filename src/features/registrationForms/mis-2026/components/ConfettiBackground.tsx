import { motion, useReducedMotion } from "framer-motion";
import { useEffect, useState } from "react";
import BlueConfetti from "@/assets/2026/mis-night/blue_confetti.svg";
import GreenConfetti from "@/assets/2026/mis-night/green_confetti.svg";
import OrangeConfetti from "@/assets/2026/mis-night/orange_confetti.svg";
import PinkConfetti from "@/assets/2026/mis-night/pink_confetti.svg";
import PurpleConfetti from "@/assets/2026/mis-night/purple_confetti.svg";
import YellowConfetti from "@/assets/2026/mis-night/yellow_confetti.svg";

const CONFETTI_ASSETS = [
  BlueConfetti,
  GreenConfetti,
  OrangeConfetti,
  PinkConfetti,
  PurpleConfetti,
  YellowConfetti,
] as const;

type ConfettiPiece = {
  id: number;
  assetIndex: number;
  x: number;
  drift: number;
  duration: number;
  startingRotation: number;
  rotation: number;
  scale: number;
};

function randomBetween(minimum: number, maximum: number) {
  return minimum + Math.random() * (maximum - minimum);
}

export function ConfettiBackground() {
  const [pieces, setPieces] = useState<ConfettiPiece[]>([]);
  const shouldReduceMotion = useReducedMotion() ?? false;

  useEffect(() => {
    if (shouldReduceMotion) return;

    let nextId = 0;
    let spawnTimer: number | undefined;
    const cleanupTimers = new Set<number>();

    function scheduleNextPiece(delay = randomBetween(750, 1500)) {
      spawnTimer = window.setTimeout(() => {
        const duration = randomBetween(5.5, 8);
        const id = nextId++;
        const rotationDirection = Math.random() > 0.5 ? 1 : -1;

        setPieces((currentPieces) => [
          ...currentPieces.slice(-5),
          {
            id,
            assetIndex: Math.floor(Math.random() * CONFETTI_ASSETS.length),
            x: randomBetween(3, 97),
            drift: randomBetween(-70, 70),
            duration,
            startingRotation: randomBetween(0, 360),
            rotation: rotationDirection * randomBetween(360, 720),
            scale: randomBetween(0.85, 1.3),
          },
        ]);

        const cleanupTimer = window.setTimeout(
          () => {
            setPieces((currentPieces) =>
              currentPieces.filter((piece) => piece.id !== id),
            );
            cleanupTimers.delete(cleanupTimer);
          },
          duration * 1000 + 300,
        );

        cleanupTimers.add(cleanupTimer);
        scheduleNextPiece();
      }, delay);
    }

    scheduleNextPiece(randomBetween(700, 1500));

    return () => {
      if (spawnTimer !== undefined) {
        window.clearTimeout(spawnTimer);
      }

      cleanupTimers.forEach((timer) => window.clearTimeout(timer));
    };
  }, [shouldReduceMotion]);

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 z-0 overflow-hidden"
    >
      {pieces.map((piece) => {
        const ConfettiAsset = CONFETTI_ASSETS[piece.assetIndex];

        return (
          <motion.span
            key={piece.id}
            className="absolute top-0 block will-change-transform"
            style={{ left: `${piece.x}%`, scale: piece.scale }}
            initial={{
              x: 0,
              y: -32,
              rotate: piece.startingRotation,
              opacity: 0,
            }}
            animate={{
              x: [0, piece.drift * 0.35, piece.drift],
              y: "calc(100dvh + 48px)",
              rotate: piece.startingRotation + piece.rotation,
              opacity: [0, 1, 1, 1],
            }}
            transition={{
              duration: piece.duration,
              ease: "linear",
              opacity: { duration: 0.35 },
            }}
          >
            <ConfettiAsset focusable="false" />
          </motion.span>
        );
      })}
    </div>
  );
}
