import { useEffect, useRef, useState, type FormEvent } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Pill, ProductButton } from "../components/ProductPlusUI";
import { errorMessage } from "../submission/api";
import type { Rubric } from "./api";
import {
  formatScore,
  RUBRIC_CRITERIA,
  RUBRIC_MAX,
  rubricDraft,
  rubricTotal,
  validRubricScore,
  validRubricScores,
} from "./rubric";

const fieldClass =
  "rounded-[14px] border-[#d9d1f2] bg-white/75 px-3.5 py-3 text-[14px] leading-5 text-product-ink placeholder:text-[#8c94ad] focus-visible:border-product-primary focus-visible:ring-product-primary/20 focus-visible:ring-offset-0";

export default function RubricForm({
  rubric,
  onSave,
}: {
  rubric?: Rubric;
  onSave: (rubric: Pick<Rubric, "scores" | "comments">) => Promise<void>;
}) {
  const [draft, setDraft] = useState(() => rubricDraft(rubric));
  const [hasSaved, setHasSaved] = useState(!!rubric);
  const [savedDraft, setSavedDraft] = useState(() => rubricDraft(rubric));
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState<{
    error: boolean;
    message: string;
  } | null>(null);
  const submitting = useRef(false);
  const valid = validRubricScores(draft.scores);
  const dirty =
    draft.scores.some((score, i) => score !== savedDraft.scores[i]) ||
    draft.comments.some((comment, i) => comment !== savedDraft.comments[i]);
  const total = valid ? rubricTotal(draft.scores.map(Number)) : null;

  // Refresh a pristine form from the latest GET without replacing active edits.
  useEffect(() => {
    if (dirty || submitting.current) return;
    const fresh = rubricDraft(rubric);
    setDraft(fresh);
    setSavedDraft(fresh);
    setHasSaved(!!rubric);
  }, [rubric, dirty]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting.current) return;
    if (!valid) {
      setNotice({
        error: true,
        message: "Enter a score from 0 to 10 for every criterion.",
      });
      return;
    }
    submitting.current = true;
    setSaving(true);
    setNotice(null);
    try {
      await onSave({
        scores: draft.scores.map(Number),
        comments: draft.comments,
      });
      setSavedDraft(draft);
      setHasSaved(true);
      setNotice({ error: false, message: "Your rubric has been saved." });
    } catch (error) {
      setNotice({ error: true, message: errorMessage(error) });
    } finally {
      submitting.current = false;
      setSaving(false);
    }
  }

  return (
    <form
      onSubmit={(event) => void submit(event)}
      className="flex min-w-0 flex-col gap-3 min-[1200px]:h-[calc(100dvh-340px)] min-[1200px]:min-h-[540px]"
      aria-label="Submission rubric"
      aria-busy={saving}
    >
      <div className="flex items-center justify-between gap-3">
        <h2 className="m-0 text-[18px] font-semibold leading-6 tracking-normal [font-family:inherit]">
          Rubric
        </h2>
        <Pill className="px-2.5 py-1 text-[12px] leading-4">
          {dirty
            ? "Unsaved changes"
            : hasSaved
              ? "Your saved rubric"
              : "Draft rubric"}
        </Pill>
      </div>
      <div className="flex min-h-0 flex-1 flex-col gap-5 min-[1200px]:overflow-y-auto min-[1200px]:pr-1">
        <p className="m-0 text-[13px] leading-[18px] text-product-muted">
          Preliminary round: judge product thinking, strategic decisions and
          justification across the pitch video and PRD. Score each criterion out
          of 10; weights are applied to the total.
        </p>
        <fieldset
          disabled={saving}
          className="m-0 flex min-w-0 flex-col gap-5 border-0 p-0"
        >
          <legend className="sr-only">
            {RUBRIC_CRITERIA.length} rubric criteria
          </legend>
          {RUBRIC_CRITERIA.map((criterion, index) => (
            <div key={criterion.name} className="flex min-w-0 flex-col gap-2">
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <label
                    htmlFor={`rubric-score-${index}`}
                    className="block text-[15px] font-semibold leading-5"
                  >
                    {criterion.name}
                  </label>
                  <span
                    id={`rubric-weight-${index}`}
                    className="text-[12px] leading-4 text-product-muted"
                  >
                    Weight: {criterion.weight}%
                  </span>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <Input
                    id={`rubric-score-${index}`}
                    type="number"
                    min={0}
                    max={criterion.max}
                    step="any"
                    required
                    placeholder="Score"
                    value={draft.scores[index]}
                    aria-invalid={
                      draft.scores[index] !== "" &&
                      !validRubricScore(draft.scores[index], criterion.max)
                    }
                    aria-describedby={`rubric-weight-${index} rubric-help-${index}`}
                    className={`${fieldClass} h-11 w-[76px] px-2.5 aria-[invalid=true]:border-[#99263d]`}
                    onChange={(event) => {
                      const value = event.target.value;
                      setNotice(null);
                      setDraft((previous) => ({
                        ...previous,
                        scores: previous.scores.map((score, i) =>
                          i === index ? value : score,
                        ),
                      }));
                    }}
                  />
                  <span className="w-8 text-[14px] font-semibold text-product-muted">
                    / {criterion.max}
                  </span>
                </div>
              </div>
              <p
                id={`rubric-help-${index}`}
                className="m-0 text-[13px] leading-[18px] text-product-muted"
              >
                {criterion.description}
              </p>
              <label className="sr-only" htmlFor={`rubric-comment-${index}`}>
                {criterion.name} comments
              </label>
              <Textarea
                id={`rubric-comment-${index}`}
                rows={1}
                placeholder="Comments (optional)"
                className={`${fieldClass} min-h-11`}
                value={draft.comments[index]}
                onChange={(event) => {
                  const value = event.target.value;
                  setNotice(null);
                  setDraft((previous) => ({
                    ...previous,
                    comments: previous.comments.map((comment, i) =>
                      i === index ? value : comment,
                    ),
                  }));
                }}
              />
            </div>
          ))}
        </fieldset>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#bfb2e5] pt-3.5">
        <div className="flex flex-col gap-0.5">
          <span className="text-[12px] font-semibold text-product-muted">
            Weighted total
          </span>
          <output
            className="font-product-heading text-[26px] leading-8 text-product-primary"
            aria-live="polite"
          >
            {total === null ? "—" : formatScore(total)} / {RUBRIC_MAX}
          </output>
        </div>
        <ProductButton type="submit" disabled={saving || !valid}>
          {saving ? "Saving…" : hasSaved ? "Update rubric" : "Submit rubric"}
        </ProductButton>
      </div>
      {notice ? (
        <p
          role={notice.error ? "alert" : "status"}
          className={`m-0 text-[13px] leading-[18px] ${notice.error ? "text-[#99263d]" : "text-[#246953]"}`}
        >
          {notice.message}
        </p>
      ) : null}
    </form>
  );
}
