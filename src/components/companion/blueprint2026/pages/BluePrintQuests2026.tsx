import { useRouter } from "next/router";
import {
  ArrowLeft,
  Sparkles,
  Target,
  CheckCircle2,
  Circle,
} from "lucide-react";
import Link from "next/link";
import BluePrintLayout from "../layout/BluePrintLayout";
import BluePrintCard from "../components/BluePrintCard";
import BluePrintButton from "../components/BluePrintButton";
import { useQuests } from "@/queries/quests";
import { DynamicPageProps } from "@/constants/companion-events";

export default function BluePrintQuests2026({
  eventId,
  year,
}: DynamicPageProps) {
  const router = useRouter();
  const routeEventId =
    typeof router.query.eventId === "string" ? router.query.eventId : eventId;
  const routeYear =
    typeof router.query.year === "string" ? router.query.year : year;

  const { data: quests, isLoading } = useQuests(routeEventId, routeYear);

  const questsArray = quests
    ? Object.entries(quests).map(([id, quest]) => ({
        id,
        ...quest,
        isCompleted:
          quest.completedAt !== null ||
          (quest.target !== null && quest.progress >= quest.target),
      }))
    : [];

  // Sort: in-progress first, then completed
  const sortedQuests = questsArray.sort((a, b) => {
    if (a.isCompleted !== b.isCompleted) {
      return a.isCompleted ? 1 : -1;
    }
    const aPercentage = a.target ? (a.progress / a.target) * 100 : a.progress;
    const bPercentage = b.target ? (b.progress / b.target) * 100 : b.progress;
    return bPercentage - aPercentage;
  });

  const completedCount = questsArray.filter((q) => q.isCompleted).length;
  const totalQuests = questsArray.length;

  return (
    <BluePrintLayout>
      <div className="flex flex-col gap-3 pb-6">
        {/* Header with Title */}
        <div className="flex items-center justify-between">
          <Link href={`/events/${routeEventId}/${routeYear}/companion`}>
            <BluePrintButton className="text-xs px-2.5 py-1.5">
              <ArrowLeft size={14} />
              Back
            </BluePrintButton>
          </Link>
          <div className="flex items-center gap-2">
            <Sparkles className="text-[#6299ff]" size={18} />
            <h1 className="text-lg font-medium text-white">
              Quests
            </h1>
            <span className="text-xs text-[#778191]">
              ({completedCount}/{totalQuests})
            </span>
          </div>
          <div className="w-16" /> {/* Spacer for centering */}
        </div>

        <div className="h-[0.5px] w-full bg-gradient-to-r from-transparent via-white/30 to-transparent" />

        {/* Loading */}
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#6299ff]" />
          </div>
        )}

        {/* Empty state */}
        {!isLoading && sortedQuests.length === 0 && (
          <BluePrintCard>
            <div className="text-center py-8">
              <Sparkles className="mx-auto text-white/40 mb-3" size={48} />
              <p className="text-white">No quests available</p>
              <p className="text-white/60 text-sm mt-2">
                Check back later for new challenges!
              </p>
            </div>
          </BluePrintCard>
        )}

        {/* Quest list */}
        {!isLoading && sortedQuests.length > 0 && (
          <div className="flex flex-col gap-3">
            {sortedQuests.map((quest) => {
              const progressPercentage = quest.target
                ? Math.min((quest.progress / quest.target) * 100, 100)
                : 0;

              return (
                <div key={quest.id} className="p-4 rounded-xl bg-black/40 border border-white/10">
                  <div className="flex items-start gap-3">
                    {/* Icon */}
                    <div className="flex-shrink-0 mt-0.5">
                      {quest.isCompleted ? (
                        <CheckCircle2 className="text-[#4ADE80]" size={22} />
                      ) : quest.progress > 0 ? (
                        <Target className="text-[#6299ff]" size={22} />
                      ) : (
                        <Circle className="text-white/40" size={22} />
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <span
                          className={`font-medium ${
                            quest.isCompleted ? "text-[#4ADE80]" : "text-white"
                          }`}
                        >
                          {quest.description ?? quest.id}
                        </span>
                        <span
                          className={`text-sm flex-shrink-0 ${
                            quest.isCompleted
                              ? "text-[#4ADE80]"
                              : "text-[#6299ff]"
                          }`}
                        >
                          {quest.progress}/{quest.target ?? "∞"}
                        </span>
                      </div>

                      {/* Progress bar */}
                      {quest.target !== null && (
                        <div className="w-full h-2 bg-black/30 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${
                              quest.isCompleted
                                ? "bg-gradient-to-r from-[#4ADE80] to-[#22C55E]"
                                : "bg-gradient-to-r from-[#6299ff] to-[#EAE5D4]"
                            }`}
                            style={{ width: `${progressPercentage}%` }}
                          />
                        </div>
                      )}

                      {/* Items list for unique set quests */}
                      {quest.items && quest.items.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1">
                          {quest.items.map((item, idx) => (
                            <span
                              key={idx}
                              className="text-xs px-2 py-0.5 rounded-full bg-black/30 border border-white/15 text-white/70"
                            >
                              {item}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </BluePrintLayout>
  );
}
