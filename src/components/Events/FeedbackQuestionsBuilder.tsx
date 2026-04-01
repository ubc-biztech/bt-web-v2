import React, { useState } from "react";
import {
  Control,
  useFieldArray,
  useFormContext,
  useWatch,
} from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { ChevronDown, ChevronUp, Lock, Plus, Trash2 } from "lucide-react";
import { FeedbackQuestionTypes } from "@/constants/feedbackQuestionTypes";
import { OVERALL_RATING_QUESTION_ID } from "@/constants/feedbackQuestionTypes";

type FeedbackQuestionsBuilderProps = {
  control: Control<any>;
  name: string;
  title: string;
  description?: string;
};

const QUESTION_TYPE_OPTIONS = [
  { value: FeedbackQuestionTypes.SHORT_TEXT, label: "Short answer" },
  { value: FeedbackQuestionTypes.LONG_TEXT, label: "Long answer" },
  { value: FeedbackQuestionTypes.MULTIPLE_CHOICE, label: "Multiple choice" },
  { value: FeedbackQuestionTypes.CHECKBOXES, label: "Checkboxes" },
  { value: FeedbackQuestionTypes.LINEAR_SCALE, label: "Linear scale" },
];

export const FeedbackQuestionsBuilder: React.FC<
  FeedbackQuestionsBuilderProps
> = ({ control, name, title, description }) => {
  const { fields, append, remove, swap } = useFieldArray({
    control,
    name,
  });

  const { register, setValue, getValues } = useFormContext();
  const questions = (useWatch({ control, name }) as any[]) || [];
  const [optionDrafts, setOptionDrafts] = useState<Record<string, string>>({});

  const addQuestion = () => {
    append({
      id: "",
      type: FeedbackQuestionTypes.SHORT_TEXT,
      question: "",
      required: true,
      options: [],
      scaleMin: 1,
      scaleMax: 5,
      scaleMinLabel: "Very dissatisfied",
      scaleMaxLabel: "Very satisfied",
    });
  };

  const moveQuestion = (index: number, direction: "up" | "down") => {
    if (direction === "up" && index > 0) {
      swap(index, index - 1);
      return;
    }
    if (direction === "down" && index < fields.length - 1) {
      swap(index, index + 1);
    }
  };

  const removeQuestion = (index: number) => {
    remove(index);
    setValue(name, ((getValues(name) as any[]) || []).slice(), {
      shouldDirty: true,
      shouldValidate: true,
    });
  };

  const setDraftValue = (key: string, value: string) => {
    setOptionDrafts((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const addOption = (index: number) => {
    const optionKey = `${name}.${index}`;
    const rawValue = optionDrafts[optionKey] || "";
    const cleanValue = rawValue.trim();
    if (!cleanValue) return;

    const optionPath = `${name}.${index}.options`;
    const currentOptions = (getValues(optionPath) as string[]) || [];
    setValue(optionPath, [...currentOptions, cleanValue], {
      shouldDirty: true,
      shouldValidate: true,
    });
    setDraftValue(optionKey, "");
  };

  const removeOption = (index: number, optionIndex: number) => {
    const optionPath = `${name}.${index}.options`;
    const currentOptions = ((getValues(optionPath) as string[]) || []).slice();
    currentOptions.splice(optionIndex, 1);
    setValue(optionPath, currentOptions, {
      shouldDirty: true,
      shouldValidate: true,
    });
  };

  return (
    <div className="space-y-4">
      <div>
        <h4 className="text-sm font-semibold uppercase tracking-wide text-white">
          {title}
        </h4>
        {description && (
          <p className="mt-1 text-sm text-bt-blue-100">{description}</p>
        )}
      </div>

      <div className="space-y-4">
        {fields.map((field, index) => {
          const type =
            questions[index]?.type || FeedbackQuestionTypes.SHORT_TEXT;
          const options = (questions[index]?.options as string[]) || [];
          const isDefault = questions[index]?.id === OVERALL_RATING_QUESTION_ID;
          const isRequired = isDefault
            ? true
            : Boolean(questions[index]?.required);

          return (
            <div
              key={field.id}
              className="rounded-xl border border-bt-blue-300/30 bg-bt-blue-600/45 p-4 sm:p-5"
            >
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div className="space-y-1">
                  <p className="text-xs uppercase tracking-wide text-bt-blue-100 flex items-center gap-1.5">
                    Question {index + 1}
                    {isDefault && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-bt-green-400/15 px-2 py-0.5 text-[10px] font-medium text-bt-green-300 normal-case tracking-normal">
                        <Lock className="w-2.5 h-2.5" /> Default
                      </span>
                    )}
                  </p>
                  <div className="w-full lg:w-[260px]">
                    <Label className="mb-1.5 block text-xs text-white">
                      Type
                    </Label>
                    <Select
                      value={type}
                      disabled={isDefault}
                      onValueChange={(value) =>
                        setValue(`${name}.${index}.type`, value, {
                          shouldDirty: true,
                          shouldValidate: true,
                        })
                      }
                    >
                      <SelectTrigger className="text-white">
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        {QUESTION_TYPE_OPTIONS.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-start gap-2 lg:justify-end">
                  <Label
                    htmlFor={`${name}.${index}.required`}
                    className="text-sm text-white whitespace-nowrap"
                  >
                    Required
                  </Label>
                  <Checkbox
                    id={`${name}.${index}.required`}
                    checked={isRequired}
                    disabled={isDefault}
                    onCheckedChange={(checked) =>
                      !isDefault &&
                      setValue(`${name}.${index}.required`, Boolean(checked), {
                        shouldDirty: true,
                        shouldValidate: true,
                      })
                    }
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => moveQuestion(index, "up")}
                    disabled={index === 0 || isDefault}
                    className="h-8 w-8"
                  >
                    <ChevronUp className="h-4 w-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => moveQuestion(index, "down")}
                    disabled={index === fields.length - 1 || isDefault}
                    className="h-8 w-8"
                  >
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeQuestion(index)}
                    disabled={isDefault}
                    className="h-8 w-8 text-bt-red-200 hover:text-bt-red-100"
                    title={
                      isDefault
                        ? "This default question cannot be removed"
                        : "Delete question"
                    }
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="mt-4">
                <Label className="mb-1.5 block text-xs text-white">
                  Prompt
                </Label>
                <Textarea
                  rows={2}
                  placeholder="Write the question users should answer"
                  readOnly={isDefault}
                  className={isDefault ? "opacity-70 cursor-not-allowed" : ""}
                  {...register(`${name}.${index}.question`)}
                />
              </div>

              {(type === FeedbackQuestionTypes.MULTIPLE_CHOICE ||
                type === FeedbackQuestionTypes.CHECKBOXES) && (
                <div className="mt-4 space-y-3">
                  <Label className="block text-xs text-white">Options</Label>
                  <div className="flex flex-wrap gap-2">
                    {options.length === 0 ? (
                      <p className="text-sm text-bt-blue-100">
                        No options yet.
                      </p>
                    ) : (
                      options.map((option, optionIndex) => (
                        <span
                          key={`${option}-${optionIndex}`}
                          className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs text-white"
                        >
                          {option}
                          <button
                            type="button"
                            className="text-white/80 hover:text-white"
                            onClick={() => removeOption(index, optionIndex)}
                            aria-label={`Remove option ${option}`}
                          >
                            ×
                          </button>
                        </span>
                      ))
                    )}
                  </div>

                  <div className="flex flex-col gap-2 sm:flex-row">
                    <Input
                      value={optionDrafts[`${name}.${index}`] || ""}
                      onChange={(e) =>
                        setDraftValue(`${name}.${index}`, e.target.value)
                      }
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          addOption(index);
                        }
                      }}
                      placeholder="Type an option and press Add"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => addOption(index)}
                      className="border-white/20 bg-transparent text-white hover:bg-white/10"
                    >
                      Add Option
                    </Button>
                  </div>
                </div>
              )}

              {type === FeedbackQuestionTypes.LINEAR_SCALE && (
                <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div>
                    <Label className="mb-1.5 block text-xs text-white">
                      Minimum value
                    </Label>
                    <Input
                      type="number"
                      min={0}
                      max={20}
                      readOnly={isDefault}
                      className={
                        isDefault ? "opacity-70 cursor-not-allowed" : ""
                      }
                      {...register(`${name}.${index}.scaleMin`, {
                        valueAsNumber: true,
                      })}
                    />
                  </div>
                  <div>
                    <Label className="mb-1.5 block text-xs text-white">
                      Maximum value
                    </Label>
                    <Input
                      type="number"
                      min={1}
                      max={20}
                      readOnly={isDefault}
                      className={
                        isDefault ? "opacity-70 cursor-not-allowed" : ""
                      }
                      {...register(`${name}.${index}.scaleMax`, {
                        valueAsNumber: true,
                      })}
                    />
                  </div>
                  <div>
                    <Label className="mb-1.5 block text-xs text-white">
                      Minimum label
                    </Label>
                    <Input
                      placeholder="e.g. Very dissatisfied"
                      readOnly={isDefault}
                      className={
                        isDefault ? "opacity-70 cursor-not-allowed" : ""
                      }
                      {...register(`${name}.${index}.scaleMinLabel`)}
                    />
                  </div>
                  <div>
                    <Label className="mb-1.5 block text-xs text-white">
                      Maximum label
                    </Label>
                    <Input
                      placeholder="e.g. Very satisfied"
                      readOnly={isDefault}
                      className={
                        isDefault ? "opacity-70 cursor-not-allowed" : ""
                      }
                      {...register(`${name}.${index}.scaleMaxLabel`)}
                    />
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <Button
        type="button"
        onClick={addQuestion}
        className="gap-2 bg-bt-blue-400 text-white hover:bg-bt-blue-300"
      >
        <Plus className="h-4 w-4" />
        Add Feedback Question
      </Button>
    </div>
  );
};
