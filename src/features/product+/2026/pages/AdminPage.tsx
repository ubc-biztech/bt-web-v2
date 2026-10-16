"use client";

import Link from "next/link";
import { useRouter } from "next/router";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { cn } from "@/lib/utils";
import { useUserAttributes } from "@/queries/user";
import {
  GlassCard,
  PageHeading,
  Pill,
  ProductButton,
} from "../components/ProductPlusUI";
import { errorMessage } from "../submission/api";
import AdminSubmissionDetail, {
  ADMIN_PATH,
} from "../admin/AdminSubmissionDetail";
import {
  adminSubmissionsKey,
  getAdminSubmissions,
  type RankedSubmission,
} from "../admin/api";
import {
  formatScore,
  rankByAudience,
  rankByRubric,
  RUBRIC_MAX,
} from "../admin/rubric";

const cardClass =
  "flex min-w-0 flex-col gap-2 rounded-3xl p-4 min-[641px]:rounded-[28px] min-[641px]:p-4 md:p-5";
const headingClass =
  "m-0 text-[16px] font-semibold leading-5 tracking-normal text-product-ink [font-family:inherit]";
const rowClass =
  "flex min-h-[63px] items-center gap-3 rounded-2xl bg-white/[0.55] p-3 transition-colors hover:bg-white/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-product-primary md:px-4";
const submissionHref = (teamCode: string) =>
  `${ADMIN_PATH}?team=${encodeURIComponent(teamCode)}`;

function RubricScores({ submissions }: { submissions: RankedSubmission[] }) {
  const ranked = rankByRubric(submissions);
  const ungradedCount = submissions.length - ranked.length;

  return (
    <div className="grid grid-cols-1 items-stretch gap-4 min-[1200px]:grid-cols-2">
      <GlassCard className={cardClass}>
        <h2 className={headingClass}>All submissions: {submissions.length}</h2>
        <ul className="m-0 flex w-full list-none flex-col gap-2 p-0">
          {submissions.map((submission) => (
            <li key={submission.team_code}>
              <Link
                href={submissionHref(submission.team_code)}
                shallow
                className={rowClass}
              >
                <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                  <strong className="break-words text-[15px] leading-[18px]">
                    {submission.team_name}
                  </strong>
                  <span className="text-[13px] leading-4 text-product-muted">
                    Code {submission.team_code}
                  </span>
                </div>
                <Pill
                  className="shrink-0 px-2.5 py-1 text-[12px] leading-[15px]"
                  tone={
                    submission.rubric_average === null ? "neutral" : "purple"
                  }
                >
                  {submission.rubric_average === null ? "Not graded" : "Graded"}
                </Pill>
              </Link>
            </li>
          ))}
        </ul>
        {!submissions.length ? (
          <p className="py-5 text-product-muted">No submissions yet.</p>
        ) : null}
      </GlassCard>
      <GlassCard className={cardClass}>
        <h2 className={headingClass}>Graded: ranked by weighted average</h2>
        <ol className="m-0 flex w-full list-none flex-col gap-2 p-0">
          {ranked.map((submission, index) => (
            <li key={submission.team_code}>
              <Link
                href={submissionHref(submission.team_code)}
                shallow
                className={rowClass}
              >
                <span className="shrink-0 text-[14px] font-semibold text-product-muted">
                  #{index + 1}
                </span>
                <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                  <strong className="break-words text-[15px] leading-[18px]">
                    {submission.team_name}
                  </strong>
                  <span className="text-[13px] leading-4 text-product-muted">
                    {submission.rubric_count}{" "}
                    {submission.rubric_count === 1 ? "judge" : "judges"} scored
                  </span>
                </div>
                <strong className="shrink-0 text-[20px] leading-6 text-product-primary">
                  {formatScore(submission.rubric_average)}
                </strong>
              </Link>
            </li>
          ))}
        </ol>
        {!ranked.length ? (
          <p className="py-5 text-product-muted">No graded submissions yet.</p>
        ) : null}
        <p className="m-0 text-[12px] leading-4 text-product-muted">
          Weighted scores out of {RUBRIC_MAX}, averaged across saved rubrics.
          Not yet graded: {ungradedCount}.
        </p>
      </GlassCard>
    </div>
  );
}

function AudienceScores({ submissions }: { submissions: RankedSubmission[] }) {
  return (
    <GlassCard className={cardClass}>
      <div className="w-full overflow-x-auto">
        <table
          className="w-full min-w-[620px] border-separate border-spacing-x-0 border-spacing-y-2 text-left"
          aria-label="Audience scores ranked by accepts minus rejects"
        >
          <thead>
            <tr>
              {[
                "Rank",
                "Team",
                "Accepts",
                "Rejects",
                "Score (accepts − rejects)",
              ].map((label, index) => (
                <th
                  key={label}
                  scope="col"
                  className={cn(
                    "whitespace-nowrap px-4 py-1.5 text-[12px] font-semibold uppercase leading-5 text-product-muted",
                    index > 1 && "text-right",
                  )}
                >
                  {label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rankByAudience(submissions).map((submission, index) => (
              <tr key={submission.team_code}>
                <td className="rounded-l-2xl bg-white/[0.55] px-4 py-3.5 text-[14px] font-semibold text-product-muted">
                  #{index + 1}
                </td>
                <th scope="row" className="bg-white/[0.55] px-4 py-3.5">
                  <Link
                    href={submissionHref(submission.team_code)}
                    shallow
                    className="flex flex-col rounded-sm hover:underline focus-visible:outline focus-visible:outline-product-primary"
                  >
                    <strong className="text-[15px] leading-[18px]">
                      {submission.team_name}
                    </strong>
                    <span className="text-[13px] font-normal leading-4 text-product-muted">
                      Code {submission.team_code}
                    </span>
                  </Link>
                </th>
                <td className="bg-white/[0.55] px-4 py-3.5 text-right">
                  {submission.upvotes}
                </td>
                <td className="bg-white/[0.55] px-4 py-3.5 text-right">
                  {submission.downvotes}
                </td>
                <td className="rounded-r-2xl bg-white/[0.55] px-4 py-3.5 text-right text-[20px] font-semibold leading-6 text-product-primary">
                  {submission.audience_score > 0 ? "+" : ""}
                  {submission.audience_score}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {!submissions.length ? (
        <p className="py-5 text-product-muted">No submissions yet.</p>
      ) : null}
    </GlassCard>
  );
}

export default function AdminPage() {
  const router = useRouter();
  const { data: user } = useUserAttributes();
  const judgeId = user?.email ?? "";
  const teamCode =
    typeof router.query.team === "string" ? router.query.team : null;
  const [activeScores, setActiveScores] = useState<"rubric" | "audience">(
    "rubric",
  );
  const submissions = useQuery({
    queryKey: adminSubmissionsKey(judgeId),
    queryFn: getAdminSubmissions,
    enabled: !!judgeId && !teamCode,
    refetchOnWindowFocus: true,
    retry: false,
  });

  if (teamCode)
    return (
      <AdminSubmissionDetail
        key={`${teamCode}:${judgeId}`}
        teamCode={teamCode}
        judgeId={judgeId}
      />
    );

  return (
    <div className="flex w-full min-w-0 flex-col gap-5">
      <PageHeading
        title="Overview"
        description="Review submissions and scores. Execs only."
        className="mb-0 items-start md:items-center [&>div]:gap-1"
      >
        <ProductButton
          variant="secondary"
          disabled={submissions.isFetching}
          onClick={() => void submissions.refetch()}
        >
          {submissions.isFetching ? "Refreshing…" : "Refresh submissions"}
        </ProductButton>
      </PageHeading>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div
          className="inline-flex gap-1 rounded-full bg-product-primary/[0.08] p-1"
          role="group"
          aria-label="Score view"
        >
          {(["rubric", "audience"] as const).map((view) => (
            <button
              key={view}
              className={cn(
                "cursor-pointer rounded-full border border-transparent bg-transparent px-3.5 py-2.5 text-[14px] leading-[18px] text-product-muted focus-visible:outline focus-visible:outline-2 focus-visible:outline-product-primary focus-visible:outline-offset-2 md:px-[22px]",
                activeScores === view &&
                  "border-white/70 bg-white/60 font-semibold text-product-primary shadow-[0_4px_20px_rgba(97,80,184,0.08),inset_0_1px_2px_rgba(255,255,255,0.65)] backdrop-blur-[14.5px]",
              )}
              type="button"
              onClick={() => setActiveScores(view)}
              aria-pressed={activeScores === view}
            >
              {view === "rubric" ? "Rubric scores" : "Audience scores"}
            </button>
          ))}
        </div>
      </div>
      {submissions.isPending ? (
        <p role="status" className="py-12 text-product-muted">
          Loading submissions…
        </p>
      ) : null}
      {submissions.isError ? (
        <GlassCard className="flex flex-col items-start gap-4">
          <p role="alert" className="text-[#99263d]">
            Couldn’t load submissions. {errorMessage(submissions.error)}
          </p>
          <ProductButton
            variant="secondary"
            onClick={() => void submissions.refetch()}
          >
            Try again
          </ProductButton>
        </GlassCard>
      ) : null}
      {submissions.data ? (
        activeScores === "rubric" ? (
          <RubricScores submissions={submissions.data} />
        ) : (
          <AudienceScores submissions={submissions.data} />
        )
      ) : null}
    </div>
  );
}
