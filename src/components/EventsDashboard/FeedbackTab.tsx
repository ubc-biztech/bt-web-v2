import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useForm, useWatch, FormProvider } from "react-hook-form";
import { fetchBackend } from "@/lib/db";
import { BiztechEvent, FeedbackQuestion } from "@/types";
import { FeedbackQuestionsBuilder } from "@/components/Events/FeedbackQuestionsBuilder";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import QRCode from "qrcode";
import {
  CalendarClock,
  ChevronDown,
  ChevronUp,
  Copy,
  Mail,
  Download,
  ExternalLink,
  Loader2,
  MessageSquareText,
  QrCode,
  Search,
  Save,
  Star,
  ClipboardList,
  Users,
} from "lucide-react";
import Link from "next/link";
import { useToast } from "@/components/ui/use-toast";
import { generateStageURL } from "@/util/url";
import {
  OVERALL_RATING_QUESTION_ID,
  DEFAULT_OVERALL_RATING_QUESTION,
} from "@/constants/feedbackQuestionTypes";

// types
interface FeedbackTabProps {
  eventId: string;
  year: string;
  eventData: BiztechEvent;
}

type FormValues = {
  attendeeFeedbackEnabled: boolean;
  partnerFeedbackEnabled: boolean;
  attendeeFeedbackQuestions: FrontendFeedbackQuestion[];
  partnerFeedbackQuestions: FrontendFeedbackQuestion[];
};

type FrontendFeedbackQuestion = {
  id: string;
  type: string;
  question: string;
  required: boolean;
  options: string[];
  scaleMin?: number;
  scaleMax?: number;
  scaleMinLabel?: string;
  scaleMaxLabel?: string;
};

type FeedbackSubmission = {
  id: string;
  submittedAt: number;
  respondentName?: string;
  respondentEmail?: string;
  responses: Record<string, any>;
};

type FeedbackMetaResponse = {
  formType: "attendee" | "partner";
  enabled: boolean;
  feedbackQuestions: FeedbackQuestion[];
};

type FeedbackSubmissionResponse = {
  count: number;
  submissions: FeedbackSubmission[];
};

// helpers
const transformToFrontend = (
  q: FeedbackQuestion,
): FrontendFeedbackQuestion => ({
  id: q.questionId,
  type: q.type,
  question: q.label,
  required: q.required,
  options: q.choices
    ? q.choices
        .split(",")
        .map((c) => c.trim())
        .filter(Boolean)
    : [],
  scaleMin: q.scaleMin ?? 1,
  scaleMax: q.scaleMax ?? 5,
  scaleMinLabel: q.scaleMinLabel ?? "",
  scaleMaxLabel: q.scaleMaxLabel ?? "",
});

const DEFAULT_OVERALL_FRONTEND: FrontendFeedbackQuestion = {
  id: OVERALL_RATING_QUESTION_ID,
  type: DEFAULT_OVERALL_RATING_QUESTION.type,
  question: DEFAULT_OVERALL_RATING_QUESTION.label,
  required: DEFAULT_OVERALL_RATING_QUESTION.required,
  options: [],
  scaleMin: DEFAULT_OVERALL_RATING_QUESTION.scaleMin,
  scaleMax: DEFAULT_OVERALL_RATING_QUESTION.scaleMax,
  scaleMinLabel: DEFAULT_OVERALL_RATING_QUESTION.scaleMinLabel,
  scaleMaxLabel: DEFAULT_OVERALL_RATING_QUESTION.scaleMaxLabel,
};

// default question first
const ensureDefaultQuestion = (
  questions: FrontendFeedbackQuestion[],
): FrontendFeedbackQuestion[] => {
  const nonDefaultQuestions = questions.filter(
    (q) => q.id !== OVERALL_RATING_QUESTION_ID,
  );
  return [{ ...DEFAULT_OVERALL_FRONTEND }, ...nonDefaultQuestions];
};

const transformToBackend = (q: FrontendFeedbackQuestion) => ({
  type: q.type,
  questionId: q.id,
  label: q.question.trim(),
  choices: (q.options || [])
    .map((o) => String(o).trim())
    .filter(Boolean)
    .join(","),
  required: q.required,
  scaleMin: q.type === "LINEAR_SCALE" ? Number(q.scaleMin ?? 1) : undefined,
  scaleMax: q.type === "LINEAR_SCALE" ? Number(q.scaleMax ?? 5) : undefined,
  scaleMinLabel: q.type === "LINEAR_SCALE" ? q.scaleMinLabel || "" : "",
  scaleMaxLabel: q.type === "LINEAR_SCALE" ? q.scaleMaxLabel || "" : "",
});

const formatSubmittedAt = (value?: number) => {
  if (!value) return "-";
  try {
    return new Date(value).toLocaleString();
  } catch {
    return String(value);
  }
};

const formatAnswer = (value: unknown) => {
  if (Array.isArray(value)) return value.join(", ");
  if (value === undefined || value === null || value === "") return "-";
  return String(value);
};

const getOverallRatingFromResponses = (responses?: Record<string, any>) => {
  const rawValue = responses?.[OVERALL_RATING_QUESTION_ID];
  const numericValue = Number(rawValue);
  return Number.isFinite(numericValue) ? numericValue : null;
};

const downloadJson = (filename: string, content: string) => {
  const blob = new Blob([content], { type: "application/json;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
};

// views
type SubTab = "builder" | "responses";

type FeedbackFormQrCardProps = {
  title: string;
  description: string;
  url: string;
};

// main
export default function FeedbackTab({
  eventId,
  year,
  eventData,
}: FeedbackTabProps) {
  const { toast } = useToast();
  const [subTab, setSubTab] = useState<SubTab>("builder");
  const [isSaving, setIsSaving] = useState(false);
  const [appOrigin, setAppOrigin] = useState(generateStageURL());

  // response state
  const [responsesLoading, setResponsesLoading] = useState(false);
  const [responsesError, setResponsesError] = useState<string | null>(null);
  const [responsesActiveTab, setResponsesActiveTab] = useState<
    "attendee" | "partner"
  >("attendee");
  const [meta, setMeta] = useState<Record<string, FeedbackMetaResponse>>({});
  const [submissions, setSubmissions] = useState<
    Record<string, FeedbackSubmissionResponse>
  >({});

  useEffect(() => {
    if (typeof window !== "undefined" && window.location?.origin) {
      setAppOrigin(window.location.origin);
    }
  }, []);

  // form state
  const form = useForm<FormValues>({
    defaultValues: {
      attendeeFeedbackEnabled: !!eventData.attendeeFeedbackEnabled,
      partnerFeedbackEnabled: !!eventData.partnerFeedbackEnabled,
      attendeeFeedbackQuestions: ensureDefaultQuestion(
        (eventData.attendeeFeedbackQuestions || []).map(transformToFrontend),
      ),
      partnerFeedbackQuestions: ensureDefaultQuestion(
        (eventData.partnerFeedbackQuestions || []).map(transformToFrontend),
      ),
    },
  });

  const attendeeFeedbackEnabled = useWatch({
    control: form.control,
    name: "attendeeFeedbackEnabled",
  });
  const partnerFeedbackEnabled = useWatch({
    control: form.control,
    name: "partnerFeedbackEnabled",
  });

  // add default rating question
  useEffect(() => {
    if (attendeeFeedbackEnabled) {
      const cur = form.getValues("attendeeFeedbackQuestions");
      if (!cur.some((q) => q.id === OVERALL_RATING_QUESTION_ID)) {
        form.setValue(
          "attendeeFeedbackQuestions",
          [{ ...DEFAULT_OVERALL_FRONTEND }, ...cur],
          { shouldDirty: true },
        );
      }
    }
  }, [attendeeFeedbackEnabled, form]);

  useEffect(() => {
    if (partnerFeedbackEnabled) {
      const cur = form.getValues("partnerFeedbackQuestions");
      if (!cur.some((q) => q.id === OVERALL_RATING_QUESTION_ID)) {
        form.setValue(
          "partnerFeedbackQuestions",
          [{ ...DEFAULT_OVERALL_FRONTEND }, ...cur],
          { shouldDirty: true },
        );
      }
    }
  }, [partnerFeedbackEnabled, form]);

  // save
  const handleSave = useCallback(async () => {
    const values = form.getValues();
    const normalizedValues: FormValues = {
      ...values,
      attendeeFeedbackQuestions: ensureDefaultQuestion(
        values.attendeeFeedbackQuestions || [],
      ),
      partnerFeedbackQuestions: ensureDefaultQuestion(
        values.partnerFeedbackQuestions || [],
      ),
    };
    setIsSaving(true);
    try {
      await fetchBackend({
        endpoint: `/events/${eventId}/${year}`,
        method: "PATCH",
        data: {
          attendeeFeedbackEnabled: normalizedValues.attendeeFeedbackEnabled,
          partnerFeedbackEnabled: normalizedValues.partnerFeedbackEnabled,
          attendeeFeedbackQuestions:
            normalizedValues.attendeeFeedbackQuestions.map(transformToBackend),
          partnerFeedbackQuestions:
            normalizedValues.partnerFeedbackQuestions.map(transformToBackend),
        },
      });
      toast({ title: "Saved", description: "Feedback forms updated." });
      form.reset(normalizedValues);
    } catch (err: any) {
      const raw = err?.message?.message || err?.message || err;
      toast({
        title: "Error",
        description:
          typeof raw === "string" ? raw : "Failed to save feedback forms.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  }, [eventId, year, form, toast]);

  // load responses
  const loadResponses = useCallback(async () => {
    setResponsesLoading(true);
    setResponsesError(null);
    try {
      const results = await Promise.allSettled([
        fetchBackend({
          endpoint: `/events/${eventId}/${year}/feedback/attendee`,
          method: "GET",
        }),
        fetchBackend({
          endpoint: `/events/${eventId}/${year}/feedback/partner`,
          method: "GET",
        }),
        fetchBackend({
          endpoint: `/events/${eventId}/${year}/feedback/attendee/submissions`,
          method: "GET",
        }),
        fetchBackend({
          endpoint: `/events/${eventId}/${year}/feedback/partner/submissions`,
          method: "GET",
        }),
      ]);

      const val = (r: PromiseSettledResult<any>, fallback: any) =>
        r.status === "fulfilled" && r.value && !r.value.statusCode
          ? r.value
          : fallback;

      const emptyMeta: FeedbackMetaResponse = {
        formType: "attendee",
        enabled: false,
        feedbackQuestions: [],
      };
      const emptySubs: FeedbackSubmissionResponse = {
        count: 0,
        submissions: [],
      };

      setMeta({
        attendee: val(results[0], { ...emptyMeta, formType: "attendee" }),
        partner: val(results[1], { ...emptyMeta, formType: "partner" }),
      });
      setSubmissions({
        attendee: val(results[2], emptySubs),
        partner: val(results[3], emptySubs),
      });
    } catch (err: any) {
      const raw = err?.message?.message || err?.message || err;
      setResponsesError(
        typeof raw === "string"
          ? raw
          : "Failed to load feedback data. The feedback API endpoints may not be available.",
      );
    } finally {
      setResponsesLoading(false);
    }
  }, [eventId, year]);

  useEffect(() => {
    if (subTab === "responses") loadResponses();
  }, [subTab, loadResponses]);

  // derived data
  const currentMeta = meta[responsesActiveTab];
  const currentSubmissions = submissions[responsesActiveTab]?.submissions || [];

  const questionLabels = useMemo(() => {
    const entries = (currentMeta?.feedbackQuestions || []).map((q) => [
      q.questionId,
      q.label,
    ]);
    return Object.fromEntries(entries) as Record<string, string>;
  }, [currentMeta]);

  const exportCurrent = () => {
    downloadJson(
      `feedback-${eventId}-${year}-${responsesActiveTab}.json`,
      JSON.stringify(
        { formType: responsesActiveTab, submissions: currentSubmissions },
        null,
        2,
      ),
    );
  };

  const attendeeFeedbackUrl = useMemo(
    () => `${appOrigin}/event/${eventId}/${year}/feedback/attendee`,
    [appOrigin, eventId, year],
  );
  const partnerFeedbackUrl = useMemo(
    () => `${appOrigin}/event/${eventId}/${year}/feedback/partner`,
    [appOrigin, eventId, year],
  );

  const formIsDirty = form.formState.isDirty;

  // render
  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex w-full rounded-lg border border-bt-blue-300/20 bg-bt-blue-500/40 p-1 sm:w-auto">
          <button
            onClick={() => setSubTab("builder")}
            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
              subTab === "builder"
                ? "bg-bt-blue-400/60 text-white"
                : "text-bt-blue-100 hover:text-white"
            }`}
          >
            <span className="flex items-center gap-1.5">
              <MessageSquareText className="w-3.5 h-3.5" />
              Form Builder
            </span>
          </button>
          <button
            onClick={() => setSubTab("responses")}
            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
              subTab === "responses"
                ? "bg-bt-blue-400/60 text-white"
                : "text-bt-blue-100 hover:text-white"
            }`}
          >
            <span className="flex items-center gap-1.5">
              <ClipboardList className="w-3.5 h-3.5" />
              Responses
            </span>
          </button>
        </div>

        <div className="flex w-full flex-wrap items-center gap-2 text-xs text-bt-blue-100 sm:w-auto sm:gap-3">
          <Link
            href={attendeeFeedbackUrl}
            target="_blank"
            className="inline-flex items-center gap-1 rounded-full border border-white/15 px-2.5 py-1 hover:text-bt-green-300"
          >
            <ExternalLink className="w-3 h-3" />
            Attendee Form
          </Link>
          <Link
            href={partnerFeedbackUrl}
            target="_blank"
            className="inline-flex items-center gap-1 rounded-full border border-white/15 px-2.5 py-1 hover:text-bt-green-300"
          >
            <ExternalLink className="w-3 h-3" />
            Partner Form
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
        <FeedbackFormQrCard
          title="Attendee Form QR"
          description="Scan to open the attendee feedback form."
          url={attendeeFeedbackUrl}
        />
        <FeedbackFormQrCard
          title="Partner Form QR"
          description="Scan to open the partner feedback form."
          url={partnerFeedbackUrl}
        />
      </div>

      {subTab === "builder" && (
        <FormProvider {...form}>
          <div className="space-y-5">
            <div className="rounded-xl border border-bt-blue-300/30 bg-bt-blue-500/40 p-5 space-y-4">
              <h4 className="text-sm font-semibold uppercase tracking-wide text-white">
                Feedback Settings
              </h4>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="attendeeFeedbackEnabled"
                    checked={attendeeFeedbackEnabled}
                    onCheckedChange={(checked) =>
                      form.setValue(
                        "attendeeFeedbackEnabled",
                        Boolean(checked),
                        { shouldDirty: true },
                      )
                    }
                  />
                  <Label
                    htmlFor="attendeeFeedbackEnabled"
                    className="text-sm text-white cursor-pointer"
                  >
                    Enable attendee feedback form
                  </Label>
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="partnerFeedbackEnabled"
                    checked={partnerFeedbackEnabled}
                    onCheckedChange={(checked) =>
                      form.setValue(
                        "partnerFeedbackEnabled",
                        Boolean(checked),
                        { shouldDirty: true },
                      )
                    }
                  />
                  <Label
                    htmlFor="partnerFeedbackEnabled"
                    className="text-sm text-white cursor-pointer"
                  >
                    Enable partner feedback form
                  </Label>
                </div>
              </div>

              {!attendeeFeedbackEnabled && !partnerFeedbackEnabled && (
                <p className="text-sm text-bt-blue-100">
                  Enable at least one feedback form to start collecting
                  responses.
                </p>
              )}
            </div>

            {attendeeFeedbackEnabled && (
              <div className="rounded-xl border border-bt-blue-300/30 bg-bt-blue-500/40 p-5">
                <FeedbackQuestionsBuilder
                  control={form.control}
                  name="attendeeFeedbackQuestions"
                  title="Attendee Feedback Questions"
                  description="These questions appear on the attendee feedback form after the event."
                />
              </div>
            )}

            {partnerFeedbackEnabled && (
              <div className="rounded-xl border border-bt-blue-300/30 bg-bt-blue-500/40 p-5">
                <FeedbackQuestionsBuilder
                  control={form.control}
                  name="partnerFeedbackQuestions"
                  title="Partner Feedback Questions"
                  description="These questions appear on the partner feedback form after the event."
                />
              </div>
            )}

            <div className="flex items-center gap-3">
              <Button
                onClick={handleSave}
                disabled={isSaving || !formIsDirty}
                variant="green"
                className="gap-1.5"
              >
                {isSaving ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                {isSaving ? "Saving..." : "Save Feedback Forms"}
              </Button>
              {formIsDirty && (
                <span className="text-xs text-bt-yellow-100">
                  Unsaved changes
                </span>
              )}
            </div>
          </div>
        </FormProvider>
      )}

      {subTab === "responses" && (
        <div className="space-y-4">
          {responsesError && (
            <Card className="border-red-400/40 bg-red-400/10">
              <CardContent className="p-4 text-red-300">
                {responsesError}
              </CardContent>
            </Card>
          )}

          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex rounded-lg bg-bt-blue-500/50 border border-bt-blue-300/20 p-0.5 gap-0.5">
              {(["attendee", "partner"] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setResponsesActiveTab(tab)}
                  className={`px-3 py-1.5 rounded-md text-sm font-medium capitalize transition-colors ${
                    responsesActiveTab === tab
                      ? "bg-bt-blue-400/60 text-white"
                      : "text-bt-blue-100 hover:text-white"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            <Button
              onClick={exportCurrent}
              variant="outline"
              size="sm"
              className="border-white/20 bg-transparent text-white hover:bg-white/10 gap-1.5"
              disabled={currentSubmissions.length === 0}
            >
              <Download className="w-3.5 h-3.5" />
              Export JSON
            </Button>
          </div>

          <ResponsesPanel
            isLoading={responsesLoading}
            enabled={Boolean(currentMeta?.enabled)}
            submissions={currentSubmissions}
            submissionCount={submissions[responsesActiveTab]?.count || 0}
            questionLabels={questionLabels}
            questions={currentMeta?.feedbackQuestions || []}
            formType={responsesActiveTab}
          />
        </div>
      )}
    </div>
  );
}

// qr card
function FeedbackFormQrCard({ title, description, url }: FeedbackFormQrCardProps) {
  const { toast } = useToast();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [qrError, setQrError] = useState<string | null>(null);

  useEffect(() => {
    const generate = async () => {
      try {
        if (!canvasRef.current || !url) return;
        await QRCode.toCanvas(canvasRef.current, url, {
          width: 160,
          margin: 1,
          color: {
            dark: "#0b1934",
            light: "#ffffff",
          },
          errorCorrectionLevel: "M",
        });
        setQrError(null);
      } catch (error) {
        console.error("Failed to render feedback QR code:", error);
        setQrError("Unable to generate QR code.");
      }
    };

    generate();
  }, [url]);

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(url);
      toast({
        title: "Copied link",
        description: `${title} URL copied to clipboard.`,
      });
    } catch (error) {
      console.error("Failed to copy feedback URL:", error);
      toast({
        title: "Copy failed",
        description: "Unable to copy link. Please copy manually.",
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="border-white/15 bg-white/[0.04]">
      <CardContent className="space-y-3 p-4 sm:p-5">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div>
            <p className="flex items-center gap-1.5 text-sm font-semibold text-white">
              <QrCode className="h-4 w-4 text-bt-green-300" />
              {title}
            </p>
            <p className="mt-1 text-xs text-bt-blue-100">{description}</p>
          </div>
          <Link
            href={url}
            target="_blank"
            className="inline-flex shrink-0 items-center gap-1 rounded-full border border-white/15 px-2.5 py-1 text-[11px] text-bt-blue-100 hover:text-white"
          >
            <ExternalLink className="h-3 w-3" />
            Open
          </Link>
        </div>

        <div className="flex flex-col items-center gap-3 sm:flex-row sm:items-start">
          <div className="rounded-lg bg-white p-2">
            {qrError ? (
              <div className="flex h-32 w-32 items-center justify-center rounded-md border border-bt-red-300/30 bg-bt-red-100/10 px-2 text-center text-xs text-bt-red-200">
                {qrError}
              </div>
            ) : (
              <canvas
                ref={canvasRef}
                className="h-32 w-32 rounded-md"
                aria-label={`${title} QR code`}
              />
            )}
          </div>

          <div className="min-w-0 w-full flex-1 space-y-2">
            <p className="break-all text-[11px] text-bt-blue-100 sm:line-clamp-3">
              {url}
            </p>
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={handleCopyLink}
              className="h-8 w-full border-white/20 bg-transparent text-white hover:bg-white/10 sm:w-auto"
            >
              <Copy className="mr-1.5 h-3.5 w-3.5" />
              Copy Link
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// response panel
function ResponsesPanel({
  isLoading,
  enabled,
  submissionCount,
  submissions,
  questionLabels,
  questions,
  formType,
}: {
  isLoading: boolean;
  enabled: boolean;
  submissionCount: number;
  submissions: FeedbackSubmission[];
  questionLabels: Record<string, string>;
  questions: FeedbackQuestion[];
  formType: "attendee" | "partner";
}) {
  const [query, setQuery] = useState("");
  const [sortMode, setSortMode] = useState<
    "newest" | "oldest" | "rating-desc" | "rating-asc"
  >("newest");
  const [expandedRows, setExpandedRows] = useState<Record<string, boolean>>({});

  const questionOrder = useMemo(
    () => questions.map((question) => question.questionId),
    [questions],
  );
  const orderedQuestionSet = useMemo(
    () => new Set(questionOrder),
    [questionOrder],
  );

  const ratings = useMemo(
    () =>
      submissions
        .map((submission) =>
          getOverallRatingFromResponses(submission.responses),
        )
        .filter((value): value is number => value !== null),
    [submissions],
  );

  const averageRating = useMemo(() => {
    if (!ratings.length) return null;
    const total = ratings.reduce((sum, rating) => sum + rating, 0);
    return total / ratings.length;
  }, [ratings]);

  const latestSubmittedAt = useMemo(() => {
    return submissions.reduce((latest, submission) => {
      return Math.max(latest, submission.submittedAt || 0);
    }, 0);
  }, [submissions]);

  const withContactCount = useMemo(() => {
    return submissions.filter((submission) => {
      return Boolean(
        submission.respondentName?.trim() || submission.respondentEmail?.trim(),
      );
    }).length;
  }, [submissions]);

  const rows = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    const mapped = submissions.map((submission) => {
      const overallRating = getOverallRatingFromResponses(submission.responses);
      const searchableText = [
        submission.respondentName || "",
        submission.respondentEmail || "",
        ...Object.entries(submission.responses || {}).map(([key, value]) => {
          const questionLabel = questionLabels[key] || key;
          const answerText = Array.isArray(value)
            ? value.join(" ")
            : String(value ?? "");
          return `${questionLabel} ${answerText}`;
        }),
      ]
        .join(" ")
        .toLowerCase();

      return {
        submission,
        searchableText,
        overallRating,
      };
    });

    const filtered =
      normalizedQuery.length > 0
        ? mapped.filter((row) => row.searchableText.includes(normalizedQuery))
        : mapped;

    filtered.sort((a, b) => {
      if (sortMode === "oldest") {
        return (
          (a.submission.submittedAt || 0) - (b.submission.submittedAt || 0)
        );
      }

      if (sortMode === "rating-desc") {
        const aValue =
          a.overallRating === null ? Number.NEGATIVE_INFINITY : a.overallRating;
        const bValue =
          b.overallRating === null ? Number.NEGATIVE_INFINITY : b.overallRating;
        if (aValue !== bValue) return bValue - aValue;
      }

      if (sortMode === "rating-asc") {
        const aValue =
          a.overallRating === null ? Number.POSITIVE_INFINITY : a.overallRating;
        const bValue =
          b.overallRating === null ? Number.POSITIVE_INFINITY : b.overallRating;
        if (aValue !== bValue) return aValue - bValue;
      }

      return (b.submission.submittedAt || 0) - (a.submission.submittedAt || 0);
    });

    return filtered;
  }, [query, questionLabels, sortMode, submissions]);

  const toggleExpandedRow = (submissionId: string) => {
    setExpandedRows((prev) => ({
      ...prev,
      [submissionId]: !prev[submissionId],
    }));
  };

  const getOrderedEntries = (responses: Record<string, any> = {}) => {
    const preferredEntries = questionOrder
      .filter((questionId) =>
        Object.prototype.hasOwnProperty.call(responses, questionId),
      )
      .map((questionId) => [questionId, responses[questionId]] as const);

    const extraEntries = Object.entries(responses).filter(
      ([questionId]) => !orderedQuestionSet.has(questionId),
    );

    return [...preferredEntries, ...extraEntries];
  };

  if (isLoading) {
    return (
      <Card className="border-white/15 bg-white/5">
        <CardContent className="flex items-center gap-2 p-5 text-white">
          <Loader2 className="w-4 h-4 animate-spin" />
          Loading feedback data...
        </CardContent>
      </Card>
    );
  }

  if (!enabled) {
    return (
      <Card className="border-white/15 bg-white/5">
        <CardContent className="p-5 text-bt-blue-100">
          This feedback form is currently disabled. Enable it in the Form
          Builder to start collecting responses.
        </CardContent>
      </Card>
    );
  }

  if (submissions.length === 0) {
    return (
      <Card className="border-white/15 bg-white/5">
        <CardContent className="p-5 text-bt-blue-100">
          No submissions yet.
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Card className="border-white/15 bg-white/[0.04]">
          <CardContent className="space-y-1 p-4">
            <p className="text-xs uppercase tracking-wide text-bt-blue-100">
              Submissions
            </p>
            <p className="text-xl font-semibold text-white">
              {submissionCount}
            </p>
            <p className="text-xs text-bt-blue-100">Total responses received</p>
          </CardContent>
        </Card>

        <Card className="border-white/15 bg-white/[0.04]">
          <CardContent className="space-y-1 p-4">
            <p className="flex items-center gap-1 text-xs uppercase tracking-wide text-bt-blue-100">
              <Users className="h-3.5 w-3.5" /> Identified
            </p>
            <p className="text-xl font-semibold text-white">
              {withContactCount}
            </p>
            <p className="text-xs text-bt-blue-100">Included name or email</p>
          </CardContent>
        </Card>

        <Card className="border-white/15 bg-white/[0.04]">
          <CardContent className="space-y-1 p-4">
            <p className="flex items-center gap-1 text-xs uppercase tracking-wide text-bt-blue-100">
              <Star className="h-3.5 w-3.5" /> Overall Rating
            </p>
            <p className="text-xl font-semibold text-white">
              {averageRating === null ? "-" : `${averageRating.toFixed(1)}/10`}
            </p>
          </CardContent>
        </Card>

        <Card className="border-white/15 bg-white/[0.04]">
          <CardContent className="space-y-1 p-4">
            <p className="flex items-center gap-1 text-xs uppercase tracking-wide text-bt-blue-100">
              <CalendarClock className="h-3.5 w-3.5" /> Latest Response
            </p>
            <p className="text-sm font-semibold text-white">
              {latestSubmittedAt ? formatSubmittedAt(latestSubmittedAt) : "-"}
            </p>
            <p className="text-xs text-bt-blue-100">Most recent submission</p>
          </CardContent>
        </Card>
      </div>

      <Card className="border-white/15 bg-white/[0.04]">
        <CardContent className="space-y-4 p-4 sm:p-5">
          <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
            <div>
              <p className="text-sm font-semibold text-white capitalize">
                {formType} responses
              </p>
              <p className="text-xs text-bt-blue-100">
                Browse and review individual feedback submissions.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {[
                { label: "Newest", value: "newest" },
                { label: "Oldest", value: "oldest" },
                { label: "Top Rated", value: "rating-desc" },
                { label: "Low Rated", value: "rating-asc" },
              ].map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() =>
                    setSortMode(
                      option.value as
                        | "newest"
                        | "oldest"
                        | "rating-desc"
                        | "rating-asc",
                    )
                  }
                  className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                    sortMode === option.value
                      ? "border-bt-green-300/50 bg-bt-green-300/15 text-bt-green-200"
                      : "border-white/15 bg-white/[0.04] text-bt-blue-100 hover:text-white"
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-bt-blue-100" />
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search by name, email, question, or answer..."
              className="pl-10 text-white placeholder:text-bt-blue-100"
            />
          </div>

          <div className="text-xs text-bt-blue-100">
            Showing {rows.length} of {submissions.length} submissions
          </div>

          {rows.length === 0 ? (
            <div className="rounded-xl border border-white/10 bg-white/[0.04] p-6 text-sm text-bt-blue-100">
              No results match your search.
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3 xl:grid-cols-2">
              {rows.map(({ submission, overallRating }) => {
                const responseEntries = getOrderedEntries(
                  submission.responses || {},
                );
                const isExpanded = Boolean(expandedRows[submission.id]);
                const visibleEntries = isExpanded
                  ? responseEntries
                  : responseEntries.slice(0, 4);
                const displayName =
                  submission.respondentName?.trim() || "Anonymous";
                const displayEmail = submission.respondentEmail?.trim() || "";

                return (
                  <article
                    key={submission.id}
                    className="rounded-xl border border-white/10 bg-white/[0.03] shadow-[0_8px_30px_rgba(7,15,35,0.25)]"
                  >
                    <div className="border-b border-white/10 p-4">
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div className="flex min-w-0 items-center gap-3">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-bt-blue-400/40 text-sm font-semibold text-white">
                            {displayName.charAt(0).toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <p className="truncate text-sm font-semibold text-white">
                              {displayName}
                            </p>
                            <p className="truncate text-xs text-bt-blue-100">
                              {displayEmail || "No email provided"}
                            </p>
                          </div>
                        </div>
                        {overallRating !== null && (
                          <span className="inline-flex items-center gap-1 rounded-full border border-bt-green-300/40 bg-bt-green-300/10 px-2.5 py-1 text-xs font-medium text-bt-green-200">
                            <Star className="h-3 w-3" />
                            {overallRating}/10
                          </span>
                        )}
                      </div>
                      <div className="mt-2 flex items-center gap-1.5 text-xs text-bt-blue-100">
                        <CalendarClock className="h-3.5 w-3.5" />
                        {formatSubmittedAt(submission.submittedAt)}
                        {displayEmail && (
                          <>
                            <span className="text-bt-blue-300">•</span>
                            <Mail className="h-3.5 w-3.5" />
                          </>
                        )}
                      </div>
                    </div>

                    <div className="space-y-2 p-4">
                      {visibleEntries.length === 0 ? (
                        <p className="text-sm text-bt-blue-100">
                          No answers captured in this response.
                        </p>
                      ) : (
                        visibleEntries.map(([key, value]) => (
                          <div
                            key={`${submission.id}-${key}`}
                            className="rounded-lg border border-white/10 bg-bt-blue-600/25 p-3"
                          >
                            <p className="break-words text-[11px] uppercase tracking-wide text-bt-blue-100">
                              {questionLabels[key] || key}
                            </p>
                            <p className="mt-1 whitespace-pre-wrap break-words text-sm text-white">
                              {formatAnswer(value)}
                            </p>
                          </div>
                        ))
                      )}
                    </div>

                    {responseEntries.length > 4 && (
                      <button
                        type="button"
                        onClick={() => toggleExpandedRow(submission.id)}
                        className="flex w-full items-center justify-center gap-1.5 border-t border-white/10 px-4 py-2.5 text-xs font-medium text-bt-blue-100 transition-colors hover:bg-white/[0.04] hover:text-white"
                      >
                        {isExpanded ? (
                          <>
                            Show less <ChevronUp className="h-3.5 w-3.5" />
                          </>
                        ) : (
                          <>
                            Show all responses{" "}
                            <ChevronDown className="h-3.5 w-3.5" />
                          </>
                        )}
                      </button>
                    )}
                  </article>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
