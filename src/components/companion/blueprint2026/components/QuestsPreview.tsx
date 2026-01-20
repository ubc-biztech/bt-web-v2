import BluePrintCard from "./BluePrintCard";
import BluePrintButton from "./BluePrintButton";
import { Quests } from "@/queries/quests";

export default function QuestsPreview({
  quests,
}: {
  quests: Quests | undefined;
}) {
  return (
    <BluePrintCard>
      <div className="flex flex-row items-center justify-between">
        <div className="text-md font-medium">Quests</div>
        <BluePrintButton className="text-xs p-4">VIEW ALL</BluePrintButton>
      </div>
      <div className="h-[0.5px] mt-2 w-full bg-gradient-to-r from-transparent via-white to-transparent" />

      {!quests ? (
        <div className="mx-16 my-4 text-center opacity-80">
          {"No quests available"}
        </div>
      ) : (
        <div className="my-2">
          {Object.entries(quests)
            .slice(0, 3)
            .map(([questKey, quest]) => (
              <div key={questKey} className="flex flex-row justify-between">
                <div>{questKey}</div>
                <div>
                  {quest.progress} / {quest.target}
                </div>
              </div>
            ))}
        </div>
      )}
    </BluePrintCard>
  );
}
