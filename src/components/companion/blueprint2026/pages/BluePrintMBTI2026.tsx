import { ArrowUpRight } from "lucide-react";
import { Kode_Mono, Libre_Baskerville } from "next/font/google";
import BluePrintLayout from "../layout/BluePrintLayout";
import BluePrintCard from "../components/BluePrintCard";
import BluePrintButton from "../components/BluePrintButton";
import { DynamicPageProps } from "@/constants/companion-events";

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
  fontFamily:
    '"Satoshi Variable","Satoshi",var(--font-urbanist),sans-serif',
} as const;

const mockResult = {
  title: "Your Career Quiz Results",
  code: "TMSL",
  archetype: "The Architect",
  traits: ["Technical", "Maker", "Logic", "Scaler"],
  quote: "“This code is messy. Let me refactor the entire infrastructure.”",
  description:
    "You are suited for devops, backend specialist, site reliability engineer, and high-level system design roles.",
};

export default function BluePrintMBTI2026(_props: DynamicPageProps) {
  return (
    <BluePrintLayout>
      <div className="flex flex-col items-center text-center gap-6 px-2 pb-12 pt-6">
        <div className="flex flex-col items-center gap-3">
          <p
            className="text-[11px] uppercase tracking-[0.1em] text-white/70"
            style={satoshiStyle}
          >
            {mockResult.title}
          </p>
          <h1
            className={`${libre.className} text-[72px] sm:text-[90px] tracking-[0.1em] text-white`}
          >
            {mockResult.code}
          </h1>
          <p className={`${libre.className} text-sm italic text-white/80`}>
            {mockResult.archetype}
          </p>
          <div className="flex flex-wrap items-center justify-center gap-2">
            {mockResult.traits.map((trait) => (
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
          <p className="text-sm italic text-white/90">{mockResult.quote}</p>
          <p className="text-xs leading-relaxed text-white/70">
            {mockResult.description}
          </p>
        </BluePrintCard>

        <BluePrintButton className="px-5 py-2 text-xs">
          View Recommended Connections
          <ArrowUpRight size={14} />
        </BluePrintButton>
      </div>
    </BluePrintLayout>
  );
}
