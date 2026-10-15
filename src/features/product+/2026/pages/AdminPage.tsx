"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import {
  GlassCard,
  PageHeading,
  Pill,
  ProductButton,
} from "../components/ProductPlusUI";

const sampleSubmissions = [
  { team: "Product-ive", project: "Launchpad", code: "482913", graded: true },
  { team: "Launchpad Labs", project: "Orbit", code: "307118", graded: true },
  { team: "Pixel Perfect", project: "Pixelate", code: "559204", graded: true },
  {
    team: "Roadmap Rebels",
    project: "Pathfinder",
    code: "614820",
    graded: true,
  },
  { team: "Sprint Squad", project: "Standup", code: "128745", graded: false },
  { team: "Feature Flow", project: "Flowboard", code: "903361", graded: false },
  { team: "Beta Builders", project: "Betabase", code: "770192", graded: false },
  { team: "Northstar", project: "Compass", code: "245508", graded: false },
];

const sampleRubricScores = [
  { team: "Pixel Perfect", project: "Pixelate", judges: 4, score: "84.5" },
  { team: "Product-ive", project: "Launchpad", judges: 3, score: "80.0" },
  { team: "Launchpad Labs", project: "Orbit", judges: 3, score: "75.5" },
  { team: "Roadmap Rebels", project: "Pathfinder", judges: 2, score: "70.0" },
];

const sampleAudienceScores = [
  { team: "Launchpad Labs", project: "Orbit", accepts: 41, rejects: 6 },
  { team: "Product-ive", project: "Launchpad", accepts: 38, rejects: 4 },
  { team: "Pixel Perfect", project: "Pixelate", accepts: 33, rejects: 9 },
  { team: "Roadmap Rebels", project: "Pathfinder", accepts: 29, rejects: 5 },
  { team: "Sprint Squad", project: "Standup", accepts: 24, rejects: 7 },
  { team: "Feature Flow", project: "Flowboard", accepts: 18, rejects: 3 },
  { team: "Beta Builders", project: "Betabase", accepts: 12, rejects: 8 },
  { team: "Northstar", project: "Compass", accepts: 9, rejects: 6 },
];

function RubricScores() {
  return (
    <div className="grid grid-cols-1 items-stretch gap-4 min-[1200px]:grid-cols-2">
      <GlassCard className="flex min-w-0 flex-col gap-2 rounded-3xl p-4 min-[641px]:rounded-[28px] min-[641px]:p-4 md:p-5">
        <h2 className="m-0 text-[16px] font-semibold leading-5 tracking-normal text-product-ink [font-family:inherit]">
          All submissions: 8
        </h2>
        <ul className="m-0 flex w-full list-none flex-col gap-2 p-0">
          {sampleSubmissions.map((submission) => (
            <li
              className="flex min-h-[63px] items-center gap-3 rounded-2xl bg-white/[0.55] p-3 md:px-4"
              key={submission.team}
            >
              <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                <strong className="text-[15px] font-semibold leading-[18px] text-product-ink">
                  {submission.team}
                </strong>
                <span className="text-[13px] font-normal leading-4 text-product-muted">
                  {submission.project}, code {submission.code}
                </span>
              </div>
              <Pill
                className="shrink-0 px-2.5 py-1 text-[12px] leading-[15px]"
                tone={submission.graded ? "purple" : "neutral"}
              >
                {submission.graded ? "Graded" : "Not graded"}
              </Pill>
            </li>
          ))}
        </ul>
      </GlassCard>
      <GlassCard className="flex min-w-0 flex-col gap-2 rounded-3xl p-4 min-[641px]:rounded-[28px] min-[641px]:p-4 md:p-5">
        <h2 className="m-0 text-[16px] font-semibold leading-5 tracking-normal text-product-ink [font-family:inherit]">
          Graded: ranked by average total
        </h2>
        <ol className="m-0 flex w-full list-none flex-col gap-2 p-0">
          {sampleRubricScores.map((submission, index) => (
            <li
              className="flex min-h-[63px] items-center gap-3 rounded-2xl bg-white/[0.55] p-3 md:px-4"
              key={submission.team}
            >
              <span className="shrink-0 text-[14px] font-semibold text-product-muted">
                #{index + 1}
              </span>
              <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                <strong className="text-[15px] font-semibold leading-[18px] text-product-ink">
                  {submission.team}
                </strong>
                <span className="text-[13px] font-normal leading-4 text-product-muted">
                  {submission.project}, {submission.judges} of 5 judges scored
                </span>
              </div>
              <strong className="shrink-0 text-[20px] font-semibold leading-6 text-product-primary">
                {submission.score}
              </strong>
            </li>
          ))}
        </ol>
        <h3 className="m-0 text-[14px] font-semibold leading-[18px] text-product-muted">
          Not yet graded: 4
        </h3>
        <ul className="m-0 flex w-full list-none flex-col gap-2 p-0">
          {sampleSubmissions
            .filter((submission) => !submission.graded)
            .map((submission) => (
              <li
                className="flex min-h-[63px] items-center gap-3 rounded-2xl bg-white/[0.55] p-3 md:px-4"
                key={submission.team}
              >
                <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                  <strong className="text-[15px] font-semibold leading-[18px] text-product-ink">
                    {submission.team}
                  </strong>
                  <span className="text-[13px] font-normal leading-4 text-product-muted">
                    {submission.project}, 0 of 5 judges scored
                  </span>
                </div>
                <span className="text-[20px] text-product-muted">—</span>
              </li>
            ))}
        </ul>
        <p className="m-0 text-[12px] leading-4 text-product-muted">
          Sample numbers only. Scores are out of 100 (draft rubric, may change).
        </p>
      </GlassCard>
    </div>
  );
}

function AudienceScores() {
  return (
    <GlassCard className="flex min-w-0 flex-col gap-0 rounded-3xl p-4 min-[641px]:rounded-[28px] min-[641px]:p-4 md:p-5">
      <div className="w-full overflow-x-auto">
        <table
          className="w-full min-w-[720px] border-separate border-spacing-x-0 border-spacing-y-2 text-left"
          aria-label="Sample audience scores"
        >
          <thead>
            <tr>
              <th
                className="w-[74px] whitespace-nowrap py-1.5 pl-4 pr-1.5 text-[12px] font-semibold uppercase leading-5 text-product-muted"
                scope="col"
              >
                Rank
              </th>
              <th
                className="whitespace-nowrap py-1.5 pl-4 pr-1.5 text-[12px] font-semibold uppercase leading-5 text-product-muted"
                scope="col"
              >
                Team
              </th>
              <th
                className="w-[122px] whitespace-nowrap py-1.5 pl-4 pr-1.5 text-right text-[12px] font-semibold uppercase leading-5 text-product-muted"
                scope="col"
              >
                Accepts
              </th>
              <th
                className="w-[122px] whitespace-nowrap py-1.5 pl-4 pr-1.5 text-right text-[12px] font-semibold uppercase leading-5 text-product-muted"
                scope="col"
              >
                Rejects
              </th>
              <th
                className="w-[218px] whitespace-nowrap px-4 py-1.5 text-right text-[12px] font-semibold uppercase leading-5 text-product-muted"
                scope="col"
              >
                Score (accepts − rejects)
              </th>
            </tr>
          </thead>
          <tbody>
            {sampleAudienceScores.map((submission, index) => (
              <tr key={submission.team}>
                <td className="h-[63px] rounded-l-2xl bg-white/[0.55] py-3.5 pl-4 pr-1.5 text-[14px] font-semibold text-product-muted">
                  #{index + 1}
                </td>
                <th
                  className="h-[63px] bg-white/[0.55] py-3.5 pl-4 pr-1.5"
                  scope="row"
                >
                  <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                    <strong className="text-[15px] font-semibold leading-[18px] text-product-ink">
                      {submission.team}
                    </strong>
                    <span className="text-[13px] font-normal leading-4 text-product-muted">
                      {submission.project}
                    </span>
                  </div>
                </th>
                <td className="h-[63px] bg-white/[0.55] py-3.5 pl-4 pr-1.5 text-right text-[15px] text-product-ink">
                  {submission.accepts}
                </td>
                <td className="h-[63px] bg-white/[0.55] py-3.5 pl-4 pr-1.5 text-right text-[15px] text-product-ink">
                  {submission.rejects}
                </td>
                <td className="h-[63px] rounded-r-2xl bg-white/[0.55] px-4 py-3.5 text-right text-[20px] font-semibold leading-6 text-product-primary">
                  +{submission.accepts - submission.rejects}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="m-0 text-[12px] leading-4 text-product-muted">
        Sample numbers only. Single list sorted by accepts − rejects.
      </p>
    </GlassCard>
  );
}

export default function AdminPage() {
  const [activeScores, setActiveScores] = useState<"rubric" | "audience">(
    "rubric",
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
          disabled
          aria-describedby="admin-availability"
        >
          Event settings
        </ProductButton>
      </PageHeading>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div
          className="inline-flex gap-1 rounded-full bg-product-primary/[0.08] p-1"
          role="group"
          aria-label="Score view"
        >
          <button
            className={cn(
              "cursor-pointer rounded-full border border-transparent bg-transparent px-3.5 py-2.5 text-[14px] leading-[18px] text-product-muted focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#8e78ce] focus-visible:outline-offset-2 md:px-[22px]",
              activeScores === "rubric" &&
                "border-white/70 bg-white/60 font-semibold text-product-primary shadow-[0_4px_20px_rgba(97,80,184,0.08),inset_0_1px_2px_rgba(255,255,255,0.65)] backdrop-blur-[14.5px]",
            )}
            type="button"
            onClick={() => setActiveScores("rubric")}
            aria-pressed={activeScores === "rubric"}
          >
            Rubric scores
          </button>
          <button
            className={cn(
              "cursor-pointer rounded-full border border-transparent bg-transparent px-3.5 py-2.5 text-[14px] leading-[18px] text-product-muted focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#8e78ce] focus-visible:outline-offset-2 md:px-[22px]",
              activeScores === "audience" &&
                "border-white/70 bg-white/60 font-semibold text-product-primary shadow-[0_4px_20px_rgba(97,80,184,0.08),inset_0_1px_2px_rgba(255,255,255,0.65)] backdrop-blur-[14.5px]",
            )}
            type="button"
            onClick={() => setActiveScores("audience")}
            aria-pressed={activeScores === "audience"}
          >
            Audience scores
          </button>
        </div>
        <span className="text-[12px] text-product-muted">Sample data</span>
      </div>
      {activeScores === "rubric" ? <RubricScores /> : <AudienceScores />}
      <p
        className="m-0 text-[12px] leading-4 text-product-muted"
        id="admin-availability"
      >
        Preview only. Event settings and score management are coming soon.
      </p>
    </div>
  );
}
