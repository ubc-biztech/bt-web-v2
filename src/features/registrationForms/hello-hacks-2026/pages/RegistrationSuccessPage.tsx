import Link from "next/link";
import { resolveAvatar } from "../Definition";
import { AvatarBubble } from "../components/AvatarBubble";

const ASSETS = "/assets/2026/hello-hacks/confirm-details";

type RegistrationSuccessPageProps = {
  eventId: string;
  year: string;
  /** Avatar id from the success redirect; unrecognised values fall back. */
  avatar?: string | string[];
};

/**
 * Scattered confetti. Positions are hardcoded rather than random so the server
 * and client render the same thing — `Math.random()` here would hydrate dirty.
 * `left`/`top` are percentages, `r` is degrees.
 */
const CONFETTI = [
  { left: 8, top: 6, r: 24, color: "#4ade80" },
  { left: 15, top: 14, r: -38, color: "#60a5fa" },
  { left: 22, top: 4, r: 62, color: "#fb923c" },
  { left: 29, top: 17, r: -14, color: "#f472b6" },
  { left: 36, top: 8, r: 47, color: "#a78bfa" },
  { left: 43, top: 3, r: -55, color: "#facc15" },
  { left: 50, top: 12, r: 31, color: "#4ade80" },
  { left: 57, top: 6, r: -26, color: "#60a5fa" },
  { left: 64, top: 15, r: 58, color: "#ef4444" },
  { left: 71, top: 5, r: -41, color: "#a78bfa" },
  { left: 78, top: 11, r: 19, color: "#facc15" },
  { left: 86, top: 7, r: -63, color: "#f472b6" },
  { left: 11, top: 28, r: 52, color: "#fb923c" },
  { left: 25, top: 34, r: -21, color: "#60a5fa" },
  { left: 6, top: 44, r: 37, color: "#f472b6" },
  { left: 18, top: 52, r: -49, color: "#4ade80" },
  { left: 9, top: 66, r: 15, color: "#facc15" },
  { left: 23, top: 74, r: -33, color: "#a78bfa" },
  { left: 82, top: 30, r: 44, color: "#4ade80" },
  { left: 91, top: 48, r: -17, color: "#60a5fa" },
  { left: 76, top: 62, r: 29, color: "#fb923c" },
  { left: 88, top: 71, r: -57, color: "#f472b6" },
  { left: 40, top: 80, r: 23, color: "#facc15" },
  { left: 62, top: 84, r: -45, color: "#a78bfa" },
] as const;

/**
 * Route-level success screen for `/event/[eventId]/[year]/register/success`.
 * The registration page redirects here after a successful submit, so this — not
 * the in-flow `SuccessPage` step — is the screen applicants actually land on.
 */
export function HelloHacksRegistrationSuccessPage({
  eventId,
  year,
  avatar,
}: RegistrationSuccessPageProps) {
  const chosen = resolveAvatar(avatar);

  return (
    <section
      data-page="hello-hacks-success"
      aria-live="polite"
      className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#f7f6f1] px-6 py-16 text-[#181818]"
    >
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-cover bg-center md:hidden"
        style={{ backgroundImage: `url('${ASSETS}/paper-texture.jpeg')` }}
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 hidden bg-cover bg-center md:block"
        style={{ backgroundImage: `url('${ASSETS}/paper-desktop.png')` }}
      />

      <div aria-hidden="true" className="absolute inset-0 overflow-hidden">
        {CONFETTI.map((piece, index) => (
          <span
            key={index}
            className="absolute block h-[11px] w-[5px] rounded-[1px]"
            style={{
              left: `${piece.left}%`,
              top: `${piece.top}%`,
              backgroundColor: piece.color,
              transform: `rotate(${piece.r}deg)`,
            }}
          />
        ))}
      </div>

      <div className="relative z-10 flex w-full max-w-[420px] flex-col items-center text-center">
        <span className="flex h-[62px] w-[62px] items-center justify-center rounded-full bg-[#1b2a4a]">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="white"
            strokeWidth={2.5}
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-7 w-7"
            aria-hidden="true"
          >
            <path d="M4 12.5 9.5 18 20 7" />
          </svg>
        </span>

        <h1 className="mt-6 text-[32px] font-800 leading-[38px] text-[#181818] md:text-[36px] md:leading-[41.84px]">
          Application sent!
        </h1>

        <p className="mt-3 max-w-[340px] text-base leading-6 text-[#3c3c3c]">
          Thank you for applying to HelloHacks. We&apos;ll let you know your
          status by [date].
        </p>

        <div className="mt-8">
          <AvatarBubble
            color={chosen.color}
            size="clamp(140px, 30vw, 172px)"
            large
          />
        </div>

        <Link
          href={`/event/${eventId}/${year}`}
          className="mt-8 flex h-[66px] w-full max-w-[292px] items-center justify-center rounded-full border border-[#64b5ff] bg-[linear-gradient(180deg,#307bf2,#328bfc)] text-[22px] font-400 leading-none text-white shadow-[inset_0_1px_2px_rgba(255,255,255,0.3),inset_0_-1px_2px_rgba(113,206,255,0.45)] transition hover:brightness-[1.04] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1094f7] focus-visible:ring-offset-2"
        >
          View Application
        </Link>
      </div>
    </section>
  );
}
