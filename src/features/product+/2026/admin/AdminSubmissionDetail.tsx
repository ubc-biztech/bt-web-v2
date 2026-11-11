import Link from "next/link";
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import JudgeFeedbackList from "../components/JudgeFeedbackList";
import { GlassCard, Pill, ProductButton } from "../components/ProductPlusUI";
import { errorMessage, errorStatus } from "../submission/api";
import { youtubeVideoId } from "../submission/submission";
import {
  adminSubmissionKey,
  adminSubmissionsKey,
  getAdminSubmission,
  saveAdminRubric,
  type AdminSubmission,
  type Rubric,
} from "./api";
import { formatScore, rubricTotal, RUBRIC_MAX } from "./rubric";
import RubricForm from "./RubricForm";

export const ADMIN_PATH = "/companion/product+/2026/admin";
const backClass =
  "w-fit text-[14px] font-semibold text-product-primary hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-product-primary";

export default function AdminSubmissionDetail({
  teamCode,
  judgeId,
}: {
  teamCode: string;
  judgeId: string;
}) {
  const queryClient = useQueryClient();
  const queryKey = adminSubmissionKey(judgeId, teamCode);
  const submission = useQuery({
    queryKey,
    queryFn: () => getAdminSubmission(teamCode),
    enabled: /^\d{6}$/.test(teamCode),
    staleTime: 0,
    retry: false,
  });
  const [openingPdf, setOpeningPdf] = useState(false);
  const [pdfError, setPdfError] = useState<string | null>(null);
  const data = submission.data;
  // The API identifies judges by verified email, not their Cognito sub.
  const currentRubric = data?.graded_submissions.find(
    (rubric) => rubric.judge_user_id.toLowerCase() === judgeId.toLowerCase(),
  );

  async function save(rubric: Pick<Rubric, "scores" | "comments">) {
    const saved = await saveAdminRubric(teamCode, rubric);
    queryClient.setQueryData<AdminSubmission>(queryKey, (previous) =>
      previous
        ? {
            ...previous,
            graded_submissions: [
              ...previous.graded_submissions.filter(
                (item) => item.judge_user_id !== saved.judge_user_id,
              ),
              saved,
            ],
          }
        : previous,
    );
    // Reread other judges' concurrent saves and recalculate the overview on return.
    void queryClient.invalidateQueries({
      queryKey: adminSubmissionsKey(judgeId),
    });
  }

  async function openPdf() {
    if (openingPdf) return;
    // Reserve the tab during the click, then fetch a fresh temporary viewing URL.
    const tab = window.open("about:blank", "_blank");
    if (!tab) {
      setPdfError("Allow pop-ups to open the PRD, then try again.");
      return;
    }
    tab.opener = null;
    setOpeningPdf(true);
    setPdfError(null);
    try {
      const fresh = await getAdminSubmission(teamCode);
      if (!fresh.prd_view_url)
        throw new Error("No PRD is available for this submission.");
      const url = new URL(fresh.prd_view_url);
      if (url.protocol !== "https:")
        throw new Error("The PRD viewing link is invalid. Please try again.");
      tab.location.replace(url.href);
    } catch (error) {
      tab.close();
      setPdfError(errorMessage(error));
    } finally {
      setOpeningPdf(false);
    }
  }

  const videoId = data ? youtubeVideoId(data.video_url) : null;

  return (
    <div className="flex min-w-0 flex-col gap-[18px]">
      <Link href={ADMIN_PATH} shallow className={backClass}>
        ← Back to Judging
      </Link>
      {!/^\d{6}$/.test(teamCode) ? (
        <GlassCard>
          <p role="alert">
            Choose a submission with a valid six-digit team code.
          </p>
        </GlassCard>
      ) : submission.isPending ? (
        <p role="status" className="py-12 text-product-muted">
          Loading submission…
        </p>
      ) : !data ? (
        <GlassCard className="flex flex-col items-start gap-4">
          <p role="alert" className="text-[#99263d]">
            {errorStatus(submission.error) === 404
              ? "This submission could not be found."
              : errorMessage(submission.error)}
          </p>
          <ProductButton
            variant="secondary"
            onClick={() => void submission.refetch()}
          >
            Try again
          </ProductButton>
        </GlassCard>
      ) : (
        <>
          <header className="flex flex-col items-start justify-between gap-4 min-[1200px]:flex-row min-[1200px]:items-center">
            <div className="flex w-full min-w-0 flex-1 flex-col gap-4">
              <div className="flex flex-col gap-1">
                <span className="text-[13px] font-semibold text-product-muted">
                  Team:
                </span>
                <h1 className="m-0 break-words">{data.team_name}</h1>
              </div>
              <dl className="m-0 flex flex-wrap gap-x-10 gap-y-3">
                <div className="flex flex-col gap-0.5">
                  <dt className="text-[13px] font-semibold text-product-muted">
                    Project title:
                  </dt>
                  <dd className="m-0 break-words text-[16px] font-semibold">
                    {data.project_title || "Not provided"}
                  </dd>
                </div>
                <div className="flex flex-col gap-0.5">
                  <dt className="text-[13px] font-semibold text-product-muted">
                    Team code:
                  </dt>
                  <dd className="m-0 text-[16px] font-semibold">
                    {data.team_code}
                  </dd>
                </div>
                <div className="min-w-0 flex-1 basis-[220px]">
                  <dt className="text-[13px] font-semibold text-product-muted">
                    Members:
                  </dt>
                  <dd className="m-0 mt-0.5 break-words text-[16px] text-product-muted">
                    {data.member_names.join(", ") || "Not provided"}
                  </dd>
                </div>
              </dl>
            </div>
            <Pill
              tone={currentRubric ? "purple" : "neutral"}
              className="shrink-0 self-start text-[13px]"
            >
              {currentRubric ? "Your rubric submitted" : "Not graded by you"}
            </Pill>
          </header>
          {submission.isError ? (
            <p role="alert" className="text-[13px] text-[#99263d]">
              Couldn’t refresh this submission. {errorMessage(submission.error)}
            </p>
          ) : null}
          <div className="grid min-w-0 grid-cols-1 items-start gap-4 min-[1200px]:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)]">
            <div className="flex min-w-0 flex-col gap-4">
              <GlassCard className="flex flex-col gap-3 rounded-[28px] p-4 min-[641px]:rounded-[28px] min-[641px]:p-4">
                <div className="aspect-video overflow-hidden rounded-[18px] bg-[linear-gradient(150deg,#332973,#614fb8)]">
                  {videoId ? (
                    <iframe
                      title={`${data.team_name} demo video`}
                      src={`https://www.youtube-nocookie.com/embed/${videoId}`}
                      className="h-full w-full border-0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                      referrerPolicy="strict-origin-when-cross-origin"
                      allowFullScreen
                    />
                  ) : (
                    <p className="flex h-full items-center justify-center p-6 text-center text-white">
                      No valid YouTube video was submitted.
                    </p>
                  )}
                </div>
                <p className="m-0 text-[13px] leading-[18px] text-product-muted">
                  Demo video: embedded from YouTube
                </p>
              </GlassCard>
              <GlassCard className="flex flex-wrap items-center gap-3 rounded-3xl p-[18px] min-[641px]:rounded-3xl min-[641px]:p-[18px]">
                <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                  <h2 className="m-0 text-[15px] font-semibold leading-5 tracking-normal [font-family:inherit]">
                    Product Requirements Document
                  </h2>
                  <p className="m-0 break-words text-[13px] leading-[18px] text-product-muted">
                    {data.prd_path
                      ? data.prd_filename || "PRD: opens in a new tab"
                      : "No PRD submitted"}
                  </p>
                </div>
                <ProductButton
                  variant="secondary"
                  disabled={openingPdf || !data.prd_path}
                  onClick={() => void openPdf()}
                >
                  {openingPdf ? "Opening…" : "Open PRD"}
                </ProductButton>
                {pdfError ? (
                  <p
                    role="alert"
                    className="m-0 w-full text-[13px] text-[#99263d]"
                  >
                    {pdfError}
                  </p>
                ) : null}
              </GlassCard>
              <GlassCard className="flex flex-col gap-3 rounded-3xl p-[18px] min-[641px]:rounded-3xl min-[641px]:p-[18px]">
                <div className="flex items-center justify-between gap-3">
                  <h2 className="m-0 text-[14px] font-semibold leading-5 tracking-normal [font-family:inherit]">
                    Submitted scores
                  </h2>
                  <span className="text-[13px] text-product-muted">
                    {data.graded_submissions.length} scored
                  </span>
                </div>
                {data.graded_submissions.length ? (
                  <JudgeFeedbackList
                    feedback={data.graded_submissions}
                    renderAside={(rubric) => (
                      <span className="flex shrink-0 items-center gap-2">
                        {rubric.judge_user_id.toLowerCase() ===
                        judgeId.toLowerCase() ? (
                          <span className="text-[13px] text-product-muted">
                            (you)
                          </span>
                        ) : null}
                        <Pill className="px-2.5 py-0.5 text-[12px] leading-4">
                          {formatScore(rubricTotal(rubric.scores))} /{" "}
                          {RUBRIC_MAX}
                        </Pill>
                      </span>
                    )}
                  />
                ) : (
                  <p className="m-0 text-[13px] text-product-muted">
                    No rubrics submitted yet.
                  </p>
                )}
              </GlassCard>
            </div>
            <GlassCard className="rounded-[28px] p-[22px] min-[641px]:rounded-[28px] min-[641px]:p-[22px]">
              <RubricForm
                key={`${teamCode}:${judgeId}`}
                rubric={currentRubric}
                onSave={save}
              />
            </GlassCard>
          </div>
        </>
      )}
    </div>
  );
}
