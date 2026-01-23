import { ArrowUpRight } from "lucide-react";
import { Kode_Mono, Libre_Baskerville } from "next/font/google";
import Link from "next/link";
import BluePrintLayout from "../layout/BluePrintLayout";
import BluePrintCard from "../components/BluePrintCard";
import BluePrintButton from "../components/BluePrintButton";
import { DynamicPageProps } from "@/constants/companion-events";
import { useQuizReport, useWrappedStats } from "@/queries/quiz";

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

// MBTI archetype data mapping
const MBTI_DATA: Record<
  string,
  { archetype: string; quote: string; description: string }
> = {
  INTJ: {
    archetype: "The Architect",
    quote: '"This code is messy. Let me refactor the entire infrastructure."',
    description:
      "You thrive in roles requiring deep technical expertise and strategic thinking. Ideal for backend engineering, systems architecture, and technical leadership.",
  },
  INTP: {
    archetype: "The Analyst",
    quote: '"Let me think about this problem from first principles."',
    description:
      "You excel at solving complex problems through analysis and innovation. Perfect for data science, research engineering, and algorithm development.",
  },
  ENTJ: {
    archetype: "The Commander",
    quote: "\"Here's the plan—let's execute and iterate.\"",
    description:
      "You're a natural leader who combines technical knowledge with strategic vision. Suited for engineering management, product leadership, and technical consulting.",
  },
  ENTP: {
    archetype: "The Innovator",
    quote: '"What if we approached this completely differently?"',
    description:
      "You thrive on innovation and challenging the status quo. Ideal for product management, startup founding, and emerging technology roles.",
  },
  INFJ: {
    archetype: "The Advocate",
    quote: '"How will this impact our users and team?"',
    description:
      "You blend technical skills with deep empathy. Perfect for UX engineering, developer experience, and roles bridging tech and human needs.",
  },
  INFP: {
    archetype: "The Idealist",
    quote: '"Technology should make the world better."',
    description:
      "You bring creativity and values to technical work. Suited for creative technology, social impact tech, and mission-driven organizations.",
  },
  ENFJ: {
    archetype: "The Mentor",
    quote: '"Let me help you grow and succeed."',
    description:
      "You excel at leading and developing others. Ideal for engineering management, developer relations, and technical training roles.",
  },
  ENFP: {
    archetype: "The Champion",
    quote: '"This could be amazing—let\'s make it happen!"',
    description:
      "You bring enthusiasm and creativity to every project. Perfect for product management, growth roles, and cross-functional leadership.",
  },
  ISTJ: {
    archetype: "The Inspector",
    quote: '"Let\'s follow best practices and do this right."',
    description:
      "You ensure quality and reliability in everything you build. Suited for QA engineering, DevOps, and infrastructure roles.",
  },
  ISFJ: {
    archetype: "The Protector",
    quote: '"I\'ll make sure this is stable and well-documented."',
    description:
      "You create reliable, maintainable systems. Ideal for site reliability engineering, technical documentation, and support engineering.",
  },
  ESTJ: {
    archetype: "The Executive",
    quote: '"Let\'s organize this and hit our milestones."',
    description:
      "You excel at organizing teams and delivering results. Perfect for project management, technical program management, and operations.",
  },
  ESFJ: {
    archetype: "The Consul",
    quote: '"How can we make this work better for everyone?"',
    description:
      "You build cohesive teams and collaborative environments. Suited for team leadership, customer success, and partnership roles.",
  },
  ISTP: {
    archetype: "The Craftsman",
    quote: '"Let me tinker with this until it works perfectly."',
    description:
      "You have hands-on expertise and practical problem-solving skills. Ideal for systems engineering, debugging, and performance optimization.",
  },
  ISFP: {
    archetype: "The Composer",
    quote: '"I want to create something beautiful and functional."',
    description:
      "You bring artistry to technical work. Perfect for frontend development, design engineering, and creative technology roles.",
  },
  ESTP: {
    archetype: "The Dynamo",
    quote: '"Let\'s ship it and iterate based on real feedback."',
    description:
      "You thrive in fast-paced environments with quick feedback loops. Suited for startup engineering, growth hacking, and sales engineering.",
  },
  ESFP: {
    archetype: "The Performer",
    quote: '"Let\'s make this engaging and delightful!"',
    description:
      "You create engaging experiences and energize teams. Ideal for developer advocacy, demos, and user-facing product roles.",
  },
};

// Map MBTI letter to trait name
const TRAIT_LABELS: Record<string, [string, string]> = {
  I: ["Introvert", "Independent"],
  E: ["Extrovert", "Collaborative"],
  N: ["Intuitive", "Visionary"],
  S: ["Sensing", "Practical"],
  T: ["Thinking", "Logical"],
  F: ["Feeling", "Empathetic"],
  J: ["Judging", "Structured"],
  P: ["Perceiving", "Flexible"],
};

function getTraitsFromMBTI(mbti: string): string[] {
  return mbti.split("").map((letter) => TRAIT_LABELS[letter]?.[0] ?? letter);
}

function getMBTIData(mbti: string) {
  return (
    MBTI_DATA[mbti] ?? {
      archetype: "The Professional",
      quote: '"Every challenge is an opportunity to grow."',
      description:
        "Your unique combination of traits makes you versatile across many tech roles.",
    }
  );
}

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
  const mbtiData = getMBTIData(mbti);
  const traits = getTraitsFromMBTI(mbti);

  return (
    <BluePrintLayout>
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
            {mbtiData.archetype}
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

        <BluePrintCard className="w-full max-w-sm gap-4 text-center">
          <p className="text-sm italic text-white/90">{mbtiData.quote}</p>
          <p className="text-xs leading-relaxed text-white/70">
            {mbtiData.description}
          </p>
        </BluePrintCard>

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
