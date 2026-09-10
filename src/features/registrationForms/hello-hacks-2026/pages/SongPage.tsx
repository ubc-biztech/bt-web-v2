import type { HHTrack, HHTrackId } from "../Definition";
import type { TrackPreview } from "../hooks/useTrackPreview";
import { ActionButton } from "../components/ActionButton";
import { BackButton } from "../components/BackButton";

type SongPageProps = {
  tracks: readonly HHTrack[];
  selectedTrack?: HHTrackId;
  preview: TrackPreview;
  onBack: () => void;
  onSelectTrack: (track: HHTrackId) => void;
  onContinue: () => void;
};

export function SongPage({
  tracks,
  selectedTrack,
  preview,
  onBack,
  onSelectTrack,
  onContinue,
}: SongPageProps) {
  return (
    <section data-step="song">
      <BackButton onClick={onBack} />
      <h1>Choose a song</h1>
      <p>What&apos;s playing while you build?</p>
      <ul>
        {tracks.map((track) => (
          <li key={track.id}>
            <button
              type="button"
              aria-pressed={selectedTrack === track.id}
              onClick={() => onSelectTrack(track.id)}
            >
              {track.title} — {track.artist}
            </button>
            <button type="button" onClick={() => preview.toggle(track.id)}>
              {preview.playingTrackId === track.id ? "Pause" : "Play"}
            </button>
          </li>
        ))}
      </ul>
      <ActionButton disabled={!selectedTrack} onClick={onContinue}>
        Continue
      </ActionButton>
    </section>
  );
}
