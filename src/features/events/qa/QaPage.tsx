import { useState, useMemo } from "react";
import Link from "next/link";
import { ArrowLeft, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useQaQuestions } from "./queries";
import { QuestionCard } from "./QuestionCard";
import { AskQuestionModal } from "./AskQuestionModal";
import type { Question, QaSortTab } from "./types";

const PAGE_SIZE = 10;
const UPVOTED_KEY = (eventId: string, year: string) => `qa-upvoted-${eventId}-${year}`;

function getUpvotedSet(eventId: string, year: string): Set<string> {
  try {
    const raw = typeof window !== "undefined" ? localStorage.getItem(UPVOTED_KEY(eventId, year)) : null;
    return new Set(raw ? JSON.parse(raw) : []);
  } catch {
    return new Set();
  }
}

function addUpvoted(eventId: string, year: string, questionId: string) {
  try {
    if (typeof window === "undefined") return;
    const set = getUpvotedSet(eventId, year);
    set.add(questionId);
    localStorage.setItem(UPVOTED_KEY(eventId, year), JSON.stringify([...set]));
  } catch {}
}

interface QaPageProps {
  eventId: string;
  year: string;
  eventName?: string;
  isAdmin: boolean;
  signedIn: boolean;
}

export function QaPage({
  eventId,
  year,
  eventName = "Event",
  isAdmin,
  signedIn,
}: QaPageProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const [tab, setTab] = useState<QaSortTab>("all");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [upvotedIds, setUpvotedIds] = useState<Set<string>>(
    () => getUpvotedSet(eventId, year)
  );

  const { data: questions, isLoading } = useQaQuestions(eventId, year);

  const handleUpvote = (questionId: string) => {
    addUpvoted(eventId, year, questionId);
    setUpvotedIds((prev) => new Set([...prev, questionId]));
  };

  const sorted = useMemo<Question[]>(() => {
    if (!questions) return [];

    const searchTerm = search.trim().toLowerCase();
    const filtered = searchTerm
      ? questions.filter((q) => q.body.toLowerCase().includes(searchTerm))
      : questions;

    const sorted = [...filtered].sort((a, b) =>
      (b.isPinned ? 1 : 0) - (a.isPinned ? 1 : 0) || b.upvotes - a.upvotes
    );

    const tabFilters: Record<QaSortTab, (q: Question) => boolean> = {
      all: () => true,
      pendingReview: (q) => !q.answer,
      answered: (q) => !!q.answer,
      flagged: (q) => q.isHidden,
    };

    return sorted.filter(tabFilters[tab]);
  }, [questions, tab, search]);

  const stats = useMemo(() => {
    if (!questions) return { total: 0, answered: 0, rate: 0 };
    const answered = questions.filter((q) => q.answer).length;
    return {
      total: questions.length,
      answered,
      rate: questions.length > 0 ? Math.round((answered / questions.length) * 100) : 0,
    };
  }, [questions]);

  const paginated = sorted.slice(0, page * PAGE_SIZE);
  const hasMore = paginated.length < sorted.length;

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
          <h1 className="text-xl font-800 text-white md:text-2xl">
            Q&A Board
          </h1>
          <Button variant="default" onClick={() => setModalOpen(true)}>
            Ask a Question
          </Button>
        </div>

        {/* Stats */}
        {!isLoading && (
          <div className="grid grid-cols-3 gap-4">
            <div className="rounded-lg border border-[#263451] bg-[#0B152C] p-4">
              <p className="text-xs font-800 text-[#6a7a9a]">Total Questions</p>
              <p className="mt-2 text-2xl font-800 text-white">{stats.total}</p>
            </div>
            <div className="rounded-lg border border-[#263451] bg-[#0B152C] p-4">
              <p className="text-xs font-800 text-[#6a7a9a]">Answered</p>
              <p className="mt-2 text-2xl font-800 text-white">{stats.answered}</p>
            </div>
            <div className="rounded-lg border border-[#263451] bg-[#0B152C] p-4">
              <p className="text-xs font-800 text-[#6a7a9a]">Response Rate</p>
              <p className="mt-2 text-2xl font-800 text-white">{stats.rate}%</p>
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

        {/* Tabs */}
        <Tabs
          value={tab}
          onValueChange={(v) => {
            setTab(v as QaSortTab);
            setPage(1);
          }}
        >
          <TabsList className="bg-[#0B152C]">
            <TabsTrigger value="all">All ({questions?.length ?? 0})</TabsTrigger>
            <TabsTrigger value="pendingReview">
              Pending Review ({questions?.filter((q) => !q.answer).length ?? 0})
            </TabsTrigger>
            <TabsTrigger value="answered">
              Answered ({questions?.filter((q) => q.answer).length ?? 0})
            </TabsTrigger>
            <TabsTrigger value="flagged">
              Flagged ({questions?.filter((q) => q.isHidden).length ?? 0})
            </TabsTrigger>
          </TabsList>

          {(["all", "pendingReview", "answered", "flagged"] as QaSortTab[]).map(
            (tabVal) => (
              <TabsContent key={tabVal} value={tabVal} className="mt-4 space-y-4">
                {isLoading ? (
                  Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="h-32 animate-pulse rounded-lg bg-[#151515]" />
                  ))
                ) : paginated.length === 0 ? (
                  <div className="rounded-lg border border-[#263451] bg-[#0B152C] p-8 text-center">
                    <p className="text-sm text-[#6a7a9a]">
                      {search
                        ? "No questions match your search."
                        : "No questions yet."}
                    </p>
                  </div>
                ) : (
                  paginated.map((q) => (
                    <QuestionCard
                      key={q.questionId}
                      question={q}
                      eventId={eventId}
                      year={year}
                      eventName={eventName}
                      isAdmin={isAdmin}
                      isUpvoted={upvotedIds.has(q.questionId)}
                      signedIn={signedIn}
                      onUpvote={handleUpvote}
                    />
                  ))
                )}
                {hasMore && (
                  <div className="flex justify-center pt-2">
                    <Button
                      variant="outline"
                      onClick={() => setPage((p) => p + 1)}
                    >
                      Load more questions
                    </Button>
                  </div>
                )}
              </TabsContent>
            )
          )}
        </Tabs>
      </div>

      <AskQuestionModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        eventId={eventId}
        year={year}
        signedIn={signedIn}
      />
    </main>
  );
}
