import { ArrowUpRight } from "lucide-react";
import { Kode_Mono, Libre_Baskerville } from "next/font/google";
import Link from "next/link";
import BluePrintLayout from "../layout/BluePrintLayout";
import BluePrintCard from "../components/BluePrintCard";
import BluePrintButton from "../components/BluePrintButton";
import { DynamicPageProps } from "@/constants/companion-events";
import { useQuizReport, useWrappedStats } from "@/queries/quiz";
import { getQuizTypeDisplay } from "@/util/quizType";

const libre = Libre_Baskerville({
  subsets: ["latin"],
  weight: ["400", "700"],
  style: ["normal", "italic"],
});

const kode = Kode_Mono({
  subsets: ["latin"],
  weight: ["400"],
});

const satoshiStyle = {
  fontFamily: '"Satoshi Variable","Satoshi",var(--font-urbanist),sans-serif',
} as const;

export default function BluePrintMBTI2026({ eventId, year }: DynamicPageProps) {
  const { data: quizReport, isLoading, error } = useQuizReport();

  const { data: wrappedStats } = useWrappedStats(quizReport?.mbti);

  // Loading state
  if (isLoading) {
    return (
      <BluePrintLayout>
        <div className="flex flex-col items-center justify-center text-center gap-6 px-2 pb-12 pt-6 min-h-[60vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
          <p className="text-white/70">Loading your results...</p>
        </div>
      </BluePrintLayout>
    );
  }

  // No quiz results found
  if (!quizReport || error) {
    return (
      <BluePrintLayout>
        <div className="flex flex-col items-center justify-center text-center gap-6 px-2 pb-12 pt-6 min-h-[60vh]">
          <h2 className={`${libre.className} text-2xl text-white`}>
            No Quiz Results Found
          </h2>
          <p className="text-white/70 max-w-sm">
            You haven&apos;t taken the career quiz yet. Complete the quiz to
            discover your professional archetype!
          </p>
          <Link href={`/events/${eventId}/${year}/companion`}>
            <BluePrintButton className="px-5 py-2 text-xs">
              Back to Companion
              <ArrowUpRight size={14} />
            </BluePrintButton>
          </Link>
        </div>
      </BluePrintLayout>
    );
  }

  const mbti = quizReport.mbti;
  const typeDisplay = getQuizTypeDisplay(mbti);
  const traits = typeDisplay.traits;

  return (
    <BluePrintLayout>
      {/* Dark overlay for better readability */}
      <div className="fixed inset-0 bg-black/40 pointer-events-none -z-10" />
      <div className="flex flex-col items-center text-center gap-6 px-2 pb-12 pt-6">
        <div className="flex flex-col items-center gap-3">
          <p
            className="text-[11px] uppercase tracking-[0.1em] text-white/70"
            style={satoshiStyle}
          >
            Your Career Quiz Results
          </p>
          <h1
            className={`${libre.className} text-[72px] sm:text-[90px] tracking-[0.1em] text-white`}
          >
            {mbti}
          </h1>
          <p className={`${libre.className} text-sm italic text-white/80`}>
            {typeDisplay.title}
          </p>
          <div className="flex flex-wrap items-center justify-center gap-2">
            {traits.map((trait) => (
              <span
                key={trait}
                className={`${kode.className} rounded-sm border border-white/35 bg-white/10 px-2 py-1 text-[10px] uppercase tracking-[0.2em] text-white/90`}
              >
                {trait}
              </span>
            ))}
          </div>
        </div>

        <BluePrintCard className="w-full max-w-sm gap-3 text-center">
          <p className="text-[11px] uppercase tracking-[0.1em] text-white/50">
            Vibe
          </p>
          <p className="text-sm italic text-white/90">{typeDisplay.vibe}</p>
        </BluePrintCard>

        <BluePrintCard className="w-full max-w-sm gap-3 text-center">
          <p className="text-xs leading-relaxed text-white/70">
            {typeDisplay.description}
          </p>
        </BluePrintCard>

        <BluePrintCard className="w-full max-w-sm gap-3 text-center">
          <p className="text-[11px] uppercase tracking-[0.1em] text-white/50">
            Superpower
          </p>
          <p className="text-sm font-medium text-white/90">
            {typeDisplay.superpower}
          </p>
        </BluePrintCard>

        {typeDisplay.roles.length > 0 && (
          <BluePrintCard className="w-full max-w-sm gap-3 text-center">
            <p className="text-[11px] uppercase tracking-[0.1em] text-white/50">
              Careers that fit you
            </p>
            <div className="flex flex-wrap items-center justify-center gap-2">
              {typeDisplay.roles.map((role) => (
                <span
                  key={role}
                  className="rounded-full border border-white/25 bg-white/5 px-3 py-1 text-xs text-white/80"
                >
                  {role}
                </span>
              ))}
            </div>
          </BluePrintCard>
        )}

        {wrappedStats && wrappedStats.totalResponses > 0 && (
          <BluePrintCard className="w-full max-w-sm gap-2 text-center">
            <p className="text-xs text-white/70">
              <span className="text-white font-medium">
                {wrappedStats.totalWithMbtiCount}
              </span>{" "}
              out of{" "}
              <span className="text-white font-medium">
                {wrappedStats.totalResponses}
              </span>{" "}
              attendees share your type
            </p>
            <p className="text-[10px] text-white/50">
              {(
                (wrappedStats.totalWithMbtiCount /
                  wrappedStats.totalResponses) *
                100
              ).toFixed(1)}
              % of participants
            </p>
          </BluePrintCard>
        )}

        <Link href={`/events/${eventId}/${year}/companion/connections`}>
          <BluePrintButton className="px-5 py-2 text-xs">
            View Recommended Connections
            <ArrowUpRight size={14} />
          </BluePrintButton>
        </Link>
      </div>
    </BluePrintLayout>
  );
}
