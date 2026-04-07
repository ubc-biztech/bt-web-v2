import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { fetchBackend } from "@/lib/db";
import { BiztechEvent, FeedbackQuestion } from "@/types";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { EventFeedbackForm } from "@/components/Events/EventFeedbackForm";
import {
  FeedbackFormType,
  FEEDBACK_FORM_TYPES,
} from "@/constants/feedbackQuestionTypes";
import { useToast } from "@/components/ui/use-toast";

type FeedbackFormApiResponse = {
  event: BiztechEvent;
  formType: FeedbackFormType;
  enabled: boolean;
  feedbackQuestions: FeedbackQuestion[];
};

const isValidFormType = (value: unknown): value is FeedbackFormType =>
  value === FEEDBACK_FORM_TYPES.attendee ||
  value === FEEDBACK_FORM_TYPES.partner;

export default function EventFeedbackFormPage() {
  const router = useRouter();
  const { eventId, year, formType } = router.query;
  const { toast } = useToast();

  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<FeedbackFormApiResponse | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const normalizedFormType = useMemo(() => {
    if (typeof formType !== "string") return null;
    const value = formType.toLowerCase();
    return isValidFormType(value) ? value : null;
  }, [formType]);

  useEffect(() => {
    if (!router.isReady || !eventId || !year || !normalizedFormType) return;

    const loadFeedbackForm = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetchBackend({
          endpoint: `/events/${eventId}/${year}/feedback/${normalizedFormType}`,
          method: "GET",
          authenticatedCall: false,
        });
        setData(response);
      } catch (err: any) {
        const raw = err?.message?.message || err?.message;
        setError(
          typeof raw === "string" ? raw : "Unable to load feedback form.",
        );
      } finally {
        setIsLoading(false);
      }
    };

    loadFeedbackForm();
  }, [router.isReady, eventId, year, normalizedFormType]);

  if (!router.isReady) {
    return (
      <main className="min-h-screen bg-bt-blue-600 px-4 py-6 sm:px-6 sm:py-8">
        <div className="mx-auto max-w-2xl rounded-xl border border-white/15 bg-white/5 p-4 text-center text-white sm:p-6">
          Loading feedback form...
        </div>
      </main>
    );
  }

  const submitFeedback = async (payload: {
    respondentName?: string;
    respondentEmail?: string;
    responses: Record<string, any>;
  }) => {
    if (!eventId || !year || !normalizedFormType) return;

    setIsSubmitting(true);
    try {
      await fetchBackend({
        endpoint: `/events/${eventId}/${year}/feedback/${normalizedFormType}`,
        method: "POST",
        authenticatedCall: false,
        data: payload,
      });

      setSubmitted(true);
      toast({
        title: "Feedback submitted",
        description: "Thank you for sharing your thoughts.",
      });
    } catch (err: any) {
      const raw = err?.message?.message || err?.message;
      const message =
        typeof raw === "string" ? raw : "Unable to submit feedback.";
      toast({
        title: "Submission failed",
        description: message,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!normalizedFormType) {
    return (
      <main className="min-h-screen bg-bt-blue-600 px-4 py-6 sm:px-6 sm:py-8">
        <div className="mx-auto max-w-2xl rounded-xl border border-bt-red-200/40 bg-bt-red-200/10 p-4 text-center text-bt-red-100 sm:p-6">
          Invalid feedback form type.
        </div>
      </main>
    );
  }

  if (isLoading) {
    return (
      <main className="min-h-screen bg-bt-blue-600 px-4 py-6 sm:px-6 sm:py-8">
        <div className="mx-auto max-w-2xl rounded-xl border border-white/15 bg-white/5 p-4 text-center text-white sm:p-6">
          Loading feedback form...
        </div>
      </main>
    );
  }

  if (error || !data) {
    return (
      <main className="min-h-screen bg-bt-blue-600 px-4 py-6 sm:px-6 sm:py-8">
        <div className="mx-auto max-w-2xl rounded-xl border border-bt-red-200/40 bg-bt-red-200/10 p-4 text-center text-bt-red-100 sm:p-6">
          {error || "Feedback form not found."}
        </div>
      </main>
    );
  }

  if (!data.enabled || data.feedbackQuestions.length === 0) {
    return (
      <main className="min-h-screen bg-bt-blue-600 px-4 py-6 sm:px-6 sm:py-8">
        <Card className="mx-auto max-w-2xl border-white/15 bg-white/[0.04]">
          <CardContent className="space-y-4 p-4 text-center sm:p-6">
            <h2 className="text-2xl font-semibold text-white">
              Feedback Form Unavailable
            </h2>
            <p className="text-sm text-bt-blue-100">
              This feedback form is currently disabled or has no configured
              questions.
            </p>
            <Button
              asChild
              variant="outline"
              className="border-white/20 bg-transparent text-white hover:bg-white/10"
            >
              <Link
                href={`/event/${data.event.id}/${data.event.year}/feedback`}
              >
                Back to feedback options
              </Link>
            </Button>
          </CardContent>
        </Card>
      </main>
    );
  }

  if (submitted) {
    return (
      <main className="min-h-screen bg-bt-blue-600 px-4 py-6 sm:px-6 sm:py-8">
        <Card className="mx-auto max-w-2xl border-white/15 bg-white/[0.04]">
          <CardContent className="space-y-4 p-4 text-center sm:p-6">
            <h2 className="text-2xl font-semibold text-white">
              Thanks for your feedback
            </h2>
            <p className="text-sm text-bt-blue-100">
              Your response has been recorded successfully.
            </p>
            <div className="flex flex-col justify-center gap-2 sm:flex-row">
              <Button
                asChild
                variant="outline"
                className="border-white/20 bg-transparent text-white hover:bg-white/10"
              >
                <Link
                  href={`/event/${data.event.id}/${data.event.year}/feedback`}
                >
                  Return to feedback hub
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-bt-blue-600">
      <EventFeedbackForm
        event={data.event}
        formType={data.formType}
        questions={data.feedbackQuestions}
        isSubmitting={isSubmitting}
        onSubmit={submitFeedback}
      />
    </main>
  );
}
