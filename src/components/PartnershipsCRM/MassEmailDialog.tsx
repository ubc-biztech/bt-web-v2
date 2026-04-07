import { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  CheckSquare,
  Loader2,
  Mail,
  Send,
  UserRound,
  XCircle,
} from "lucide-react";
import { fetchBackend } from "@/lib/db";
import { cn } from "@/lib/utils";
import { useToast } from "@/components/ui/use-toast";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { MergeFieldPicker } from "./MergeFieldPicker";

type MergeField = {
  key: string;
  label: string;
  description: string;
  token: string;
};

type EmailConfigResponse = {
  sender: string;
  senderFirstName?: string;
  senderLastName?: string;
  senderFullName?: string;
  mergeFields: MergeField[];
  maxRecipients: number;
};

export type MassEmailTemplateOption = {
  id: string;
  name: string;
  description: string;
  subjectTemplate: string;
  bodyTemplate: string;
  archived: boolean;
  updatedAt: number | null;
  lastUsedAt: string | null;
};

type TemplatesResponse = {
  templates: MassEmailTemplateOption[];
};

type SendSummary = {
  totalRequested: number;
  totalEligible: number;
  sentCount: number;
  loggedCount: number;
  skippedCount: number;
  failedCount: number;
  warningCount: number;
};

type SendResult = {
  partnerId: string;
  company?: string;
  contactName?: string;
  email?: string;
  status: string;
  message: string;
};

type SendResponse = {
  message: string;
  campaignId?: string;
  summary: SendSummary;
  results: SendResult[];
};

export type MassEmailRecipient = {
  id: string;
  company: string;
  contactName: string;
  email: string;
  latestStatus?: string | null;
};

export type MassEmailEventOption = {
  id: string;
  name: string;
  year: number;
};

type MassEmailDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  recipients: MassEmailRecipient[];
  events: MassEmailEventOption[];
  onSent?: () => Promise<void> | void;
  onManageTemplates?: () => void;
};

const MERGE_TOKEN_REGEX = /{{\s*([a-z0-9_]+)\s*}}/gi;
const numberFormatter = new Intl.NumberFormat("en-US");

const toSafeText = (value: unknown) => {
  if (typeof value !== "string") return "";
  return value.trim();
};

const splitFullName = (value: string) => {
  const normalized = toSafeText(value).replace(/\s+/g, " ").trim();
  if (!normalized) {
    return {
      firstName: "",
      lastName: "",
      fullName: "",
    };
  }

  const parts = normalized.split(" ").filter(Boolean);
  if (parts.length <= 1) {
    return {
      firstName: normalized,
      lastName: "",
      fullName: normalized,
    };
  }

  return {
    firstName: parts[0],
    lastName: parts.slice(1).join(" "),
    fullName: normalized,
  };
};

const deriveDisplayNameFromEmail = (email: string) => {
  const localPart = toSafeText(email).split("@")[0] || "";
  return toSafeText(localPart.replace(/[._-]+/g, " "));
};

const toErrorMessage = (error: unknown, fallback: string) => {
  if (!error) return fallback;
  if (typeof error === "string") return error;
  if (error instanceof Error && error.message) return error.message;

  const candidate = error as {
    message?: unknown;
    error?: { message?: unknown };
    details?: { message?: unknown };
  };

  const possible = [
    candidate?.message,
    candidate?.error?.message,
    candidate?.details?.message,
  ];

  for (const value of possible) {
    if (typeof value === "string" && value.trim()) return value;
  }

  if (candidate?.message && typeof candidate.message === "object") {
    const nested = (candidate.message as { message?: unknown }).message;
    if (typeof nested === "string" && nested.trim()) return nested;
  }

  return fallback;
};

const getContactDisplayName = (contactName?: string | null) => {
  const normalized = toSafeText(contactName);
  return normalized || "Unnamed Contact";
};

const renderTemplate = (
  template: string,
  values: Record<string, string>,
): string => {
  if (!template) return "";
  MERGE_TOKEN_REGEX.lastIndex = 0;
  return template.replace(MERGE_TOKEN_REGEX, (_, tokenRaw) => {
    const token = String(tokenRaw || "").toLowerCase();
    return values[token] || "";
  });
};

const toReadableTime = (value?: string | null) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleString();
};

export function MassEmailDialog({
  open,
  onOpenChange,
  recipients,
  events,
  onSent,
  onManageTemplates,
}: MassEmailDialogProps) {
  const { toast } = useToast();

  const [snapshotRecipients, setSnapshotRecipients] = useState<
    MassEmailRecipient[]
  >([]);
  const [recipientSearch, setRecipientSearch] = useState("");
  const [selectedRecipientIds, setSelectedRecipientIds] = useState<string[]>(
    [],
  );

  const [config, setConfig] = useState<EmailConfigResponse | null>(null);
  const [templates, setTemplates] = useState<MassEmailTemplateOption[]>([]);
  const [isLoadingSetup, setIsLoadingSetup] = useState(false);
  const [setupError, setSetupError] = useState<string | null>(null);

  const [eventId, setEventId] = useState("none");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [selectedTemplateId, setSelectedTemplateId] = useState("none");
  const [activeComposerField, setActiveComposerField] = useState<
    "subject" | "body"
  >("body");

  const [isSending, setIsSending] = useState(false);
  const [sendResponse, setSendResponse] = useState<SendResponse | null>(null);

  const selectedEvent = useMemo(
    () => events.find((event) => event.id === eventId) || null,
    [eventId, events],
  );

  const selectedTemplate = useMemo(
    () =>
      templates.find((template) => template.id === selectedTemplateId) || null,
    [selectedTemplateId, templates],
  );

  const recipientRows = useMemo(() => {
    const searchText = recipientSearch.trim().toLowerCase();
    if (!searchText) return snapshotRecipients;

    return snapshotRecipients.filter((recipient) => {
      const index = [
        recipient.contactName,
        recipient.company,
        recipient.email,
        recipient.latestStatus || "",
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return index.includes(searchText);
    });
  }, [recipientSearch, snapshotRecipients]);

  const recipientMap = useMemo(() => {
    const map = new Map<string, MassEmailRecipient>();
    for (const recipient of snapshotRecipients) {
      map.set(recipient.id, recipient);
    }
    return map;
  }, [snapshotRecipients]);

  const selectedRecipientRows = useMemo(
    () =>
      selectedRecipientIds
        .map((recipientId) => recipientMap.get(recipientId) || null)
        .filter((value): value is MassEmailRecipient => Boolean(value)),
    [recipientMap, selectedRecipientIds],
  );

  const selectedRecipientCount = selectedRecipientRows.length;
  const recipientsWithEmailCount = useMemo(
    () =>
      snapshotRecipients.filter((recipient) => toSafeText(recipient.email))
        .length,
    [snapshotRecipients],
  );

  const availableMergeFields = config?.mergeFields || [];
  const sender = config?.sender || "";
  const maxRecipients = config?.maxRecipients || 200;

  const previewRecipient = selectedRecipientRows[0] || null;

  const previewRecipientName = useMemo(() => {
    const fullName =
      toSafeText(previewRecipient?.contactName) ||
      toSafeText(previewRecipient?.company) ||
      "there";
    return splitFullName(fullName);
  }, [previewRecipient]);

  const previewSenderName = useMemo(() => {
    const fullFromConfig =
      toSafeText(config?.senderFullName) ||
      `${toSafeText(config?.senderFirstName)} ${toSafeText(config?.senderLastName)}`.trim() ||
      deriveDisplayNameFromEmail(config?.sender || "");
    return splitFullName(fullFromConfig);
  }, [
    config?.sender,
    config?.senderFirstName,
    config?.senderFullName,
    config?.senderLastName,
  ]);

  const previewMergeValues = useMemo(() => {
    return {
      company_name:
        toSafeText(previewRecipient?.company) || "your organization",
      contact_name: previewRecipientName.fullName || "there",
      recipient_first_name:
        previewRecipientName.firstName ||
        previewRecipientName.fullName ||
        "there",
      recipient_last_name: previewRecipientName.lastName || "",
      recipient_full_name: previewRecipientName.fullName || "there",
      recipient_email: toSafeText(previewRecipient?.email),
      sender_first_name: previewSenderName.firstName || "",
      sender_last_name: previewSenderName.lastName || "",
      sender_full_name: previewSenderName.fullName || "",
      sender_email: sender,
      event_name: selectedEvent?.name || "",
      event_year: selectedEvent ? String(selectedEvent.year) : "",
    };
  }, [
    previewRecipient?.company,
    previewRecipient?.email,
    previewRecipientName,
    previewSenderName,
    selectedEvent,
    sender,
  ]);

  const renderedPreviewSubject = useMemo(
    () => renderTemplate(subject, previewMergeValues),
    [previewMergeValues, subject],
  );
  const renderedPreviewBody = useMemo(
    () => renderTemplate(body, previewMergeValues),
    [body, previewMergeValues],
  );

  const canSend =
    !isLoadingSetup &&
    !isSending &&
    Boolean(subject.trim()) &&
    Boolean(body.trim()) &&
    selectedRecipientCount > 0 &&
    selectedRecipientCount <= maxRecipients;

  const loadSetup = async () => {
    setIsLoadingSetup(true);
    setSetupError(null);

    try {
      const [configResponse, templateResponse] = await Promise.all([
        fetchBackend({
          endpoint: "/partnerships/email/config",
          method: "GET",
        }) as Promise<EmailConfigResponse>,
        fetchBackend({
          endpoint: "/partnerships/email/templates",
          method: "GET",
        }) as Promise<TemplatesResponse>,
      ]);

      setConfig(configResponse);
      setTemplates(
        Array.isArray(templateResponse?.templates)
          ? templateResponse.templates
          : [],
      );
    } catch (error: unknown) {
      setSetupError(
        toErrorMessage(
          error,
          "Unable to load email settings for Partnerships CRM.",
        ),
      );
    } finally {
      setIsLoadingSetup(false);
    }
  };

  useEffect(() => {
    if (!open) return;

    const snapshot = recipients.map((recipient) => ({
      id: recipient.id,
      company: recipient.company || "",
      contactName: recipient.contactName || "",
      email: recipient.email || "",
      latestStatus: recipient.latestStatus || null,
    }));

    setSnapshotRecipients(snapshot);
    setSelectedRecipientIds(
      snapshot
        .filter((recipient) => toSafeText(recipient.email))
        .map((recipient) => recipient.id),
    );
    setRecipientSearch("");
    setSendResponse(null);
    setSubject("");
    setBody("");
    setSelectedTemplateId("none");
    setEventId("none");
    setActiveComposerField("body");

    void loadSetup();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const toggleRecipientSelection = (recipientId: string, checked: boolean) => {
    setSelectedRecipientIds((previous) => {
      if (checked) {
        if (previous.includes(recipientId)) return previous;
        return [...previous, recipientId];
      }
      return previous.filter((id) => id !== recipientId);
    });
  };

  const selectAllVisible = () => {
    const visibleIds = recipientRows
      .filter((recipient) => toSafeText(recipient.email))
      .map((recipient) => recipient.id);

    setSelectedRecipientIds((previous) =>
      Array.from(new Set([...previous, ...visibleIds])),
    );
  };

  const resetToEmailReady = () => {
    setSelectedRecipientIds(
      snapshotRecipients
        .filter((recipient) => toSafeText(recipient.email))
        .map((recipient) => recipient.id),
    );
  };

  const clearAllSelections = () => {
    setSelectedRecipientIds([]);
  };

  const handleTemplateSelection = (templateId: string) => {
    setSelectedTemplateId(templateId);

    if (templateId === "none") {
      setSubject("");
      setBody("");
      return;
    }

    const template = templates.find((item) => item.id === templateId);
    if (!template) return;

    setSubject(template.subjectTemplate || "");
    setBody(template.bodyTemplate || "");
  };

  const insertMergeToken = (token: string) => {
    if (activeComposerField === "subject") {
      setSubject((previous) => `${previous}${token}`);
      return;
    }
    setBody((previous) => `${previous}${token}`);
  };

  const sendBulkEmail = async () => {
    if (!sender) {
      toast({
        variant: "destructive",
        title: "Missing sender",
        description:
          "Could not read your signed-in email. Please re-login and try again.",
      });
      return;
    }

    if (!subject.trim() || !body.trim()) {
      toast({
        variant: "destructive",
        title: "Email content required",
        description: "Subject and body are required.",
      });
      return;
    }

    if (!selectedRecipientCount) {
      toast({
        variant: "destructive",
        title: "No recipients selected",
        description: "Select at least one recipient.",
      });
      return;
    }

    if (selectedRecipientCount > maxRecipients) {
      toast({
        variant: "destructive",
        title: "Too many recipients",
        description: `This send supports up to ${maxRecipients} recipients per run.`,
      });
      return;
    }

    setIsSending(true);
    try {
      const response = (await fetchBackend({
        endpoint: "/partnerships/email/send",
        method: "POST",
        data: {
          eventId: eventId !== "none" ? eventId : null,
          partnerIds: selectedRecipientIds,
          subject,
          body,
          templateId: selectedTemplateId !== "none" ? selectedTemplateId : null,
          campaignName: selectedTemplate?.name || null,
        },
      })) as SendResponse;

      setSendResponse(response);

      toast({
        title: response?.summary?.failedCount
          ? "Bulk email sent with issues"
          : "Bulk email sent",
        description:
          response?.message ||
          `Sent to ${response?.summary?.sentCount || 0} recipient(s).`,
      });

      if (onSent) {
        await onSent();
      }

      await loadSetup();
    } catch (error: unknown) {
      toast({
        variant: "destructive",
        title: "Unable to send bulk email",
        description: toErrorMessage(
          error,
          "The email send failed. Please check the form and try again.",
        ),
      });
    } finally {
      setIsSending(false);
    }
  };

  const failuresPreview = useMemo(() => {
    if (!sendResponse?.results?.length) return [];
    return sendResponse.results
      .filter((result) =>
        ["failed_send", "failed_render", "warning_log_failed"].includes(
          result.status,
        ),
      )
      .slice(0, 6);
  }, [sendResponse]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[calc(100vw-1rem)] max-w-6xl overflow-hidden border-bt-blue-300 bg-bt-blue-500 p-0 text-white">
        <div className="flex max-h-[92vh] flex-col">
          <div className="border-b border-bt-blue-300/35 px-4 py-3">
            <h3 className="text-lg font-semibold text-white">New Mail Merge</h3>
            <p className="text-sm text-bt-blue-100">
              Draft your email, pick recipients, and send.
            </p>
          </div>

          <div className="flex-1 space-y-4 overflow-y-auto p-4">
            {setupError ? (
              <Alert className="border-bt-red-200/40 bg-bt-red-200/10 text-bt-red-100">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Unable to load mass email settings</AlertTitle>
                <AlertDescription>{setupError}</AlertDescription>
              </Alert>
            ) : null}

            <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
              <div className="rounded-lg border border-bt-blue-300/30 bg-bt-blue-600/35 p-3">
                <p className="text-[11px] uppercase tracking-wide text-bt-blue-100">
                  Snapshot Recipients
                </p>
                <p className="mt-1 text-base font-semibold text-white">
                  {numberFormatter.format(snapshotRecipients.length)}
                </p>
              </div>
              <div className="rounded-lg border border-bt-blue-300/30 bg-bt-blue-600/35 p-3">
                <p className="text-[11px] uppercase tracking-wide text-bt-blue-100">
                  Email Ready
                </p>
                <p className="mt-1 text-base font-semibold text-white">
                  {numberFormatter.format(recipientsWithEmailCount)}
                </p>
              </div>
              <div className="rounded-lg border border-bt-blue-300/30 bg-bt-blue-600/35 p-3">
                <p className="text-[11px] uppercase tracking-wide text-bt-blue-100">
                  Selected
                </p>
                <p className="mt-1 text-base font-semibold text-white">
                  {numberFormatter.format(selectedRecipientCount)}
                </p>
              </div>
              <div className="rounded-lg border border-bt-blue-300/30 bg-bt-blue-600/35 p-3">
                <p className="text-[11px] uppercase tracking-wide text-bt-blue-100">
                  Sending As
                </p>
                <p className="mt-1 truncate text-sm font-semibold text-white">
                  {sender || "-"}
                </p>
              </div>
            </div>

            {isLoadingSetup ? (
              <div className="space-y-2">
                <Skeleton className="h-12 w-full bg-bt-blue-300/20" />
                <Skeleton className="h-40 w-full bg-bt-blue-300/20" />
                <Skeleton className="h-40 w-full bg-bt-blue-300/20" />
              </div>
            ) : (
              <div className="grid gap-4 lg:grid-cols-[minmax(280px,0.95fr)_minmax(0,1.4fr)]">
                <Card className="border-bt-blue-300/30 bg-bt-blue-600/20">
                  <CardContent className="space-y-3 p-3">
                    <div className="flex items-center justify-between gap-2">
                      <h4 className="text-sm font-semibold text-white">
                        Recipients
                      </h4>
                      <span className="text-xs text-bt-blue-100">
                        From current filters
                      </span>
                    </div>

                    <Input
                      value={recipientSearch}
                      onChange={(event) =>
                        setRecipientSearch(event.target.value)
                      }
                      placeholder="Search recipients"
                      className="border-bt-blue-300/40 bg-bt-blue-600/40 text-white placeholder:text-bt-blue-100"
                    />

                    <div className="flex flex-wrap gap-1.5">
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-7 border-bt-blue-300/40 bg-bt-blue-500/40 px-2 text-xs text-white hover:bg-bt-blue-500/60"
                        onClick={selectAllVisible}
                      >
                        <CheckSquare className="mr-1 h-3.5 w-3.5" />
                        Select Visible
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-7 border-bt-blue-300/40 bg-bt-blue-500/40 px-2 text-xs text-white hover:bg-bt-blue-500/60"
                        onClick={resetToEmailReady}
                      >
                        <Mail className="mr-1 h-3.5 w-3.5" />
                        Email-Ready
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-7 border-bt-blue-300/40 bg-bt-blue-500/40 px-2 text-xs text-white hover:bg-bt-blue-500/60"
                        onClick={clearAllSelections}
                      >
                        <XCircle className="mr-1 h-3.5 w-3.5" />
                        Clear
                      </Button>
                    </div>

                    <div className="max-h-[44vh] space-y-2 overflow-y-auto pr-1">
                      {!recipientRows.length ? (
                        <p className="rounded-md border border-bt-blue-300/30 bg-bt-blue-600/35 p-3 text-sm text-bt-blue-100">
                          No recipients found for this search.
                        </p>
                      ) : (
                        recipientRows.map((recipient) => {
                          const hasEmail = Boolean(toSafeText(recipient.email));
                          const selected = selectedRecipientIds.includes(
                            recipient.id,
                          );
                          const contactName = getContactDisplayName(
                            recipient.contactName,
                          );

                          return (
                            <label
                              key={recipient.id}
                              className={cn(
                                "flex cursor-pointer items-start gap-2 rounded-md border p-2 transition",
                                selected
                                  ? "border-bt-green-300/45 bg-bt-green-300/10"
                                  : "border-bt-blue-300/25 bg-bt-blue-600/35 hover:bg-bt-blue-500/45",
                              )}
                            >
                              <Checkbox
                                checked={selected}
                                disabled={!hasEmail}
                                onCheckedChange={(checked) =>
                                  toggleRecipientSelection(
                                    recipient.id,
                                    Boolean(checked),
                                  )
                                }
                                className="mt-0.5 border-bt-blue-100"
                              />
                              <div className="min-w-0">
                                <p className="truncate text-sm font-medium text-white">
                                  {contactName}
                                </p>
                                <p className="truncate text-xs text-bt-blue-100">
                                  {recipient.company || "Unknown company"}
                                </p>
                                <p
                                  className={cn(
                                    "truncate text-xs",
                                    hasEmail
                                      ? "text-bt-blue-100"
                                      : "text-bt-red-100",
                                  )}
                                >
                                  {hasEmail ? recipient.email : "Missing email"}
                                </p>
                              </div>
                            </label>
                          );
                        })
                      )}
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-bt-blue-300/30 bg-bt-blue-600/20">
                  <CardContent className="space-y-4 p-3">
                    <div className="flex items-center justify-between gap-2">
                      <h4 className="text-sm font-semibold text-white">
                        Composer
                      </h4>
                      {onManageTemplates ? (
                        <Button
                          type="button"
                          size="sm"
                          variant="ghost"
                          className="h-7 px-2 text-xs text-bt-blue-100 hover:bg-bt-blue-500/40 hover:text-white"
                          onClick={onManageTemplates}
                        >
                          Manage Templates
                        </Button>
                      ) : null}
                    </div>

                    <div className="grid gap-3 lg:grid-cols-2">
                      <div className="space-y-1">
                        <label className="text-xs text-bt-blue-100">
                          Sender (Signed-In)
                        </label>
                        <Input
                          value={sender}
                          readOnly
                          className="border-bt-blue-300/40 bg-bt-blue-600/40 text-white"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs text-bt-blue-100">
                          Related Event
                        </label>
                        <Select value={eventId} onValueChange={setEventId}>
                          <SelectTrigger className="border-bt-blue-300/40 bg-bt-blue-600/40 text-white">
                            <SelectValue placeholder="Optional event context" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">
                              No event context
                            </SelectItem>
                            {events.map((event) => (
                              <SelectItem key={event.id} value={event.id}>
                                {event.name} ({event.year})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-1 lg:col-span-2">
                        <label className="text-xs text-bt-blue-100">
                          Template
                        </label>
                        <Select
                          value={selectedTemplateId}
                          onValueChange={handleTemplateSelection}
                        >
                          <SelectTrigger className="border-bt-blue-300/40 bg-bt-blue-600/40 text-white">
                            <SelectValue placeholder="Choose template" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">No template</SelectItem>
                            {templates.map((template) => (
                              <SelectItem key={template.id} value={template.id}>
                                {template.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {selectedTemplate ? (
                          <p className="text-[11px] text-bt-blue-100">
                            {selectedTemplate.description || "No description"} •
                            Last used{" "}
                            {toReadableTime(selectedTemplate.lastUsedAt)}
                          </p>
                        ) : null}
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs text-bt-blue-100">
                        Subject
                      </label>
                      <Input
                        value={subject}
                        onFocus={() => setActiveComposerField("subject")}
                        onChange={(event) => setSubject(event.target.value)}
                        className="border-bt-blue-300/40 bg-bt-blue-600/40 text-white placeholder:text-bt-blue-100"
                        placeholder="Your subject line"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs text-bt-blue-100">Body</label>
                      <Textarea
                        value={body}
                        onFocus={() => setActiveComposerField("body")}
                        onChange={(event) => setBody(event.target.value)}
                        className="min-h-[160px] border-bt-blue-300/40 bg-bt-blue-600/40 text-white placeholder:text-bt-blue-100"
                        placeholder="Write your email here..."
                      />
                    </div>

                    <MergeFieldPicker
                      fields={availableMergeFields}
                      activeTargetLabel={
                        activeComposerField === "subject" ? "subject" : "body"
                      }
                      onInsertToken={insertMergeToken}
                      className="bg-bt-blue-600/35"
                    />

                    <div className="rounded-md border border-bt-blue-300/30 bg-bt-blue-600/35 p-3">
                      <p className="text-[11px] uppercase tracking-wide text-bt-blue-100">
                        Live Preview
                      </p>
                      {previewRecipient ? (
                        <div className="mt-2 space-y-2">
                          <div className="flex items-center gap-2 text-xs text-bt-blue-100">
                            <UserRound className="h-3.5 w-3.5" />
                            {getContactDisplayName(
                              previewRecipient.contactName,
                            )}{" "}
                            • {previewRecipient.company}
                          </div>
                          <div className="rounded-md border border-bt-blue-300/30 bg-bt-blue-700/45 p-2">
                            <p className="text-xs font-semibold text-white">
                              {renderedPreviewSubject || "(empty subject)"}
                            </p>
                            <p className="mt-1 whitespace-pre-wrap text-xs text-bt-blue-100">
                              {renderedPreviewBody || "(empty body)"}
                            </p>
                          </div>
                        </div>
                      ) : (
                        <p className="mt-2 text-xs text-bt-blue-100">
                          Select at least one recipient to preview merge fields.
                        </p>
                      )}
                    </div>

                    {sendResponse ? (
                      <Alert
                        className={cn(
                          "border",
                          sendResponse.summary.failedCount > 0
                            ? "border-bt-red-200/40 bg-bt-red-200/10 text-bt-red-100"
                            : "border-[#75D450]/45 bg-[#75D450]/12 text-[#D6F5C9]",
                        )}
                      >
                        <Mail className="h-4 w-4" />
                        <AlertTitle>{sendResponse.message}</AlertTitle>
                        <AlertDescription>
                          <p>
                            Sent {sendResponse.summary.sentCount} • Logged{" "}
                            {sendResponse.summary.loggedCount} • Skipped{" "}
                            {sendResponse.summary.skippedCount} • Failed{" "}
                            {sendResponse.summary.failedCount}
                            {sendResponse.summary.warningCount > 0
                              ? ` • Warnings ${sendResponse.summary.warningCount}`
                              : ""}
                          </p>
                          {failuresPreview.length ? (
                            <ul className="mt-2 list-disc space-y-1 pl-4 text-xs">
                              {failuresPreview.map((failure) => (
                                <li
                                  key={`${failure.partnerId}-${failure.status}`}
                                >
                                  {getContactDisplayName(failure.contactName)}{" "}
                                  {failure.email ? `(${failure.email})` : ""}:{" "}
                                  {failure.message}
                                </li>
                              ))}
                            </ul>
                          ) : null}
                        </AlertDescription>
                      </Alert>
                    ) : null}
                  </CardContent>
                </Card>
              </div>
            )}
          </div>

          <div className="flex flex-wrap justify-between gap-2 border-t border-bt-blue-300/35 bg-bt-blue-500 px-4 py-3">
            <p className="self-center text-xs text-bt-blue-100">
              Limit: {numberFormatter.format(maxRecipients)} recipients per send
            </p>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button
                variant="green"
                onClick={() => void sendBulkEmail()}
                disabled={!canSend}
              >
                {isSending ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Send className="mr-2 h-4 w-4" />
                )}
                Send to {numberFormatter.format(selectedRecipientCount)}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
