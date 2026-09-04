import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { ChevronUp, ArrowUpRight, CheckCircle2, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useQaQuestions } from "./queries";
import { AskQuestionModal } from "./AskQuestionModal";

interface QaModuleProps {
  eventId: string;
  year: string;
}

export function QaModule({ eventId, year }: QaModuleProps) {
  const router = useRouter();
  const [modalOpen, setModalOpen] = useState(false);
  const { data: questions, isLoading, isError } = useQaQuestions(eventId, year);
  const boardHref = `/event/${eventId}/${year}/qa`;

  const featured = questions?.find((q) => q.isPinned) ?? questions?.[0];

  return (
    <section className="flex min-h-[275px] flex-col overflow-hidden rounded-lg border border-[#263451] bg-[#0B152C] shadow-[0_12px_28px_rgba(0,0,0,0.2)]">
      <div className="flex flex-1 flex-col gap-4 p-5 md:p-6">
        {/* Header */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex flex-col gap-1 flex-1">
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-800 text-white">Event Q&A Board</h3>
              <ArrowUpRight className="h-4 w-4 text-white" />
            </div>
            <p className="text-xs text-[#9f9f9f]">
              Ask questions to BizTech Execs and get answers
            </p>
          </div>
          <Button
            variant="default"
            size="sm"
            onClick={() => setModalOpen(true)}
            className="text-xs shrink-0"
          >
            + Ask a question
          </Button>
        </div>

        {/* Featured question */}
        {isLoading ? (
          <Skeleton className="h-20 bg-[#151515]" />
        ) : featured ? (
          <div className="flex flex-1 flex-col gap-3">
            {/* Question header with avatar */}
            <div className="flex items-start gap-3">
              <div className="rounded-full bg-[#263451] p-2 shrink-0">
                <User className="h-4 w-4 text-[#9f9f9f]" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-[#9f9f9f]">Anonymous</p>
                <p className="text-sm leading-5 text-white break-words">
                  {featured.body}
                </p>
              </div>
            </div>

            {/* Question footer with upvotes and status */}
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-1 text-[#9f9f9f]">
                <ChevronUp className="h-4 w-4" />
                <span className="text-xs font-800">{featured.upvotes}</span>
              </div>
              {featured.answer && (
                <span className="inline-flex items-center gap-1 rounded-full border border-bt-green-300/30 bg-bt-green-300/10 px-2 py-0.5 text-xs font-800 text-bt-green-300">
                  <CheckCircle2 className="h-3 w-3" />
                  Answered
                </span>
              )}
            </div>
          </div>
        ) : (
          <div className="flex flex-1 flex-col items-center justify-center gap-2 text-center">
            <p className="text-sm text-[#6a7a9a]">
              {isError
                ? "We couldn't load questions right now."
                : "No questions yet. Be the first!"}
            </p>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="border-t border-[#263451] p-4 text-center">
        <Link
          href={boardHref}
          className="text-xs font-800 text-bt-blue-100 hover:text-white"
        >
          View all questions →
        </Link>
      </div>

      <AskQuestionModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        eventId={eventId}
        year={year}
        onViewBoard={() => router.push(boardHref)}
      />
    </section>
  );
}
