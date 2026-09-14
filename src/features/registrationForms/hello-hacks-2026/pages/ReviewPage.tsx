import Image from "next/image";
import type { ReactNode } from "react";
import type { HHEditableStep } from "../flow";
import { ActionButton } from "../components/ActionButton";
import { BackButton } from "../components/BackButton";

const ASSETS = "/assets/2026/hello-hacks/confirm-details";

export type ReviewRow = {
  key: string;
  label: string;
  value: string;
  step: HHEditableStep;
  /** Rendered in place of `value` — the avatar row shows art, not text. */
  media?: ReactNode;
};

type ReviewPageProps = {
  rows: readonly ReviewRow[];
  submitting: boolean;
  onBack: () => void;
  onEdit: (step: HHEditableStep) => void;
};

export function ReviewPage({
  rows,
  submitting,
  onBack,
  onEdit,
}: ReviewPageProps) {
  return (
    <section
      data-step="review"
      className="relative min-h-screen overflow-hidden bg-[#f7f6f1] px-[var(--hh-step-pad-x)] pb-12 pt-[var(--hh-step-pad-top)] font-sf tracking-normal text-[#181818] sm:px-10 md:px-16 md:pb-16 md:pt-[var(--hh-step-pad-top-lg)] lg:px-20"
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

      <div className="relative z-10 mx-auto flex w-full max-w-[var(--hh-step-column)] flex-col gap-8 md:gap-10">
        <header className="flex w-full flex-col items-start gap-[var(--hh-status-gap)]">
          <span
            aria-hidden="true"
            className="flex h-[var(--hh-status-height)] w-full items-center justify-between text-[16.774px] font-600 leading-[var(--hh-status-height)] text-[#20386a] md:hidden"
          >
            <span>9:26</span>
            <Image
              src={`${ASSETS}/mobile-status-icons.svg`}
              alt=""
              width={94}
              height={24}
            />
          </span>

          <BackButton
            onClick={onBack}
            className="h-[var(--hh-back-size)] w-[var(--hh-back-size)] bg-[url('/assets/2026/hello-hacks/confirm-details/arrow-narrow-left.svg')] bg-contain bg-center bg-no-repeat text-transparent"
          />

          <div className="flex w-full flex-col items-start gap-1">
            <h1 className="text-[32px] font-700 leading-[38px] text-[#181818] md:text-[36px] md:leading-[41.84px]">
              Review
            </h1>
            <p className="text-base font-400 leading-6 text-[#3c3c3c]">
              Please take one last look before submitting.
            </p>
          </div>
        </header>

        <dl className="w-full divide-y divide-[#ececec] overflow-hidden rounded-[16px] bg-white shadow-[0_0_35px_rgba(0,0,0,0.08)]">
          {rows.map((row) => (
            <div
              key={row.key}
              className="flex items-center justify-between gap-4 px-5 py-4 md:px-6"
            >
              <div className="flex min-w-0 flex-col gap-1">
                <dt className="text-[13px] font-500 leading-4 text-[#8e8e93]">
                  {row.label}
                </dt>
                <dd className="m-0 min-w-0">
                  {row.media ?? (
                    <span className="block truncate text-base font-500 leading-5 text-[#181818]">
                      {row.value}
                    </span>
                  )}
                </dd>
              </div>

              <button
                type="button"
                onClick={() => onEdit(row.step)}
                className="shrink-0 rounded text-sm font-400 text-[#1094f7] transition hover:text-[#008af0] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1094f7] focus-visible:ring-offset-2"
              >
                Edit
                <span className="sr-only"> {row.label}</span>
              </button>
            </div>
          ))}
        </dl>

        <ActionButton
          type="submit"
          disabled={submitting}
          className="mx-auto h-[66px] w-full max-w-[292px] rounded-full border border-[#64b5ff] bg-[linear-gradient(180deg,#307bf2,#328bfc)] px-8 py-0 text-[22px] font-400 leading-6 shadow-[inset_0_1px_2px_rgba(255,255,255,0.3),inset_0_-1px_2px_rgba(113,206,255,0.45)] transition disabled:cursor-not-allowed disabled:opacity-50"
        >
          {submitting ? "Submitting..." : "Submit Application"}
        </ActionButton>
      </div>
    </section>
  );
}
