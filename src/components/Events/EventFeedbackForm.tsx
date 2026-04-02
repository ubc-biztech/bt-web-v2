import React, { useMemo } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Image from "next/image";
import { BiztechEvent, FeedbackQuestion } from "@/types";
import {
  FeedbackFormType,
  FeedbackQuestionTypes,
} from "@/constants/feedbackQuestionTypes";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Card, CardContent } from "@/components/ui/card";
import { BadgeCheck, Building, Calendar, CircleAlert } from "lucide-react";
import { extractMonthDay, extractTime } from "@/util/extractDate";
import { cn } from "@/lib/utils";

type FeedbackFormValues = {
  respondentName?: string;
  respondentEmail?: string;
  responses: Record<string, any>;
};

type EventFeedbackFormProps = {
  event: BiztechEvent;
  formType: FeedbackFormType;
  questions: FeedbackQuestion[];
  isSubmitting?: boolean;
  onSubmit: (payload: FeedbackFormValues) => Promise<void>;
};

const FEEDBACK_TEXT_LIMITS = {
  SHORT_TEXT: 280,
  LONG_TEXT: 4000,
} as const;

const normalizeChoices = (choices?: string) => {
  if (!choices) return [];
  return choices
    .split(",")
    .map((choice) => choice.trim())
    .filter(Boolean);
};

const createFeedbackSchema = (questions: FeedbackQuestion[]) =>
  z
    .object({
      respondentName: z.string().max(120).optional(),
      respondentEmail: z
        .string()
        .email("Please enter a valid email address")
        .or(z.literal(""))
        .optional(),
      responses: z.record(z.any()),
    })
    .superRefine((data, ctx) => {
      for (const question of questions) {
        const answer = data.responses?.[question.questionId];

        if (question.type === FeedbackQuestionTypes.SHORT_TEXT) {
          const text = typeof answer === "string" ? answer.trim() : "";
          if (question.required && !text) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              path: ["responses", question.questionId],
              message: "This question is required.",
            });
          }
          if (text.length > FEEDBACK_TEXT_LIMITS.SHORT_TEXT) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              path: ["responses", question.questionId],
              message: `Please keep this answer under ${FEEDBACK_TEXT_LIMITS.SHORT_TEXT} characters.`,
            });
          }
          continue;
        }

        if (question.type === FeedbackQuestionTypes.LONG_TEXT) {
          const text = typeof answer === "string" ? answer.trim() : "";
          if (question.required && !text) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              path: ["responses", question.questionId],
              message: "This question is required.",
            });
          }
          if (text.length > FEEDBACK_TEXT_LIMITS.LONG_TEXT) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              path: ["responses", question.questionId],
              message: `Please keep this answer under ${FEEDBACK_TEXT_LIMITS.LONG_TEXT} characters.`,
            });
          }
          continue;
        }

        if (question.type === FeedbackQuestionTypes.MULTIPLE_CHOICE) {
          const options = normalizeChoices(question.choices);
          const text = typeof answer === "string" ? answer.trim() : "";
          if (question.required && !text) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              path: ["responses", question.questionId],
              message: "Please select an option.",
            });
          }
          if (text && !options.includes(text)) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              path: ["responses", question.questionId],
              message: "Please select a valid option.",
            });
          }
          continue;
        }

        if (question.type === FeedbackQuestionTypes.CHECKBOXES) {
          const options = normalizeChoices(question.choices);
          const values = Array.isArray(answer) ? answer : [];

          if (question.required && values.length === 0) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              path: ["responses", question.questionId],
              message: "Please select at least one option.",
            });
          }

          const invalid = values.filter((item) => !options.includes(item));
          if (invalid.length > 0) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              path: ["responses", question.questionId],
              message: "One or more selected options are invalid.",
            });
          }
          continue;
        }

        if (question.type === FeedbackQuestionTypes.LINEAR_SCALE) {
          const rawMin = Number(question.scaleMin ?? 1);
          const rawMax = Number(question.scaleMax ?? 5);
          const safeMin = Number.isFinite(rawMin) ? rawMin : 1;
          const safeMax = Number.isFinite(rawMax) ? rawMax : 5;
          const min = Math.min(safeMin, safeMax);
          const max = Math.max(safeMin, safeMax);
          if (
            (answer === undefined || answer === null || answer === "") &&
            question.required
          ) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              path: ["responses", question.questionId],
              message: "Please choose a rating.",
            });
            continue;
          }

          if (answer !== undefined && answer !== null && answer !== "") {
            const value = Number(answer);
            if (
              !Number.isFinite(value) ||
              !Number.isInteger(value) ||
              value < min ||
              value > max
            ) {
              ctx.addIssue({
                code: z.ZodIssueCode.custom,
                path: ["responses", question.questionId],
                message: `Please pick a whole-number value between ${min} and ${max}.`,
              });
            }
          }
        }
      }
    });

export const EventFeedbackForm: React.FC<EventFeedbackFormProps> = ({
  event,
  formType,
  questions,
  isSubmitting,
  onSubmit,
}) => {
  const schema = useMemo(() => createFeedbackSchema(questions), [questions]);

  const defaultResponses = useMemo(() => {
    return questions.reduce<Record<string, any>>((acc, question) => {
      if (question.type === FeedbackQuestionTypes.CHECKBOXES) {
        acc[question.questionId] = [];
      } else {
        acc[question.questionId] = "";
      }
      return acc;
    }, {});
  }, [questions]);

  const form = useForm<FeedbackFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      respondentName: "",
      respondentEmail: "",
      responses: defaultResponses,
    },
  });

  const submitHandler: SubmitHandler<FeedbackFormValues> = async (values) => {
    await onSubmit(values);
  };

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-6 sm:px-6 sm:py-8">
      <Card className="overflow-hidden border-white/15 bg-bt-blue-500/50 backdrop-blur">
        <div className="relative aspect-[16/9] w-full bg-bt-blue-400/40 sm:aspect-[16/7]">
          {event.imageUrl ? (
            <Image
              src={event.imageUrl}
              alt={`${event.ename} cover image`}
              fill
              className="object-cover"
            />
          ) : null}
          <div className="absolute inset-0 bg-gradient-to-t from-bt-blue-700/90 via-bt-blue-700/35 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-5">
            <p className="text-xs uppercase tracking-[0.1em] text-bt-blue-100/90">
              {formType === "attendee" ? "Attendee" : "Partner"} feedback
            </p>
            <h2 className="text-xl font-semibold text-white sm:text-3xl">
              {event.ename}
            </h2>
            <div className="mt-2 flex flex-wrap gap-2 text-xs sm:text-sm">
              <span className="inline-flex max-w-full items-center gap-1 rounded-full bg-white/10 px-2.5 py-1 text-white break-words">
                <Building className="h-3.5 w-3.5" />{" "}
                {event.elocation || "Location TBA"}
              </span>
              <span className="inline-flex max-w-full items-center gap-1 rounded-full bg-white/10 px-2.5 py-1 text-white break-words">
                <Calendar className="h-3.5 w-3.5" />
                {event.startDate
                  ? `${extractMonthDay(event.startDate)} ${extractTime(event.startDate)}`
                  : "Date TBA"}
              </span>
            </div>
          </div>
        </div>

        <CardContent className="space-y-5 p-4 sm:p-6">
          <p className="text-sm text-bt-blue-100">
            Thanks for participating. Your feedback helps the team improve
            future events.
          </p>

          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(submitHandler)}
              className="space-y-5"
            >
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="respondentName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Your name (optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="Jane Doe" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="respondentEmail"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email (optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="jane@domain.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="space-y-4">
                {questions.map((question, index) => {
                  const choices = normalizeChoices(question.choices);
                  const rawScaleMin = Number(question.scaleMin ?? 1);
                  const rawScaleMax = Number(question.scaleMax ?? 5);
                  const safeScaleMin = Number.isFinite(rawScaleMin)
                    ? Math.round(rawScaleMin)
                    : 1;
                  const safeScaleMax = Number.isFinite(rawScaleMax)
                    ? Math.round(rawScaleMax)
                    : 5;
                  const scaleMin = Math.min(safeScaleMin, safeScaleMax);
                  const scaleMax = Math.max(safeScaleMin, safeScaleMax);

                  return (
                    <FormField
                      key={question.questionId}
                      control={form.control}
                      name={`responses.${question.questionId}`}
                      render={({ field, fieldState }) => (
                        <FormItem
                          className={cn(
                            "rounded-xl border bg-white/[0.04] p-4 sm:p-5",
                            fieldState.error
                              ? "border-bt-red-200/60 bg-bt-red-200/10"
                              : "border-white/10",
                          )}
                        >
                          <div className="mb-3 flex items-start justify-between gap-3">
                            <FormLabel className="break-words text-sm leading-6 text-white sm:text-base">
                              <span className="text-bt-blue-100 mr-2">
                                {index + 1}.
                              </span>
                              {question.label}
                              {question.required && (
                                <span className="ml-1 text-bt-green-300">
                                  *
                                </span>
                              )}
                            </FormLabel>
                          </div>

                          {question.type ===
                            FeedbackQuestionTypes.SHORT_TEXT && (
                            <FormControl>
                              <Input
                                placeholder="Type your answer"
                                value={field.value ?? ""}
                                onChange={field.onChange}
                                maxLength={FEEDBACK_TEXT_LIMITS.SHORT_TEXT}
                              />
                            </FormControl>
                          )}

                          {question.type ===
                            FeedbackQuestionTypes.LONG_TEXT && (
                            <FormControl>
                              <Textarea
                                rows={4}
                                placeholder="Share your feedback"
                                value={field.value ?? ""}
                                onChange={field.onChange}
                                maxLength={FEEDBACK_TEXT_LIMITS.LONG_TEXT}
                              />
                            </FormControl>
                          )}

                          {question.type ===
                            FeedbackQuestionTypes.MULTIPLE_CHOICE && (
                            <FormControl>
                              <RadioGroup
                                value={field.value ?? ""}
                                onValueChange={field.onChange}
                                className="space-y-2"
                              >
                                {choices.map((choice) => (
                                  <FormItem
                                    key={choice}
                                    className="flex items-start space-x-2"
                                  >
                                    <FormControl>
                                      <RadioGroupItem value={choice} />
                                    </FormControl>
                                    <FormLabel className="min-w-0 font-normal break-words leading-5">
                                      {choice}
                                    </FormLabel>
                                  </FormItem>
                                ))}
                              </RadioGroup>
                            </FormControl>
                          )}

                          {question.type ===
                            FeedbackQuestionTypes.CHECKBOXES && (
                            <FormControl>
                              <div className="space-y-2">
                                {choices.map((choice) => {
                                  const currentValues = Array.isArray(
                                    field.value,
                                  )
                                    ? field.value
                                    : [];
                                  const checked =
                                    currentValues.includes(choice);

                                  return (
                                    <label
                                      key={choice}
                                      className="flex items-start gap-2 text-sm text-white"
                                    >
                                      <Checkbox
                                        checked={checked}
                                        onCheckedChange={(isChecked) => {
                                          if (isChecked) {
                                            field.onChange([
                                              ...currentValues,
                                              choice,
                                            ]);
                                            return;
                                          }
                                          field.onChange(
                                            currentValues.filter(
                                              (item: string) => item !== choice,
                                            ),
                                          );
                                        }}
                                      />
                                      <span className="break-words">
                                        {choice}
                                      </span>
                                    </label>
                                  );
                                })}
                              </div>
                            </FormControl>
                          )}

                          {question.type ===
                            FeedbackQuestionTypes.LINEAR_SCALE && (
                            <FormControl>
                              <div className="space-y-3">
                                <div className="flex items-center justify-between gap-2 text-xs text-bt-blue-100 sm:text-sm">
                                  <span className="max-w-[40%] break-words">
                                    {question.scaleMinLabel || "Low"}
                                  </span>
                                  <span className="shrink-0 rounded-full border border-bt-green-300/30 bg-bt-green-400/10 px-2.5 py-1 text-sm font-semibold text-bt-green-300">
                                    {Number.isFinite(Number(field.value))
                                      ? Math.round(Number(field.value))
                                      : "Select"}
                                  </span>
                                  <span className="max-w-[40%] break-words text-right">
                                    {question.scaleMaxLabel || "High"}
                                  </span>
                                </div>
                                <input
                                  type="range"
                                  min={scaleMin}
                                  max={scaleMax}
                                  step={1}
                                  value={
                                    Number.isFinite(Number(field.value))
                                      ? Math.round(Number(field.value))
                                      : scaleMin
                                  }
                                  onPointerDown={() => {
                                    if (!Number.isFinite(Number(field.value))) {
                                      field.onChange(scaleMin);
                                    }
                                  }}
                                  onChange={(e) => {
                                    field.onChange(
                                      Math.round(Number(e.target.value)),
                                    );
                                  }}
                                  className="h-2 w-full cursor-pointer accent-bt-green-300"
                                />
                                <div className="flex items-center justify-between text-xs text-bt-blue-100">
                                  <span>{scaleMin}</span>
                                  <span>{scaleMax}</span>
                                </div>
                              </div>
                            </FormControl>
                          )}

                          {fieldState.error?.message ? (
                            <div
                              role="alert"
                              className="mt-1 inline-flex w-full items-start gap-2 rounded-md border border-bt-red-200/40 bg-bt-red-200/20 px-3 py-2 text-sm font-medium text-bt-red-100"
                            >
                              <CircleAlert className="mt-0.5 h-4 w-4 shrink-0" />
                              <span className="break-words">
                                {String(fieldState.error.message)}
                              </span>
                            </div>
                          ) : null}
                        </FormItem>
                      )}
                    />
                  );
                })}
              </div>

              <Button
                type="submit"
                className="w-full bg-bt-green-300 text-bt-blue-600 hover:bg-bt-green-500 sm:w-auto"
                disabled={isSubmitting || form.formState.isSubmitting}
              >
                <BadgeCheck className="mr-2 h-4 w-4" />
                {isSubmitting || form.formState.isSubmitting
                  ? "Submitting..."
                  : "Submit feedback"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};
