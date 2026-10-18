import { type CSSProperties } from "react";
import { createPortal } from "react-dom";
import { type VoteChoice } from "../arena";
import styles from "./ArenaVoteBurst.module.css";

// An irregular entrance order keeps the stream from forming diagonal rows.
const entranceOrder = [
  0, 23, 7, 28, 12, 31, 4, 19, 26, 9, 16, 2, 25, 14, 6, 21, 11, 30, 18, 3, 27,
  10, 22, 5, 15, 29, 8, 20, 1, 24, 13, 17,
];

const animationSpeed = 2;

const particles = entranceOrder.map((entry, index) => ({
  left: `${3 + (index / (entranceOrder.length - 1)) * 94}%`,
  size: `${28 + ((index * 11) % 28)}px`,
  delay: (entry * 32) / animationSpeed,
  duration: (2400 + (index % 5) * 120) / animationSpeed,
  swayDuration: (1600 + (index % 4) * 280) / animationSpeed,
  swayDelay: ((index % 6) * -250) / animationSpeed,
  drift: `${6 + (index % 5) * 2}px`,
  rotation: `${3 + (index % 4)}deg`,
}));

export const VOTE_BURST_DURATION_MS =
  Math.max(...particles.map(({ delay, duration }) => delay + duration)) +
  100 / animationSpeed;

export default function ArenaVoteBurst({ choice }: { choice: VoteChoice }) {
  const rising = choice === "accept";
  return createPortal(
    <div
      aria-hidden="true"
      className={styles.storm}
      style={
        {
          "--start-y": rising ? "calc(100vh + 64px)" : "-64px",
          "--end-y": rising ? "-64px" : "calc(100vh + 64px)",
        } as CSSProperties
      }
    >
      {particles.map((particle, index) => (
        <span
          key={index}
          className={styles.emoji}
          style={
            {
              "--left": particle.left,
              "--size": particle.size,
              "--delay": `${particle.delay}ms`,
              "--duration": `${particle.duration}ms`,
              "--sway-duration": `${particle.swayDuration}ms`,
              "--sway-delay": `${particle.swayDelay}ms`,
              "--drift": particle.drift,
              "--rotation": particle.rotation,
            } as CSSProperties
          }
        >
          <span className={styles.glyph}>{rising ? "👍" : "👎"}</span>
        </span>
      ))}
    </div>,
    document.body,
  );
}
