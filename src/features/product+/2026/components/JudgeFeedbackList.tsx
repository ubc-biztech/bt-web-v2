import type { ReactNode } from "react";
import { RUBRIC_CRITERIA } from "../admin/rubric";

export interface JudgeFeedback {
  judge_user_id: string;
  /** Comments in RUBRIC_CRITERIA order; blank entries are skipped. */
  comments: string[];
}

export default function JudgeFeedbackList<T extends JudgeFeedback>({
  feedback,
  renderAside,
}: {
  feedback: readonly T[];
  renderAside?: (judge: T) => ReactNode;
}) {
  return (
    <ul className="m-0 flex list-none flex-col gap-4 p-0">
      {feedback.map((judge) => {
        const comments = RUBRIC_CRITERIA.map((criterion, index) => ({
          name: criterion.name,
          comment: judge.comments?.[index]?.trim() ?? "",
        })).filter(({ comment }) => comment);
        return (
          <li key={judge.judge_user_id} className="flex flex-col gap-2">
            <div className="flex items-center justify-between gap-3">
              <span className="min-w-0 break-words text-[14px] font-semibold [overflow-wrap:anywhere]">
                {judge.judge_user_id}
              </span>
              {renderAside?.(judge)}
            </div>
            {comments.length ? (
              <dl className="m-0 flex flex-col gap-2 pl-4">
                {comments.map(({ name, comment }) => (
                  <div key={name} className="flex flex-col gap-0.5">
                    <dt className="text-[13px] font-semibold leading-[18px] text-product-ink">
                      {name}
                    </dt>
                    <dd className="m-0 flex gap-1.5 pl-4 text-[13px] leading-[18px] text-product-muted">
                      <span aria-hidden="true">-</span>
                      <span className="min-w-0 whitespace-pre-wrap break-words [overflow-wrap:anywhere]">
                        {comment}
                      </span>
                    </dd>
                  </div>
                ))}
              </dl>
            ) : (
              <p className="m-0 pl-4 text-[13px] text-product-muted">
                No comments.
              </p>
            )}
          </li>
        );
      })}
    </ul>
  );
}
