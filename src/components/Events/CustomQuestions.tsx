import React from "react";
import { useFieldArray, Control } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { EventFormSchema } from "./EventFormSchema";
import { CustomQuestionItem } from "@/components/Events/CustomQuestionItem";

interface CustomQuestionsProps {
  control: Control<any>;
  name: string;
  label: string;
}

export const CustomQuestions: React.FC<CustomQuestionsProps> = ({
  control,
}) => {
  const { fields, append, remove, swap } = useFieldArray({
    control,
    name: "customQuestions",
  });

  const addCustomQuestion = () => {
    append({
      id: "",
      type: "TEXT",
      question: "",
      required: false,
      options: [],
    });
  };

  const moveQuestion = (index: number, direction: "up" | "down") => {
    if (direction === "up" && index > 0) {
      swap(index, index - 1);
    } else if (direction === "down" && index < fields.length - 1) {
      swap(index, index + 1);
    }
  };

  return (
    <div>
      <h4 className="text-bt-blue-100">Attendee Form Custom Questions</h4>
      <div className="space-y-6">
        {fields.map((field, index) => (
          <CustomQuestionItem
            key={field.id}
            index={index}
            control={control}
            remove={remove}
            onMoveUp={() => moveQuestion(index, "up")}
            onMoveDown={() => moveQuestion(index, "down")}
            isFirst={index === 0}
            isLast={index === fields.length - 1}
          />
        ))}
      </div>
      <Button type="button" onClick={addCustomQuestion} className="mt-2">
        <Plus className="w-4 h-4 mr-2" />
        Add Custom Question
      </Button>
    </div>
  );
};
