import Image from "next/image";
import BluePrintCard from "./BluePrintCard";
import { Button } from "@/components/ui/button";

export default function QuizResultsPreview() {
  return (
    <BluePrintCard className="min-h-36">
      <div className="flex flex-col">
        <p className="text-lg">BluePrint Career Quiz</p>
        <p className="text-xs opacity-60 -mt-1">
          {" "}
          Visit a kiosk to take the quiz
        </p>
        <Button className="mt-4 bg-[#4972EF] text-white rounded-full w-fit text-xs">
          View your assessment
        </Button>
      </div>
      <Image
        src="/assets/blueprint/quiz-staircase.png"
        height={256}
        width={256}
        alt="Staircase"
        className="absolute bottom-0 right-0 rounded-sm"
      />
    </BluePrintCard>
  );
}
