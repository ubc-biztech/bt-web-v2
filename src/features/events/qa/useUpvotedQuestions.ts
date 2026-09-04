import { useCallback, useEffect, useState } from "react";

/**
 * Remembers which questions this browser has upvoted.
 *
 * This is a UI affordance, not an authorization check — the backend owns the
 * real per-user vote record and rejects duplicates. Clearing site data lets a
 * browser re-press the button; the server still refuses the second vote.
 */
const storageKey = (eventId: string, year: string) =>
  `qa-upvoted-${eventId}-${year}`;

function readUpvoted(eventId: string, year: string): Set<string> {
  try {
    const raw = localStorage.getItem(storageKey(eventId, year));
    const parsed: unknown = raw ? JSON.parse(raw) : [];
    return new Set(Array.isArray(parsed) ? parsed : []);
  } catch {
    return new Set();
  }
}

export function useUpvotedQuestions(eventId: string, year: string) {
  // Seeded in an effect rather than a useState initializer: this page is
  // statically prerendered, so reading localStorage during the first render
  // would produce markup that doesn't match the server's.
  const [upvotedIds, setUpvotedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    setUpvotedIds(readUpvoted(eventId, year));
  }, [eventId, year]);

  const markUpvoted = useCallback(
    (questionId: string) => {
      setUpvotedIds((previous) => {
        if (previous.has(questionId)) return previous;

        const next = new Set(previous).add(questionId);
        try {
          localStorage.setItem(
            storageKey(eventId, year),
            JSON.stringify(Array.from(next)),
          );
        } catch {
          // Private browsing or a full quota: the button just won't stay
          // pressed across reloads.
        }
        return next;
      });
    },
    [eventId, year],
  );

  return { upvotedIds, markUpvoted };
}
