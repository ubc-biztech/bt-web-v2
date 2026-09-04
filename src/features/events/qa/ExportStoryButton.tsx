import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import type { Question } from "./types";

const STORY_WIDTH = 1080;
const STORY_HEIGHT = 1920;

// The story card is an offscreen render target for html2canvas, which clones
// the node and reads computed styles. Styling it inline (rather than with
// Tailwind classes) keeps the exported image independent of the app's cascade
// and of whatever fonts the page happens to have loaded.
const STORY_COLORS = {
  background: "#0B152C", // bt-blue-600-ish, matches the event page surface
  accent: "#75D450", // bt-green-300
  body: "#FFFFFF",
  answer: "#BDC8E3", // bt-blue-0
  footer: "#7282A8", // bt-blue-200
} as const;

interface ExportStoryButtonProps {
  question: Question;
  eventName: string;
}

export function ExportStoryButton({
  question,
  eventName,
}: ExportStoryButtonProps) {
  const storyRef = useRef<HTMLDivElement>(null);
  const [exporting, setExporting] = useState(false);
  const [failed, setFailed] = useState(false);

  // Mounted only while an export is in flight — previously every question card
  // kept a 1080x1920 subtree in the DOM whether or not anyone exported.
  useEffect(() => {
    if (!exporting) return;

    let cancelled = false;

    const capture = async () => {
      try {
        const node = storyRef.current;
        if (!node) return;

        // Loaded on demand: html2canvas is large and only admins ever export.
        const { default: html2canvas } = await import("html2canvas");
        const canvas = await html2canvas(node, {
          backgroundColor: STORY_COLORS.background,
          scale: 2,
          useCORS: true,
          width: STORY_WIDTH,
          height: STORY_HEIGHT,
        });
        if (cancelled) return;

        const link = document.createElement("a");
        link.download = `qa-story-${question.questionId.slice(0, 8)}.png`;
        link.href = canvas.toDataURL("image/png");
        link.click();
      } catch {
        if (!cancelled) setFailed(true);
      } finally {
        if (!cancelled) setExporting(false);
      }
    };

    capture();

    return () => {
      cancelled = true;
    };
  }, [exporting, question.questionId]);

  return (
    <>
      {exporting && (
        <div
          ref={storyRef}
          aria-hidden
          style={{
            position: "fixed",
            left: "-9999px",
            top: 0,
            width: `${STORY_WIDTH}px`,
            height: `${STORY_HEIGHT}px`,
            backgroundColor: STORY_COLORS.background,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "120px",
            fontFamily: "sans-serif",
          }}
        >
          <p
            style={{
              color: STORY_COLORS.accent,
              fontSize: "32px",
              fontWeight: 700,
              marginBottom: "40px",
            }}
          >
            {eventName} Q&A
          </p>
          <p
            style={{
              color: STORY_COLORS.body,
              fontSize: "48px",
              fontWeight: 800,
              textAlign: "center",
              lineHeight: 1.3,
            }}
          >
            {question.body}
          </p>
          {question.answer && (
            <div
              style={{
                marginTop: "60px",
                borderLeft: `4px solid ${STORY_COLORS.accent}`,
                paddingLeft: "32px",
              }}
            >
              <p
                style={{
                  color: STORY_COLORS.accent,
                  fontSize: "24px",
                  fontWeight: 700,
                  marginBottom: "16px",
                }}
              >
                Answer
              </p>
              <p
                style={{
                  color: STORY_COLORS.answer,
                  fontSize: "36px",
                  lineHeight: 1.4,
                }}
              >
                {question.answer}
              </p>
            </div>
          )}
          <p
            style={{
              color: STORY_COLORS.footer,
              fontSize: "24px",
              marginTop: "80px",
            }}
          >
            ubcbiztech.com
          </p>
        </div>
      )}

      <Button
        variant="outline"
        size="sm"
        onClick={() => {
          setFailed(false);
          setExporting(true);
        }}
        disabled={exporting}
        className="gap-1.5"
      >
        <Download className="h-3.5 w-3.5" />
        {exporting ? "Exporting…" : failed ? "Retry export" : "Export Story"}
      </Button>
    </>
  );
}
