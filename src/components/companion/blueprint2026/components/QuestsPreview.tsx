import BluePrintCard from "./BluePrintCard";
import BluePrintButton from "./BluePrintButton";
import { Quests } from "@/queries/quests";
import Link from "next/link";
import { CircleStar } from "lucide-react";

export default function QuestsPreview({
  quests,
}: {
  quests: Quests | undefined;
}) {
  const questsArray = quests
    ? Object.entries(quests).map(([id, quest]) => ({
        id,
        ...quest,
        isCompleted:
          quest.completedAt !== null ||
          (quest.target !== null && quest.progress >= quest.target),
      }))
    : [];

  // Sort: in-progress first, then by progress percentage
  const sortedQuests = questsArray
    .sort((a, b) => {
      if (a.isCompleted !== b.isCompleted) return a.isCompleted ? 1 : -1;
      const aPercent = a.target ? a.progress / a.target : 0;
      const bPercent = b.target ? b.progress / b.target : 0;
      return bPercent - aPercent;
    })
    .slice(0, 3);

  return (
    <BluePrintCard>
      <div className="flex flex-row items-center justify-between">
        <div className="flex items-center gap-2">
          <CircleStar size={16} className="text-[#6299ff]" />
          <div className="text-md font-medium">Quests</div>
        </div>
        <Link href="/events/blueprint/2026/companion/quests">
          <BluePrintButton className="text-xs p-4">VIEW ALL</BluePrintButton>
        </Link>
      </div>
      <div className="h-[0.5px] mt-2 w-full bg-gradient-to-r from-transparent via-white to-transparent" />

      {!quests || sortedQuests.length === 0 ? (
        <div className="mx-16 my-4 text-center text-white/70 rounded-lg bg-black/30 py-4">
          {"No quests available"}
        </div>
      ) : (
        <div className="flex flex-col gap-3 my-3">
          {sortedQuests.map((quest) => {
            const progressPercent = quest.target
              ? Math.min((quest.progress / quest.target) * 100, 100)
              : 0;

            return (
              <div
                key={quest.id}
                className="flex flex-col gap-1.5 p-3 rounded-lg bg-black/40 border border-white/10"
              >
                <div className="flex items-center justify-between text-sm">
                  <span className="text-white">
                    {quest.description ?? quest.id}
                  </span>
                  <span className="text-[#6299ff] text-xs font-medium">
                    {quest.progress}/{quest.target ?? "∞"}
                  </span>
                </div>
                {quest.target !== null && (
                  <div className="w-full h-1.5 bg-black/30 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500 bg-gradient-to-r from-[#6299ff] to-[#EAE5D4]"
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </BluePrintCard>
  );
}
