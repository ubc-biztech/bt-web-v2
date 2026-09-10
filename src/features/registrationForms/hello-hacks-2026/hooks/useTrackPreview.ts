import { useEffect, useRef, useState } from "react";
import { HH_TRACKS, type HHTrackId } from "../Definition";

export type TrackPreview = {
  /** Track currently loaded into the audio element, if any. */
  playingTrackId?: HHTrackId;
  /** Toggles playback for a track, pausing whatever else was playing. */
  toggle: (trackId: HHTrackId) => void;
  stop: () => void;
};

/**
 * Owns a single <audio> element shared by every track on the song step, so the
 * styled player only has to render controls and call `toggle`.
 */
export function useTrackPreview(): TrackPreview {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [playingTrackId, setPlayingTrackId] = useState<HHTrackId>();

  useEffect(() => {
    const audio = new Audio();
    audio.preload = "none";
    audio.addEventListener("ended", () => setPlayingTrackId(undefined));
    audioRef.current = audio;

    return () => {
      audio.pause();
      audioRef.current = null;
    };
  }, []);

  function stop() {
    audioRef.current?.pause();
    setPlayingTrackId(undefined);
  }

  function toggle(trackId: HHTrackId) {
    const audio = audioRef.current;
    if (!audio) return;

    if (playingTrackId === trackId) {
      stop();
      return;
    }

    const track = HH_TRACKS.find(({ id }) => id === trackId);
    if (!track) return;

    audio.src = track.src;
    audio.currentTime = 0;
    void audio.play().catch(() => setPlayingTrackId(undefined));
    setPlayingTrackId(trackId);
  }

  return { playingTrackId, toggle, stop };
}
