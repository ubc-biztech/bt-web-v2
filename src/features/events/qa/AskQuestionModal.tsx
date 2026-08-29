import { useState } from "react";
import { useRouter } from "next/router";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CheckCircle2 } from "lucide-react";
import { QA_CATEGORIES } from "./types";
import { useSubmitQuestion } from "./queries";
import { cn } from "@/lib/utils";

const MAX_CHARS = 500;

interface AskQuestionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  eventId: string;
  year: string;
  signedIn: boolean;
  onViewBoard?: () => void;
}

type ModalStep = "form" | "success";

export function AskQuestionModal({
  open,
  onOpenChange,
  eventId,
  year,
  signedIn,
  onViewBoard,
}: AskQuestionModalProps) {
  const router = useRouter();
  const [step, setStep] = useState<ModalStep>("form");
  const [body, setBody] = useState("");
  const [category, setCategory] = useState<string>("General");

  const submitMutation = useSubmitQuestion(eventId, year);

  const handleSubmit = async () => {
    if (!body.trim() || body.length > MAX_CHARS) return;
    if (!signedIn) {
      router.push(`/login?redirect=${router.asPath}`);
      return;
    }
    await submitMutation.mutateAsync({ body: body.trim(), category });
    setStep("success");
  };

  const handleClose = (isOpen: boolean) => {
    if (!isOpen) {
      setTimeout(() => {
        setStep("form");
        setBody("");
        setCategory("General");
      }, 300);
    }
    onOpenChange(isOpen);
  };

  const handleAskAnother = () => {
    setStep("form");
    setBody("");
    setCategory("General");
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="border-[#263451] bg-[#0B152C] text-white sm:max-w-md">
        {step === "form" ? (
          <>
            <DialogHeader>
              <DialogTitle className="text-white">Ask a Question</DialogTitle>
            </DialogHeader>
            <p className="text-xs text-[#9f9f9f]">
              Your question will appear anonymously on the Q&A board.
            </p>

            <div className="space-y-3">
              <div>
                <Textarea
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  placeholder="What would you like to ask?"
                  maxLength={MAX_CHARS}
                  rows={4}
                  className="resize-none text-sm text-white"
                />
                <p
                  className={cn(
                    "mt-1 text-right text-xs",
                    body.length > MAX_CHARS - 50
                      ? "text-bt-red-300"
                      : "text-[#6a7a9a]"
                  )}
                >
                  {body.length}/{MAX_CHARS}
                </p>
              </div>

              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger className="border-[#263451] text-white">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent className="border-[#263451] bg-[#0B152C]">
                  {QA_CATEGORIES.map((cat) => (
                    <SelectItem key={cat} value={cat} className="text-white">
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button
              variant="default"
              onClick={handleSubmit}
              disabled={
                !body.trim() ||
                body.length > MAX_CHARS ||
                submitMutation.isPending
              }
              className="w-full"
            >
              {!signedIn
                ? "Sign in to submit"
                : submitMutation.isPending
                  ? "Submitting…"
                  : "Submit Question"}
            </Button>

            {submitMutation.isError && (
              <p className="text-center text-xs text-bt-red-300">
                Something went wrong. Please try again.
              </p>
            )}
          </>
        ) : (
          <div className="flex flex-col items-center gap-5 py-4 text-center">
            <CheckCircle2 className="h-12 w-12 text-bt-green-300" />
            <div>
              <h3 className="text-lg font-800 text-white">
                Question Submitted!
              </h3>
              <p className="mt-1 text-xs text-[#9f9f9f]">
                Your question is now on the Q&A board.
              </p>
            </div>
            <div className="flex w-full flex-col gap-2">
              <Button
                variant="default"
                className="w-full"
                onClick={() => {
                  handleClose(false);
                  onViewBoard?.();
                }}
              >
                View Q&A Board
              </Button>
              <Button
                variant="outline"
                className="w-full"
                onClick={handleAskAnother}
              >
                Ask Another Question
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
