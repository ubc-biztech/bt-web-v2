"use client";

import { useState, type ComponentType, type SVGProps } from "react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import CalendarAsset from "@/assets/2026/product+/submission-calendar.svg";
import CopyAsset from "@/assets/2026/product+/copy.svg";
import EditAsset from "@/assets/2026/product+/edit.svg";
import AddAsset from "@/assets/2026/product+/member-add.svg";
import RemoveAsset from "@/assets/2026/product+/member-remove.svg";
import UploadAsset from "@/assets/2026/product+/upload.svg";
import PlayAsset from "@/assets/2026/product+/submission-play.svg";
import CheckAsset from "@/assets/2026/product+/submission-check.svg";
import PdfEllipseAsset from "@/assets/2026/product+/pdf-ellipse.svg";
import PdfRectangleAsset from "@/assets/2026/product+/pdf-rectangle.svg";
import PdfOutlineAsset from "@/assets/2026/product+/pdf-outline.svg";
import {
  GlassCard,
  PageHeading,
  Pill,
  PreviewNotice,
  ProductButton,
} from "../components/ProductPlusUI";

type SvgComponent = ComponentType<SVGProps<SVGSVGElement>>;
const CalendarIcon = CalendarAsset as unknown as SvgComponent;
const CopyIcon = CopyAsset as unknown as SvgComponent;
const EditIcon = EditAsset as unknown as SvgComponent;
const AddIcon = AddAsset as unknown as SvgComponent;
const RemoveIcon = RemoveAsset as unknown as SvgComponent;
const UploadIcon = UploadAsset as unknown as SvgComponent;
const PlayIcon = PlayAsset as unknown as SvgComponent;
const CheckIcon = CheckAsset as unknown as SvgComponent;
const PdfEllipse = PdfEllipseAsset as unknown as SvgComponent;
const PdfRectangle = PdfRectangleAsset as unknown as SvgComponent;
const PdfOutline = PdfOutlineAsset as unknown as SvgComponent;

const sampleMembers = ["Eliana Barbosa", "Freya Darmadji", "Evan Peng"];

function PdfIcon() {
  return (
    <span className="relative block h-8 w-8 shrink-0" aria-hidden="true">
      <span className="absolute inset-[40.12%_0_0_40.12%] block">
        <PdfEllipse />
      </span>
      <span className="absolute inset-[0_1.16%_1.16%_0] block">
        <PdfRectangle />
      </span>
      <span className="absolute inset-[0_1.16%_1.16%_0] block">
        <PdfOutline />
      </span>
      <span className="absolute inset-[20.95%_62.95%_73.65%_11.87%] rounded-[15px] bg-white" />
      <span className="absolute inset-[11.15%_72.66%_63.67%_21.94%] rounded-[15px] bg-white" />
    </span>
  );
}

export default function SubmissionPage() {
  const [submittedPreview, setSubmittedPreview] = useState(false);

  return (
    <div className="flex w-full min-w-0 flex-col gap-5 md:gap-6">
      <PageHeading
        title="Submission"
        className="mb-0 items-start md:items-center"
      >
        <div className="flex flex-row items-center gap-3 max-md:self-start">
          <span
            className="inline-flex h-[47px] w-[39px] shrink-0 items-center justify-center"
            aria-hidden="true"
          >
            <CalendarIcon />
          </span>
          <div>
            <p className="m-0 block text-[13px] leading-[18px] text-product-muted">
              Submission deadline
            </p>
            <strong className="mt-0.5 block text-[14px] font-semibold leading-5 text-product-ink">
              October 22, 2026, 11:59 PM PT
            </strong>
          </div>
        </div>
      </PageHeading>

      {!submittedPreview ? (
        <GlassCard className="flex flex-wrap items-center justify-between gap-4 p-5 min-[641px]:p-5 md:px-7 md:py-6">
          <h2 className="m-0 font-product-heading text-[24px] font-normal leading-8 tracking-[-0.5px] text-product-ink">
            Team Product-ive
          </h2>
          <span
            className="inline-flex shrink-0 items-center gap-2 rounded-full border border-[#614fb8]/30 bg-[#614fb8]/10 px-3.5 py-2 text-[16px] font-semibold tracking-[0.96px] text-[#614fb8]"
            aria-label="Sample team code 004218"
          >
            004218 <CopyIcon aria-hidden="true" />
          </span>
        </GlassCard>
      ) : (
        <GlassCard className="flex min-h-[112px] flex-wrap items-center justify-between gap-4 p-5 min-[641px]:p-5 md:p-6">
          <div>
            <h2 className="m-0 font-product-heading text-[24px] font-normal leading-8 tracking-[-0.5px] text-product-ink">
              Product-ive
            </h2>
            <p className="mb-0 mt-3 text-[14px] leading-5 text-product-muted">
              {sampleMembers.join(", ")}
            </p>
          </div>
          <Pill className="px-3 py-0.5 text-[12px] leading-[18px]">
            Team code 004218
          </Pill>
        </GlassCard>
      )}

      <GlassCard className="flex flex-col gap-6 p-5 min-[641px]:p-5 md:p-7">
        {submittedPreview ? (
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-3">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-[#e8f5ed] py-1.5 pl-2.5 pr-3 text-[13px] leading-[18px] text-[#215c47]">
                <CheckIcon aria-hidden="true" /> Submitted
              </span>
              <p className="m-0 text-[13px] leading-[18px] text-product-muted">
                Last updated Oct 20, 3:12 PM
              </p>
            </div>
            <ProductButton
              className="min-h-9 py-2 pl-3.5 pr-4"
              variant="secondary"
              disabled
              aria-describedby="submission-availability"
            >
              <EditIcon aria-hidden="true" /> Edit details
            </ProductButton>
          </div>
        ) : null}
        <div
          className="grid min-h-0 grid-cols-1 items-start gap-7 md:min-h-[492px] md:grid-cols-[minmax(0,1fr)_minmax(0,1.25fr)] md:gap-6 min-[1200px]:grid-cols-[minmax(0,384px)_minmax(0,1fr)] min-[1200px]:gap-8"
          key={submittedPreview ? "submitted" : "empty"}
        >
          <div className="flex min-w-0 flex-col gap-6">
            <label className="flex min-w-0 flex-col gap-2">
              <span className="text-[14px] font-semibold leading-5 text-product-ink">
                Team name
              </span>
              <Input
                className="h-14 min-w-0 rounded-2xl border-[#614fb8]/[0.08] bg-white/[0.85] px-4 py-3 text-[14px] leading-5 text-product-ink shadow-[0_1px_2px_rgba(97,79,184,0.04),inset_0_1px_2px_rgba(255,255,255,0.65)] backdrop-blur-[14px] placeholder:text-product-muted focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#8e78ce] focus-visible:outline-offset-2 focus-visible:ring-transparent"
                defaultValue="Product-ive"
                autoComplete="off"
              />
            </label>
            <label className="flex min-w-0 flex-col gap-2">
              <span className="text-[14px] font-semibold leading-5 text-product-ink">
                Project title
              </span>
              <Input
                className={cn(
                  "h-14 min-w-0 rounded-2xl border-[#614fb8]/[0.08] bg-white/50 px-4 py-3 text-[14px] leading-5 text-product-ink shadow-[0_1px_2px_rgba(97,79,184,0.04),inset_0_1px_2px_rgba(255,255,255,0.65)] backdrop-blur-[14px] placeholder:text-product-muted focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#8e78ce] focus-visible:outline-offset-2 focus-visible:ring-transparent",
                  submittedPreview && "bg-white/[0.85]",
                )}
                defaultValue={submittedPreview ? "Launchpad" : ""}
                placeholder="e.g. Launchpad"
                autoComplete="off"
              />
            </label>
            <fieldset className="m-0 flex min-w-0 flex-col gap-3 border-0 p-0">
              <legend className="mb-3 p-0 text-[14px] font-semibold leading-5 text-product-ink">
                Team members
              </legend>
              {sampleMembers.map((member, index) => (
                <div className="flex min-w-0 items-center gap-3" key={member}>
                  <Input
                    className="h-14 min-w-0 rounded-2xl border-[#614fb8]/[0.08] bg-white/[0.85] px-4 py-3 text-[14px] leading-5 text-product-ink shadow-[0_1px_2px_rgba(97,79,184,0.04),inset_0_1px_2px_rgba(255,255,255,0.65)] backdrop-blur-[14px] placeholder:text-product-muted focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#8e78ce] focus-visible:outline-offset-2 focus-visible:ring-transparent"
                    aria-label={`Team member ${index + 1}`}
                    defaultValue={member}
                    autoComplete="off"
                  />
                  <ProductButton
                    className="h-10 min-h-10 w-10 shrink-0 border-[#614fb8]/[0.28] bg-white/60 p-0 shadow-[0_2px_6px_rgba(52,49,92,0.07),inset_0_1px_1px_rgba(255,255,255,0.62)]"
                    variant="secondary"
                    disabled
                    aria-label={`Remove ${member}`}
                    aria-describedby="submission-availability"
                  >
                    <RemoveIcon aria-hidden="true" />
                  </ProductButton>
                </div>
              ))}
              <ProductButton
                className="min-h-8 self-start gap-1.5 border-0 bg-transparent py-1.5 pl-0.5 pr-1 text-[#614fb8] shadow-none"
                variant="secondary"
                disabled
                aria-describedby="submission-availability"
              >
                <AddIcon aria-hidden="true" /> Add member
              </ProductButton>
            </fieldset>
          </div>
          <div className="flex min-w-0 flex-col gap-3">
            <label className="flex min-h-[84px] min-w-0 flex-col gap-2 md:min-h-[110px]">
              <span className="text-[14px] font-semibold leading-5 text-product-ink">
                YouTube link
              </span>
              <Input
                className={cn(
                  "h-14 min-w-0 rounded-2xl border-[#614fb8]/[0.08] bg-white/50 px-4 py-3 text-[14px] leading-5 text-product-ink shadow-[0_1px_2px_rgba(97,79,184,0.04),inset_0_1px_2px_rgba(255,255,255,0.65)] backdrop-blur-[14px] placeholder:text-product-muted focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#8e78ce] focus-visible:outline-offset-2 focus-visible:ring-transparent",
                  submittedPreview && "bg-white/[0.85]",
                )}
                type="url"
                defaultValue={
                  submittedPreview ? "https://youtu.be/OrbitC04218" : ""
                }
                placeholder="YouTube link"
                autoComplete="off"
                aria-describedby="video-helper"
              />
            </label>
            <p
              className="m-0 text-[13px] leading-[18px] text-product-muted"
              id="video-helper"
            >
              Check that your video is unlisted and plays correctly.
            </p>
            {submittedPreview ? (
              <div
                className="flex h-[124px] items-center justify-center overflow-hidden rounded-2xl bg-[linear-gradient(180deg,#22315f,#7463a6)]"
                aria-label="Sample video preview"
              >
                <ProductButton
                  className="h-10 min-h-10 w-14 rounded-xl border-0 bg-white/[0.85] p-0 shadow-none"
                  variant="secondary"
                  disabled
                  aria-label="Play sample video"
                  aria-describedby="submission-availability"
                >
                  <PlayIcon aria-hidden="true" />
                </ProductButton>
              </div>
            ) : null}
            <div className="flex min-w-0 flex-col gap-2 pt-1">
              <p className="m-0 text-[14px] font-semibold leading-5 text-product-ink">
                PRD
              </p>
              {submittedPreview ? (
                <>
                  <div className="flex min-h-16 items-center gap-3 rounded-2xl border border-white/70 bg-white/60 px-4 py-3">
                    <PdfIcon />
                    <span className="min-w-0 flex-1 text-[14px] leading-5 text-product-primary [overflow-wrap:anywhere]">
                      004218_Orbit-Collective_Orbit-Launchpad.pdf
                    </span>
                    <ProductButton
                      className="min-h-5 shrink-0 border-0 bg-transparent p-0 shadow-none"
                      variant="secondary"
                      disabled
                      aria-describedby="submission-availability"
                    >
                      Open
                    </ProductButton>
                  </div>
                  <button
                    className="flex h-[68px] w-full cursor-not-allowed flex-col items-center justify-center gap-1 rounded-2xl border-[1.5px] border-dashed border-[#614fb8]/[0.55] bg-product-lavender/[0.65] p-3 text-center text-[14px] leading-5 text-product-ink"
                    disabled
                    aria-describedby="submission-availability"
                  >
                    <span>Replace PDF</span>
                    <small className="text-[13px] leading-[18px] text-product-muted">
                      PDF only
                    </small>
                  </button>
                </>
              ) : (
                <button
                  className="flex h-[148px] w-full cursor-not-allowed flex-col items-center justify-center gap-1 rounded-2xl border-[1.5px] border-dashed border-[#614fb8]/[0.55] bg-product-lavender/[0.65] p-3 text-center text-[14px] leading-5 text-product-ink"
                  disabled
                  aria-describedby="submission-availability"
                >
                  <UploadIcon aria-hidden="true" />
                  <span>Drop your PDF here or choose a file</span>
                  <small className="text-[13px] leading-[18px] text-product-muted">
                    PDF only
                  </small>
                </button>
              )}
              <p className="m-0 text-[13px] leading-[18px] text-product-muted">
                Include your team code, team name and project title on the first
                page.
              </p>
              <p className="m-0 text-[13px] italic leading-[18px] text-[#aa95dd] [overflow-wrap:anywhere]">
                e.g. 004218_Product-ive_Launchpad.pdf
              </p>
            </div>
          </div>
        </div>
        <div className="flex justify-end">
          <ProductButton
            className="w-full md:w-[200px]"
            disabled
            aria-describedby="submission-availability"
          >
            {submittedPreview ? "Save changes" : "Submit"}
          </ProductButton>
        </div>
      </GlassCard>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div id="submission-availability">
          <PreviewNotice>
            Design preview with sample team details. Uploads and submissions are
            coming soon.
          </PreviewNotice>
        </div>
        <ProductButton
          className="min-h-9 shrink-0 px-3.5 py-2 text-[12px]"
          variant="secondary"
          onClick={() => setSubmittedPreview((value) => !value)}
          aria-pressed={submittedPreview}
        >
          {submittedPreview ? "Preview empty form" : "Preview submitted form"}
        </ProductButton>
      </div>
      {submittedPreview ? (
        <p className="m-0 text-right text-[12px] text-product-muted">
          Team code 004218 · Sample preview
        </p>
      ) : null}
    </div>
  );
}
