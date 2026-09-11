import { useEffect, useRef, useState } from "react";
import { HH_TRACKS, type HHTrackId } from "../Definition";

const SOUND_KEY = "hello-hacks:sound:v1";

export type TrackPreview = {
  soundEnabled: boolean;
  toggle: () => void;
};

/** One looping soundtrack for the registration flow, with a saved sound preference. */
export function useTrackPreview(
  trackId: HHTrackId | undefined,
  active: boolean,
): TrackPreview {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const enabledRef = useRef(true);
  const startedRef = useRef(false);
  const [soundEnabled, setSoundEnabled] = useState(true);

  useEffect(() => {
    try {
      enabledRef.current = localStorage.getItem(SOUND_KEY) !== "off";
    } catch {
      // Playback still works when browser storage is unavailable.
    }
    setSoundEnabled(enabledRef.current);
    const audio = new Audio();
    audio.preload = "none";
    audio.loop = true;
    audioRef.current = audio;

    // Retry after a gesture if the browser blocked the initial autoplay attempt.
    const resume = () => {
      if (
        enabledRef.current &&
        startedRef.current &&
        audio.paused &&
        audio.src
      ) {
        void audio.play().catch(() => {});
      }
    };
    document.addEventListener("pointerup", resume);
    document.addEventListener("keydown", resume);
    return () => {
      document.removeEventListener("pointerup", resume);
      document.removeEventListener("keydown", resume);
      audio.pause();
      audio.removeAttribute("src");
      audio.load();
      audioRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (active) startedRef.current = true;
    const audio = audioRef.current;
    const track = HH_TRACKS.find(({ id }) => id === trackId);
    if (!audio || !track || !startedRef.current) return;
    if (audio.getAttribute("src") !== track.src) audio.src = track.src;
    if (enabledRef.current) {
      void audio.play().catch(() => {});
    } else {
      audio.pause();
    }
  }, [trackId, active]);

  function toggle() {
    const enabled = !enabledRef.current;
    enabledRef.current = enabled;
    setSoundEnabled(enabled);
    try {
      localStorage.setItem(SOUND_KEY, enabled ? "on" : "off");
    } catch {
      // Keep the preference in memory when storage is unavailable.
    }
    const audio = audioRef.current;
    if (audio) {
      if (enabled) void audio.play().catch(() => {});
      else audio.pause();
    }
  }

  return { soundEnabled, toggle };
}
