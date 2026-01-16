import BluePrintCard from "./BluePrintCard";
import BluePrintButton from "./BluePrintButton";

export default function QuestsPreview() {
    return (
        <BluePrintCard>
            <div className="flex flex-row items-center justify-between">

            <div className="text-md font-medium">
                Quests
            </div>
            <BluePrintButton className="text-xs p-4">
                VIEW ALL
            </BluePrintButton>
            </div>
            <div className="h-[0.5px] mt-2 w-full bg-gradient-to-r from-transparent via-white to-transparent"/>
        </BluePrintCard>
    )
}