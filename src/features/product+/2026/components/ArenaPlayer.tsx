import {
  useEffect,
  useRef,
  useState,
  type ComponentType,
  type SVGProps,
} from "react";
import { Pause } from "lucide-react";
import PlayAsset from "@/assets/2026/product+/arena-play.svg";
import PlayOrbAsset from "@/assets/2026/product+/arena-play-orb.svg";
import PrevAsset from "@/assets/2026/product+/arena-prev.svg";
import NextAsset from "@/assets/2026/product+/arena-next.svg";
import { youtubeVideoId, type AudienceSubmission } from "../arena";
import { cn } from "@/lib/utils";

type Svg = ComponentType<SVGProps<SVGSVGElement>>;
const Play = PlayAsset as unknown as Svg;
const PlayOrb = PlayOrbAsset as unknown as Svg;
const Prev = PrevAsset as unknown as Svg;
const Next = NextAsset as unknown as Svg;

interface YouTubePlayer {
  playVideo(): void;
  pauseVideo(): void;
  seekTo(seconds: number, allowSeekAhead: boolean): void;
  getCurrentTime(): number;
  getDuration(): number;
  getIframe(): HTMLIFrameElement;
  destroy(): void;
}
interface YouTubeAPI {
  Player: new (
    element: HTMLElement,
    options: {
      width: string;
      height: string;
      videoId: string;
      playerVars: Record<string, string | number>;
      events: {
        onReady(event: { target: YouTubePlayer }): void;
        onStateChange(event: { data: number }): void;
        onAutoplayBlocked(): void;
        onError(): void;
      };
    },
  ) => YouTubePlayer;
}
type YouTubeWindow = Window & {
  YT?: YouTubeAPI;
  onYouTubeIframeAPIReady?: () => void;
};

let apiPromise: Promise<YouTubeAPI> | undefined;
function loadYouTube(): Promise<YouTubeAPI> {
  const ytWindow = window as YouTubeWindow;
  if (ytWindow.YT?.Player) return Promise.resolve(ytWindow.YT);
  if (apiPromise) return apiPromise;
  apiPromise = new Promise<YouTubeAPI>((resolve, reject) => {
    const previous = ytWindow.onYouTubeIframeAPIReady;
    const timer = window.setTimeout(
      () => reject(new Error("YouTube did not load")),
      15000,
    );
    ytWindow.onYouTubeIframeAPIReady = () => {
      window.clearTimeout(timer);
      previous?.();
      if (ytWindow.YT) resolve(ytWindow.YT);
    };
    const script = document.createElement("script");
    script.src = "https://www.youtube.com/iframe_api";
    script.async = true;
    script.onerror = () => {
      window.clearTimeout(timer);
      script.remove();
      reject(new Error("YouTube could not load"));
    };
    document.head.appendChild(script);
  }).catch((error) => {
    apiPromise = undefined;
    throw error;
  });
  return apiPromise;
}

function timestamp(seconds: number) {
  const whole = Math.max(0, Math.floor(seconds));
  return `${Math.floor(whole / 60)}:${String(whole % 60).padStart(2, "0")}`;
}

export default function ArenaPlayer({
  team,
  position,
  total,
  pending,
  onPrevious,
  onNext,
  onFinished,
}: {
  team: AudienceSubmission;
  position: number;
  total: number;
  pending: boolean;
  onPrevious(): void;
  onNext(): void;
  onFinished(): void;
}) {
  const videoId = youtubeVideoId(team.video_url);
  const container = useRef<HTMLDivElement>(null);
  const player = useRef<YouTubePlayer>();
  const [started, setStarted] = useState(true);
  const [ready, setReady] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [error, setError] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    if (!started || !videoId || !container.current) return;
    let cancelled = false;
    let instance: YouTubePlayer | undefined;
    let readyTimer: number | undefined;
    const element = document.createElement("div");
    container.current.appendChild(element);
    void loadYouTube()
      .then((api) => {
        if (cancelled) return;
        readyTimer = window.setTimeout(() => {
          if (!cancelled) setError(true);
        }, 15000);
        instance = new api.Player(element, {
          width: "100%",
          height: "100%",
          videoId,
          playerVars: {
            autoplay: 1,
            controls: 0,
            playsinline: 1,
            rel: 0,
            origin: window.location.origin,
          },
          events: {
            onReady: ({ target }) => {
              window.clearTimeout(readyTimer);
              if (cancelled) return;
              player.current = target;
              target.getIframe().title = `${team.team_name} pitch video`;
              target.getIframe().allow =
                "autoplay; encrypted-media; fullscreen; picture-in-picture";
              setReady(true);
              setDuration(target.getDuration());
              target.playVideo();
            },
            onStateChange: ({ data }) => {
              if (!cancelled) setPlaying(data === 1);
            },
            onAutoplayBlocked: () => {
              // Keep the manual play control available when browser policy blocks playback.
              if (!cancelled) setPlaying(false);
            },
            onError: () => {
              if (!cancelled) setError(true);
            },
          },
        });
      })
      .catch(() => {
        if (!cancelled) setError(true);
      });
    return () => {
      cancelled = true;
      window.clearTimeout(readyTimer);
      player.current = undefined;
      instance?.destroy();
      element.remove();
    };
  }, [started, videoId, team.team_name]);

  useEffect(() => {
    if (!ready) return;
    const timer = window.setInterval(() => {
      setElapsed(player.current?.getCurrentTime() ?? 0);
      setDuration(player.current?.getDuration() ?? 0);
    }, 500);
    return () => window.clearInterval(timer);
  }, [ready]);

  function togglePlayback() {
    if (!started) setStarted(true);
    else if (playing) player.current?.pauseVideo();
    else player.current?.playVideo();
  }

  const unavailable = !videoId || error;
  return (
    <section className="relative flex w-full flex-col gap-2 overflow-hidden rounded-[36px] border-2 border-white/90 bg-[linear-gradient(180deg,rgba(219,229,255,0.9),rgba(242,244,255,0.9))] px-5 pb-3 pt-3 shadow-[0_16px_40px_rgba(97,80,184,0.28),inset_0_2px_3px_rgba(255,255,255,0.9)] backdrop-blur-[15px] max-[640px]:rounded-[28px] max-[640px]:px-3">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-[210px] rounded-b-[120px] bg-gradient-to-b from-white/70 to-transparent"
      />
      <header className="relative flex items-center justify-between gap-3">
        <h1
          id="arena-heading"
          className="min-w-0 break-words font-product-heading text-[24px] font-normal leading-8 max-[480px]:text-[20px]"
        >
          {team.team_name}
        </h1>
        <span className="shrink-0 rounded-full border-[1.5px] border-white/95 bg-white/70 px-4 py-2 font-semibold shadow-[0_4px_12px_rgba(97,80,184,0.15)] max-[480px]:px-3">
          Pitch {position}/{total}
        </span>
      </header>
      <div className="relative aspect-video w-full overflow-hidden rounded-[22px] border-2 border-white/90 bg-gradient-to-b from-[#29336b] to-[#735eb2] shadow-[inset_0_3px_10px_rgba(0,0,38,0.4)]">
        <div
          ref={container}
          className={cn(
            "absolute inset-0 [&>iframe]:h-full [&>iframe]:w-full",
            (!started || unavailable) && "hidden",
          )}
        />
        {!started && !unavailable ? (
          <>
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -left-1/4 top-2/3 h-[150px] w-[150%] rotate-[14deg] bg-gradient-to-r from-transparent via-white/20 to-transparent"
            />
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -left-1/4 top-1/2 h-14 w-[150%] rotate-[14deg] bg-gradient-to-r from-transparent via-white/[0.14] to-transparent"
            />
            <button
              type="button"
              onClick={togglePlayback}
              aria-label={`Play ${team.team_name} pitch`}
              className="absolute left-1/2 top-1/2 flex h-[84px] w-[84px] -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-2 border-white/80 bg-white/[0.28] shadow-[0_8px_20px_rgba(0,0,51,0.25),inset_0_2px_4px_rgba(255,255,255,0.7)] backdrop-blur-lg focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-white"
            >
              <Play aria-hidden="true" />
            </button>
          </>
        ) : null}
        {started && !ready && !unavailable ? (
          <p
            role="status"
            className="absolute inset-0 grid place-items-center text-white"
          >
            Loading pitch…
          </p>
        ) : null}
        {unavailable ? (
          <div
            role="status"
            className="absolute inset-0 flex flex-col items-center justify-center gap-4 p-6 text-center text-white"
          >
            <p>
              This pitch can’t be played here. You can continue to the next
              team.
            </p>
            {videoId ? (
              <a
                href={`https://www.youtube.com/watch?v=${videoId}`}
                target="_blank"
                rel="noreferrer"
                className="underline underline-offset-4"
              >
                Watch on YouTube
              </a>
            ) : null}
          </div>
        ) : null}
      </div>
      <div className="relative flex items-center gap-3 text-[13px] font-semibold tabular-nums">
        <span>{timestamp(elapsed)}</span>
        <input
          type="range"
          aria-label="Seek pitch video"
          aria-valuetext={`${timestamp(elapsed)} of ${timestamp(duration)}`}
          min={0}
          max={duration || 1}
          step={0.1}
          value={Math.min(elapsed, duration || 1)}
          disabled={!ready || unavailable}
          onChange={(event) => {
            const value = Number(event.target.value);
            player.current?.seekTo(value, true);
            setElapsed(value);
          }}
          className="h-[10px] min-w-0 flex-1 cursor-pointer appearance-none rounded-[5px] border-[1.5px] border-white/95 shadow-[inset_0_1px_3px_rgba(97,80,184,0.3)] disabled:cursor-default disabled:opacity-50 focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-[6px] focus-visible:outline-[#6150b8] [&::-webkit-slider-thumb]:size-[38px] [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:border-0 [&::-webkit-slider-thumb]:bg-[url('/assets/2026/productplus/arena-knob.svg')] [&::-webkit-slider-thumb]:bg-[length:38px_38px] [&::-webkit-slider-thumb]:bg-center [&::-webkit-slider-thumb]:bg-no-repeat [&::-moz-range-thumb]:size-[38px] [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:bg-[url('/assets/2026/productplus/arena-knob.svg')] [&::-moz-range-thumb]:bg-[length:38px_38px] [&::-moz-range-thumb]:bg-center [&::-moz-range-thumb]:bg-no-repeat"
          style={{
            background: `linear-gradient(to right, #6150b8 ${(elapsed / (duration || 1)) * 100}%, rgba(255,255,255,0.55) 0)`,
          }}
        />
        <span>{timestamp(duration)}</span>
      </div>
      <div className="relative flex items-center justify-center gap-3">
        <button
          type="button"
          onClick={onPrevious}
          disabled={position === 1 || pending}
          aria-label="Previous team"
          className="flex h-9 w-9 items-center justify-center rounded-full border-[1.5px] border-white/95 bg-white/60 shadow-[0_4px_12px_rgba(97,80,184,0.18)] disabled:opacity-40 focus-visible:outline focus-visible:outline-product-primary"
        >
          <Prev aria-hidden="true" />
        </button>
        <button
          type="button"
          onClick={togglePlayback}
          disabled={unavailable || (started && !ready)}
          aria-label={playing ? "Pause pitch" : "Play pitch"}
          className="relative h-12 w-12 rounded-full disabled:opacity-40 focus-visible:outline focus-visible:outline-product-primary"
        >
          <span className="pointer-events-none absolute -left-3.5 -top-2 origin-top-left scale-[0.7]">
            <PlayOrb aria-hidden="true" />
          </span>
          {playing ? (
            <span className="pointer-events-none absolute inset-0 flex items-center justify-center rounded-full bg-product-primary">
              <Pause size={22} className="text-white" aria-hidden="true" />
            </span>
          ) : null}
        </button>
        <button
          type="button"
          onClick={onNext}
          disabled={position === total || pending}
          aria-label="Next team"
          className={cn(
            "flex h-9 items-center justify-center rounded-full border-[1.5px] border-white/95 bg-white/60 shadow-[0_4px_12px_rgba(97,80,184,0.18)] disabled:opacity-40 focus-visible:outline focus-visible:outline-product-primary",
            team.has_voted && position < total
              ? "gap-1 px-3 text-[12px] font-semibold text-product-primary"
              : "w-9",
          )}
        >
          <Next aria-hidden="true" />
          {team.has_voted && position < total ? <span>Next team</span> : null}
        </button>
        {position === total ? (
          <button
            type="button"
            onClick={onFinished}
            disabled={pending}
            className="rounded-full border border-white/90 bg-white/70 px-3 py-2 text-[12px] font-semibold text-product-primary disabled:opacity-40 focus-visible:outline focus-visible:outline-product-primary"
          >
            Finish
          </button>
        ) : null}
      </div>
    </section>
  );
}
