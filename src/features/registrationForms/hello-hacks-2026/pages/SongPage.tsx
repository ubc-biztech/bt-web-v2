import Image from "next/image";
import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import type { HHTrack, HHTrackId } from "../Definition";
import type { TrackPreview } from "../hooks/useTrackPreview";
import { ActionButton } from "../components/ActionButton";
import { BackButton } from "../components/BackButton";
import styles from "./SongPage.module.css";

type SongPageProps = {
  tracks: readonly HHTrack[];
  selectedTrack?: HHTrackId;
  preview: TrackPreview;
  onBack: () => void;
  onSelectTrack: (track: HHTrackId) => void;
  onContinue: () => void;
};

const ASSETS = "/assets/2026/hello-hacks/song-player";

function SkipIcon({ previous = false }: { previous?: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width="20"
      height="20"
      fill="currentColor"
      aria-hidden="true"
      style={previous ? { transform: "rotate(180deg)" } : undefined}
    >
      <path d="M4 5v14l8-7V5l8 7-8 7v-7L4 5Zm16 0h2v14h-2z" />
    </svg>
  );
}

export function SongPage({
  tracks,
  selectedTrack,
  preview,
  onBack,
  onSelectTrack,
  onContinue,
}: SongPageProps) {
  const [direction, setDirection] = useState(1);
  const reduceMotion = useReducedMotion();
  const index = Math.max(
    0,
    tracks.findIndex(({ id }) => id === selectedTrack),
  );
  const track = tracks[index];
  if (!track) return null;

  function cycle(direction: number) {
    setDirection(direction);
    onSelectTrack(
      tracks[(index + direction + tracks.length) % tracks.length].id,
    );
  }

  return (
    <section
      data-step="song"
      className={styles.page}
      aria-labelledby="song-title"
    >
      <span aria-hidden="true" className={styles.statusStrip}>
        <span>9:26</span>
        <Image
          src="/assets/2026/hello-hacks/confirm-details/mobile-status-icons.svg"
          alt=""
          width={94}
          height={24}
        />
      </span>

      <div className={styles.backRow}>
        <BackButton onClick={onBack} className={styles.back} />
      </div>
      <header className={styles.header}>
        <h1 id="song-title">Choose a song</h1>
        <p className="text-black">What&apos;s playing while you build?</p>
      </header>
      <div className={styles.ipod}>
        <Image
          src={`${ASSETS}/ipod_body.svg`}
          alt=""
          fill
          priority
          className={styles.body}
        />
        <div className={styles.top}>
          <div className={styles.display}>
            <div className={styles.covers}>
              <AnimatePresence initial={false} custom={direction}>
                {[-1, 0, 1].map((offset) => {
                  const cover =
                    tracks[(index + offset + tracks.length) % tracks.length];
                  return (
                    <motion.div
                      key={cover.id}
                      className={styles.cover}
                      style={{ zIndex: offset === 0 ? 2 : 1 }}
                      custom={direction}
                      variants={{
                        enter: (travel: number) => ({
                          x: `${travel * 110}%`,
                          scale: 0.5,
                          rotate: travel * 16,
                        }),
                        exit: (travel: number) => ({
                          x: `${-travel * 160}%`,
                          scale: 0.5,
                          rotate: -travel * 16,
                          zIndex: 0,
                          transition: {
                            type: "tween",
                            duration: reduceMotion ? 0 : 0.14,
                            ease: "easeOut",
                          },
                        }),
                      }}
                      initial="enter"
                      animate={{
                        x: `${offset * 55}%`,
                        scale: offset === 0 ? 1 : 0.64,
                        rotate: offset * 8,
                      }}
                      exit="exit"
                      transition={
                        reduceMotion
                          ? { duration: 0 }
                          : {
                              type: "spring",
                              stiffness: 300,
                              damping: 30,
                            }
                      }
                    >
                      <Image
                        src={`${ASSETS}/album_cover_${cover.id.slice(-1)}.svg?v=3`}
                        unoptimized
                        alt={offset === 0 ? `${track.title} album cover` : ""}
                        fill
                        priority
                      />
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
            <div
              className={styles.caption}
              aria-live="polite"
              aria-atomic="true"
            >
              <p>{track.title}</p>
              <span>{track.artist}</span>
            </div>
          </div>
        </div>
        <div className={styles.bottom}>
          <div
            className={styles.wheel}
            role="group"
            aria-label="Music controls"
          >
            <Image src={`${ASSETS}/outerwheel.svg`} alt="" fill priority />
            <span className={styles.menu}>MENU</span>
            <button
              type="button"
              className={styles.previousButton}
              aria-label="Previous song"
              onClick={() => cycle(-1)}
            >
              <SkipIcon previous />
            </button>
            <button
              type="button"
              className={styles.nextButton}
              aria-label="Next song"
              onClick={() => cycle(1)}
            >
              <SkipIcon />
            </button>
            <button
              type="button"
              className={styles.playButton}
              aria-label={
                preview.soundEnabled ? "Turn music off" : "Turn music on"
              }
              aria-pressed={preview.soundEnabled}
              onClick={preview.toggle}
            >
              <svg
                viewBox="0 0 24 24"
                width="22"
                height="22"
                fill="currentColor"
                aria-hidden="true"
              >
                <path d="M4 5v14l10-7L4 5Zm11 0h3v14h-3zm5 0h3v14h-3z" />
              </svg>
            </button>
          </div>
        </div>
      </div>
      <ActionButton className={styles.continue} onClick={onContinue}>
        Continue
      </ActionButton>
    </section>
  );
}
