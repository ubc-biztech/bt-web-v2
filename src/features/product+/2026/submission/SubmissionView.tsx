import {
  useEffect,
  useRef,
  useState,
  type ComponentType,
  type SVGProps,
} from "react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import CalendarAsset from "@/assets/2026/product+/submission-calendar.svg";
import CopyAsset from "@/assets/2026/product+/submission-copy.svg";
import CopiedAsset from "@/assets/2026/product+/team-copy-confirmed.svg";
import EditAsset from "@/assets/2026/product+/edit.svg";
import UploadAsset from "@/assets/2026/product+/upload.svg";
import UploadErrorAsset from "@/assets/2026/product+/submission-upload-error.svg";
import PlayAsset from "@/assets/2026/product+/submission-play.svg";
import CheckAsset from "@/assets/2026/product+/submission-check.svg";
import PdfEllipseAsset from "@/assets/2026/product+/pdf-ellipse.svg";
import PdfRectangleAsset from "@/assets/2026/product+/submission-pdf-rectangle.svg";
import PdfOutlineAsset from "@/assets/2026/product+/submission-pdf-outline.svg";
import SuccessAsset from "@/assets/2026/product+/submission-toast-success.svg";
import ErrorAsset from "@/assets/2026/product+/submission-toast-error.svg";
import SpinnerAsset from "@/assets/2026/product+/submission-spinner.svg";
import {
  GlassCard,
  PageHeading,
  ProductButton,
} from "../components/ProductPlusUI";
import {
  formatSubmissionDate,
  youtubeVideoId,
  type Submission,
  type SubmissionErrors,
  type SubmissionFields,
  type SubmissionNotice,
  type SubmissionPhase,
  type SubmissionTeam,
} from "./submission";

type SvgComponent = ComponentType<SVGProps<SVGSVGElement>>;
const CalendarIcon = CalendarAsset as unknown as SvgComponent;
const CopyIcon = CopyAsset as unknown as SvgComponent;
const CopiedIcon = CopiedAsset as unknown as SvgComponent;
const EditIcon = EditAsset as unknown as SvgComponent;
const UploadIcon = UploadAsset as unknown as SvgComponent;
const UploadErrorIcon = UploadErrorAsset as unknown as SvgComponent;
const PlayIcon = PlayAsset as unknown as SvgComponent;
const CheckIcon = CheckAsset as unknown as SvgComponent;
const PdfEllipse = PdfEllipseAsset as unknown as SvgComponent;
const PdfRectangle = PdfRectangleAsset as unknown as SvgComponent;
const PdfOutline = PdfOutlineAsset as unknown as SvgComponent;
const SuccessIcon = SuccessAsset as unknown as SvgComponent;
const ErrorIcon = ErrorAsset as unknown as SvgComponent;
const SpinnerIcon = SpinnerAsset as unknown as SvgComponent;

const inputClass =
  "h-14 min-w-0 rounded-2xl border-[#614fb8]/[0.08] bg-white/[0.85] px-4 py-3 text-[14px] leading-5 text-product-ink shadow-[0_1px_2px_rgba(97,79,184,0.04),inset_0_1px_2px_rgba(255,255,255,0.65)] backdrop-blur-[14px] placeholder:text-product-muted focus-visible:border-[#614fb8] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#614fb8] focus-visible:ring-offset-0 disabled:opacity-100";
const labelClass = "text-[14px] font-semibold leading-5 text-product-ink";
const helperClass = "m-0 text-[13px] leading-[18px] text-product-muted";
const linkClass =
  "rounded-sm text-[14px] font-semibold leading-5 text-[#614fb8] hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-product-primary disabled:cursor-wait disabled:opacity-60";

function PdfIcon() {
  return (
    <span className="relative block h-8 w-8 shrink-0" aria-hidden="true">
      <span className="absolute inset-[40.12%_0_0_40.12%]">
        <PdfEllipse />
      </span>
      <span className="absolute inset-[0_1.16%_1.16%_0]">
        <PdfRectangle />
      </span>
      <span className="absolute inset-[0_1.16%_1.16%_0]">
        <PdfOutline />
      </span>
      <span className="absolute inset-[20.95%_62.95%_73.65%_11.87%] rounded-[15px] bg-white" />
      <span className="absolute inset-[11.15%_72.66%_63.67%_21.94%] rounded-[15px] bg-white" />
    </span>
  );
}

export interface SubmissionViewProps {
  team: SubmissionTeam;
  fields: SubmissionFields;
  saved: Submission | null;
  deadline: string;
  locked: boolean;
  editing: boolean;
  phase: SubmissionPhase;
  checkingFile: boolean;
  errors: SubmissionErrors;
  notice: SubmissionNotice | null;
  pdfName: string | null;
  rejectedFile: string | null;
  uploadError: string | null;
  openingPdf: boolean;
  onChange: (fields: SubmissionFields) => void;
  onEdit: () => void;
  onFile: (file: File) => void;
  onSubmit: () => void;
  onRetryUpload: () => void;
  onOpenPdf: () => void;
  onNotice: (notice: SubmissionNotice) => void;
  onVideoBlur: () => void;
}

export default function SubmissionView({
  team,
  fields,
  saved,
  deadline,
  locked,
  editing,
  phase,
  checkingFile,
  errors,
  notice,
  pdfName,
  rejectedFile,
  uploadError,
  openingPdf,
  onChange,
  onEdit,
  onFile,
  onSubmit,
  onRetryUpload,
  onOpenPdf,
  onNotice,
  onVideoBlur,
}: SubmissionViewProps) {
  const fileInput = useRef<HTMLInputElement>(null);
  const form = useRef<HTMLFormElement>(null);
  const titleInput = useRef<HTMLInputElement>(null);
  const [replacing, setReplacing] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [copied, setCopied] = useState(false);
  const [playing, setPlaying] = useState<string | null>(null);
  const busy = phase !== "idle" || checkingFile;
  const disabled = busy || locked;
  const fieldClass = cn(
    inputClass,
    locked && "focus-visible:border-[#614fb8]/[0.08] focus-visible:ring-0",
  );
  const readOnlyFieldClass = cn(
    inputClass,
    "focus-visible:border-[#614fb8]/[0.08] focus-visible:ring-0",
  );
  const videoId = youtubeVideoId(fields.video_url);

  useEffect(() => {
    if (!copied) return;
    const timer = window.setTimeout(() => setCopied(false), 2000);
    return () => window.clearTimeout(timer);
  }, [copied]);

  useEffect(() => {
    setReplacing(false);
  }, [pdfName, saved?.updated_at, locked]);

  async function copyCode() {
    try {
      await navigator.clipboard.writeText(team.team_code);
      setCopied(true);
    } catch {
      onNotice({
        tone: "error",
        message:
          "Couldn’t copy the team code. Please select and copy it manually.",
      });
    }
  }

  function chooseFile(file?: File) {
    if (!file || disabled) return;
    onFile(file);
    setDragging(false);
  }

  return (
    <div className="relative flex w-full min-w-0 flex-col gap-6">
      {notice && (
        <div
          role={notice.tone === "error" ? "alert" : "status"}
          className={cn(
            "absolute -top-7 left-1/2 z-20 flex w-max max-w-full -translate-x-1/2 items-center gap-2.5 rounded-[24px] border py-3 pl-4 pr-[22px] text-[14px] leading-5 shadow-[0_8px_14px_rgba(97,80,184,0.08),inset_0_1px_2px_rgba(255,255,255,0.65)] backdrop-blur-[14px] max-[960px]:relative max-[960px]:left-auto max-[960px]:top-auto max-[960px]:translate-x-0",
            notice.tone === "success"
              ? "border-[#215c47]/15 bg-[#e8f5ed] text-[#215c47]"
              : "border-[#99263d]/[0.22] bg-[#faebf0] text-[#99263d]",
          )}
        >
          <span className="shrink-0" aria-hidden="true">
            {notice.tone === "success" ? <SuccessIcon /> : <ErrorIcon />}
          </span>
          <span>{notice.message}</span>
        </div>
      )}
      <PageHeading
        title="Submission"
        className="mb-0 items-start max-[640px]:mb-0 md:items-center"
      >
        <div className="flex items-center gap-3">
          <span className="shrink-0" aria-hidden="true">
            <CalendarIcon />
          </span>
          <div>
            <p className={helperClass}>
              {locked ? "Deadline passed" : "Submission deadline"}
            </p>
            <strong className="mt-0.5 block text-[14px] font-semibold leading-5 text-product-ink">
              {formatSubmissionDate(deadline)}
            </strong>
          </div>
        </div>
      </PageHeading>

      <GlassCard className="flex flex-wrap items-center justify-between gap-4 p-5 min-[641px]:px-7 min-[641px]:py-6">
        <h2 className="m-0 min-w-0 break-words font-product-heading text-[24px] font-normal leading-8 tracking-[-0.5px] text-product-ink">
          Team {team.team_name}
        </h2>
        <button
          type="button"
          onClick={() => void copyCode()}
          aria-label={
            copied ? "Team code copied" : `Copy team code ${team.team_code}`
          }
          className="inline-flex shrink-0 items-center gap-2 rounded-full border border-[#614fb8]/30 bg-[#614fb8]/10 px-3.5 py-2 text-[16px] font-semibold leading-5 tracking-[0.96px] text-[#614fb8] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-product-primary"
        >
          <span aria-live="polite">{copied ? "Copied!" : team.team_code}</span>
          <span aria-hidden="true">
            {copied ? <CopiedIcon /> : <CopyIcon />}
          </span>
        </button>
      </GlassCard>

      <GlassCard className="p-5 min-[641px]:p-7">
        <form
          ref={form}
          noValidate
          aria-busy={busy}
          onSubmit={(event) => {
            event.preventDefault();
            if (!disabled) {
              onSubmit();
              requestAnimationFrame(() =>
                form.current
                  ?.querySelector<HTMLElement>(
                    '[aria-invalid="true"], [data-invalid="true"]',
                  )
                  ?.focus(),
              );
            }
          }}
          className="flex flex-col gap-6"
        >
          {saved && (
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-3">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-[#e8f5ed] py-1.5 pl-2.5 pr-3 text-[13px] leading-[18px] text-[#215c47]">
                  <CheckIcon aria-hidden="true" /> Submitted
                </span>
                <p className={helperClass}>
                  Last updated {formatSubmissionDate(saved.updated_at, true)}
                </p>
              </div>
              {!locked && (
                <ProductButton
                  type="button"
                  variant="secondary"
                  disabled={busy}
                  onClick={() => {
                    onEdit();
                    titleInput.current?.focus();
                  }}
                  className="min-h-9 gap-2 py-2 pl-3.5 pr-4 shadow-[0_3px_8px_rgba(52,49,92,0.03),inset_0_1px_1px_rgba(255,255,255,0.62)]"
                >
                  <EditIcon aria-hidden="true" /> Edit details
                </ProductButton>
              )}
            </div>
          )}

          <div className="grid min-w-0 grid-cols-1 items-start gap-7 md:min-h-[492px] md:grid-cols-[minmax(0,1fr)_minmax(0,1.25fr)] md:gap-6 min-[1201px]:grid-cols-[minmax(0,384px)_minmax(0,1fr)] min-[1201px]:gap-8">
            <div className="flex min-w-0 flex-col gap-6">
              <label className="flex min-w-0 flex-col gap-2">
                <span className={labelClass}>Team name</span>
                <Input
                  className={readOnlyFieldClass}
                  value={fields.team_name}
                  readOnly
                  tabIndex={-1}
                />
              </label>
              <label className="flex min-w-0 flex-col gap-2">
                <span className={labelClass}>Project title</span>
                <Input
                  ref={titleInput}
                  className={cn(
                    fieldClass,
                    errors.project_title && "border-[#99263d]",
                  )}
                  value={fields.project_title ?? ""}
                  required
                  readOnly={disabled}
                  onChange={(event) =>
                    onChange({ ...fields, project_title: event.target.value })
                  }
                  placeholder="e.g. Launchpad"
                  aria-invalid={!!errors.project_title}
                  aria-describedby={
                    errors.project_title ? "project-title-error" : undefined
                  }
                />
                {errors.project_title && (
                  <span
                    id="project-title-error"
                    className="text-[13px] leading-[18px] text-[#99263d]"
                  >
                    {errors.project_title}
                  </span>
                )}
              </label>
              <fieldset className="m-0 min-w-0 border-0 p-0">
                <legend className={cn(labelClass, "mb-3 p-0")}>
                  Team members
                </legend>
                <div className="flex flex-col gap-3">
                  {fields.member_names.map((member, index) => (
                    <Input
                      key={index}
                      className={readOnlyFieldClass}
                      aria-label={`Team member ${index + 1}`}
                      value={member}
                      readOnly
                      tabIndex={-1}
                    />
                  ))}
                </div>
              </fieldset>
            </div>

            <div className="flex min-w-0 flex-col gap-3">
              <label className="flex min-h-[110px] min-w-0 flex-col gap-2">
                <span className={labelClass}>YouTube link</span>
                <Input
                  className={cn(
                    fieldClass,
                    !fields.video_url && "bg-white/50",
                    errors.video_url && "border-[#99263d] bg-white/60",
                  )}
                  type="url"
                  value={fields.video_url}
                  placeholder="YouTube link"
                  readOnly={disabled}
                  autoComplete="off"
                  aria-invalid={!!errors.video_url}
                  aria-describedby={
                    errors.video_url ? "video-error" : "video-helper"
                  }
                  onBlur={onVideoBlur}
                  onChange={(event) => {
                    setPlaying(null);
                    onChange({ ...fields, video_url: event.target.value });
                  }}
                />
                {errors.video_url && (
                  <span
                    id="video-error"
                    className="text-[13px] leading-[18px] text-[#99263d]"
                  >
                    {errors.video_url}
                  </span>
                )}
              </label>
              {!errors.video_url && (
                <p className={helperClass} id="video-helper">
                  Check that your video is unlisted and plays correctly.
                </p>
              )}
              {videoId && !errors.video_url && (
                <div className="flex aspect-video w-full items-center justify-center overflow-hidden rounded-2xl bg-[linear-gradient(180deg,#22315f,#7463a6)]">
                  {playing === videoId ? (
                    <iframe
                      key={videoId}
                      title="Submission video preview"
                      className="h-full w-full border-0"
                      src={`https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&playsinline=1`}
                      allow="autoplay; encrypted-media; picture-in-picture"
                      allowFullScreen
                    />
                  ) : (
                    <button
                      type="button"
                      aria-label="Play submission video"
                      onClick={() => setPlaying(videoId)}
                      className="flex h-10 w-14 items-center justify-center rounded-xl bg-white/[0.85] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
                    >
                      <PlayIcon aria-hidden="true" />
                    </button>
                  )}
                </div>
              )}

              <div className="flex min-w-0 flex-col gap-2 pt-1">
                <p className={cn(labelClass, "m-0")} id="prd-label">
                  PRD
                </p>
                <input
                  ref={fileInput}
                  type="file"
                  accept="application/pdf,.pdf"
                  className="sr-only"
                  tabIndex={-1}
                  disabled={disabled}
                  aria-label="Choose PRD PDF"
                  onChange={(event) => {
                    chooseFile(event.target.files?.[0]);
                    event.target.value = "";
                  }}
                />
                {pdfName && (
                  <div
                    className={cn(
                      "flex min-h-16 items-center gap-3 rounded-2xl border border-white/70 bg-white/60 p-4",
                      uploadError && "border-[#99263d]/70 bg-[#faebf0]/80",
                    )}
                  >
                    <PdfIcon />
                    <span
                      className={cn(
                        "min-w-0 flex-1 break-words text-[14px] leading-5 text-product-primary [overflow-wrap:anywhere]",
                        uploadError && "text-[#99263d]",
                      )}
                    >
                      {pdfName}
                    </span>
                    {phase === "uploading" ? (
                      <span
                        role="status"
                        className="text-[14px] text-product-primary"
                      >
                        Uploading…
                      </span>
                    ) : uploadError ? (
                      <button
                        type="button"
                        className={cn(linkClass, "shrink-0 text-[#99263d]")}
                        disabled={disabled}
                        onClick={onRetryUpload}
                      >
                        Retry
                      </button>
                    ) : (
                      <button
                        type="button"
                        className={cn(linkClass, "shrink-0")}
                        disabled={openingPdf}
                        onClick={onOpenPdf}
                      >
                        {openingPdf ? "Opening…" : "Open"}
                      </button>
                    )}
                  </div>
                )}
                {uploadError && (
                  <p
                    role="alert"
                    className="m-0 text-[13px] leading-[18px] text-[#99263d]"
                  >
                    {uploadError}
                  </p>
                )}
                {!locked && (!pdfName || replacing || rejectedFile) && (
                  <button
                    type="button"
                    disabled={busy}
                    aria-labelledby="prd-label prd-drop-label"
                    aria-describedby="prd-file-help"
                    data-invalid={!!errors.prd_path || !!rejectedFile}
                    onClick={() => fileInput.current?.click()}
                    onDragOver={(event) => {
                      event.preventDefault();
                      if (!disabled) setDragging(true);
                    }}
                    onDragLeave={(event) => {
                      if (
                        !event.currentTarget.contains(
                          event.relatedTarget as Node | null,
                        )
                      )
                        setDragging(false);
                    }}
                    onDrop={(event) => {
                      event.preventDefault();
                      setDragging(false);
                      chooseFile(event.dataTransfer.files[0]);
                    }}
                    className={cn(
                      "flex w-full flex-col items-center justify-center gap-1 rounded-2xl border-[1.5px] border-dashed border-[#614fb8]/[0.55] bg-product-lavender/[0.65] p-3 text-center text-[14px] leading-5 text-product-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-product-primary disabled:cursor-wait",
                      pdfName && !rejectedFile
                        ? "min-h-[68px]"
                        : "min-h-[148px]",
                      dragging &&
                        "border-product-primary bg-product-lavender ring-2 ring-product-primary/20",
                      rejectedFile &&
                        "border-[#99263d]/70 bg-[#faebf0]/80 text-[#99263d]",
                    )}
                  >
                    {(!pdfName || rejectedFile) && (
                      <span aria-hidden="true">
                        {rejectedFile ? <UploadErrorIcon /> : <UploadIcon />}
                      </span>
                    )}
                    <span id="prd-drop-label">
                      {rejectedFile
                        ? `We couldn’t add “${rejectedFile}”`
                        : dragging
                          ? "Drop your PDF here"
                          : pdfName
                            ? "Replace PDF"
                            : "Drop your PDF here or choose a file"}
                    </span>
                    <span
                      id="prd-file-help"
                      className={cn(
                        "text-[13px] leading-[18px] text-product-muted",
                        rejectedFile && "text-[#99263d]",
                      )}
                    >
                      {rejectedFile
                        ? "Only PDF files up to 5 MB are accepted. Choose another PDF."
                        : "PDF only"}
                    </span>
                  </button>
                )}
                {pdfName && !replacing && !rejectedFile && !locked && (
                  <button
                    type="button"
                    className={cn(linkClass, "self-start px-0.5 py-1")}
                    disabled={busy}
                    onClick={() => {
                      onEdit();
                      setReplacing(true);
                    }}
                  >
                    Replace PDF?
                  </button>
                )}
                {errors.prd_path && !rejectedFile && (
                  <p
                    role="alert"
                    className="m-0 text-[13px] leading-[18px] text-[#99263d]"
                  >
                    {errors.prd_path}
                  </p>
                )}
                {!pdfName && locked && (
                  <p className={helperClass}>No PRD was submitted.</p>
                )}
                <p className={helperClass}>
                  Include your team code, team name and project title on the
                  first page.
                </p>
                <p className="m-0 text-[13px] italic leading-[18px] text-[#aa95dd] [overflow-wrap:anywhere]">
                  e.g. {team.team_code}_{fields.team_name || "Team-name"}
                  _Launchpad.pdf
                </p>
              </div>
            </div>
          </div>

          {!locked && (!saved || editing || busy) && (
            <div className="flex justify-end">
              <ProductButton
                type="submit"
                className="w-full gap-2 disabled:bg-[#dfdaf0] md:w-[200px]"
                disabled={busy}
              >
                {busy && (
                  <span
                    className="relative block h-[18px] w-[18px]"
                    aria-hidden="true"
                  >
                    <span className="absolute -inset-px block motion-safe:animate-spin">
                      <SpinnerIcon />
                    </span>
                  </span>
                )}
                {checkingFile
                  ? "Checking PDF…"
                  : phase === "uploading"
                    ? "Uploading…"
                    : busy
                      ? saved
                        ? "Saving…"
                        : "Submitting…"
                      : saved
                        ? "Save changes"
                        : "Submit"}
              </ProductButton>
            </div>
          )}
          {locked && !saved && (
            <p role="status" className={helperClass}>
              The submission deadline has passed. New submissions are closed.
            </p>
          )}
        </form>
      </GlassCard>
    </div>
  );
}
