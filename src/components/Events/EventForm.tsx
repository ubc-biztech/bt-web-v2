import React, { useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { toast } from "@/components/ui/use-toast";
import { EventFormSchema, eventFormSchema } from "./EventFormSchema";
import { FormCheckbox } from "./FormComponents/FormCheckbox";
import { FormInput } from "./FormComponents/FormInput";
import { FormTextarea } from "./FormComponents/FormTextarea";
import { FormDatePicker } from "./FormComponents/FormDatePicker";
import { CustomQuestions } from "./CustomQuestions";
import { EventPreview } from "./EventPreview";
import EventThumbnailUploader from "./EventThumbnailUploader";
import Link from "next/link";
import { useEffect } from "react";
import {
  ImageIcon,
  FileText,
  Calendar,
  DollarSign,
  Users,
  ExternalLink,
  Save,
  Send,
  CheckCircle2,
  ArrowLeft,
  MapPin,
  Link as LinkIcon,
  Settings,
} from "lucide-react";

interface EventFormProps {
  initialData?: Partial<EventFormSchema>;
  onSubmit: (data: EventFormSchema) => void;
  eventId?: string; // Add this prop for constructing URLs
  eventYear?: string; // Add this prop for constructing URLs
}

export const EventForm: React.FC<EventFormProps> = ({
  initialData,
  onSubmit,
  eventId,
  eventYear,
}) => {
  // Add state to track if we're intentionally submitting/updating
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<EventFormSchema>({
    resolver: zodResolver(eventFormSchema),
    defaultValues: {
      customQuestions: [],
      isApplicationBased: false,
      nonBizTechAllowed: false,
      startDate: new Date(),
      endDate: new Date(),
      eventName: "",
      eventSlug: "",
      description: "",
      capacity: 0,
      location: "",
      price: 0,
      imageUrl: "",
      deadline: new Date(),
      partnerDescription: "",
      partnerCustomQuestions: [],
      nonMemberPrice: 0,
      isPublished: false,
      isCompleted: false,
      ...initialData,
    },
    mode: "onChange", // Changed from 'onBlur'
  });

  const imageUrl = useWatch({ control: form.control, name: "imageUrl" });
  const eventName = useWatch({ control: form.control, name: "eventName" });
  const isPublished = useWatch({ control: form.control, name: "isPublished" });
  const isCompleted = useWatch({ control: form.control, name: "isCompleted" });
  const nonBizTechAllowed = useWatch({
    control: form.control,
    name: "nonBizTechAllowed",
  });
  const eventSlug = useWatch({ control: form.control, name: "eventSlug" });

  // Track if form is dirty (has unsaved changes)
  const formIsDirty =
    form.formState.isDirty &&
    form.formState.dirtyFields &&
    Object.keys(form.formState.dirtyFields).length > 0;

  // Add event listener for tab/window closing
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (formIsDirty && !isSubmitting) {
        e.preventDefault();
        e.returnValue = ""; // Required for Chrome
        return ""; // Required for other browsers
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [formIsDirty, isSubmitting]);

  const handleSubmit = async (data: EventFormSchema) => {
    try {
      setIsSubmitting(true);
      await onSubmit(data);
      // Reset form state after successful submission
      form.reset(data);
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to create event",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePublish = async () => {
    setIsSubmitting(true);
    try {
      const currentValue = form.getValues("isPublished");
      form.setValue("isPublished", !currentValue);
      await handleSubmit(form.getValues());
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleComplete = async () => {
    setIsSubmitting(true);
    try {
      const currentValue = form.getValues("isCompleted");
      form.setValue("isCompleted", !currentValue);
      await handleSubmit(form.getValues());
    } finally {
      setIsSubmitting(false);
    }
  };

  const getSlugPreview = () => {
    if (initialData) {
      return {
        main: `https://ubcbiztech.com/event/${eventId}/${eventYear}/register`,
        partner: `https://ubcbiztech.com/event/${eventId}/${eventYear}/register/partner`,
      };
    } else {
      const slug = eventSlug || "[slug]";
      const year = new Date().getFullYear().toString();
      return {
        main: `https://ubcbiztech.com/event/${slug}/${year}/register`,
        partner: `https://ubcbiztech.com/event/${slug}/${year}/register/partner`,
      };
    }
  };

  const SectionCard: React.FC<{
    icon: React.ReactNode;
    title: string;
    children: React.ReactNode;
    className?: string;
  }> = ({ icon, title, children, className = "" }) => (
    <div
      className={`rounded-xl border border-bt-blue-300/30 bg-bt-blue-500/40 p-5 space-y-4 ${className}`}
    >
      <div className="flex items-center gap-2.5">
        <span className="text-bt-green-300">{icon}</span>
        <h4 className="text-sm font-semibold text-white tracking-wide uppercase">
          {title}
        </h4>
      </div>
      {children}
    </div>
  );

  return (
    <div className="text-white px-4 py-6 sm:px-6 lg:px-8 max-w-[1600px] mx-auto w-full">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Link
                href="/admin"
                className="text-bt-blue-100 hover:text-white transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-white">
                  {initialData
                    ? `Edit Event — ${eventName || "Untitled"}`
                    : "Create New Event"}
                </h1>
                <p className="text-sm text-bt-blue-100 mt-0.5">
                  {initialData
                    ? "Update your event details below"
                    : "Fill in the details to create a new event"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <Button type="submit" variant="green" className="gap-1.5">
                <Save className="w-4 h-4" />
                Save
              </Button>
              {initialData && (
                <>
                  <Button
                    type="button"
                    variant="outline"
                    className="gap-1.5"
                    onClick={handlePublish}
                  >
                    <Send className="w-4 h-4" />
                    {isPublished ? "Unpublish" : "Publish"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className="gap-1.5"
                    onClick={handleComplete}
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    {isCompleted ? "Mark Incomplete" : "Mark Complete"}
                  </Button>
                </>
              )}
            </div>
          </div>

          {initialData && !isPublished && formIsDirty && (
            <div className="rounded-lg border border-bt-red-200/40 bg-bt-red-200/10 px-4 py-3 text-sm text-bt-red-200 flex items-center gap-2">
              <span className="shrink-0">⚠️</span>
              There are unsaved changes that have not been published yet.
            </div>
          )}

          {initialData && (
            <div className="rounded-xl border border-bt-blue-300/30 bg-bt-blue-500/40 p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <FormCheckbox
                  name="isPublished"
                  label="Published"
                  disabled={true}
                />
                <FormCheckbox
                  name="isCompleted"
                  label="Completed"
                  disabled={true}
                />
              </div>
              <div className="flex flex-col sm:flex-row gap-2 text-sm">
                <Link
                  href={`/event/${eventId}/${eventYear}/register`}
                  className="inline-flex items-center gap-1.5 text-bt-green-300 hover:underline"
                  target="_blank"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  User Registration Page
                </Link>
                <Link
                  href={`/event/${eventId}/${eventYear}/register/partner`}
                  className="inline-flex items-center gap-1.5 text-bt-green-300 hover:underline"
                  target="_blank"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  Partner Registration Page
                </Link>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 xl:grid-cols-[1fr_1.3fr] gap-8">
            {/* Left Column — Live Preview */}
            <div className="order-2 xl:order-1">
              <div className="sticky top-6">
                <SectionCard
                  icon={<FileText className="w-4 h-4" />}
                  title="Live Preview"
                >
                  <EventPreview form={form} />
                </SectionCard>
              </div>
            </div>

            {/* Right Column — Form Sections */}
            <div className="order-1 xl:order-2 space-y-5">
              {/* Settings */}
              <SectionCard
                icon={<Settings className="w-4 h-4" />}
                title="Event Settings"
              >
                <FormCheckbox
                  name="isApplicationBased"
                  label="This is an application based event (i.e. you will accept / reject applicants)"
                />
                <FormCheckbox
                  name="nonBizTechAllowed"
                  label="Non-BizTech members allowed?"
                />
              </SectionCard>

              {/* Cover Photo */}
              <SectionCard
                icon={<ImageIcon className="w-4 h-4" />}
                title="Cover Photo"
              >
                <EventThumbnailUploader
                  value={imageUrl}
                  onChange={(url) =>
                    form.setValue("imageUrl", url, {
                      shouldDirty: true,
                      shouldValidate: true,
                    })
                  }
                  label="Cover Photo*"
                  maxSizeMB={5}
                />
              </SectionCard>

              {/* Event Information */}
              <SectionCard
                icon={<FileText className="w-4 h-4" />}
                title="Event Information"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <FormInput name="eventName" label="Event Name*" />
                  </div>
                  <FormInput
                    name="eventSlug"
                    label="Event Slug (URL)*"
                    disabled={!!initialData}
                  />
                  <FormInput name="capacity" label="Capacity*" type="number" />
                </div>
                <div className="rounded-lg bg-bt-blue-600/60 border border-bt-blue-300/20 px-3 py-2 text-xs text-bt-blue-100 space-y-0.5">
                  <div className="flex items-center gap-1.5 text-bt-green-300 font-medium mb-1">
                    <LinkIcon className="w-3 h-3" />
                    URL Preview
                  </div>
                  <div className="truncate">{getSlugPreview().main}</div>
                  <div className="truncate">{getSlugPreview().partner}</div>
                </div>
                <FormTextarea name="description" label="Description*" />
              </SectionCard>

              {/* Date & Time */}
              <SectionCard
                icon={<Calendar className="w-4 h-4" />}
                title="Date & Time"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormDatePicker
                    name="startDate"
                    label="Start Date &amp; Time*"
                  />
                  <FormDatePicker name="endDate" label="End Date &amp; Time*" />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormDatePicker
                    name="deadline"
                    label="Registration Deadline*"
                  />
                </div>
              </SectionCard>

              {/* Location & Links */}
              <SectionCard
                icon={<MapPin className="w-4 h-4" />}
                title="Location"
              >
                <FormInput name="location" label="Location*" />
              </SectionCard>

              {/* Pricing */}
              <SectionCard
                icon={<DollarSign className="w-4 h-4" />}
                title="Pricing"
              >
                <div className="space-y-4">
                  <FormInput name="price" label="Member Price" type="number" />
                  {!nonBizTechAllowed && (
                    <p className="text-sm text-bt-blue-100">
                      Enable &quot;Non-BizTech members allowed?&quot; above to
                      set different pricing for non-members
                    </p>
                  )}
                  {nonBizTechAllowed && (
                    <FormInput
                      name="nonMemberPrice"
                      label="Non-Member Price"
                      type="number"
                    />
                  )}
                </div>
              </SectionCard>

              {/* Partner Information */}
              <SectionCard
                icon={<Users className="w-4 h-4" />}
                title="Attendee Registration Questions"
              >
                <CustomQuestions
                  control={form.control}
                  name="customQuestions"
                  label="Attendee Custom Questions"
                />
              </SectionCard>

              {/* Partner Information */}
              <SectionCard
                icon={<Users className="w-4 h-4" />}
                title="Partner Event Information"
              >
                <FormTextarea
                  name="partnerDescription"
                  label="Partner Description*"
                />
                <CustomQuestions
                  control={form.control}
                  name="partnerCustomQuestions"
                  label="Partner Custom Questions"
                />
              </SectionCard>
            </div>
          </div>
        </form>
      </Form>
    </div>
  );
};
