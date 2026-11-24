import { useEffect, useRef, type RefObject } from "react";
import type { FieldErrors } from "react-hook-form";
import type { EventFormSchema } from "./EventFormSchema";

import { getEventFormIssues } from "./eventFormIssues";

function focusField(editor: HTMLFormElement, path: string) {
  const parts = path.split(".");
  while (parts.length) {
    const field = editor.querySelector<HTMLElement>(
      `[data-event-field="${CSS.escape(parts.join("."))}"]`,
    );
    if (field) {
      // A row or section is the focus target when the field has no input.
      const target = field.hasAttribute("tabindex")
        ? field
        : (field.querySelector<HTMLElement>(
            "input:not([type=hidden]):enabled, textarea:enabled, button:enabled",
          ) ?? field);
      target.scrollIntoView({ block: "center" });
      target.focus({ preventScroll: true });
      return;
    }
    parts.pop();
  }
}

export function EventFormErrorSummary({
  editorRef,
  errors,
  submitCount,
}: {
  editorRef: RefObject<HTMLFormElement>;
  errors: FieldErrors<EventFormSchema>;
  submitCount: number;
}) {
  const summaryRef = useRef<HTMLDivElement>(null);
  const issues = submitCount ? getEventFormIssues(errors) : [];

  useEffect(() => {
    summaryRef.current?.focus();
  }, [submitCount]);

  if (!issues.length) return null;

  return (
    <div
      ref={summaryRef}
      tabIndex={-1}
      role="region"
      aria-labelledby="event-form-errors"
      className="rounded-lg border border-bt-red-200/60 bg-bt-red-200/10 px-4 py-3 text-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-bt-red-200"
    >
      <h2
        id="event-form-errors"
        className="text-sm font-semibold text-bt-red-200"
      >
        Review these fields before saving
      </h2>
      <ul className="mt-2 list-disc space-y-1 pl-5">
        {issues.map(({ label, message, path }) => (
          <li key={path}>
            <button
              type="button"
              className="text-left underline underline-offset-2 hover:text-bt-red-200"
              onClick={() =>
                editorRef.current && focusField(editorRef.current, path)
              }
            >
              {message.toLowerCase().startsWith(label.toLowerCase())
                ? message
                : `${label} — ${message}`}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
