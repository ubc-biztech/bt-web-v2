import type { ReactNode } from "react";
import ArchitectMascot from "@/assets/2026/mis-night/architect_mascot.svg";
import DesignerMascot from "@/assets/2026/mis-night/designer_mascot.svg";
import EditIcon from "@/assets/2026/mis-night/edit_05.svg";
import LogicianMascot from "@/assets/2026/mis-night/logicion_mascot.svg";
import StrategistMascot from "@/assets/2026/mis-night/strategist_mascot.svg";
import VisionaryMascot from "@/assets/2026/mis-night/visionary_mascot.svg";
import type { MISCareerInterest } from "../Definition";
import { ActionButton } from "../components/ActionButton";
import { BackButton } from "../components/BackButton";

export const RSVP_CONTROL_CLASS =
  "h-[46px] w-full rounded-[12px] border-[1.5px] border-[#333333] bg-[#1A1A1A] px-4 text-[15px] font-bold leading-none text-[#DBDBDB] outline-none transition-colors placeholder:text-white/35 focus:border-[#98F3FF] focus:ring-2 focus:ring-[#98F3FF]/20";

export type RSVPField = {
  id: string;
  label: string;
  control: ReactNode;
  error?: string;
};

type RSVPPageProps = {
  fields: RSVPField[];
  profileName: string;
  careerInterest?: MISCareerInterest;
  stepLabel: string;
  submitting: boolean;
  onBack: () => void;
};

const MASCOT_BY_BLOCK = {
  "The Architect": ArchitectMascot,
  "The Designer": DesignerMascot,
  "The Logician": LogicianMascot,
  "The Strategist": StrategistMascot,
  "The Visionary": VisionaryMascot,
} satisfies Record<MISCareerInterest, typeof ArchitectMascot>;

function formatProfileTitle(name: string) {
  return name.trim() || "BizTech attendee";
}

function RSVPFieldRow({ field }: { field: RSVPField }) {
  return (
    <label className="block" htmlFor={field.id}>
      <span className="block text-[11px] font-[900] uppercase leading-none tracking-[1px] text-[#909090]">
        {field.label}
      </span>

      <span className="mt-2 block md:mt-1.5">{field.control}</span>

      {field.error ? (
        <span
          role="alert"
          className="mt-1.5 block text-[10px] font-medium leading-tight text-[#FF8A9E] md:text-[11px]"
        >
          {field.error}
        </span>
      ) : null}
    </label>
  );
}

export function RSVPPage({
  fields,
  profileName,
  careerInterest,
  stepLabel,
  submitting,
  onBack,
}: RSVPPageProps) {
  const Mascot = careerInterest ? MASCOT_BY_BLOCK[careerInterest] : null;

  return (
    <section
      data-step="rsvp"
      className="flex min-h-[100dvh] w-full flex-col px-6 pb-16 pt-10 md:px-20 md:py-20"
    >
      <div className="relative mx-auto flex w-full max-w-[422px] flex-1 flex-col md:max-w-[1003px]">
        <div className="flex items-center justify-between">
          <BackButton
            onClick={onBack}
            className="!size-11 !border-[1.5px] !border-[#2A2A2A]"
          />

          <span className="text-[13.872px] font-medium leading-none text-[#98F3FF]/60 md:text-[14px]">
            {stepLabel}
          </span>
        </div>

        <div className="mt-14 md:mt-8">
          <h1 className="text-[32.587px] font-black leading-tight text-[#98F3FF] md:text-[32px]">
            Confirm your RSVP details
          </h1>

          <p className="mt-[10px] text-[16.293px] font-normal leading-[1.4] text-[#DBDBDB] md:mt-3 md:max-w-[760px] md:text-[16px]">
            We found your BizTech profile!{" "}
            <span className="font-[900] text-[#98F3FF]">
              Please verify your pre-filled details to complete your RSVP for
              MIS Night.
            </span>
          </p>
        </div>

        <div className="mt-10 max-h-[560px] w-full max-w-[410px] flex-1 self-center overflow-x-hidden overflow-y-auto rounded-[24px] border-[1.5px] border-[#2A2A2A] bg-[#1C1C1C] p-6 shadow-[0_18px_60px_rgba(0,0,0,0.22)] md:mt-8 md:h-auto md:max-w-none md:flex-none">
          <div className="flex items-center gap-4 md:gap-4">
            {Mascot ? (
              <span className="flex size-[56px] shrink-0 items-center justify-center rounded-[28px] border-[1.5px] border-[#333333] bg-[#1A1A1A]">
                <Mascot
                  focusable="false"
                  aria-hidden="true"
                  className="max-h-[38px] max-w-[45px]"
                />
              </span>
            ) : null}

            <div className="min-w-0 flex-1">
              <p className="truncate text-[18px] font-[900] leading-tight text-white">
                {formatProfileTitle(profileName)}
              </p>

              {careerInterest ? (
                <p className="mt-[3px] text-[12px] font-[900] uppercase leading-none tracking-[1px] text-[#98F3FF]">
                  {careerInterest}
                </p>
              ) : null}
            </div>

            <span
              aria-hidden="true"
              className="flex size-8 shrink-0 items-center justify-center rounded-md text-white md:size-10"
            >
              <EditIcon
                focusable="false"
                aria-hidden="true"
                className="size-6 text-white [&_path]:stroke-current"
              />
            </span>
          </div>

          <div className="mt-4 h-px bg-[#2A2A2A] md:mt-5" />

          <div className="mt-5 grid grid-cols-1 gap-4 md:mt-5 md:grid-cols-2 md:gap-x-6 md:gap-y-4">
            {fields.map((field) => (
              <RSVPFieldRow key={field.id} field={field} />
            ))}
          </div>
        </div>

        <div className="mt-auto flex justify-center pt-14 md:mt-16 md:justify-end md:pt-0">
          <ActionButton
            type="submit"
            disabled={submitting}
            className="!h-[67px] !min-h-[67px] !w-full !max-w-[422px] !rounded-[25.067px] !py-5 !text-[22.56px] !font-[900] md:!w-[422px]"
          >
            {submitting ? (
              "Submitting..."
            ) : (
              <>
                <span className="md:hidden">Confirm</span>
                <span className="hidden md:inline">Confirm RSVP</span>
              </>
            )}
          </ActionButton>
        </div>
      </div>
    </section>
  );
}
