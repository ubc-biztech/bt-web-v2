import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { cn } from "@/lib/utils";
import { formatTimeAgo } from "@/lib/time";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ChevronUp, Pin, EyeOff, Pencil, Check, X } from "lucide-react";
import { useAuthState } from "@/queries/user";
import type { Question } from "./types";
import {
  usePatchQuestion,
  useUpvoteQuestion,
  type QuestionPatch,
} from "./queries";
import { ExportStoryButton } from "./ExportStoryButton";

interface QuestionCardProps {
  question: Question;
  eventId: string;
  year: string;
  eventName: string;
  isAdmin: boolean;
  isUpvoted: boolean;
  onUpvoted: (questionId: string) => void;
}

export function QuestionCard({
  question,
  eventId,
  year,
  eventName,
  isAdmin,
  isUpvoted,
  onUpvoted,
}: QuestionCardProps) {
  const router = useRouter();
  const { signedIn, authLoading } = useAuthState();
  const [editingAnswer, setEditingAnswer] = useState(false);
  const [answerDraft, setAnswerDraft] = useState(question.answer ?? "");
  const [editingBody, setEditingBody] = useState(false);
  const [bodyDraft, setBodyDraft] = useState(question.body);

  const patchMutation = usePatchQuestion(eventId, year);
  const upvoteMutation = useUpvoteQuestion(eventId, year);

  // Keep drafts in step with refetched data while an editor is closed, so
  // reopening it doesn't resurrect a stale copy of someone else's edit.
  useEffect(() => {
    if (!editingAnswer) setAnswerDraft(question.answer ?? "");
  }, [question.answer, editingAnswer]);

  useEffect(() => {
    if (!editingBody) setBodyDraft(question.body);
  }, [question.body, editingBody]);

  const handleUpvote = () => {
    // While auth is still resolving, `signedIn` is false for a signed-in user;
    // acting on it would bounce them to /login.
    if (isUpvoted || authLoading) return;
    if (!signedIn) {
      router.push(`/login?redirect=${encodeURIComponent(router.asPath)}`);
      return;
    }
    upvoteMutation.mutate(question.questionId, {
      onSuccess: () => onUpvoted(question.questionId),
    });
  };

  const handlePatch = (patch: QuestionPatch, onSuccess?: () => void) => {
    patchMutation.mutate(
      { questionId: question.questionId, patch },
      { onSuccess },
    );
  };

  const statusBadge = question.answer
    ? "bg-bt-green-300/15 text-bt-green-300 border-bt-green-300/30"
    : "bg-[#ffd66b]/10 text-[#ffd66b] border-[#ffd66b]/30";
  const statusLabel = question.answer ? "Answered" : "Pending Answer";

  return (
    <div
      className={cn(
        "rounded-lg border bg-[#0B152C] p-5 shadow-sm",
        question.isPinned ? "border-bt-green-300/40" : "border-[#263451]",
      )}
    >
      {/* Header row */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          {question.isPinned && (
            <span className="inline-flex items-center gap-1 rounded-full border border-bt-green-300/30 bg-bt-green-300/10 px-2 py-0.5 text-xs font-800 text-bt-green-300">
              <Pin className="h-3 w-3" />
              Pinned
            </span>
          )}
          <span
            className={cn(
              "inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-800",
              statusBadge,
            )}
          >
            {statusLabel}
          </span>
          {question.category && (
            <span className="rounded-full bg-[#263451] px-2 py-0.5 text-xs text-[#9f9f9f]">
              {question.category}
            </span>
          )}
        </div>
        <span className="shrink-0 text-xs text-[#6a7a9a]">
          Anonymous · {formatTimeAgo(question.createdAt)}
        </span>
      </div>

      {/* Body */}
      <div className="mt-3">
        {editingBody ? (
          <div className="space-y-2">
            <Textarea
              value={bodyDraft}
              onChange={(e) => setBodyDraft(e.target.value)}
              maxLength={500}
              rows={3}
              className="text-sm text-white"
            />
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="default"
                onClick={() =>
                  handlePatch({ body: bodyDraft }, () => setEditingBody(false))
                }
                disabled={patchMutation.isPending}
              >
                <Check className="h-3.5 w-3.5" />
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setEditingBody(false)}
              >
                <X className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        ) : (
          <p className="text-sm leading-6 text-white">{question.body}</p>
        )}
      </div>

      {/* Answer */}
      {question.answer && !editingAnswer && (
        <div className="mt-4 rounded-md border-l-2 border-bt-green-300 bg-bt-green-300/5 px-4 py-3">
          <p className="mb-1 text-xs font-800 text-bt-green-300">
            Answer {question.answeredBy ? `· ${question.answeredBy}` : ""}
          </p>
          <p className="text-sm leading-6 text-[#c8e6c9]">{question.answer}</p>
        </div>
      )}

      {/* Admin: answer textarea */}
      {isAdmin && editingAnswer && (
        <div className="mt-4 space-y-2">
          <Textarea
            value={answerDraft}
            onChange={(e) => setAnswerDraft(e.target.value)}
            placeholder="Write an answer…"
            rows={3}
            className="text-sm text-white"
          />
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="default"
              onClick={() =>
                handlePatch({ answer: answerDraft }, () =>
                  setEditingAnswer(false),
                )
              }
              disabled={patchMutation.isPending}
            >
              {patchMutation.isPending ? "Posting…" : "Post Answer"}
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setEditingAnswer(false)}
            >
              Cancel
            </Button>
          </div>
        </div>
      )}

      {patchMutation.isError && (
        <p className="mt-2 text-xs text-bt-red-300">
          That change didn&apos;t save. Please try again.
        </p>
      )}

      {/* Footer row */}
      <div className="mt-4 flex flex-wrap items-center gap-2">
        {/* Upvote */}
        <button
          onClick={handleUpvote}
          disabled={isUpvoted || upvoteMutation.isPending}
          className={cn(
            "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-800 transition",
            isUpvoted
              ? "border-bt-green-300/40 bg-bt-green-300/15 text-bt-green-300"
              : "border-bt-blue-300 bg-bt-blue-500 text-[#9f9f9f] hover:border-bt-green-300/40 hover:text-bt-green-300",
          )}
        >
          <ChevronUp className="h-3.5 w-3.5" />
          {question.upvotes}
        </button>

        {/* Admin actions */}
        {isAdmin && (
          <>
            {!editingAnswer && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => setEditingAnswer(true)}
                className="text-xs"
              >
                {question.answer ? "Edit Answer" : "Answer"}
              </Button>
            )}
            <Button
              size="sm"
              variant="outline"
              onClick={() => setEditingBody(true)}
              className="gap-1.5 text-xs"
            >
              <Pencil className="h-3.5 w-3.5" />
              Edit
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => handlePatch({ isPinned: !question.isPinned })}
              className={cn(
                "gap-1.5 text-xs",
                question.isPinned && "text-bt-green-300",
              )}
            >
              <Pin className="h-3.5 w-3.5" />
              {question.isPinned ? "Unpin" : "Pin"}
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => handlePatch({ isHidden: !question.isHidden })}
              className="gap-1.5 text-xs text-bt-red-300 hover:text-bt-red-300"
            >
              <EyeOff className="h-3.5 w-3.5" />
              {question.isHidden ? "Restore" : "Hide"}
            </Button>
            <ExportStoryButton question={question} eventName={eventName} />
          </>
        )}
      </div>
    </div>
  );
}
