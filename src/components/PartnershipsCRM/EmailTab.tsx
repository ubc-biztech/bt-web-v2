import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  AlertCircle,
  Inbox,
  Loader2,
  MailPlus,
  Pencil,
  RefreshCw,
  Save,
  Send,
  Trash2,
  UserRound,
} from "lucide-react";
import { fetchBackend } from "@/lib/db";
import { API_URL } from "@/lib/dbconfig";
import { useToast } from "@/components/ui/use-toast";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import {
  MassEmailDialog,
  MassEmailEventOption,
  MassEmailRecipient,
  MassEmailTemplateOption,
} from "./MassEmailDialog";
import { GmailSyncSetupDialog } from "./GmailSyncSetupDialog";
import { MergeFieldPicker } from "./MergeFieldPicker";
import {
  deriveDisplayNameFromEmail,
  renderTemplatePreview,
  splitFullName,
  toErrorMessage,
  toReadableDateTime,
  toSafeText,
} from "./emailTabUtils";

type MergeField = {
  key: string;
  token: string;
  label: string;
  description: string;
};

type EmailConfigResponse = {
  sender: string;
  senderFirstName?: string;
  senderLastName?: string;
  senderFullName?: string;
  maxRecipients: number;
  mergeFields: MergeField[];
};

type EmailSyncStats = {
  received: number;
  processed: number;
  imported: number;
  duplicates: number;
  unmatched: number;
  skipped: number;
  errors: number;
};

type EmailSyncStatusResponse = {
  provider: string;
  enabled: boolean;
  configured: boolean;
  ingestUrl: string;
  allowedDomains: string[];
  message: string;
  lastIngestAt: string | null;
  lastSuccessAt: string | null;
  lastIngestStatusCode: number | null;
  stats: EmailSyncStats;
  recentActorEmails?: string[];
  unmatchedEmails?: string[];
  recentErrors: Array<{
    entryIndex: number;
    reason: string;
    details?: Record<string, unknown>;
  }>;
};

type TemplatesResponse = {
  templates: MassEmailTemplateOption[];
};

type TemplateFormState = {
  name: string;
  description: string;
  subjectTemplate: string;
  bodyTemplate: string;
};

type PartnershipsEmailTabProps = {
  recipients: MassEmailRecipient[];
  events: MassEmailEventOption[];
  onDataMutated?: () => Promise<void> | void;
};

const numberFormatter = new Intl.NumberFormat("en-US");

const defaultTemplateForm: TemplateFormState = {
  name: "",
  description: "",
  subjectTemplate: "",
  bodyTemplate: "",
};

const defaultEmailSyncStats: EmailSyncStats = {
  received: 0,
  processed: 0,
  imported: 0,
  duplicates: 0,
  unmatched: 0,
  skipped: 0,
  errors: 0,
};

export function PartnershipsEmailTab({
  recipients,
  events,
  onDataMutated,
}: PartnershipsEmailTabProps) {
  const { toast } = useToast();
  const templatesRef = useRef<HTMLDivElement | null>(null);

  const [config, setConfig] = useState<EmailConfigResponse | null>(null);
  const [templates, setTemplates] = useState<MassEmailTemplateOption[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [isMassEmailOpen, setIsMassEmailOpen] = useState(false);

  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
  const [templateModalMode, setTemplateModalMode] = useState<"create" | "edit">(
    "create",
  );
  const [editingTemplateId, setEditingTemplateId] = useState<string | null>(
    null,
  );
  const [templateForm, setTemplateForm] =
    useState<TemplateFormState>(defaultTemplateForm);
  const [activeTemplateField, setActiveTemplateField] = useState<
    "subjectTemplate" | "bodyTemplate"
  >("bodyTemplate");
  const [isSavingTemplate, setIsSavingTemplate] = useState(false);
  const [archivingTemplateId, setArchivingTemplateId] = useState<string | null>(
    null,
  );
  const [syncStatus, setSyncStatus] = useState<EmailSyncStatusResponse | null>(
    null,
  );
  const [syncStatusError, setSyncStatusError] = useState<string | null>(null);
  const [isSyncStatusLoading, setIsSyncStatusLoading] = useState(false);
  const [isSetupGuideOpen, setIsSetupGuideOpen] = useState(false);

  const recipientsWithEmailCount = useMemo(
    () => recipients.filter((recipient) => toSafeText(recipient.email)).length,
    [recipients],
  );

  const filteredTemplates = useMemo(() => {
    const searchText = search.trim().toLowerCase();
    if (!searchText) return templates;

    return templates.filter((template) => {
      const index = [
        template.name,
        template.description,
        template.subjectTemplate,
        template.bodyTemplate,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return index.includes(searchText);
    });
  }, [search, templates]);

  const previewRecipient = recipients[0] || null;
  const previewEvent = events[0] || null;

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

  const previewValues = useMemo(
    () => ({
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
      sender_email: toSafeText(config?.sender),
      event_name: previewEvent?.name || "",
      event_year: previewEvent ? String(previewEvent.year) : "",
    }),
    [
      config?.sender,
      previewEvent,
      previewRecipient?.company,
      previewRecipient?.email,
      previewRecipientName,
      previewSenderName,
    ],
  );

  const resolvedSyncIngestUrl = useMemo(() => {
    const configuredUrl = toSafeText(syncStatus?.ingestUrl);
    if (configuredUrl) return configuredUrl;
    return `${API_URL}/partnerships/email/sync/ingest`;
  }, [syncStatus?.ingestUrl]);

  const syncScriptTemplate = useMemo(
    () => `/**
 * Partnerships CRM Gmail sync (Apps Script)
 * Quick setup:
 * 1) Paste this script into https://script.new.
 * 2) Run syncPartnershipEmails once to authorize Gmail access.
 * 3) Create a trigger for syncPartnershipEmails:
 *    - Event source: Time-driven
 *    - Type: Minutes timer
 *    - Interval: Every 10 minutes (or 15 minutes)
 */
const INGEST_URL = "${resolvedSyncIngestUrl}";
const LOOKBACK_MINUTES = 30;

function syncPartnershipEmails() {
  const now = new Date();
  const since = new Date(now.getTime() - LOOKBACK_MINUTES * 60 * 1000);
  const sentMessages = fetchMessages_("in:sent", since, "outbound");
  const inboxMessages = fetchMessages_("in:inbox", since, "inbound");
  const entries = sentMessages.concat(inboxMessages);

  if (!entries.length) {
    Logger.log("No recent messages to sync.");
    return;
  }

  const payload = {
    provider: "gmail",
    actorEmail: Session.getActiveUser().getEmail(),
    sourceMethod: "gmail_apps_script",
    entries,
  };

  const response = UrlFetchApp.fetch(INGEST_URL, {
    method: "post",
    contentType: "application/json",
    payload: JSON.stringify(payload),
    muteHttpExceptions: true,
  });

  Logger.log(response.getResponseCode());
  Logger.log(response.getContentText());
}

function fetchMessages_(queryBase, sinceDate, direction) {
  const query = \`\${queryBase} newer_than:2d\`;
  const threads = GmailApp.search(query, 0, 60);
  const results = [];

  threads.forEach((thread) => {
    thread.getMessages().forEach((message) => {
      const messageDate = message.getDate();
      if (messageDate < sinceDate) return;

      results.push({
        messageId: message.getId(),
        threadId: message.getThread().getId(),
        direction,
        occurredAt: messageDate.toISOString(),
        from: message.getFrom(),
        to: message.getTo(),
        cc: message.getCc(),
        bcc: message.getBcc(),
        subject: message.getSubject(),
        snippet: message.getPlainBody().slice(0, 600),
      });
    });
  });

  return results;
}
`,
    [resolvedSyncIngestUrl],
  );

  const syncChecklistText = useMemo(
    () =>
      [
        "Partnerships CRM Email Sync Setup",
        "",
        "Before you start:",
        "- Use the Gmail account you normally send partner emails from.",
        "- Keep the script in that same Google account.",
        "",
        "1) Create the Apps Script project",
        "   a) Open https://script.new",
        "   b) Delete placeholder code and paste the template from Partnerships CRM",
        "   c) Save the project (name it: Partnerships CRM Email Sync)",
        "",
        "2) Run once and authorize",
        "   a) At the top, choose function: syncPartnershipEmails",
        "   b) Click Run",
        "   c) In the Google prompt: Review permissions -> choose your account -> Allow",
        "   d) If you see 'Google hasn't verified this app': Advanced -> Go to ... (unsafe) -> Allow",
        "",
        "3) Add the automatic time trigger",
        "   a) In Apps Script, click Triggers (clock icon, left sidebar)",
        "   b) Click + Add Trigger",
        "   c) Choose function to run: syncPartnershipEmails",
        "   d) Deployment: Head",
        "   e) Event source: Time-driven",
        "   f) Type of time based trigger: Minutes timer",
        "   g) Select minute interval: Every 10 minutes (or Every 15 minutes)",
        "   h) Click Save",
        "",
        "4) Verify in CRM",
        "   a) Go back to Partnerships CRM -> Email Ops",
        "   b) Click Refresh",
        "   c) Confirm Last Sync updates and your email appears in Synced Accounts",
        "",
        "5) Quick troubleshooting",
        "   - If Last Sync does not move: open Apps Script -> Executions and check latest error",
        "   - If Synced Accounts is empty: send one test email from that same Gmail account, then wait for the next trigger run",
        "   - If there are domain errors: make sure your Gmail ends with an allowed domain (usually @ubcbiztech.com)",
        "",
        `Webhook URL: ${resolvedSyncIngestUrl}`,
      ].join("\n"),
    [resolvedSyncIngestUrl],
  );

  const syncTestPayload = useMemo(
    () =>
      JSON.stringify(
        {
          provider: "gmail",
          sourceMethod: "manual_test",
          actorEmail: "your.name@ubcbiztech.com",
          entries: [
            {
              direction: "inbound",
              occurredAt: new Date().toISOString(),
              from: "partner@example.com",
              to: "your.name@ubcbiztech.com",
              subject: "Test sync message",
              snippet: "Quick test from setup guide.",
              messageId: "test-message-id-1",
              threadId: "test-thread-id-1",
            },
          ],
        },
        null,
        2,
      ),
    [],
  );

  const copyText = async (value: string, successMessage: string) => {
    try {
      await navigator.clipboard.writeText(value);
      toast({
        title: successMessage,
      });
    } catch {
      toast({
        variant: "destructive",
        title: "Unable to copy",
        description: "Copy manually from the text area.",
      });
    }
  };

  const loadEmailData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    setIsSyncStatusLoading(true);
    setSyncStatusError(null);

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

      setConfig(configResponse || null);
      setTemplates(
        Array.isArray(templateResponse?.templates)
          ? templateResponse.templates
          : [],
      );
    } catch (loadError: unknown) {
      setError(
        toErrorMessage(
          loadError,
          "Unable to load Partnerships email settings.",
        ),
      );
    } finally {
      setIsLoading(false);
    }

    try {
      const syncStatusResponse = (await fetchBackend({
        endpoint: "/partnerships/email/sync/status",
        method: "GET",
      })) as EmailSyncStatusResponse;
      setSyncStatus(syncStatusResponse || null);
    } catch (syncError: unknown) {
      setSyncStatus(null);
      setSyncStatusError(
        toErrorMessage(syncError, "Unable to load email sync status."),
      );
    } finally {
      setIsSyncStatusLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadEmailData();
  }, [loadEmailData]);

  const openCreateTemplateModal = () => {
    setTemplateModalMode("create");
    setEditingTemplateId(null);
    setTemplateForm(defaultTemplateForm);
    setActiveTemplateField("bodyTemplate");
    setIsTemplateModalOpen(true);
  };

  const openEditTemplateModal = (template: MassEmailTemplateOption) => {
    setTemplateModalMode("edit");
    setEditingTemplateId(template.id);
    setTemplateForm({
      name: template.name || "",
      description: template.description || "",
      subjectTemplate: template.subjectTemplate || "",
      bodyTemplate: template.bodyTemplate || "",
    });
    setActiveTemplateField("bodyTemplate");
    setIsTemplateModalOpen(true);
  };

  const insertMergeToken = (token: string) => {
    if (activeTemplateField === "subjectTemplate") {
      setTemplateForm((previous) => ({
        ...previous,
        subjectTemplate: `${previous.subjectTemplate}${token}`,
      }));
      return;
    }

    setTemplateForm((previous) => ({
      ...previous,
      bodyTemplate: `${previous.bodyTemplate}${token}`,
    }));
  };

  const saveTemplate = async () => {
    if (!templateForm.name.trim()) {
      toast({
        variant: "destructive",
        title: "Template name required",
        description: "Please provide a template name.",
      });
      return;
    }

    if (
      !templateForm.subjectTemplate.trim() ||
      !templateForm.bodyTemplate.trim()
    ) {
      toast({
        variant: "destructive",
        title: "Template content required",
        description: "Subject and body are both required.",
      });
      return;
    }

    setIsSavingTemplate(true);
    try {
      const payload = {
        name: templateForm.name,
        description: templateForm.description,
        subjectTemplate: templateForm.subjectTemplate,
        bodyTemplate: templateForm.bodyTemplate,
      };

      if (templateModalMode === "create") {
        await fetchBackend({
          endpoint: "/partnerships/email/templates",
          method: "POST",
          data: payload,
        });
        toast({ title: "Template created" });
      } else if (editingTemplateId) {
        await fetchBackend({
          endpoint: `/partnerships/email/templates/${editingTemplateId}`,
          method: "PATCH",
          data: payload,
        });
        toast({ title: "Template updated" });
      }

      setIsTemplateModalOpen(false);
      await loadEmailData();
    } catch (saveError: unknown) {
      toast({
        variant: "destructive",
        title: "Unable to save template",
        description: toErrorMessage(saveError, "Please review and retry."),
      });
    } finally {
      setIsSavingTemplate(false);
    }
  };

  const archiveTemplate = async (templateId: string) => {
    const confirmed = window.confirm(
      "Archive this template? It will no longer appear for campaigns.",
    );
    if (!confirmed) return;

    setArchivingTemplateId(templateId);
    try {
      await fetchBackend({
        endpoint: `/partnerships/email/templates/${templateId}`,
        method: "DELETE",
      });
      toast({ title: "Template archived" });
      await loadEmailData();
    } catch (archiveError: unknown) {
      toast({
        variant: "destructive",
        title: "Unable to archive template",
        description: toErrorMessage(archiveError, "Please retry."),
      });
    } finally {
      setArchivingTemplateId(null);
    }
  };

  const syncStats = syncStatus?.stats || defaultEmailSyncStats;
  const hasSyncErrors = (syncStatus?.lastIngestStatusCode || 0) >= 400;
  const syncBadgeClassName = !syncStatus?.enabled
    ? "border-bt-red-300/40 bg-bt-red-300/15 text-bt-red-100"
    : syncStatus?.configured
      ? hasSyncErrors
        ? "border-[#F59DAA]/40 bg-[#F59DAA]/15 text-[#FFD8DE]"
        : "border-[#75D450]/45 bg-[#75D450]/12 text-[#D6F5C9]"
      : "border-[#F0C66D]/35 bg-[#F0C66D]/12 text-[#FDEBC3]";

  return (
    <div className="space-y-4">
      <Card className="border-bt-blue-300/30 bg-bt-blue-500/40">
        <CardContent className="space-y-3 p-4">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div>
              <h2 className="text-sm font-semibold text-white sm:text-base">
                Partnerships Email Ops
              </h2>
              <p className="text-xs text-bt-blue-100">
                Save templates and send partner emails.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => void loadEmailData()}
                className="border-bt-blue-300/40 bg-bt-blue-500/40 text-white hover:bg-bt-blue-500/60"
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Refresh
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={openCreateTemplateModal}
                className="border-bt-blue-300/40 bg-bt-blue-500/40 text-white hover:bg-bt-blue-500/60"
              >
                <MailPlus className="mr-2 h-4 w-4" />
                New Template
              </Button>
              <Button
                variant="green"
                size="sm"
                onClick={() => setIsMassEmailOpen(true)}
              >
                <Send className="mr-2 h-4 w-4" />
                Mail Merge
              </Button>
            </div>
          </div>

          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-lg border border-bt-blue-300/25 bg-bt-blue-600/25 p-3">
              <p className="text-[11px] uppercase tracking-wide text-bt-blue-100">
                Sending As
              </p>
              <p className="mt-1 truncate text-sm font-semibold text-white">
                {config?.sender || "-"}
              </p>
            </div>
            <div className="rounded-lg border border-bt-blue-300/25 bg-bt-blue-600/25 p-3">
              <p className="text-[11px] uppercase tracking-wide text-bt-blue-100">
                Templates
              </p>
              <p className="mt-1 text-sm font-semibold text-white">
                {numberFormatter.format(templates.length)}
              </p>
            </div>
            <div className="rounded-lg border border-bt-blue-300/25 bg-bt-blue-600/25 p-3">
              <p className="text-[11px] uppercase tracking-wide text-bt-blue-100">
                Recipients In Scope
              </p>
              <p className="mt-1 text-sm font-semibold text-white">
                {numberFormatter.format(recipients.length)}
              </p>
            </div>
            <div className="rounded-lg border border-bt-blue-300/25 bg-bt-blue-600/25 p-3">
              <p className="text-[11px] uppercase tracking-wide text-bt-blue-100">
                Max Recipients / Send
              </p>
              <p className="mt-1 text-sm font-semibold text-white">
                {numberFormatter.format(config?.maxRecipients || 200)}
              </p>
            </div>
          </div>

          {error ? (
            <Alert className="border-bt-red-200/40 bg-bt-red-200/10 text-bt-red-100">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Unable to load email tools</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          ) : null}

          <p className="text-xs text-bt-blue-100">
            {numberFormatter.format(recipientsWithEmailCount)} of{" "}
            {numberFormatter.format(recipients.length)} recipients currently
            have an email configured.
          </p>
        </CardContent>
      </Card>

      <Card className="border-bt-blue-300/30 bg-bt-blue-500/40">
        <CardContent className="space-y-3 p-4">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div>
              <h3 className="text-sm font-semibold text-white sm:text-base">
                Inbox & Reply Sync
              </h3>
              <p className="text-xs text-bt-blue-100">
                Import normal Gmail sends and replies into each partner
                communication log.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <span
                className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-medium ${syncBadgeClassName}`}
              >
                {isSyncStatusLoading
                  ? "Loading"
                  : !syncStatus?.enabled
                    ? "Disabled"
                    : syncStatus?.configured
                      ? hasSyncErrors
                        ? "Needs Attention"
                        : "Configured"
                      : "Not Configured"}
              </span>
              <Button
                size="sm"
                variant="outline"
                className="h-8 border-bt-blue-300/40 bg-bt-blue-500/40 px-2 text-xs text-white hover:bg-bt-blue-500/60"
                onClick={() => void loadEmailData()}
              >
                <RefreshCw className="mr-1.5 h-3.5 w-3.5" />
                Refresh
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="h-8 border-bt-blue-300/40 bg-bt-blue-500/40 px-2 text-xs text-white hover:bg-bt-blue-500/60"
                onClick={() => setIsSetupGuideOpen(true)}
              >
                <Inbox className="mr-1.5 h-3.5 w-3.5" />
                Setup Guide
              </Button>
            </div>
          </div>

          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-lg border border-bt-blue-300/25 bg-bt-blue-600/25 p-3">
              <p className="text-[11px] uppercase tracking-wide text-bt-blue-100">
                Imported
              </p>
              <p className="mt-1 text-sm font-semibold text-white">
                {numberFormatter.format(syncStats.imported)}
              </p>
            </div>
            <div className="rounded-lg border border-bt-blue-300/25 bg-bt-blue-600/25 p-3">
              <p className="text-[11px] uppercase tracking-wide text-bt-blue-100">
                Duplicates Ignored
              </p>
              <p className="mt-1 text-sm font-semibold text-white">
                {numberFormatter.format(syncStats.duplicates)}
              </p>
            </div>
            <div className="rounded-lg border border-bt-blue-300/25 bg-bt-blue-600/25 p-3">
              <p className="text-[11px] uppercase tracking-wide text-bt-blue-100">
                Unmatched
              </p>
              <p className="mt-1 text-sm font-semibold text-white">
                {numberFormatter.format(syncStats.unmatched)}
              </p>
            </div>
            <div className="rounded-lg border border-bt-blue-300/25 bg-bt-blue-600/25 p-3">
              <p className="text-[11px] uppercase tracking-wide text-bt-blue-100">
                Last Sync
              </p>
              <p className="mt-1 text-sm font-semibold text-white">
                {toReadableDateTime(syncStatus?.lastIngestAt)}
              </p>
            </div>
          </div>

          {syncStatusError ? (
            <Alert className="border-bt-red-200/40 bg-bt-red-200/10 text-bt-red-100">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Unable to load sync status</AlertTitle>
              <AlertDescription>{syncStatusError}</AlertDescription>
            </Alert>
          ) : null}

          {syncStatus?.message ? (
            <p className="text-xs text-bt-blue-100">{syncStatus.message}</p>
          ) : null}

          {syncStatus?.unmatchedEmails?.length ? (
            <div className="rounded-md border border-[#F0C66D]/35 bg-[#F0C66D]/12 p-2">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-[#FDEBC3]">
                Unmatched Emails
              </p>
              <p className="mt-1 line-clamp-2 text-xs text-[#FDEBC3]">
                {syncStatus.unmatchedEmails.join(", ")}
              </p>
            </div>
          ) : null}

          {syncStatus?.recentActorEmails?.length ? (
            <div className="rounded-md border border-bt-blue-300/30 bg-bt-blue-600/30 p-2">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-bt-blue-100">
                Synced Accounts
              </p>
              <p className="mt-1 line-clamp-2 text-xs text-bt-blue-50">
                {syncStatus.recentActorEmails.join(", ")}
              </p>
            </div>
          ) : null}
        </CardContent>
      </Card>

      <Card
        ref={templatesRef}
        id="partnership-email-templates"
        className="border-bt-blue-300/30 bg-bt-blue-500/40"
      >
        <CardContent className="space-y-3 p-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h3 className="text-sm font-semibold text-white sm:text-base">
              Template Library
            </h3>
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search templates"
              className="h-9 w-full max-w-[320px] border-bt-blue-300/40 bg-bt-blue-600/40 text-white placeholder:text-bt-blue-100"
            />
          </div>

          {isLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-10 w-full bg-bt-blue-300/20" />
              <Skeleton className="h-10 w-full bg-bt-blue-300/20" />
              <Skeleton className="h-10 w-full bg-bt-blue-300/20" />
            </div>
          ) : !filteredTemplates.length ? (
            <p className="rounded-md border border-bt-blue-300/30 bg-bt-blue-600/25 p-3 text-sm text-bt-blue-100">
              No templates found.
            </p>
          ) : (
            <>
              <div className="hidden md:block">
                <Table>
                  <TableHeader>
                    <TableRow className="border-bt-blue-300/20 hover:bg-transparent">
                      <TableHead className="text-bt-blue-100">
                        Template
                      </TableHead>
                      <TableHead className="text-bt-blue-100">
                        Description
                      </TableHead>
                      <TableHead className="text-bt-blue-100">
                        Last Used
                      </TableHead>
                      <TableHead className="text-right text-bt-blue-100">
                        Actions
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredTemplates.map((template) => (
                      <TableRow
                        key={template.id}
                        className="border-bt-blue-300/20 hover:bg-bt-blue-500/30"
                      >
                        <TableCell>
                          <p className="text-sm font-medium text-white">
                            {template.name}
                          </p>
                          <p className="line-clamp-1 text-xs text-bt-blue-100">
                            {template.subjectTemplate}
                          </p>
                        </TableCell>
                        <TableCell className="max-w-[380px]">
                          <p className="line-clamp-2 text-xs text-bt-blue-100">
                            {template.description || "No description"}
                          </p>
                        </TableCell>
                        <TableCell className="text-xs text-bt-blue-100">
                          {toReadableDateTime(template.lastUsedAt)}
                        </TableCell>
                        <TableCell>
                          <div className="flex justify-end gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-7 border-bt-blue-300/40 bg-bt-blue-500/40 px-2 text-xs text-white hover:bg-bt-blue-500/60"
                              onClick={() => openEditTemplateModal(template)}
                            >
                              <Pencil className="mr-1 h-3.5 w-3.5" />
                              Edit
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-7 border-bt-red-300/40 bg-bt-red-300/15 px-2 text-xs text-bt-red-100 hover:bg-bt-red-300/25"
                              onClick={() => void archiveTemplate(template.id)}
                              disabled={archivingTemplateId === template.id}
                            >
                              {archivingTemplateId === template.id ? (
                                <Loader2 className="mr-1 h-3.5 w-3.5 animate-spin" />
                              ) : (
                                <Trash2 className="mr-1 h-3.5 w-3.5" />
                              )}
                              Archive
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              <div className="grid gap-2 md:hidden">
                {filteredTemplates.map((template) => (
                  <div
                    key={template.id}
                    className="rounded-md border border-bt-blue-300/25 bg-bt-blue-600/25 p-3"
                  >
                    <p className="text-sm font-medium text-white">
                      {template.name}
                    </p>
                    <p className="mt-0.5 line-clamp-2 text-xs text-bt-blue-100">
                      {template.description || "No description"}
                    </p>
                    <p className="mt-1 text-[11px] text-bt-blue-100">
                      Last used: {toReadableDateTime(template.lastUsedAt)}
                    </p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-7 border-bt-blue-300/40 bg-bt-blue-500/40 px-2 text-xs text-white hover:bg-bt-blue-500/60"
                        onClick={() => openEditTemplateModal(template)}
                      >
                        <Pencil className="mr-1 h-3.5 w-3.5" />
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-7 border-bt-red-300/40 bg-bt-red-300/15 px-2 text-xs text-bt-red-100 hover:bg-bt-red-300/25"
                        onClick={() => void archiveTemplate(template.id)}
                        disabled={archivingTemplateId === template.id}
                      >
                        {archivingTemplateId === template.id ? (
                          <Loader2 className="mr-1 h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <Trash2 className="mr-1 h-3.5 w-3.5" />
                        )}
                        Archive
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <MassEmailDialog
        open={isMassEmailOpen}
        onOpenChange={setIsMassEmailOpen}
        recipients={recipients}
        events={events}
        onManageTemplates={() => {
          templatesRef.current?.scrollIntoView({
            behavior: "smooth",
            block: "start",
          });
        }}
        onSent={async () => {
          await loadEmailData();
          if (onDataMutated) {
            await onDataMutated();
          }
        }}
      />

      <GmailSyncSetupDialog
        open={isSetupGuideOpen}
        onOpenChange={setIsSetupGuideOpen}
        resolvedSyncIngestUrl={resolvedSyncIngestUrl}
        syncChecklistText={syncChecklistText}
        syncScriptTemplate={syncScriptTemplate}
        syncTestPayload={syncTestPayload}
        onCopy={copyText}
      />

      <Dialog open={isTemplateModalOpen} onOpenChange={setIsTemplateModalOpen}>
        <DialogContent className="w-[calc(100vw-1rem)] max-w-4xl overflow-hidden border-bt-blue-300 bg-bt-blue-500 p-0 text-white">
          <div className="flex max-h-[92vh] flex-col">
            <div className="border-b border-bt-blue-300/35 px-4 py-3">
              <h3 className="text-lg font-semibold text-white">
                {templateModalMode === "create"
                  ? "Create Email Template"
                  : "Edit Email Template"}
              </h3>
              <p className="text-sm text-bt-blue-100">
                Write a template you can reuse for sponsor and partner outreach.
              </p>
            </div>

            <div className="grid flex-1 gap-4 overflow-y-auto p-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
              <div className="space-y-3">
                <div className="space-y-1">
                  <label className="text-xs text-bt-blue-100">
                    Template Name
                  </label>
                  <Input
                    value={templateForm.name}
                    onChange={(event) =>
                      setTemplateForm((previous) => ({
                        ...previous,
                        name: event.target.value,
                      }))
                    }
                    className="border-bt-blue-300/40 bg-bt-blue-600/40 text-white placeholder:text-bt-blue-100"
                    placeholder="Sponsor follow-up"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs text-bt-blue-100">
                    Description
                  </label>
                  <Input
                    value={templateForm.description}
                    onChange={(event) =>
                      setTemplateForm((previous) => ({
                        ...previous,
                        description: event.target.value,
                      }))
                    }
                    className="border-bt-blue-300/40 bg-bt-blue-600/40 text-white placeholder:text-bt-blue-100"
                    placeholder="Optional"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs text-bt-blue-100">
                    Subject Template
                  </label>
                  <Input
                    value={templateForm.subjectTemplate}
                    onFocus={() => setActiveTemplateField("subjectTemplate")}
                    onChange={(event) =>
                      setTemplateForm((previous) => ({
                        ...previous,
                        subjectTemplate: event.target.value,
                      }))
                    }
                    className="border-bt-blue-300/40 bg-bt-blue-600/40 text-white placeholder:text-bt-blue-100"
                    placeholder="Hi {{contact_name}}, quick follow-up"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs text-bt-blue-100">
                    Body Template
                  </label>
                  <Textarea
                    value={templateForm.bodyTemplate}
                    onFocus={() => setActiveTemplateField("bodyTemplate")}
                    onChange={(event) =>
                      setTemplateForm((previous) => ({
                        ...previous,
                        bodyTemplate: event.target.value,
                      }))
                    }
                    className="min-h-[200px] border-bt-blue-300/40 bg-bt-blue-600/40 text-white placeholder:text-bt-blue-100"
                    placeholder="Write your template body..."
                  />
                </div>
              </div>

              <div className="space-y-3">
                <MergeFieldPicker
                  fields={config?.mergeFields || []}
                  activeTargetLabel={
                    activeTemplateField === "subjectTemplate"
                      ? "subject template"
                      : "body template"
                  }
                  onInsertToken={insertMergeToken}
                />

                <div className="rounded-md border border-bt-blue-300/30 bg-bt-blue-600/30 p-3">
                  <p className="text-[11px] uppercase tracking-wide text-bt-blue-100">
                    Preview
                  </p>
                  <div className="mt-2 flex items-center gap-2 text-xs text-bt-blue-100">
                    <UserRound className="h-3.5 w-3.5" />
                    {previewRecipient
                      ? `${previewRecipient.contactName || "Contact"} • ${previewRecipient.company || "Company"}`
                      : "Uses sample values"}
                  </div>
                  <div className="mt-2 rounded-md border border-bt-blue-300/30 bg-bt-blue-700/45 p-2">
                    <p className="text-xs font-semibold text-white">
                      {renderTemplatePreview(
                        templateForm.subjectTemplate,
                        previewValues,
                      ) || "(empty subject)"}
                    </p>
                    <p className="mt-1 whitespace-pre-wrap text-xs text-bt-blue-100">
                      {renderTemplatePreview(
                        templateForm.bodyTemplate,
                        previewValues,
                      ) || "(empty body)"}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 border-t border-bt-blue-300/35 px-4 py-3">
              <Button
                variant="outline"
                onClick={() => setIsTemplateModalOpen(false)}
              >
                Cancel
              </Button>
              <Button
                variant="green"
                onClick={() => void saveTemplate()}
                disabled={isSavingTemplate}
              >
                {isSavingTemplate ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Save className="mr-2 h-4 w-4" />
                )}
                {templateModalMode === "create"
                  ? "Create Template"
                  : "Save Changes"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
