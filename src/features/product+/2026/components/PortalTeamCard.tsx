import type { ComponentType, ReactNode, SVGProps } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import SubmittedCheckIcon from "@/assets/2026/product+/portal-submitted-check.svg";
import { useUserAttributes } from "@/queries/user";
import { PRODUCT_PLUS_COMPANION_PATH } from "../access";
import { getSubmission } from "../submission/api";
import { useProductPlusTeam, type Team } from "../team";
import { GlassCard, ProductButton } from "./ProductPlusUI";

const SubmittedCheck = SubmittedCheckIcon as unknown as ComponentType<
  SVGProps<SVGSVGElement>
>;
const TEAM_PATH = `${PRODUCT_PLUS_COMPANION_PATH}/myteam`;
const headingClass =
  "font-product-heading text-[24px] font-normal leading-[normal] tracking-[-0.6px] [overflow-wrap:anywhere]";

function TeamCardFrame({
  children,
  loading = false,
}: {
  children: ReactNode;
  loading?: boolean;
}) {
  return (
    <GlassCard
      aria-labelledby="portal-team-heading"
      aria-busy={loading}
      className="flex flex-col gap-[14px] rounded-[28px] p-6 shadow-[0_4px_20px_rgba(97,80,184,0.08),inset_0_1px_2px_rgba(255,255,255,0.65)] backdrop-blur-[14.5px] min-[641px]:rounded-[28px] min-[641px]:p-6"
    >
      {children}
    </GlassCard>
  );
}

function TeamLabel() {
  return (
    <p className="font-product-body text-[13px] font-semibold leading-[normal] tracking-[0.78px] text-product-muted">
      MY TEAM
    </p>
  );
}

function NoTeamCard() {
  return (
    <TeamCardFrame>
      <TeamLabel />
      <h2 id="portal-team-heading" className={headingClass}>
        No team yet
      </h2>
      <p className="text-[14px] leading-[normal] text-product-muted">
        Create a team or join one with the 6-digit code from a teammate.
      </p>
      <ProductButton asChild className="w-full">
        <Link href={TEAM_PATH}>Create or join a team</Link>
      </ProductButton>
    </TeamCardFrame>
  );
}

function TeamCardState({
  loading = false,
  retry,
}: {
  loading?: boolean;
  retry?: () => void;
}) {
  return (
    <TeamCardFrame loading={loading}>
      <TeamLabel />
      <h2 id="portal-team-heading" className={headingClass}>
        {loading ? "Loading your team…" : "We couldn’t load your team"}
      </h2>
      {loading ? (
        <p role="status" className="text-[14px] leading-5 text-product-muted">
          Checking your team details.
        </p>
      ) : (
        <>
          <p role="status" className="text-[14px] leading-5 text-product-muted">
            Please try again to see your team details.
          </p>
          <ProductButton
            type="button"
            variant="secondary"
            className="w-full"
            onClick={retry}
          >
            Try again
          </ProductButton>
        </>
      )}
    </TeamCardFrame>
  );
}

function initialsOf(name: string) {
  return (
    name
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part[0])
      .join("")
      .toUpperCase() || "?"
  );
}

function TeamDetails({
  email,
  team,
  refreshTeam,
}: {
  email: string;
  team: Team;
  refreshTeam: () => void;
}) {
  const submissionQuery = useQuery({
    queryKey: ["productplus", "submission", email, team.team_code],
    queryFn: getSubmission,
    retry: false,
    staleTime: 0,
    gcTime: 0,
    refetchOnWindowFocus: "always",
  });
  const submission = submissionQuery.isSuccess
    ? submissionQuery.data.submission
    : null;
  const matchingSubmission =
    submission?.team_code === team.team_code ? submission : null;
  const isSubmitted = Boolean(matchingSubmission?.submitted_at);
  const submissionMismatch = Boolean(submission && !matchingSubmission);
  const memberCount = team.members.length;

  return (
    <TeamCardFrame>
      <div className="flex min-h-[30px] items-center justify-between gap-2">
        <TeamLabel />
        {isSubmitted ? (
          <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-[#e8f5ed] pl-2.5 pr-3 py-1.5 text-[13px] leading-[18px] text-[#215c47]">
            <SubmittedCheck
              aria-hidden="true"
              width={14}
              height={14}
              className="shrink-0"
            />
            Submitted
          </span>
        ) : null}
      </div>
      <h2 id="portal-team-heading" className={headingClass}>
        {team.team_name}
      </h2>
      {matchingSubmission?.project_title ? (
        <p className="text-[14px] font-semibold leading-[normal] text-product-primary [overflow-wrap:anywhere]">
          {matchingSubmission.project_title}
        </p>
      ) : null}
      <div className="flex items-center gap-2.5 rounded-[14px] border border-[#ada3db] bg-product-lavender px-[14px] py-2">
        <span className="shrink-0 text-[13px] leading-[normal] text-product-muted">
          Team code
        </span>
        <span className="min-w-0 font-product-heading text-[20px] font-normal leading-6 text-product-primary [overflow-wrap:anywhere]">
          {team.team_code}
        </span>
      </div>
      <div className="flex items-center gap-2.5">
        {memberCount > 0 ? (
          <div className="flex shrink-0 -space-x-2">
            {team.members.slice(0, 3).map((member) => (
              <span
                key={member.user_id}
                role="img"
                aria-label={member.name}
                title={member.name}
                className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-product-lavender text-[11px] font-semibold leading-[normal] text-product-ink"
              >
                {initialsOf(member.name)}
              </span>
            ))}
          </div>
        ) : null}
        <span className="text-[13px] leading-[normal] text-product-muted">
          {memberCount} {memberCount === 1 ? "member" : "members"}
        </span>
      </div>
      {submissionQuery.isPending ? (
        <p
          role="status"
          className="text-[12px] leading-[18px] text-product-muted"
        >
          Checking submission status…
        </p>
      ) : submissionQuery.isError || submissionMismatch ? (
        <div className="text-[12px] leading-[18px] text-product-muted">
          <p role="status">We couldn’t verify your submission status.</p>
          <button
            type="button"
            className="mt-1 rounded-sm font-semibold text-product-primary underline underline-offset-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-product-primary"
            onClick={() => {
              if (submissionMismatch) refreshTeam();
              void submissionQuery.refetch();
            }}
          >
            Try again
          </button>
        </div>
      ) : null}
      <ProductButton asChild variant="secondary" className="w-full">
        <Link href={TEAM_PATH}>View team</Link>
      </ProductButton>
    </TeamCardFrame>
  );
}

export default function PortalTeamCard() {
  const user = useUserAttributes();
  const email = user.data?.email;
  const team = useProductPlusTeam(email, {
    retry: false,
    refetchOnWindowFocus: "always",
  });

  if (user.isPending) return <TeamCardState loading />;
  if (user.isError) return <TeamCardState retry={() => void user.refetch()} />;
  if (!email) return <NoTeamCard />;
  if (team.isPending) return <TeamCardState loading />;
  if (team.isError) return <TeamCardState retry={() => void team.refetch()} />;
  if (!team.data) return <NoTeamCard />;

  return (
    <TeamDetails
      key={`${email}:${team.data.team_code}`}
      email={email}
      team={team.data}
      refreshTeam={() => void team.refetch()}
    />
  );
}
