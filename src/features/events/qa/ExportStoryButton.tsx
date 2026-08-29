import { useRef, useState } from "react";
import html2canvas from "html2canvas";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import type { Question } from "./types";

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

  const handleExport = async () => {
    if (!storyRef.current) return;
    setExporting(true);
    try {
      const canvas = await html2canvas(storyRef.current, {
        backgroundColor: "#0B152C",
        scale: 2,
        useCORS: true,
        width: 1080,
        height: 1920,
      });
      const link = document.createElement("a");
      link.download = `qa-story-${question.questionId.slice(0, 8)}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    } finally {
      setExporting(false);
    }
  };

  return (
    <>
      <div
        ref={storyRef}
        style={{
          position: "fixed",
          left: "-9999px",
          top: 0,
          width: "1080px",
          height: "1920px",
          backgroundColor: "#0B152C",
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
            color: "#75D450",
            fontSize: "32px",
            fontWeight: 700,
            marginBottom: "40px",
          }}
        >
          {eventName} Q&A
        </p>
        <p
          style={{
            color: "#FFFFFF",
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
              borderLeft: "4px solid #75D450",
              paddingLeft: "32px",
            }}
          >
            <p
              style={{
                color: "#75D450",
                fontSize: "24px",
                fontWeight: 700,
                marginBottom: "16px",
              }}
            >
              Answer
            </p>
            <p style={{ color: "#BDC8E3", fontSize: "36px", lineHeight: 1.4 }}>
              {question.answer}
            </p>
          </div>
        )}
        <p style={{ color: "#7282A8", fontSize: "24px", marginTop: "80px" }}>
          ubcbiztech.com
        </p>
      </div>

      <Button
        variant="outline"
        size="sm"
        onClick={handleExport}
        disabled={exporting}
        className="gap-1.5"
      >
        <Download className="h-3.5 w-3.5" />
        {exporting ? "Exporting…" : "Export Story"}
      </Button>
    </>
  );
}
