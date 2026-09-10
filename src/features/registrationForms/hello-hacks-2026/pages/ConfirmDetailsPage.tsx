import type { ReactNode } from "react";
import Image from "next/image";
import { ActionButton } from "../components/ActionButton";
import { BackButton } from "../components/BackButton";
import styles from "./ConfirmDetailsPage.module.css";

export type ConfirmDetailField = {
  id: string;
  label: string;
  control: ReactNode;
  error?: string;
};

type ConfirmDetailsPageProps = {
  fields: readonly ConfirmDetailField[];
  profileName: string;
  profilePronouns?: string;
  canContinue: boolean;
  onBack: () => void;
  onContinue: () => void;
  onEditFirstField?: () => void;
};

export function ConfirmDetailsPage({
  fields,
  profileName,
  profilePronouns,
  canContinue,
  onBack,
  onContinue,
  onEditFirstField,
}: ConfirmDetailsPageProps) {
  const displayName = profilePronouns
    ? `${profileName} (${profilePronouns})`
    : profileName;

  return (
    <section
      data-step="confirm-details"
      className={`${styles.desktop} relative min-h-screen overflow-hidden bg-[#f7f6f1] px-6 py-12 text-[#181818] sm:px-10 md:px-16 md:py-20 lg:px-20`}
    >
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage:
            "url('/assets/2026/hello-hacks/confirm-details/paper-texture.jpeg')",
        }}
      />

      <div className="relative z-10 mx-auto flex min-h-[calc(100vh-6rem)] w-full max-w-[760px] flex-col items-start justify-center gap-8 md:min-h-[calc(100vh-10rem)] md:gap-12">
        <header className="flex w-full flex-col items-start gap-3">
          <span className={styles.statusStrip} aria-hidden="true">
            <span>9:26</span>
            <Image
              src="/assets/2026/hello-hacks/confirm-details/mobile-status-icons.svg"
              alt=""
              width={94}
              height={24}
            />
          </span>
          <BackButton
            onClick={onBack}
            className="h-6 w-6 bg-[url('/assets/2026/hello-hacks/confirm-details/arrow-narrow-left.svg')] bg-contain bg-center bg-no-repeat text-transparent"
          />
          <div className="flex w-full flex-col items-start gap-1">
            <h1 className="text-[36px] font-800 leading-[41.84px] text-[#181818]">
              Confirm your details
            </h1>
            <p className="max-w-[760px] text-base leading-6 text-[#3c3c3c]">
              We found your BizTech profile! Please verify your pre-filled
              details to complete your application.
            </p>
          </div>
        </header>

        <div className="w-full max-w-[376px] self-center rounded-[24px] bg-white p-6 shadow-[0_0_35px_rgba(0,0,0,0.1)] sm:max-w-[760px]">
          <div className="flex items-center justify-between gap-4">
            <div className="flex min-w-0 items-center gap-4">
              <span className="relative flex h-[60.9px] w-[60.9px] shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#78b3e9]">
                <Image
                  alt=""
                  src="/assets/2026/hello-hacks/confirm-details/bizbot-avatar.png"
                  width={38}
                  height={30}
                  className="h-[30px] w-[38px] object-contain"
                />
              </span>
              <p className="min-w-0 truncate text-lg font-800 leading-none text-[#181818]">
                {displayName}
              </p>
            </div>

            {onEditFirstField ? (
              <button
                type="button"
                onClick={onEditFirstField}
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-[url('/assets/2026/hello-hacks/confirm-details/edit-05.svg')] bg-[length:24px_24px] bg-center bg-no-repeat transition hover:bg-[#f7f6f1] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1094f7]/35"
                aria-label="Edit profile details"
              />
            ) : null}
          </div>

          <div className="mt-5 flex max-h-[384px] w-full flex-col gap-4 overflow-y-auto pr-1 sm:max-h-none sm:overflow-visible sm:pr-0">
            {fields.map((field) => (
              <label key={field.id} className="flex w-full flex-col gap-2">
                <span className="text-[13px] font-500 leading-none text-[#8e8e93]">
                  {field.label}
                </span>
                {field.control}
                {field.error ? (
                  <span role="alert" className="text-xs text-[#d9344e]">
                    {field.error}
                  </span>
                ) : null}
              </label>
            ))}
          </div>
        </div>

        <ActionButton
          disabled={!canContinue}
          onClick={onContinue}
          className="mx-auto h-[66px] w-full max-w-[292px] rounded-full border border-[#84ccff]/70 bg-[#1094f7] px-8 py-0 text-[22px] font-500 leading-none shadow-[inset_0_1px_2px_rgba(255,255,255,0.55),0_9px_18px_rgba(16,148,247,0.22)] transition hover:bg-[#008af0] disabled:cursor-not-allowed disabled:opacity-50"
        >
          Continue
        </ActionButton>
      </div>
    </section>
  );
}
