import { useState, type ComponentType, type SVGProps } from "react";
import { Input } from "@/components/ui/input";
import CopyIcon from "@/assets/2026/product+/copy.svg";
import {
  GlassCard,
  PageHeading,
  Pill,
  PreviewNotice,
  ProductButton,
} from "../components/ProductPlusUI";

type TeamPreview = "registration" | "created" | "members";
const Copy = CopyIcon as unknown as ComponentType<SVGProps<SVGSVGElement>>;
const sampleMembers = [
  { name: "Eliana Barbosa", initials: "EB" },
  { name: "Freya Darmadji", initials: "FD" },
  { name: "Evan Peng", initials: "EP" },
];

export default function MyTeamPage() {
  const [preview, setPreview] = useState<TeamPreview>("registration");
  const [teamName, setTeamName] = useState("");
  const [code, setCode] = useState("");
  const registration = preview === "registration";
  return (
    <div className="pt-12 max-[640px]:pt-0">
      <PageHeading
        title={registration ? "Create or join a team" : "My team"}
        description={
          registration
            ? "Create your team once, then share the code. Teammates join with that code."
            : undefined
        }
      />
      {registration ? (
        <div className="grid grid-cols-2 gap-6 pt-10 max-[1200px]:gap-4 max-[1200px]:pt-4 max-[960px]:grid-cols-1 max-[640px]:pt-0">
          <GlassCard className="flex flex-col gap-6 max-[1200px]:p-6">
            <Pill>One teammate does this</Pill>
            <div>
              <h2>Create a team</h2>
              <p className="mt-2 text-product-muted">
                You&apos;ll get a 6-digit code to share with everyone else.
              </p>
            </div>
            <label className="flex flex-col gap-2 font-semibold">
              Team name
              <Input
                className="h-14 min-h-14 w-full rounded-[16px] border border-[rgba(97,79,184,0.08)] bg-white/30 px-4 py-3 text-[14px] font-normal leading-5 text-product-ink shadow-[0_1px_2px_rgba(97,79,184,0.05)] placeholder:text-product-muted focus-visible:shadow-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-product-primary focus-visible:ring-0 focus-visible:ring-offset-0"
                value={teamName}
                onChange={(event) => setTeamName(event.target.value)}
                placeholder="e.g. Product-ive"
                autoComplete="off"
              />
            </label>
            <ProductButton
              className="mt-auto w-full"
              disabled
              aria-describedby="team-preview-note"
            >
              Create team
            </ProductButton>
          </GlassCard>
          <GlassCard className="flex flex-col gap-6 max-[1200px]:p-6">
            <Pill>Everyone else</Pill>
            <div>
              <h2>Join a team</h2>
              <p className="mt-2 text-product-muted">
                Got a code from your teammate? Enter it to join their team.
              </p>
            </div>
            <label
              className="flex flex-col gap-2 font-semibold"
              htmlFor="team-code"
            >
              Team code
            </label>
            <div className="relative -mt-4 focus-within:rounded-[18px] focus-within:outline focus-within:outline-2 focus-within:outline-offset-4 focus-within:outline-product-primary">
              <input
                id="team-code"
                aria-label="Six-digit team code"
                autoComplete="off"
                inputMode="numeric"
                maxLength={6}
                className="absolute z-[1] h-full w-full cursor-text border-0 bg-transparent text-transparent caret-transparent opacity-0"
                value={code}
                onChange={(event) =>
                  setCode(event.target.value.replace(/\D/g, "").slice(0, 6))
                }
              />
              <div
                aria-hidden="true"
                className="grid grid-cols-6 gap-3 max-[1200px]:gap-2 max-[640px]:gap-[6px]"
              >
                {Array.from({ length: 6 }, (_, index) => (
                  <span
                    key={index}
                    className="flex h-[72px] items-center justify-center rounded-[18px] border border-white/70 bg-white/60 text-[20px] text-product-muted shadow-[0_8px_28px_rgba(97,80,184,0.08)] max-[1200px]:h-16 max-[640px]:h-14"
                  >
                    {code[index] || "–"}
                  </span>
                ))}
              </div>
            </div>
            <ProductButton
              className="mt-auto w-full"
              disabled
              aria-describedby="team-preview-note"
            >
              Join team
            </ProductButton>
          </GlassCard>
        </div>
      ) : (
        <GlassCard className="mx-auto mt-4 flex max-w-[800px] flex-col items-start gap-6 max-[640px]:mt-0">
          <div className="flex w-full items-start justify-between gap-6 max-[960px]:flex-wrap">
            <div>
              <h2>Product-ive</h2>
              <p className="mt-2 text-product-muted">
                {preview === "created"
                  ? "Share the code with your teammates."
                  : "Share this code so teammates can join."}
              </p>
            </div>
            <div className="flex items-center gap-5 rounded-[24px] border-[1.5px] border-[rgba(97,79,184,0.45)] bg-product-lavender px-5 py-[14px] max-[1200px]:gap-3 max-[1200px]:p-3">
              <div className="flex flex-col gap-[2px]">
                <span className="text-[11px] text-product-muted">
                  Team Code
                </span>
                <strong className="font-product-heading text-[32px] font-normal leading-10 tracking-[1.92px] text-product-primary">
                  004218
                </strong>
              </div>
              <ProductButton
                variant="secondary"
                disabled
                className="min-h-[34px] gap-[6px] bg-[rgba(97,79,184,0.12)] px-3 py-2 text-[13px] shadow-none"
              >
                <Copy aria-hidden="true" />
                Tap to copy
              </ProductButton>
            </div>
          </div>
          <ul className="m-0 flex w-full list-none flex-col gap-3 p-0">
            {sampleMembers
              .slice(0, preview === "created" ? 1 : 3)
              .map((member, index) => (
                <li
                  key={member.name}
                  className="flex min-h-[72px] items-center gap-4 rounded-[16px] border border-[rgba(97,79,184,0.16)] bg-white/60 px-4 py-3 max-[640px]:gap-[10px] max-[640px]:p-[10px]"
                >
                  <span className="flex h-10 w-10 shrink-0 grow-0 basis-10 items-center justify-center rounded-full bg-product-lavender text-[14px] font-semibold text-product-ink">
                    {member.initials}
                  </span>
                  <strong className="flex-1">{member.name}</strong>
                  {index === 0 ? (
                    <Pill className="min-w-[104px] max-[640px]:min-w-0">
                      Leader
                    </Pill>
                  ) : (
                    <ProductButton
                      variant="secondary"
                      disabled
                      className="max-[640px]:min-h-10 max-[640px]:px-3 max-[640px]:py-2"
                    >
                      Remove
                    </ProductButton>
                  )}
                </li>
              ))}
          </ul>
          <ProductButton variant="secondary" disabled>
            Leave team
          </ProductButton>
        </GlassCard>
      )}
      <div className="mt-8 flex flex-wrap items-center gap-x-3 gap-y-2 text-[12px] text-product-muted">
        <label htmlFor="team-preview">Preview screen</label>
        <select
          id="team-preview"
          value={preview}
          className="rounded-[12px] border border-[rgba(97,79,184,0.16)] bg-white/70 px-3 py-[6px] text-product-ink"
          onChange={(event) => setPreview(event.target.value as TeamPreview)}
        >
          <option value="registration">Create or join</option>
          <option value="created">Team created</option>
          <option value="members">Team with members</option>
        </select>
        <div id="team-preview-note" className="basis-full">
          <PreviewNotice>
            Team registration is coming soon. This preview does not create,
            join, or change a team.
          </PreviewNotice>
        </div>
      </div>
    </div>
  );
}
