import { useState, useMemo } from "react";
import Link from "next/link";
import { ArrowLeft, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuthState } from "@/queries/user";
import { useQaQuestions } from "./queries";
import { useUpvotedQuestions } from "./useUpvotedQuestions";
import { QuestionCard } from "./QuestionCard";
import { AskQuestionModal } from "./AskQuestionModal";
import {
  QA_FILTER_TABS,
  QA_FILTER_TAB_LABELS,
  QA_FILTER_TAB_PREDICATES,
  type QaFilterTab,
} from "./types";

const PAGE_SIZE = 10;

interface QaPageProps {
  eventId: string;
  year: string;
  eventName?: string;
}

export function QaPage({ eventId, year, eventName = "Event" }: QaPageProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const [tab, setTab] = useState<QaFilterTab>("all");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const { isAdmin } = useAuthState();
  const { data: questions, isLoading, isError } = useQaQuestions(eventId, year);
  const { upvotedIds, markUpvoted } = useUpvotedQuestions(eventId, year);

  const visibleQuestions = useMemo(() => {
    if (!questions) return [];

    const searchTerm = search.trim().toLowerCase();
    const matching = searchTerm
      ? questions.filter((q) => q.body.toLowerCase().includes(searchTerm))
      : questions;

    return [...matching]
      .filter(QA_FILTER_TAB_PREDICATES[tab])
      .sort(
        (a, b) =>
          Number(b.isPinned) - Number(a.isPinned) || b.upvotes - a.upvotes,
      );
  }, [questions, tab, search]);

  const tabCounts = useMemo(() => {
    const source = questions ?? [];
    return Object.fromEntries(
      QA_FILTER_TABS.map((tabValue) => [
        tabValue,
        source.filter(QA_FILTER_TAB_PREDICATES[tabValue]).length,
      ]),
    ) as Record<QaFilterTab, number>;
  }, [questions]);

  const responseRate = tabCounts.all
    ? Math.round((tabCounts.answered / tabCounts.all) * 100)
    : 0;

  const paginated = visibleQuestions.slice(0, page * PAGE_SIZE);
  const hasMore = paginated.length < visibleQuestions.length;

  return (
    <main className="min-h-[calc(100vh-8rem)] bg-transparent text-white">
      <div className="mx-auto flex w-full max-w-[860px] flex-col gap-6 px-4 py-6">
        {/* Back link */}
        <Link
          href={`/event/${eventId}/${year}`}
          className="inline-flex items-center gap-1.5 text-xs text-[#9f9f9f] hover:text-white"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to event
        </Link>

        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-xl font-800 text-white md:text-2xl">Q&A Board</h1>
          <Button variant="default" onClick={() => setModalOpen(true)}>
            Ask a Question
          </Button>
        </div>

        {/* Stats */}
        {!isLoading && (
          <div className="grid grid-cols-3 gap-4">
            <div className="rounded-lg border border-[#263451] bg-[#0B152C] p-4">
              <p className="text-xs font-800 text-[#6a7a9a]">Total Questions</p>
              <p className="mt-2 text-2xl font-800 text-white">
                {tabCounts.all}
              </p>
            </div>
            <div className="rounded-lg border border-[#263451] bg-[#0B152C] p-4">
              <p className="text-xs font-800 text-[#6a7a9a]">Answered</p>
              <p className="mt-2 text-2xl font-800 text-white">
                {tabCounts.answered}
              </p>
            </div>
            <div className="rounded-lg border border-[#263451] bg-[#0B152C] p-4">
              <p className="text-xs font-800 text-[#6a7a9a]">Response Rate</p>
              <p className="mt-2 text-2xl font-800 text-white">
                {responseRate}%
              </p>
            </div>
          </div>
        )}

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6a7a9a]" />
          <input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Search questions…"
            className="w-full rounded-md border border-[#263451] bg-[#0B152C] py-2 pl-9 pr-3 text-sm text-white placeholder-[#6a7a9a] focus:outline-none focus:ring-1 focus:ring-bt-blue-100"
          />
        </div>

        <Tabs
          value={tab}
          onValueChange={(value) => {
            setTab(value as QaFilterTab);
            setPage(1);
          }}
        >
          <TabsList className="bg-[#0B152C]">
            {QA_FILTER_TABS.map((tabValue) => (
              <TabsTrigger key={tabValue} value={tabValue}>
                {QA_FILTER_TAB_LABELS[tabValue]} ({tabCounts[tabValue]})
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        {/* Questions */}
        <div className="space-y-4">
          {isLoading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-32 rounded-lg bg-[#151515]" />
            ))
          ) : isError ? (
            <div className="rounded-lg border border-bt-red-300/30 bg-bt-red-300/10 p-8 text-center">
              <p className="text-sm text-bt-red-300">
                We couldn&apos;t load the questions. Please refresh to try
                again.
              </p>
            </div>
          ) : paginated.length === 0 ? (
            <div className="rounded-lg border border-[#263451] bg-[#0B152C] p-8 text-center">
              <p className="text-sm text-[#6a7a9a]">
                {search
                  ? "No questions match your search."
                  : "No questions yet."}
              </p>
            </div>
          ) : (
            paginated.map((question) => (
              <QuestionCard
                key={question.questionId}
                question={question}
                eventId={eventId}
                year={year}
                eventName={eventName}
                isAdmin={isAdmin}
                isUpvoted={upvotedIds.has(question.questionId)}
                onUpvoted={markUpvoted}
              />
            ))
          )}
          {hasMore && (
            <div className="flex justify-center pt-2">
              <Button variant="outline" onClick={() => setPage((p) => p + 1)}>
                Load more questions
              </Button>
            </div>
          )}
        </div>
      </div>

      <AskQuestionModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        eventId={eventId}
        year={year}
      />
    </main>
  );
}
