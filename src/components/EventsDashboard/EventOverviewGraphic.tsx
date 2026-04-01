import { useRef, useCallback, useMemo, useState, useEffect } from "react";
import { Registration } from "@/types/types";
import { BiztechEvent } from "@/types";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Download, Sparkles, Share2 } from "lucide-react";

interface EventOverviewGraphicProps {
  registrations: Registration[] | null;
  eventData: BiztechEvent;
}

// colours
const C = {
  bg: "#0B111E",
  bgCard: "#0D172C",
  bgSubtle: "#1B253D",
  border: "#3B4866",
  borderLight: "#26324D",
  green: "#75D450",
  greenDark: "#5CC433",
  greenLight: "#8AD96A",
  blue0: "#BDC8E3",
  blue100: "#A2B1D5",
  blue200: "#7282A8",
  pink: "#FF9AF8",
  red: "#FF8A9E",
  yellow: "#FFC960",
  purple: "#9F8AD1",
  cyan: "#75CFF5",
  white: "#FFFFFF",
};

const ACCENT = [C.green, C.cyan, C.pink, C.yellow, C.purple, C.red];

// canvas helpers
function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.arcTo(x + w, y, x + w, y + r, r);
  ctx.lineTo(x + w, y + h - r);
  ctx.arcTo(x + w, y + h, x + w - r, y + h, r);
  ctx.lineTo(x + r, y + h);
  ctx.arcTo(x, y + h, x, y + h - r, r);
  ctx.lineTo(x, y + r);
  ctx.arcTo(x, y, x + r, y, r);
  ctx.closePath();
}

function fillRoundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
  color: string,
) {
  roundRect(ctx, x, y, w, h, r);
  ctx.fillStyle = color;
  ctx.fill();
}

function drawText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  opts: {
    size?: number;
    weight?: number | string;
    color?: string;
    align?: CanvasTextAlign;
    maxWidth?: number;
    font?: string;
  } = {},
) {
  const {
    size = 13,
    weight = 400,
    color = C.white,
    align = "left",
    maxWidth,
    font = "Urbanist, Inter, system-ui, sans-serif",
  } = opts;
  ctx.font = `${weight} ${size}px ${font}`;
  ctx.fillStyle = color;
  ctx.textAlign = align;
  ctx.textBaseline = "top";
  if (maxWidth) {
    ctx.fillText(text, x, y, maxWidth);
  } else {
    ctx.fillText(text, x, y);
  }
}

// main
export default function EventOverviewGraphic({
  registrations,
  eventData,
}: EventOverviewGraphicProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const data = useMemo(() => registrations || [], [registrations]);

  // derived stats
  const stats = useMemo(() => {
    const total = data.length;
    const capacity = eventData?.capac || 0;
    const soldOut = capacity > 0 && total >= capacity;
    return { total, capacity, soldOut };
  }, [data, eventData]);

  const topFaculties = useMemo(() => {
    const counts: Record<string, number> = {};
    data.forEach((r) => {
      const f = r.basicInformation?.faculty;
      if (f) counts[f] = (counts[f] || 0) + 1;
    });
    return Object.entries(counts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 4)
      .map(([label, count]) => ({
        label: label
          .replace("Faculty of ", "")
          .replace("School of ", "")
          .replace("Sauder School of Business", "Sauder"),
        count,
        pct: data.length ? Math.round((count / data.length) * 100) : 0,
      }));
  }, [data]);

  const uniqueYears = useMemo(() => {
    const set = new Set<string>();
    data.forEach((r) => {
      if (r.basicInformation?.year) set.add(r.basicInformation.year);
    });
    return set.size;
  }, [data]);

  const uniqueFaculties = useMemo(() => {
    const set = new Set<string>();
    data.forEach((r) => {
      if (r.basicInformation?.faculty) set.add(r.basicInformation.faculty);
    });
    return set.size;
  }, [data]);

  const uniqueMajors = useMemo(() => {
    const set = new Set<string>();
    data.forEach((r) => {
      if (r.basicInformation?.major) set.add(r.basicInformation.major);
    });
    return set.size;
  }, [data]);

  const formattedDate = useMemo(() => {
    if (!eventData?.startDate) return "";
    return new Date(eventData.startDate).toLocaleDateString("en-US", {
      weekday: "short",
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  }, [eventData]);

  const formattedTime = useMemo(() => {
    if (!eventData?.startDate) return "";
    const start = new Date(eventData.startDate);
    const end = eventData.endDate ? new Date(eventData.endDate) : null;
    const fmt = (d: Date) =>
      d.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      });
    return end ? `${fmt(start)} \u2013 ${fmt(end)}` : fmt(start);
  }, [eventData]);

  const shortDesc = useMemo(() => {
    if (!eventData?.description) return "";
    const clean = eventData.description.replace(/<[^>]*>/g, "").trim();
    const sentence = clean.split(/[.!?]\s/)[0];
    if (sentence.length <= 100)
      return sentence + (clean.length > sentence.length ? "." : "");
    return clean.substring(0, 97).trim() + "...";
  }, [eventData]);

  // paint card
  const CARD_W = 390;
  const SCALE = 3; // retina
  const PAD = 28;

  const paintCard = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // dynamic height
    let y = 0;
    const w = CARD_W;

    // first pass
    const contentHeight = calculateContentHeight(ctx, w);
    const h = contentHeight;

    canvas.width = w * SCALE;
    canvas.height = h * SCALE;
    canvas.style.width = `${w}px`;
    canvas.style.height = `${h}px`;
    ctx.scale(SCALE, SCALE);

    // bg
    roundRect(ctx, 0, 0, w, h, 28);
    ctx.fillStyle = C.bg;
    ctx.fill();
    ctx.clip(); // rounded clip

    // glow
    ctx.save();
    ctx.globalAlpha = 0.07;
    ctx.fillStyle = C.green;
    ctx.beginPath();
    ctx.arc(w + 20, -20, 140, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = C.purple;
    ctx.beginPath();
    ctx.arc(-20, h + 10, 100, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = C.cyan;
    ctx.beginPath();
    ctx.arc(w + 10, h * 0.45, 70, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // top bar
    const barGrad = ctx.createLinearGradient(0, 0, w, 0);
    barGrad.addColorStop(0, C.green);
    barGrad.addColorStop(0.33, C.cyan);
    barGrad.addColorStop(0.66, C.pink);
    barGrad.addColorStop(1, C.yellow);
    ctx.fillStyle = barGrad;
    ctx.fillRect(0, 0, w, 4);

    y = 4 + PAD;

    // header
    // bt badge
    const badgeSize = 36;
    const btGrad = ctx.createLinearGradient(
      PAD,
      y,
      PAD + badgeSize,
      y + badgeSize,
    );
    btGrad.addColorStop(0, C.green);
    btGrad.addColorStop(1, C.greenDark);
    fillRoundRect(ctx, PAD, y, badgeSize, badgeSize, 10, "");
    ctx.fillStyle = btGrad;
    ctx.fill();
    drawText(ctx, "BT", PAD + badgeSize / 2, y + 10, {
      size: 15,
      weight: 800,
      color: C.bg,
      align: "center",
    });

    // badge text
    drawText(ctx, "UBC BIZTECH", PAD + badgeSize + 10, y + 4, {
      size: 14,
      weight: 700,
      color: C.blue0,
    });
    drawText(ctx, "Event Recap", PAD + badgeSize + 10, y + 22, {
      size: 10,
      weight: 400,
      color: C.blue200,
    });

    // sold out
    if (stats.soldOut) {
      const badgeText = "\u2726 Sold Out";
      ctx.font = `700 10px Urbanist, Inter, system-ui, sans-serif`;
      const badgeW = ctx.measureText(badgeText).width + 24;
      const badgeX = w - PAD - badgeW;
      fillRoundRect(ctx, badgeX, y + 6, badgeW, 22, 11, C.green);
      drawText(ctx, badgeText, badgeX + badgeW / 2, y + 11, {
        size: 10,
        weight: 700,
        color: C.bg,
        align: "center",
      });
    }

    y += badgeSize + 24;

    // title
    ctx.font = `800 32px Urbanist, Inter, system-ui, sans-serif`;
    const titleLines = wrapText(ctx, eventData?.ename || "Event", w - PAD * 2);
    // title gradient
    titleLines.forEach((line, i) => {
      const lineY = y + i * 36;
      // white to green
      const tGrad = ctx.createLinearGradient(PAD, lineY, w - PAD, lineY + 36);
      tGrad.addColorStop(0, C.white);
      tGrad.addColorStop(0.4, C.white);
      tGrad.addColorStop(1, C.green);
      ctx.fillStyle = tGrad;
      ctx.textAlign = "left";
      ctx.textBaseline = "top";
      ctx.fillText(line, PAD, lineY);
    });
    y += titleLines.length * 36;

    // desc
    if (shortDesc) {
      y += 8;
      ctx.font = `400 13px Urbanist, Inter, system-ui, sans-serif`;
      const descLines = wrapText(ctx, shortDesc, w - PAD * 2 - 20);
      descLines.forEach((line, i) => {
        drawText(ctx, line, PAD, y + i * 19, {
          size: 13,
          weight: 400,
          color: C.blue100,
        });
      });
      y += descLines.length * 19;
    }

    // date time location
    y += 14;
    const infoRows: string[] = [];
    if (formattedDate) infoRows.push(`\uD83D\uDCC5  ${formattedDate}`);
    if (formattedTime) infoRows.push(`\uD83D\uDD52  ${formattedTime}`);
    if (eventData?.elocation)
      infoRows.push(`\uD83D\uDCCD  ${eventData.elocation}`);

    infoRows.forEach((row) => {
      drawText(ctx, row, PAD, y, {
        size: 12,
        weight: 400,
        color: C.blue100,
      });
      y += 20;
    });

    // divider
    y += 8;
    const divGrad = ctx.createLinearGradient(PAD, y, w - PAD, y);
    divGrad.addColorStop(0, "transparent");
    divGrad.addColorStop(0.5, C.border);
    divGrad.addColorStop(1, "transparent");
    ctx.fillStyle = divGrad;
    ctx.fillRect(PAD, y, w - PAD * 2, 1);
    y += 20;

    // hero number
    drawText(ctx, String(stats.total), PAD, y, {
      size: 56,
      weight: 800,
      color: C.green,
    });
    ctx.font = `800 56px Urbanist, Inter, system-ui, sans-serif`;
    const numW = ctx.measureText(String(stats.total)).width;
    drawText(ctx, "attendees", PAD + numW + 8, y + 32, {
      size: 16,
      weight: 600,
      color: C.blue100,
    });
    y += 62;

    // diversity cards
    y += 12;
    const cardGap = 8;
    const cardW = (w - PAD * 2 - cardGap * 2) / 3;
    const cardH = 76;

    const diversityItems = [
      {
        value: String(uniqueFaculties),
        label: "Faculties",
        emoji: "\uD83C\uDF93",
        color: C.cyan,
      },
      {
        value: String(uniqueMajors),
        label: "Majors",
        emoji: "\uD83D\uDCDA",
        color: C.yellow,
      },
      {
        value: String(uniqueYears),
        label: "Year Levels",
        emoji: "\uD83C\uDF1F",
        color: C.pink,
      },
    ];

    diversityItems.forEach((item, i) => {
      const cx = PAD + i * (cardW + cardGap);
      fillRoundRect(ctx, cx, y, cardW, cardH, 14, C.bgSubtle);
      ctx.strokeStyle = C.borderLight;
      ctx.lineWidth = 1;
      roundRect(ctx, cx, y, cardW, cardH, 14);
      ctx.stroke();

      // emoji
      drawText(ctx, item.emoji, cx + cardW / 2, y + 10, {
        size: 14,
        align: "center",
      });
      // value
      drawText(ctx, item.value, cx + cardW / 2, y + 30, {
        size: 24,
        weight: 800,
        color: item.color,
        align: "center",
      });
      // label
      drawText(ctx, item.label, cx + cardW / 2, y + 58, {
        size: 10,
        weight: 500,
        color: C.blue200,
        align: "center",
      });
    });
    y += cardH;

    // faculty split
    if (topFaculties.length > 0) {
      y += 20;
      drawText(ctx, "\uD83C\uDF93  WHO ATTENDED", PAD, y, {
        size: 11,
        weight: 700,
        color: C.blue0,
      });
      y += 20;

      // box
      const facBoxH = topFaculties.length * 26 + 28;
      fillRoundRect(ctx, PAD, y, w - PAD * 2, facBoxH, 16, C.bgSubtle);
      ctx.strokeStyle = C.borderLight;
      ctx.lineWidth = 1;
      roundRect(ctx, PAD, y, w - PAD * 2, facBoxH, 16);
      ctx.stroke();

      // donut
      const donutCx = PAD + 50;
      const donutCy = y + facBoxH / 2;
      const donutR = 32;
      const donutInnerR = 22;

      // segments
      let startAngle = -Math.PI / 2;
      const totalFac = topFaculties.reduce((s, f) => s + f.count, 0);
      topFaculties.forEach((f, i) => {
        const sweep = (f.count / totalFac) * Math.PI * 2;
        ctx.beginPath();
        ctx.moveTo(donutCx, donutCy);
        ctx.arc(donutCx, donutCy, donutR, startAngle, startAngle + sweep);
        ctx.closePath();
        ctx.fillStyle = ACCENT[i % ACCENT.length];
        ctx.fill();
        startAngle += sweep;
      });
      // remainder
      if (startAngle < Math.PI * 1.5) {
        ctx.beginPath();
        ctx.moveTo(donutCx, donutCy);
        ctx.arc(donutCx, donutCy, donutR, startAngle, Math.PI * 1.5);
        ctx.closePath();
        ctx.fillStyle = C.border;
        ctx.fill();
      }
      // inner ring
      ctx.beginPath();
      ctx.arc(donutCx, donutCy, donutInnerR, 0, Math.PI * 2);
      ctx.fillStyle = C.bgSubtle;
      ctx.fill();
      // center text
      drawText(ctx, String(uniqueFaculties), donutCx, donutCy - 10, {
        size: 16,
        weight: 800,
        color: C.white,
        align: "center",
      });
      drawText(ctx, "faculties", donutCx, donutCy + 6, {
        size: 7,
        weight: 500,
        color: C.blue200,
        align: "center",
      });

      // legend
      const legendX = PAD + 100;
      topFaculties.forEach((f, i) => {
        const ly = y + 14 + i * 26;
        // swatch
        fillRoundRect(ctx, legendX, ly + 2, 8, 8, 2, ACCENT[i % ACCENT.length]);
        // label
        drawText(ctx, f.label, legendX + 16, ly, {
          size: 11,
          weight: 400,
          color: C.blue100,
          maxWidth: w - PAD - legendX - 60,
        });
        // pct
        drawText(ctx, `${f.pct}%`, w - PAD - 16, ly, {
          size: 11,
          weight: 700,
          color: ACCENT[i % ACCENT.length],
          align: "right",
        });
      });

      y += facBoxH;
    }

    // bottom divider
    y += 8;
    const div2Grad = ctx.createLinearGradient(PAD, y, w - PAD, y);
    div2Grad.addColorStop(0, "transparent");
    div2Grad.addColorStop(0.5, C.border);
    div2Grad.addColorStop(1, "transparent");
    ctx.fillStyle = div2Grad;
    ctx.fillRect(PAD, y, w - PAD * 2, 1);
    y += 16;

    // footer
    // mini badge
    const ftBadge = 20;
    const ftGrad = ctx.createLinearGradient(PAD, y, PAD + ftBadge, y + ftBadge);
    ftGrad.addColorStop(0, C.green);
    ftGrad.addColorStop(1, C.greenDark);
    fillRoundRect(ctx, PAD, y, ftBadge, ftBadge, 5, "");
    ctx.fillStyle = ftGrad;
    ctx.fill();
    drawText(ctx, "BT", PAD + ftBadge / 2, y + 5, {
      size: 8,
      weight: 800,
      color: C.bg,
      align: "center",
    });
    drawText(ctx, "ubcbiztech.com", PAD + ftBadge + 6, y + 4, {
      size: 11,
      weight: 500,
      color: C.blue200,
    });

    // year tag
    // green dot
    ctx.beginPath();
    ctx.arc(w - PAD - 30, y + 10, 3, 0, Math.PI * 2);
    ctx.fillStyle = C.green;
    ctx.fill();
    drawText(ctx, String(eventData?.year || ""), w - PAD, y + 4, {
      size: 10,
      weight: 400,
      color: C.blue200,
      align: "right",
    });

    y += ftBadge + PAD;
    // done
  }, [
    stats,
    topFaculties,
    uniqueFaculties,
    uniqueMajors,
    uniqueYears,
    formattedDate,
    formattedTime,
    shortDesc,
    eventData,
  ]);

  // height pass
  const calculateContentHeight = useCallback(
    (ctx: CanvasRenderingContext2D, w: number) => {
      let y = 4 + PAD; // top pad
      y += 36 + 24; // header

      // title
      ctx.font = `800 32px Urbanist, Inter, system-ui, sans-serif`;
      const titleLines = wrapText(
        ctx,
        eventData?.ename || "Event",
        w - PAD * 2,
      );
      y += titleLines.length * 36;

      // desc
      if (shortDesc) {
        y += 8;
        ctx.font = `400 13px Urbanist, Inter, system-ui, sans-serif`;
        const descLines = wrapText(ctx, shortDesc, w - PAD * 2 - 20);
        y += descLines.length * 19;
      }

      // info rows
      y += 14;
      let infoCount = 0;
      if (formattedDate) infoCount++;
      if (formattedTime) infoCount++;
      if (eventData?.elocation) infoCount++;
      y += infoCount * 20;

      // divider
      y += 8 + 1 + 20;

      // hero
      y += 62;

      // cards
      y += 12 + 76;

      // faculty
      if (topFaculties.length > 0) {
        y += 20 + 20;
        y += topFaculties.length * 26 + 28;
      }

      // footer
      y += 8 + 1 + 16 + 20 + PAD;

      return y;
    },
    [topFaculties, formattedDate, formattedTime, shortDesc, eventData],
  );

  // paint on open
  useEffect(() => {
    if (isOpen) {
      // small delay
      const timer = setTimeout(paintCard, 50);
      return () => clearTimeout(timer);
    }
  }, [isOpen, paintCard]);

  // export
  const handleExport = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    setIsExporting(true);
    try {
      const link = document.createElement("a");
      const safeName = (eventData?.ename || "event")
        .replace(/[^a-zA-Z0-9]+/g, "-")
        .toLowerCase();
      link.download = `${safeName}-overview.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    } catch (err) {
      console.error("Export failed:", err);
    } finally {
      setIsExporting(false);
    }
  }, [eventData]);

  // render
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className="flex items-center gap-2 border-bt-blue-300/30 bg-bt-blue-500/40 hover:bg-bt-blue-400/40 text-bt-green-300"
        >
          <Share2 className="w-4 h-4" />
          <span className="hidden sm:inline">Generate Overview</span>
          <span className="sm:hidden">Overview</span>
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-[480px] bg-bt-blue-600 border-bt-blue-300/30 max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-white flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-bt-green-300" />
            Event Overview
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col items-center gap-4">
          <canvas
            ref={canvasRef}
            style={{
              borderRadius: 28,
              maxWidth: "100%",
              height: "auto",
            }}
          />

          <Button
            onClick={handleExport}
            disabled={isExporting}
            className="w-full bg-bt-green-400 hover:bg-bt-green-300 text-bt-blue-700 font-semibold"
          >
            {isExporting ? (
              <>Generating...</>
            ) : (
              <>
                <Download className="w-4 h-4 mr-2" />
                Download PNG
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// text wrap
function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
): string[] {
  const words = text.split(" ");
  const lines: string[] = [];
  let currentLine = "";

  for (const word of words) {
    const testLine = currentLine ? `${currentLine} ${word}` : word;
    const metrics = ctx.measureText(testLine);
    if (metrics.width > maxWidth && currentLine) {
      lines.push(currentLine);
      currentLine = word;
    } else {
      currentLine = testLine;
    }
  }
  if (currentLine) lines.push(currentLine);
  return lines;
}
