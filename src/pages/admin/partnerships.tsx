import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import Head from "next/head";
import { fetchBackend } from "@/lib/db";
import { cn } from "@/lib/utils";
import { PartnershipsOverviewTab } from "@/components/PartnershipsCRM/OverviewTab";
import { PartnershipsEmailTab } from "@/components/PartnershipsCRM/EmailTab";
import { PartnershipsDialogs } from "@/components/PartnershipsCRM/PartnershipsDialogs";
import { StatusChip } from "@/components/PartnershipsCRM/StatusChip";
import { toStatusLabel } from "@/components/PartnershipsCRM/status";
import {
  PartnershipsDashboardResponse,
  PartnershipsGoogleSheetsStatus,
} from "@/components/PartnershipsCRM/types";
import {
  createTierRow,
  CUSTOM_STATUS_VALUE,
  CUSTOM_TIER_VALUE,
  defaultCommunicationForm,
  defaultDocumentForm,
  defaultEventForm,
  defaultLinkForm,
  defaultPartnerForm,
  defaultStatusValues,
  getStatusSummary,
  roleSuggestions,
} from "@/components/PartnershipsCRM/partnershipsPageDefaults";
import {
  buildCsv,
  downloadTextFile,
  formatCurrency,
  formatDate,
  formatIsoTimestamp,
  formatPercent,
  formatTimestamp,
  getContactDisplayName,
  getInitials,
  normalizeStatusOptions,
  normalizeTierOptions,
  slugifyTier,
  toErrorMessage,
  toLocalDateTimeInput,
  toTagList,
  toTierLabel,
} from "@/components/PartnershipsCRM/partnershipsPageUtils";
import type {
  DirectorySummary,
  EventDetailResponse,
  EventOption,
  EventSponsorship,
  PartnerCommunication,
  PartnerCommunicationFormState,
  PartnerDetailResponse,
  PartnerDocument,
  PartnerDocumentFormState,
  PartnerFormState,
  PartnerLink,
  PartnerLinkFormState,
  PartnerStatus,
  PartnerSummary,
  PartnershipsEmailSyncStatus,
  PartnershipEventFormState,
  TierConfig,
} from "@/components/PartnershipsCRM/partnershipsPageTypes";
import { useToast } from "@/components/ui/use-toast";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import {
  AlertCircle,
  Archive,
  CalendarDays,
  Download,
  ExternalLink,
  FileText,
  FilterX,
  Handshake,
  Loader2,
  Mail,
  MessageSquare,
  Pencil,
  Plus,
  RefreshCw,
  Search,
  Trash2,
  UserRound,
  Users,
} from "lucide-react";
const numberFormatter = new Intl.NumberFormat("en-US");

export default function PartnershipsCrmPage() {
  const { toast } = useToast();
  const selectedPartnerIdRef = useRef<string | null>(null);

  const [activeTab, setActiveTab] = useState<
    "overview" | "partners" | "events" | "emails"
  >("overview");

  const [partners, setPartners] = useState<PartnerSummary[]>([]);
  const [, setSummary] = useState<DirectorySummary | null>(null);
  const [dashboard, setDashboard] =
    useState<PartnershipsDashboardResponse | null>(null);
  const [events, setEvents] = useState<EventOption[]>([]);
  const [eventDetail, setEventDetail] = useState<EventDetailResponse | null>(
    null,
  );
  const [partnerDetail, setPartnerDetail] =
    useState<PartnerDetailResponse | null>(null);
  const [sheetsStatus, setSheetsStatus] =
    useState<PartnershipsGoogleSheetsStatus | null>(null);
  const [emailSyncStatus, setEmailSyncStatus] =
    useState<PartnershipsEmailSyncStatus | null>(null);

  const [selectedPartnerId, setSelectedPartnerId] = useState<string | null>(
    null,
  );
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [partnerPanelTab, setPartnerPanelTab] = useState<
    "sponsorships" | "documents" | "communications"
  >("sponsorships");

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [eventFilter, setEventFilter] = useState<string>("all");
  const [packageTierFilter, setPackageTierFilter] = useState<string>("all");
  const [partnerTierFilter, setPartnerTierFilter] = useState<string>("all");
  const [alumniFilter, setAlumniFilter] = useState<string>("all");
  const [tagFilter, setTagFilter] = useState<string>("all");
  const [includeArchived, setIncludeArchived] = useState(false);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [dashboardYearFilter, setDashboardYearFilter] = useState("auto");
  const [dashboardEventFilter, setDashboardEventFilter] = useState("all");
  const [dashboardWindowDays, setDashboardWindowDays] = useState("21");
  const [dashboardIncludeArchived, setDashboardIncludeArchived] =
    useState(false);

  const [availableStatuses, setAvailableStatuses] =
    useState<string[]>(defaultStatusValues);
  const [availablePackageTiers, setAvailablePackageTiers] = useState<string[]>(
    [],
  );
  const [availablePartnerTiers, setAvailablePartnerTiers] = useState<string[]>(
    [],
  );

  const [isLoadingDirectory, setIsLoadingDirectory] = useState(true);
  const [isLoadingDashboard, setIsLoadingDashboard] = useState(true);
  const [isLoadingEvents, setIsLoadingEvents] = useState(true);
  const [isLoadingPartnerDetail, setIsLoadingPartnerDetail] = useState(false);
  const [isLoadingEventDetail, setIsLoadingEventDetail] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isSyncingSheets, setIsSyncingSheets] = useState<
    "push" | "pull" | null
  >(null);
  const [error, setError] = useState<string | null>(null);

  const [isPartnerModalOpen, setIsPartnerModalOpen] = useState(false);
  const [partnerModalMode, setPartnerModalMode] = useState<"create" | "edit">(
    "create",
  );
  const [partnerForm, setPartnerForm] =
    useState<PartnerFormState>(defaultPartnerForm);
  const [isSavingPartner, setIsSavingPartner] = useState(false);

  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [eventModalMode, setEventModalMode] = useState<"create" | "edit">(
    "create",
  );
  const [eventForm, setEventForm] =
    useState<PartnershipEventFormState>(defaultEventForm);
  const [editingEventId, setEditingEventId] = useState<string | null>(null);
  const [isSavingEvent, setIsSavingEvent] = useState(false);

  const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);
  const [linkModalMode, setLinkModalMode] = useState<"create" | "edit">(
    "create",
  );
  const [linkForm, setLinkForm] =
    useState<PartnerLinkFormState>(defaultLinkForm);
  const [editingLinkId, setEditingLinkId] = useState<string | null>(null);
  const [isSavingLink, setIsSavingLink] = useState(false);

  const [isDocumentModalOpen, setIsDocumentModalOpen] = useState(false);
  const [documentModalMode, setDocumentModalMode] = useState<"create" | "edit">(
    "create",
  );
  const [documentForm, setDocumentForm] =
    useState<PartnerDocumentFormState>(defaultDocumentForm);
  const [editingDocumentId, setEditingDocumentId] = useState<string | null>(
    null,
  );
  const [isSavingDocument, setIsSavingDocument] = useState(false);

  const [isCommunicationModalOpen, setIsCommunicationModalOpen] =
    useState(false);
  const [communicationModalMode, setCommunicationModalMode] = useState<
    "create" | "edit"
  >("create");
  const [communicationForm, setCommunicationForm] =
    useState<PartnerCommunicationFormState>(defaultCommunicationForm);
  const [editingCommunicationId, setEditingCommunicationId] = useState<
    string | null
  >(null);
  const [isSavingCommunication, setIsSavingCommunication] = useState(false);

  const selectedPartner = useMemo(
    () => partners.find((partner) => partner.id === selectedPartnerId) || null,
    [partners, selectedPartnerId],
  );

  const selectedEvent = useMemo(
    () => events.find((event) => event.id === selectedEventId) || null,
    [events, selectedEventId],
  );

  const selectedPartnerStatusSummary = useMemo(
    () =>
      selectedPartner
        ? getStatusSummary(selectedPartner, 3)
        : { visible: [], hiddenCount: 0 },
    [selectedPartner],
  );

  const communicationSyncSummary = useMemo(() => {
    const communications = partnerDetail?.communications || [];
    const synced = communications.filter(
      (communication) => communication.source === "email_sync",
    );

    if (!synced.length) {
      return {
        count: 0,
        latestActor: "",
        latestAt: "",
        actorEmails: [] as string[],
      };
    }

    const actorEmails = Array.from(
      new Set(
        synced
          .map((communication) =>
            String(
              communication.actorEmail || communication.sender || "",
            ).trim(),
          )
          .filter(Boolean),
      ),
    );

    const latest = [...synced].sort((left, right) => {
      const rightTime = Date.parse(right.occurredAt || "") || 0;
      const leftTime = Date.parse(left.occurredAt || "") || 0;
      return rightTime - leftTime;
    })[0];

    return {
      count: synced.length,
      latestActor: String(latest?.actorEmail || latest?.sender || "").trim(),
      latestAt: latest?.occurredAt || "",
      actorEmails,
    };
  }, [partnerDetail?.communications]);

  const statusSet = useMemo(
    () => new Set(availableStatuses),
    [availableStatuses],
  );

  const tagOptions = useMemo(() => {
    const tags = new Set<string>();

    for (const partner of partners) {
      for (const tag of partner.tags || []) {
        const normalized = String(tag || "").trim();
        if (normalized) tags.add(normalized);
      }
    }

    return Array.from(tags).sort((left, right) => left.localeCompare(right));
  }, [partners]);

  const dashboardYearOptions = useMemo(() => {
    const years = new Set<number>();
    for (const event of events) {
      if (Number.isInteger(event.year)) {
        years.add(event.year);
      }
    }
    return Array.from(years).sort((left, right) => right - left);
  }, [events]);

  const dashboardEventOptions = useMemo(() => {
    const selectedYear =
      dashboardYearFilter !== "auto" && dashboardYearFilter !== "all"
        ? Number(dashboardYearFilter)
        : null;

    return events
      .filter((event) =>
        selectedYear && Number.isInteger(selectedYear)
          ? Number(event.year) === selectedYear
          : true,
      )
      .sort((left, right) => {
        if (right.year !== left.year) return right.year - left.year;
        return left.name.localeCompare(right.name);
      });
  }, [dashboardYearFilter, events]);

  const dashboardPipelineRows = useMemo(
    () => dashboard?.pipeline?.byStatus || [],
    [dashboard],
  );

  const dashboardEventRows = useMemo(
    () => dashboard?.revenueByEvent || [],
    [dashboard],
  );

  const dashboardActionItems = useMemo(
    () => dashboard?.actionItems || [],
    [dashboard],
  );

  useEffect(() => {
    if (dashboardEventFilter === "all") return;
    if (
      dashboardEventOptions.some((event) => event.id === dashboardEventFilter)
    )
      return;
    setDashboardEventFilter("all");
  }, [dashboardEventFilter, dashboardEventOptions]);

  const hasActiveFilters = useMemo(
    () =>
      search.trim() !== "" ||
      statusFilter !== "all" ||
      eventFilter !== "all" ||
      packageTierFilter !== "all" ||
      partnerTierFilter !== "all" ||
      alumniFilter !== "all" ||
      tagFilter !== "all" ||
      includeArchived,
    [
      search,
      statusFilter,
      eventFilter,
      packageTierFilter,
      partnerTierFilter,
      alumniFilter,
      tagFilter,
      includeArchived,
    ],
  );

  const clearAllFilters = useCallback(() => {
    setSearch("");
    setStatusFilter("all");
    setEventFilter("all");
    setPackageTierFilter("all");
    setPartnerTierFilter("all");
    setAlumniFilter("all");
    setTagFilter("all");
    setIncludeArchived(false);
  }, []);

  const detailPanelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (
      !selectedPartnerId ||
      typeof window === "undefined" ||
      window.innerWidth >= 1280
    )
      return;
    const timeout = setTimeout(() => {
      detailPanelRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 150);
    return () => clearTimeout(timeout);
  }, [selectedPartnerId]);

  const selectedLinkEvent = useMemo(
    () => events.find((event) => event.id === linkForm.eventId) || null,
    [events, linkForm.eventId],
  );

  const selectedLinkEventTierConfigs = useMemo(
    () => selectedLinkEvent?.tierConfigs || [],
    [selectedLinkEvent],
  );

  const isEventScopedPartnerView = eventFilter !== "all";
  const selectedEventFilterLabel = useMemo(() => {
    if (eventFilter === "all") return "";

    const matched = events.find(
      (event) => `${event.id}#${event.year}` === eventFilter,
    );
    if (!matched) return "selected event";
    return `${matched.name} (${matched.year})`;
  }, [eventFilter, events]);

  const linkTierOptionIds = useMemo(
    () => new Set(selectedLinkEventTierConfigs.map((tier) => tier.id)),
    [selectedLinkEventTierConfigs],
  );

  const linkTierSelectValue = useMemo(() => {
    if (linkForm.packageTier && linkTierOptionIds.has(linkForm.packageTier)) {
      return linkForm.packageTier;
    }
    if (linkForm.customTier.trim()) return CUSTOM_TIER_VALUE;
    return "none";
  }, [linkForm.customTier, linkForm.packageTier, linkTierOptionIds]);

  const loadEvents = useCallback(async () => {
    setIsLoadingEvents(true);
    try {
      const response = await fetchBackend({
        endpoint: "/partnerships/events",
        method: "GET",
      });

      const nextEvents: EventOption[] = response?.events || [];
      setEvents(nextEvents);

      setAvailablePackageTiers((previous) => {
        return normalizeTierOptions([
          ...previous,
          ...nextEvents.flatMap((event) => event.packageTiers || []),
        ]);
      });

      if (!nextEvents.length) {
        setSelectedEventId(null);
        setEventDetail(null);
      } else {
        setSelectedEventId((previous) => {
          if (previous && nextEvents.some((event) => event.id === previous)) {
            return previous;
          }

          const firstActive =
            nextEvents.find((event) => !event.archived) || nextEvents[0];
          return firstActive.id;
        });
      }
    } catch (err: unknown) {
      toast({
        variant: "destructive",
        title: "Unable to load CRM events",
        description: toErrorMessage(err, "Please refresh and try again."),
      });
    } finally {
      setIsLoadingEvents(false);
    }
  }, [toast]);

  const loadSheetsStatus = useCallback(async () => {
    try {
      const response = await fetchBackend({
        endpoint: "/partnerships/google-sheets/status",
        method: "GET",
      });
      setSheetsStatus(response || null);
    } catch {
      setSheetsStatus(null);
    }
  }, []);

  const loadEmailSyncStatus = useCallback(async () => {
    try {
      const response = await fetchBackend({
        endpoint: "/partnerships/email/sync/status",
        method: "GET",
      });
      setEmailSyncStatus(response || null);
    } catch {
      setEmailSyncStatus(null);
    }
  }, []);

  const loadDashboard = useCallback(async () => {
    setIsLoadingDashboard(true);
    try {
      const query = new URLSearchParams();

      if (dashboardYearFilter !== "auto" && dashboardYearFilter !== "all") {
        query.set("year", dashboardYearFilter);
      }
      if (dashboardEventFilter !== "all") {
        query.set("eventId", dashboardEventFilter);
      }
      if (dashboardIncludeArchived) {
        query.set("includeArchived", "true");
      }
      if (dashboardWindowDays.trim()) {
        query.set("upcomingWindowDays", dashboardWindowDays.trim());
      }

      const endpoint = query.toString()
        ? `/partnerships/dashboard?${query.toString()}`
        : "/partnerships/dashboard";

      const response = await fetchBackend({
        endpoint,
        method: "GET",
      });
      setDashboard(response || null);
    } catch (err: unknown) {
      toast({
        variant: "destructive",
        title: "Unable to load dashboard",
        description: toErrorMessage(err, "Please refresh and try again."),
      });
      setDashboard(null);
    } finally {
      setIsLoadingDashboard(false);
    }
  }, [
    dashboardEventFilter,
    dashboardIncludeArchived,
    dashboardWindowDays,
    dashboardYearFilter,
    toast,
  ]);

  const loadPartners = useCallback(
    async (preferredPartnerId?: string | null) => {
      setIsLoadingDirectory(true);
      setError(null);

      try {
        const query = new URLSearchParams();
        if (search.trim()) query.set("search", search.trim());
        if (statusFilter !== "all") query.set("status", statusFilter);
        if (eventFilter !== "all") query.set("eventIdYear", eventFilter);
        if (packageTierFilter !== "all") query.set("tier", packageTierFilter);
        if (partnerTierFilter !== "all")
          query.set("partnerTier", partnerTierFilter);
        if (alumniFilter !== "all") {
          query.set("isAlumni", alumniFilter === "yes" ? "true" : "false");
        }
        if (tagFilter !== "all") query.set("tag", tagFilter);
        if (includeArchived) query.set("includeArchived", "true");

        const endpoint = query.toString()
          ? `/partnerships/partners?${query.toString()}`
          : "/partnerships/partners";

        const response = await fetchBackend({
          endpoint,
          method: "GET",
        });

        const nextPartners: PartnerSummary[] = response?.partners || [];
        const preferredId = preferredPartnerId ?? selectedPartnerIdRef.current;

        setPartners(nextPartners);
        setSummary(response?.summary || null);

        setAvailableStatuses((previous) =>
          normalizeStatusOptions([
            ...(Array.isArray(response?.statusOptions)
              ? response.statusOptions
              : []),
            ...previous,
          ]),
        );

        setAvailablePackageTiers((previous) =>
          normalizeTierOptions([
            ...previous,
            ...(Array.isArray(response?.packageTierOptions)
              ? response.packageTierOptions
              : []),
          ]),
        );

        setAvailablePartnerTiers((previous) =>
          normalizeTierOptions([
            ...previous,
            ...(Array.isArray(response?.partnerTierOptions)
              ? response.partnerTierOptions
              : []),
          ]),
        );

        if (!nextPartners.length) {
          setSelectedPartnerId(null);
          setPartnerDetail(null);
          return;
        }

        if (
          preferredId &&
          nextPartners.some((partner) => partner.id === preferredId)
        ) {
          setSelectedPartnerId(preferredId);
          return;
        }

        setSelectedPartnerId(nextPartners[0].id);
      } catch (err: unknown) {
        setError(toErrorMessage(err, "Unable to load partnerships directory."));
      } finally {
        setIsLoadingDirectory(false);
      }
    },
    [
      search,
      statusFilter,
      eventFilter,
      packageTierFilter,
      partnerTierFilter,
      alumniFilter,
      tagFilter,
      includeArchived,
    ],
  );

  const loadPartnerDetail = useCallback(
    async (partnerId: string) => {
      setIsLoadingPartnerDetail(true);
      try {
        const response = await fetchBackend({
          endpoint: `/partnerships/partners/${partnerId}`,
          method: "GET",
        });

        setPartnerDetail(response || null);

        setAvailableStatuses((previous) =>
          normalizeStatusOptions([
            ...(Array.isArray(response?.statusOptions)
              ? response.statusOptions
              : []),
            ...previous,
          ]),
        );

        setAvailablePackageTiers((previous) =>
          normalizeTierOptions([
            ...previous,
            ...(Array.isArray(response?.packageTierOptions)
              ? response.packageTierOptions
              : []),
          ]),
        );
      } catch (err: unknown) {
        toast({
          variant: "destructive",
          title: "Unable to load partner details",
          description: toErrorMessage(err, "Please refresh and try again."),
        });
        setPartnerDetail(null);
      } finally {
        setIsLoadingPartnerDetail(false);
      }
    },
    [toast],
  );

  const loadEventDetail = useCallback(
    async (eventId: string) => {
      if (!eventId) return;
      setIsLoadingEventDetail(true);

      try {
        const response = await fetchBackend({
          endpoint: `/partnerships/events/${eventId}`,
          method: "GET",
        });
        setEventDetail(response || null);
      } catch (err: unknown) {
        toast({
          variant: "destructive",
          title: "Unable to load event detail",
          description: toErrorMessage(err, "Please refresh and try again."),
        });
        setEventDetail(null);
      } finally {
        setIsLoadingEventDetail(false);
      }
    },
    [toast],
  );

  useEffect(() => {
    selectedPartnerIdRef.current = selectedPartnerId;
  }, [selectedPartnerId]);

  useEffect(() => {
    void Promise.all([
      loadEvents(),
      loadPartners(null),
      loadDashboard(),
      loadSheetsStatus(),
      loadEmailSyncStatus(),
    ]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const handle = setTimeout(() => {
      void loadDashboard();
    }, 200);

    return () => clearTimeout(handle);
  }, [
    dashboardYearFilter,
    dashboardEventFilter,
    dashboardWindowDays,
    dashboardIncludeArchived,
    loadDashboard,
  ]);

  useEffect(() => {
    const handle = setTimeout(() => {
      void loadPartners();
    }, 250);

    return () => clearTimeout(handle);
  }, [
    search,
    statusFilter,
    eventFilter,
    packageTierFilter,
    partnerTierFilter,
    alumniFilter,
    tagFilter,
    includeArchived,
    loadPartners,
  ]);

  useEffect(() => {
    if (!selectedPartnerId) return;
    void loadPartnerDetail(selectedPartnerId);
  }, [selectedPartnerId, loadPartnerDetail]);

  useEffect(() => {
    if (!selectedEventId) {
      setEventDetail(null);
      return;
    }

    void loadEventDetail(selectedEventId);
  }, [selectedEventId, loadEventDetail]);

  const runSheetsSync = useCallback(
    async (mode: "push" | "pull") => {
      setIsSyncingSheets(mode);

      try {
        const response = await fetchBackend({
          endpoint: "/partnerships/google-sheets/sync",
          method: "POST",
          data: { mode },
        });

        toast({
          title: `Google Sheets ${mode === "push" ? "push" : "pull"} complete`,
          description: response?.message || "Sync finished successfully.",
        });

        await Promise.all([
          loadPartners(selectedPartnerIdRef.current),
          loadEvents(),
          loadDashboard(),
          loadEmailSyncStatus(),
        ]);
        if (selectedPartnerIdRef.current) {
          await loadPartnerDetail(selectedPartnerIdRef.current);
        }
        if (selectedEventId) {
          await loadEventDetail(selectedEventId);
        }
        await loadSheetsStatus();
      } catch (err: unknown) {
        toast({
          variant: "destructive",
          title: "Google Sheets sync failed",
          description: toErrorMessage(
            err,
            "Please check configuration and retry.",
          ),
        });
      } finally {
        setIsSyncingSheets(null);
      }
    },
    [
      loadEventDetail,
      loadDashboard,
      loadEmailSyncStatus,
      loadEvents,
      loadPartnerDetail,
      loadPartners,
      loadSheetsStatus,
      selectedEventId,
      toast,
    ],
  );

  const refreshAll = useCallback(async () => {
    await Promise.all([
      loadPartners(selectedPartnerIdRef.current),
      loadEvents(),
      loadDashboard(),
      loadSheetsStatus(),
      loadEmailSyncStatus(),
    ]);

    if (selectedPartnerIdRef.current) {
      await loadPartnerDetail(selectedPartnerIdRef.current);
    }
    if (selectedEventId) {
      await loadEventDetail(selectedEventId);
    }
  }, [
    loadEventDetail,
    loadDashboard,
    loadEmailSyncStatus,
    loadEvents,
    loadPartnerDetail,
    loadPartners,
    loadSheetsStatus,
    selectedEventId,
  ]);

  const exportCsv = useCallback(async () => {
    setIsExporting(true);
    try {
      const response = await fetchBackend({
        endpoint: "/partnerships/export",
        method: "GET",
      });

      const rows: Record<string, unknown>[] = Array.isArray(response?.rows)
        ? response.rows
        : [];
      const csv = buildCsv(rows);
      const datePrefix = new Date().toISOString().slice(0, 10);
      downloadTextFile(
        `partnerships-${datePrefix}.csv`,
        "text/csv;charset=utf-8",
        csv,
      );

      toast({
        title: "Export ready",
        description: `Downloaded ${rows.length} row${rows.length === 1 ? "" : "s"}.`,
      });
    } catch (err: unknown) {
      toast({
        variant: "destructive",
        title: "Unable to export",
        description: toErrorMessage(err, "Please retry in a moment."),
      });
    } finally {
      setIsExporting(false);
    }
  }, [toast]);

  const selectPartner = useCallback(
    (partnerId: string) => {
      setSelectedPartnerId(partnerId);
      if (activeTab !== "partners") {
        setActiveTab("partners");
      }
    },
    [activeTab],
  );

  const openCreatePartnerModal = () => {
    setPartnerModalMode("create");
    setPartnerForm(defaultPartnerForm);
    setIsPartnerModalOpen(true);
  };

  const openEditPartnerModal = () => {
    if (!selectedPartner) return;
    setPartnerModalMode("edit");
    setPartnerForm({
      company: selectedPartner.company || "",
      contactName: selectedPartner.contactName || "",
      email: selectedPartner.email || "",
      phone: selectedPartner.phone || "",
      contactRole: selectedPartner.contactRole || "",
      tier: selectedPartner.tier || "",
      linkedin: selectedPartner.linkedin || "",
      tagsInput: (selectedPartner.tags || []).join(", "),
      notes: selectedPartner.notes || "",
      isAlumni: Boolean(selectedPartner.isAlumni),
    });
    setIsPartnerModalOpen(true);
  };

  const submitPartner = async () => {
    setIsSavingPartner(true);
    try {
      const payload = {
        company: partnerForm.company,
        contactName: partnerForm.contactName,
        email: partnerForm.email,
        phone: partnerForm.phone,
        contactRole: partnerForm.contactRole,
        tier: partnerForm.tier,
        linkedin: partnerForm.linkedin,
        notes: partnerForm.notes,
        tags: toTagList(partnerForm.tagsInput),
        isAlumni: partnerForm.isAlumni,
      };

      if (partnerModalMode === "create") {
        await fetchBackend({
          endpoint: "/partnerships/partners",
          method: "POST",
          data: payload,
        });

        toast({ title: "Partner added" });
      } else if (selectedPartnerId) {
        await fetchBackend({
          endpoint: `/partnerships/partners/${selectedPartnerId}`,
          method: "PATCH",
          data: payload,
        });
        toast({ title: "Partner updated" });
      }

      setIsPartnerModalOpen(false);
      await loadPartners(selectedPartnerIdRef.current);
      if (selectedPartnerIdRef.current) {
        await loadPartnerDetail(selectedPartnerIdRef.current);
      }
      await loadEvents();
      await loadDashboard();
    } catch (err: unknown) {
      toast({
        variant: "destructive",
        title: "Unable to save partner",
        description: toErrorMessage(err, "Please review the fields and retry."),
      });
    } finally {
      setIsSavingPartner(false);
    }
  };

  const toggleArchivePartner = async (target: PartnerSummary) => {
    try {
      await fetchBackend({
        endpoint: `/partnerships/partners/${target.id}`,
        method: "PATCH",
        data: {
          archived: !target.archived,
        },
      });

      toast({
        title: target.archived ? "Partner restored" : "Partner archived",
      });

      await loadPartners(target.id);
      if (target.id === selectedPartnerIdRef.current) {
        await loadPartnerDetail(target.id);
      }
      await loadDashboard();
    } catch (err: unknown) {
      toast({
        variant: "destructive",
        title: "Unable to update partner",
        description: toErrorMessage(err, "Please retry."),
      });
    }
  };

  const openCreateEventModal = () => {
    setEventModalMode("create");
    setEditingEventId(null);
    setEventForm(defaultEventForm);
    setIsEventModalOpen(true);
  };

  const openEditEventModal = (eventToEdit: EventOption) => {
    setEventModalMode("edit");
    setEditingEventId(eventToEdit.id);
    setEventForm({
      name: eventToEdit.name || "",
      year: String(eventToEdit.year || new Date().getFullYear()),
      startDate: eventToEdit.startDate || "",
      endDate: eventToEdit.endDate || "",
      outreachStartDate: eventToEdit.outreachStartDate || "",
      sponsorshipGoal:
        eventToEdit.sponsorshipGoal === null ||
        eventToEdit.sponsorshipGoal === undefined
          ? ""
          : String(eventToEdit.sponsorshipGoal),
      notes: eventToEdit.notes || "",
      archived: Boolean(eventToEdit.archived),
      tierRows:
        eventToEdit.tierConfigs && eventToEdit.tierConfigs.length
          ? eventToEdit.tierConfigs.map((tier) =>
              createTierRow(
                tier.label || toTierLabel(tier.id),
                tier.amount === null || tier.amount === undefined
                  ? ""
                  : String(tier.amount),
              ),
            )
          : [createTierRow()],
    });
    setIsEventModalOpen(true);
  };

  const updateTierRow = (
    localId: string,
    key: "label" | "amount",
    value: string,
  ) => {
    setEventForm((previous) => ({
      ...previous,
      tierRows: previous.tierRows.map((row) =>
        row.localId === localId ? { ...row, [key]: value } : row,
      ),
    }));
  };

  const addTierRow = () => {
    setEventForm((previous) => ({
      ...previous,
      tierRows: [...previous.tierRows, createTierRow()],
    }));
  };

  const removeTierRow = (localId: string) => {
    setEventForm((previous) => {
      const nextRows = previous.tierRows.filter(
        (row) => row.localId !== localId,
      );
      return {
        ...previous,
        tierRows: nextRows.length ? nextRows : [createTierRow()],
      };
    });
  };

  const submitEvent = async () => {
    setIsSavingEvent(true);
    try {
      const tierConfigs: TierConfig[] = [];
      const seenTierIds = new Set<string>();

      for (const row of eventForm.tierRows) {
        const label = row.label.trim();
        const amountText = row.amount.trim();

        if (!label && !amountText) continue;
        if (!label) {
          throw new Error(
            "Every tier row with an amount must include a tier name.",
          );
        }

        const id = slugifyTier(label);
        if (!id) {
          throw new Error(`Tier \"${label}\" is invalid.`);
        }

        if (seenTierIds.has(id)) {
          throw new Error(`Duplicate tier name \"${label}\".`);
        }
        seenTierIds.add(id);

        const amount = amountText === "" ? null : Number(amountText);
        if (amount !== null && (!Number.isFinite(amount) || amount < 0)) {
          throw new Error(
            `Tier \"${label}\" must have a valid non-negative amount.`,
          );
        }

        tierConfigs.push({
          id,
          label,
          amount,
        });
      }

      const payload = {
        name: eventForm.name,
        year: Number(eventForm.year),
        startDate: eventForm.startDate || null,
        endDate: eventForm.endDate || null,
        outreachStartDate: eventForm.outreachStartDate || null,
        sponsorshipGoal:
          eventForm.sponsorshipGoal.trim() === ""
            ? null
            : Number(eventForm.sponsorshipGoal),
        notes: eventForm.notes,
        archived: eventForm.archived,
        tierConfigs,
      };

      if (eventModalMode === "create") {
        await fetchBackend({
          endpoint: "/partnerships/events",
          method: "POST",
          data: payload,
        });
        toast({ title: "CRM event created" });
      } else if (editingEventId) {
        await fetchBackend({
          endpoint: `/partnerships/events/${editingEventId}`,
          method: "PATCH",
          data: payload,
        });
        toast({ title: "CRM event updated" });
      }

      setIsEventModalOpen(false);
      await loadEvents();
      await loadPartners(selectedPartnerIdRef.current);
      if (selectedPartnerIdRef.current) {
        await loadPartnerDetail(selectedPartnerIdRef.current);
      }
      if (selectedEventId) {
        await loadEventDetail(selectedEventId);
      }
      await loadDashboard();
    } catch (err: unknown) {
      toast({
        variant: "destructive",
        title: "Unable to save CRM event",
        description: toErrorMessage(
          err,
          "Please review event details and retry.",
        ),
      });
    } finally {
      setIsSavingEvent(false);
    }
  };

  const applyTierDefaultAmount = useCallback(
    (eventId: string, tierId: string) => {
      const eventRecord = events.find((item) => item.id === eventId);
      if (!eventRecord) return;

      const tier = (eventRecord.tierConfigs || []).find(
        (item) => item.id === tierId,
      );
      if (!tier) return;

      if (tier.amount === null || tier.amount === undefined) {
        setLinkForm((previous) => ({ ...previous, amount: "" }));
      } else {
        setLinkForm((previous) => ({
          ...previous,
          amount: String(tier.amount),
        }));
      }
    },
    [events],
  );

  const openCreateLinkModal = (options?: {
    partnerId?: string;
    eventId?: string;
  }) => {
    const defaultPartnerId = options?.partnerId || selectedPartnerId || "";
    const defaultEventId = options?.eventId || selectedEventId || "";

    setLinkModalMode("create");
    setEditingLinkId(null);
    setLinkForm({
      ...defaultLinkForm,
      partnerId: defaultPartnerId,
      eventId: defaultEventId,
    });
    setIsLinkModalOpen(true);
  };

  const openEditLinkModal = (link: PartnerLink, partnerIdOverride?: string) => {
    const currentEvent = events.find((event) => event.id === link.eventId);
    const tierExists = Boolean(
      currentEvent?.tierConfigs?.some((tier) => tier.id === link.packageTier),
    );

    const normalizedStatus = link.status?.trim() || "";
    const isKnown = statusSet.has(normalizedStatus);

    setLinkModalMode("edit");
    setEditingLinkId(link.id);
    setLinkForm({
      partnerId: partnerIdOverride || link.partnerId,
      eventId: link.eventId,
      status: isKnown ? normalizedStatus : CUSTOM_STATUS_VALUE,
      customStatus: isKnown ? "" : normalizedStatus,
      packageTier: tierExists ? link.packageTier : "",
      customTier: tierExists ? "" : link.packageTier || "",
      role: link.role || "",
      amount:
        link.amount === null || link.amount === undefined
          ? ""
          : String(link.amount),
      followUpDate: link.followUpDate || "",
      notes: link.notes || "",
    });
    setIsLinkModalOpen(true);
  };

  const submitLink = async () => {
    setIsSavingLink(true);

    try {
      const partnerId = linkForm.partnerId;
      if (!partnerId) {
        throw new Error("Please select a partner.");
      }

      const eventId = linkForm.eventId;
      if (!eventId) {
        throw new Error("Please select a CRM event.");
      }

      const resolvedStatus =
        linkForm.status === CUSTOM_STATUS_VALUE
          ? linkForm.customStatus.trim()
          : linkForm.status.trim();

      if (!resolvedStatus) {
        throw new Error("Please choose a status.");
      }

      const resolvedTier = linkForm.packageTier
        ? linkForm.packageTier
        : linkForm.customTier.trim();

      const payload: Record<string, unknown> = {
        status: resolvedStatus,
        eventId,
        role: linkForm.role,
        notes: linkForm.notes,
      };

      if (resolvedTier) {
        payload.packageTier = resolvedTier;
      }

      if (linkForm.amount.trim() !== "") {
        const amount = Number(linkForm.amount);
        if (!Number.isFinite(amount) || amount < 0) {
          throw new Error("Amount must be a non-negative number.");
        }
        payload.amount = amount;
      }

      if (linkForm.followUpDate.trim()) {
        payload.followUpDate = linkForm.followUpDate;
      }

      if (linkModalMode === "create") {
        await fetchBackend({
          endpoint: `/partnerships/partners/${partnerId}/events`,
          method: "POST",
          data: payload,
        });
        toast({ title: "Partner involvement added" });
      } else if (editingLinkId) {
        delete payload.eventId;
        await fetchBackend({
          endpoint: `/partnerships/partner-events/${editingLinkId}`,
          method: "PATCH",
          data: payload,
        });
        toast({ title: "Partner involvement updated" });
      }

      setIsLinkModalOpen(false);
      await loadPartners(partnerId);
      await loadEvents();
      await loadPartnerDetail(partnerId);
      if (selectedEventId) {
        await loadEventDetail(selectedEventId);
      }
      await loadDashboard();
    } catch (err: unknown) {
      toast({
        variant: "destructive",
        title: "Unable to save partner involvement",
        description: toErrorMessage(
          err,
          "Please check the form fields and retry.",
        ),
      });
    } finally {
      setIsSavingLink(false);
    }
  };

  const deleteLink = async (link: PartnerLink) => {
    const confirmed = window.confirm("Remove this partner involvement?");
    if (!confirmed) return;

    try {
      await fetchBackend({
        endpoint: `/partnerships/partner-events/${link.id}`,
        method: "DELETE",
      });

      toast({ title: "Involvement removed" });
      await loadPartners(link.partnerId);
      if (selectedPartnerIdRef.current === link.partnerId) {
        await loadPartnerDetail(link.partnerId);
      }
      await loadEvents();
      if (selectedEventId) {
        await loadEventDetail(selectedEventId);
      }
      await loadDashboard();
    } catch (err: unknown) {
      toast({
        variant: "destructive",
        title: "Unable to remove relationship",
        description: toErrorMessage(err, "Please retry."),
      });
    }
  };

  const openCreateDocumentModal = () => {
    if (!selectedPartnerId) return;
    setDocumentModalMode("create");
    setEditingDocumentId(null);
    setDocumentForm(defaultDocumentForm);
    setIsDocumentModalOpen(true);
  };

  const openEditDocumentModal = (document: PartnerDocument) => {
    setDocumentModalMode("edit");
    setEditingDocumentId(document.id);
    setDocumentForm({
      title: document.title || "",
      type: document.type || "general",
      status: document.status || "draft",
      url: document.url || "",
      fileName: document.fileName || "",
      eventId: document.eventId || "",
      notes: document.notes || "",
    });
    setIsDocumentModalOpen(true);
  };

  const submitDocument = async () => {
    if (!selectedPartnerId) return;

    setIsSavingDocument(true);
    try {
      const payload = {
        title: documentForm.title,
        type: documentForm.type,
        status: documentForm.status,
        url: documentForm.url,
        fileName: documentForm.fileName,
        eventId: documentForm.eventId || null,
        notes: documentForm.notes,
      };

      if (documentModalMode === "create") {
        await fetchBackend({
          endpoint: `/partnerships/partners/${selectedPartnerId}/documents`,
          method: "POST",
          data: payload,
        });
        toast({ title: "Document linked" });
      } else if (editingDocumentId) {
        await fetchBackend({
          endpoint: `/partnerships/partner-documents/${editingDocumentId}`,
          method: "PATCH",
          data: payload,
        });
        toast({ title: "Document updated" });
      }

      setIsDocumentModalOpen(false);
      await loadPartnerDetail(selectedPartnerId);
      await loadDashboard();
    } catch (err: unknown) {
      toast({
        variant: "destructive",
        title: "Unable to save document",
        description: toErrorMessage(err, "Please review the fields and retry."),
      });
    } finally {
      setIsSavingDocument(false);
    }
  };

  const deleteDocument = async (documentId: string) => {
    const confirmed = window.confirm("Remove this document link?");
    if (!confirmed) return;
    if (!selectedPartnerId) return;

    try {
      await fetchBackend({
        endpoint: `/partnerships/partner-documents/${documentId}`,
        method: "DELETE",
      });
      toast({ title: "Document removed" });
      await loadPartnerDetail(selectedPartnerId);
      await loadDashboard();
    } catch (err: unknown) {
      toast({
        variant: "destructive",
        title: "Unable to remove document",
        description: toErrorMessage(err, "Please retry."),
      });
    }
  };

  const openCreateCommunicationModal = () => {
    if (!selectedPartnerId) return;
    setCommunicationModalMode("create");
    setEditingCommunicationId(null);
    setCommunicationForm(defaultCommunicationForm);
    setIsCommunicationModalOpen(true);
  };

  const openEditCommunicationModal = (communication: PartnerCommunication) => {
    setCommunicationModalMode("edit");
    setEditingCommunicationId(communication.id);
    setCommunicationForm({
      subject: communication.subject || "",
      summary: communication.summary || "",
      channel: communication.channel || "email",
      direction: communication.direction === "inbound" ? "inbound" : "outbound",
      occurredAtLocal: toLocalDateTimeInput(communication.occurredAt),
      followUpDate: communication.followUpDate || "",
      eventId: communication.eventId || "",
    });
    setIsCommunicationModalOpen(true);
  };

  const submitCommunication = async () => {
    if (!selectedPartnerId) return;

    setIsSavingCommunication(true);
    try {
      const payload = {
        subject: communicationForm.subject,
        summary: communicationForm.summary,
        channel: communicationForm.channel,
        direction: communicationForm.direction,
        occurredAt: communicationForm.occurredAtLocal
          ? new Date(communicationForm.occurredAtLocal).toISOString()
          : new Date().toISOString(),
        followUpDate: communicationForm.followUpDate || null,
        eventId: communicationForm.eventId || null,
      };

      if (communicationModalMode === "create") {
        await fetchBackend({
          endpoint: `/partnerships/partners/${selectedPartnerId}/communications`,
          method: "POST",
          data: payload,
        });
        toast({ title: "Communication logged" });
      } else if (editingCommunicationId) {
        await fetchBackend({
          endpoint: `/partnerships/partner-communications/${editingCommunicationId}`,
          method: "PATCH",
          data: payload,
        });
        toast({ title: "Communication updated" });
      }

      setIsCommunicationModalOpen(false);
      await loadPartnerDetail(selectedPartnerId);
      await loadDashboard();
    } catch (err: unknown) {
      toast({
        variant: "destructive",
        title: "Unable to save communication",
        description: toErrorMessage(err, "Please review the fields and retry."),
      });
    } finally {
      setIsSavingCommunication(false);
    }
  };

  const deleteCommunication = async (communicationId: string) => {
    const confirmed = window.confirm("Remove this communication entry?");
    if (!confirmed) return;
    if (!selectedPartnerId) return;

    try {
      await fetchBackend({
        endpoint: `/partnerships/partner-communications/${communicationId}`,
        method: "DELETE",
      });

      toast({ title: "Communication removed" });
      await loadPartnerDetail(selectedPartnerId);
      await loadDashboard();
    } catch (err: unknown) {
      toast({
        variant: "destructive",
        title: "Unable to remove communication",
        description: toErrorMessage(err, "Please retry."),
      });
    }
  };

  const toggleArchiveEvent = async (targetEvent: EventOption) => {
    try {
      await fetchBackend({
        endpoint: `/partnerships/events/${targetEvent.id}`,
        method: "PATCH",
        data: { archived: !targetEvent.archived },
      });

      toast({
        title: targetEvent.archived ? "Event restored" : "Event archived",
      });

      await loadEvents();
      if (selectedEventId) {
        await loadEventDetail(selectedEventId);
      }
      await loadPartners(selectedPartnerIdRef.current);
      await loadDashboard();
    } catch (err: unknown) {
      toast({
        variant: "destructive",
        title: "Unable to update event",
        description: toErrorMessage(err, "Please retry."),
      });
    }
  };

  const statusFilterOptions = useMemo(
    () => [
      { value: "all", label: "All statuses" },
      ...availableStatuses.map((value) => ({
        value,
        label: toStatusLabel(value),
      })),
    ],
    [availableStatuses],
  );

  const partnerLinkStatusOptions = useMemo(
    () => [
      ...availableStatuses.map((value) => ({
        value,
        label: toStatusLabel(value),
      })),
      { value: CUSTOM_STATUS_VALUE, label: "Other / Custom" },
    ],
    [availableStatuses],
  );

  const linkStatusSelectValue = useMemo(() => {
    if (linkForm.status === CUSTOM_STATUS_VALUE) return CUSTOM_STATUS_VALUE;
    if (statusSet.has(linkForm.status)) return linkForm.status;
    if (linkForm.customStatus.trim()) return CUSTOM_STATUS_VALUE;
    return "reached_out";
  }, [linkForm.customStatus, linkForm.status, statusSet]);

  const eventFilterOptions = useMemo(() => {
    return [
      { value: "all", label: "All events" },
      ...events.map((event) => ({
        value: `${event.id}#${event.year}`,
        label: `${event.name} (${event.year})`,
      })),
    ];
  }, [events]);

  const partnerNameMap = useMemo(() => {
    const map = new Map<string, PartnerSummary>();
    for (const partner of partners) {
      map.set(partner.id, partner);
    }
    return map;
  }, [partners]);

  return (
    <>
      <Head>
        <title>Partnerships CRM | BizTech Admin</title>
      </Head>

      <main className="min-h-screen bg-bt-blue-600 text-white">
        <div className="mx-auto w-full max-w-[1700px] space-y-6 px-2 py-3 sm:px-4 sm:py-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
                Partnerships CRM
              </h1>
              <p className="mt-1 text-sm text-bt-blue-100 sm:text-base">
                Partners, events, docs, and follow-ups in one workspace.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Button
                variant="outline"
                onClick={() => void refreshAll()}
                className="border-bt-blue-300/40 bg-bt-blue-500/40 text-white hover:bg-bt-blue-500/60"
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Refresh
              </Button>
              <Button
                variant="outline"
                onClick={() => void exportCsv()}
                disabled={isExporting}
                className="border-bt-blue-300/40 bg-bt-blue-500/40 text-white hover:bg-bt-blue-500/60"
              >
                {isExporting ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Download className="mr-2 h-4 w-4" />
                )}
                Export CSV
              </Button>
            </div>
          </div>

          {error ? (
            <Alert className="border-bt-red-200/40 bg-bt-red-200/10 text-bt-red-100">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Unable to load data</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          ) : null}

          <Tabs
            value={activeTab}
            onValueChange={(value) =>
              setActiveTab(
                value as "overview" | "partners" | "events" | "emails",
              )
            }
            className="space-y-6"
          >
            <div className="flex w-full flex-row items-end">
              <div className="relative flex w-full flex-wrap border-b border-bt-blue-300 md:w-fit md:flex-nowrap">
                {(["overview", "partners", "events", "emails"] as const).map(
                  (tab) => {
                    const labels = {
                      overview: "Overview",
                      partners: "Partners",
                      events: "Events",
                      emails: "Emails",
                    } as const;
                    return (
                      <button
                        key={tab}
                        type="button"
                        onClick={() => setActiveTab(tab)}
                        className={`relative flex-1 whitespace-nowrap px-3 py-2.5 text-center text-sm transition-colors duration-200 ease-in-out md:flex-none md:px-5 md:py-3 md:text-base ${
                          activeTab === tab
                            ? "text-bt-green-300"
                            : "text-bt-blue-300 hover:text-bt-blue-200"
                        }`}
                      >
                        {labels[tab]}
                        {activeTab === tab && (
                          <motion.div
                            layoutId="crm-main-tab"
                            className="absolute bottom-0 left-0 right-0 h-0.5 bg-bt-green-300"
                            transition={{
                              type: "spring",
                              stiffness: 300,
                              damping: 20,
                            }}
                          />
                        )}
                      </button>
                    );
                  },
                )}
              </div>
              <div className="relative hidden flex-1 border-b border-bt-blue-300 md:flex" />
            </div>

            <TabsContent value="overview" className="space-y-4">
              <PartnershipsOverviewTab
                isLoadingDashboard={isLoadingDashboard}
                dashboard={dashboard}
                dashboardYearFilter={dashboardYearFilter}
                onDashboardYearFilterChange={setDashboardYearFilter}
                dashboardEventFilter={dashboardEventFilter}
                onDashboardEventFilterChange={setDashboardEventFilter}
                dashboardWindowDays={dashboardWindowDays}
                onDashboardWindowDaysChange={setDashboardWindowDays}
                dashboardIncludeArchived={dashboardIncludeArchived}
                onDashboardIncludeArchivedChange={setDashboardIncludeArchived}
                dashboardYearOptions={dashboardYearOptions}
                dashboardEventOptions={dashboardEventOptions}
                dashboardPipelineRows={dashboardPipelineRows}
                dashboardEventRows={dashboardEventRows}
                dashboardActionItems={dashboardActionItems}
                onReloadDashboard={() => void loadDashboard()}
                onSelectPartner={selectPartner}
                onOpenEvent={(eventId) => {
                  setSelectedEventId(eventId);
                  setActiveTab("events");
                }}
                sheetsStatus={sheetsStatus}
                isSyncingSheets={isSyncingSheets}
                onRunSheetsSync={(mode) => void runSheetsSync(mode)}
                emailSyncStatus={emailSyncStatus}
                onOpenEmailTab={() => setActiveTab("emails")}
                formatCurrency={formatCurrency}
                formatPercent={formatPercent}
                formatIsoTimestamp={formatIsoTimestamp}
                formatNumber={(value) => numberFormatter.format(value)}
              />
            </TabsContent>

            <TabsContent value="partners" className="space-y-4">
              <Card className="border-bt-blue-300/30 bg-bt-blue-500/40">
                <CardContent className="space-y-3 p-4">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <h2 className="text-sm font-semibold text-white sm:text-base">
                        Partner Directory
                      </h2>
                      <p className="text-xs text-bt-blue-100">
                        Search and filter industry contacts across all CRM
                        events.
                      </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={openCreatePartnerModal}
                        className="border-bt-blue-300/40 bg-bt-blue-500/40 text-white hover:bg-bt-blue-500/60"
                      >
                        <Plus className="mr-2 h-4 w-4" />
                        Add Partner
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openCreateLinkModal()}
                        className="border-bt-blue-300/40 bg-bt-blue-500/40 text-white hover:bg-bt-blue-500/60"
                      >
                        <Handshake className="mr-2 h-4 w-4" />
                        Link Partner
                      </Button>
                    </div>
                  </div>

                  <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_repeat(3,minmax(0,180px))]">
                    <div className="relative">
                      <Search className="pointer-events-none absolute left-2.5 top-2.5 h-4 w-4 text-bt-blue-100" />
                      <Input
                        value={search}
                        onChange={(event) => setSearch(event.target.value)}
                        placeholder="Search by contact, company, email, notes"
                        className="border-bt-blue-300/40 bg-bt-blue-600/40 pl-8 text-white placeholder:text-bt-blue-100"
                      />
                    </div>

                    <Select
                      value={statusFilter}
                      onValueChange={setStatusFilter}
                    >
                      <SelectTrigger className="border-bt-blue-300/40 bg-bt-blue-600/40 text-white">
                        <SelectValue placeholder="Status" />
                      </SelectTrigger>
                      <SelectContent>
                        {statusFilterOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    <Select value={eventFilter} onValueChange={setEventFilter}>
                      <SelectTrigger className="border-bt-blue-300/40 bg-bt-blue-600/40 text-white">
                        <SelectValue placeholder="Event" />
                      </SelectTrigger>
                      <SelectContent>
                        {eventFilterOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    <Select
                      value={packageTierFilter}
                      onValueChange={setPackageTierFilter}
                    >
                      <SelectTrigger className="border-bt-blue-300/40 bg-bt-blue-600/40 text-white">
                        <SelectValue placeholder="Package tier" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All package tiers</SelectItem>
                        {availablePackageTiers.map((tier) => (
                          <SelectItem key={tier} value={tier}>
                            {toTierLabel(tier)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-bt-blue-100 hover:bg-bt-blue-500/40 hover:text-white"
                        onClick={() =>
                          setShowAdvancedFilters((previous) => !previous)
                        }
                      >
                        {showAdvancedFilters ? "Hide" : "Show"} advanced filters
                      </Button>
                      {hasActiveFilters ? (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-bt-blue-100 hover:bg-bt-blue-500/40 hover:text-white"
                          onClick={clearAllFilters}
                        >
                          <FilterX className="mr-1.5 h-3.5 w-3.5" />
                          Clear
                        </Button>
                      ) : null}
                    </div>
                  </div>

                  {showAdvancedFilters ? (
                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                      <Select
                        value={partnerTierFilter}
                        onValueChange={setPartnerTierFilter}
                      >
                        <SelectTrigger className="border-bt-blue-300/40 bg-bt-blue-600/40 text-white">
                          <SelectValue placeholder="Partner tier" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All partner tiers</SelectItem>
                          {availablePartnerTiers.map((tier) => (
                            <SelectItem key={tier} value={tier}>
                              {toTierLabel(tier)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>

                      <Select
                        value={alumniFilter}
                        onValueChange={setAlumniFilter}
                      >
                        <SelectTrigger className="border-bt-blue-300/40 bg-bt-blue-600/40 text-white">
                          <SelectValue placeholder="Alumni" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All partners</SelectItem>
                          <SelectItem value="yes">Alumni only</SelectItem>
                          <SelectItem value="no">Non-alumni only</SelectItem>
                        </SelectContent>
                      </Select>

                      <Select value={tagFilter} onValueChange={setTagFilter}>
                        <SelectTrigger className="border-bt-blue-300/40 bg-bt-blue-600/40 text-white">
                          <SelectValue placeholder="Tag" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All tags</SelectItem>
                          {tagOptions.map((tag) => (
                            <SelectItem key={tag} value={tag}>
                              {tag}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>

                      <label className="flex items-center gap-2 rounded-md border border-bt-blue-300/30 bg-bt-blue-600/30 px-3 text-sm text-bt-blue-100">
                        <Checkbox
                          checked={includeArchived}
                          onCheckedChange={(checked) =>
                            setIncludeArchived(Boolean(checked))
                          }
                          className="border-bt-blue-200"
                        />
                        Include archived
                      </label>
                    </div>
                  ) : null}
                </CardContent>
              </Card>

              <div className="grid gap-4 xl:grid-cols-[minmax(0,1.25fr)_minmax(380px,1fr)]">
                <Card className="border-bt-blue-300/30 bg-bt-blue-500/40">
                  <CardContent className="p-0">
                    <div className="border-b border-bt-blue-300/20 px-4 py-3">
                      <h2 className="text-sm font-semibold text-white sm:text-base">
                        Directory Results
                      </h2>
                      <p className="text-xs text-bt-blue-100">
                        {numberFormatter.format(partners.length)} partner
                        {partners.length === 1 ? "" : "s"} in view
                      </p>
                    </div>

                    {isLoadingDirectory ? (
                      <div className="space-y-2 p-4">
                        <Skeleton className="h-10 w-full bg-bt-blue-300/20" />
                        <Skeleton className="h-10 w-full bg-bt-blue-300/20" />
                        <Skeleton className="h-10 w-full bg-bt-blue-300/20" />
                      </div>
                    ) : !partners.length ? (
                      <div className="p-4 text-sm text-bt-blue-100">
                        No partners found for the selected filters.
                      </div>
                    ) : (
                      <>
                        <div className="hidden md:block">
                          <Table>
                            <TableHeader>
                              <TableRow className="border-bt-blue-300/20 hover:bg-transparent">
                                <TableHead className="text-bt-blue-100">
                                  Contact
                                </TableHead>
                                <TableHead className="text-bt-blue-100">
                                  Status
                                </TableHead>
                                <TableHead className="text-right text-bt-blue-100">
                                  Pipeline
                                </TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {partners.map((partner) => {
                                const contactName = getContactDisplayName(
                                  partner.contactName,
                                );
                                return (
                                  <TableRow
                                    key={partner.id}
                                    className={cn(
                                      "cursor-pointer border-bt-blue-300/20 hover:bg-bt-blue-500/40",
                                      selectedPartnerId === partner.id &&
                                        "bg-bt-blue-500/50 hover:bg-bt-blue-500/50",
                                    )}
                                    onClick={() => selectPartner(partner.id)}
                                  >
                                    <TableCell>
                                      <div className="flex items-center gap-3">
                                        <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-bt-blue-300/30 text-xs font-semibold text-white">
                                          {getInitials(contactName)}
                                        </span>
                                        <div className="min-w-0">
                                          <p className="truncate text-sm font-semibold text-white">
                                            {contactName}
                                          </p>
                                          <p className="truncate text-xs text-bt-blue-100">
                                            {partner.company ||
                                              "Unknown company"}
                                          </p>
                                        </div>
                                      </div>
                                    </TableCell>
                                    <TableCell>
                                      <div className="space-y-1">
                                        {partner.latestStatus ? (
                                          <StatusChip
                                            status={partner.latestStatus}
                                          />
                                        ) : (
                                          <span className="text-[11px] text-bt-blue-100">
                                            No statuses yet
                                          </span>
                                        )}
                                        <p className="text-[11px] text-bt-blue-100">
                                          {isEventScopedPartnerView
                                            ? `Filtered by ${selectedEventFilterLabel}`
                                            : `${partner.relationshipCount} total involvements`}
                                        </p>
                                      </div>
                                    </TableCell>
                                    <TableCell className="text-right">
                                      <p className="text-sm font-medium text-white">
                                        {formatCurrency(partner.totalAmount)}
                                      </p>
                                      <p className="text-xs text-bt-blue-100">
                                        {partner.relationshipCount} deals
                                      </p>
                                    </TableCell>
                                  </TableRow>
                                );
                              })}
                            </TableBody>
                          </Table>
                        </div>

                        <div className="grid gap-2 p-3 md:hidden">
                          {partners.map((partner) => {
                            const contactName = getContactDisplayName(
                              partner.contactName,
                            );

                            return (
                              <button
                                key={partner.id}
                                type="button"
                                onClick={() => selectPartner(partner.id)}
                                className={cn(
                                  "rounded-md border border-bt-blue-300/20 bg-bt-blue-600/30 p-3 text-left transition hover:bg-bt-blue-500/40",
                                  selectedPartnerId === partner.id &&
                                    "bg-bt-blue-500/50 hover:bg-bt-blue-500/50",
                                )}
                              >
                                <div className="flex items-start justify-between gap-2">
                                  <div className="min-w-0">
                                    <p className="truncate text-sm font-semibold text-white">
                                      {contactName}
                                    </p>
                                    <p className="truncate text-xs text-bt-blue-100">
                                      {partner.company || "Unknown company"}
                                    </p>
                                  </div>
                                  {partner.latestStatus ? (
                                    <StatusChip status={partner.latestStatus} />
                                  ) : (
                                    <span className="text-[11px] text-bt-blue-100">
                                      No status
                                    </span>
                                  )}
                                </div>
                                <div className="mt-2 flex items-center justify-between text-xs">
                                  <span className="flex items-center gap-1 text-bt-blue-100">
                                    {isEventScopedPartnerView
                                      ? `Filtered by ${selectedEventFilterLabel}`
                                      : `${partner.relationshipCount} total involvements`}
                                  </span>
                                  <span className="font-medium text-white">
                                    {formatCurrency(partner.totalAmount)}
                                  </span>
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      </>
                    )}
                  </CardContent>
                </Card>

                <Card
                  ref={detailPanelRef}
                  className="border-bt-blue-300/30 bg-bt-blue-500/40"
                >
                  <CardContent className="space-y-4 p-4">
                    {!selectedPartner ? (
                      <div className="flex flex-col items-center justify-center gap-3 rounded-md border border-dashed border-bt-blue-300/30 bg-bt-blue-600/20 py-12 text-center">
                        <UserRound className="h-8 w-8 text-bt-blue-100/50" />
                        <div>
                          <p className="text-sm font-medium text-bt-blue-100">
                            No partner selected
                          </p>
                          <p className="mt-1 text-xs text-bt-blue-100">
                            Select a partner from the directory to view their
                            event involvement history, documents, and
                            communication log.
                          </p>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="flex flex-wrap items-start justify-between gap-3">
                          <div className="min-w-0">
                            <p className="text-xs uppercase tracking-wide text-bt-blue-100">
                              Partner Detail
                            </p>
                            <h3 className="truncate text-lg font-semibold text-white">
                              {getContactDisplayName(
                                selectedPartner.contactName,
                              )}
                            </h3>
                            <p className="truncate text-sm text-bt-blue-100">
                              {selectedPartner.company}
                            </p>
                            <div className="mt-2 flex flex-wrap gap-2">
                              {selectedPartnerStatusSummary.visible.map(
                                (entry) => (
                                  <span
                                    key={`${selectedPartner.id}-detail-${entry.status}`}
                                    className="inline-flex items-center gap-1 rounded-full border border-bt-blue-300/35 bg-bt-blue-600/45 px-2 py-0.5 text-[11px] font-medium text-bt-blue-100"
                                  >
                                    <span>{toStatusLabel(entry.status)}</span>
                                    <span className="rounded-full bg-bt-blue-300/30 px-1.5 py-0 text-[10px] text-white">
                                      {entry.count}
                                    </span>
                                  </span>
                                ),
                              )}
                              {selectedPartnerStatusSummary.hiddenCount > 0 ? (
                                <span className="inline-flex items-center rounded-full border border-bt-blue-300/35 bg-bt-blue-600/45 px-2 py-0.5 text-[11px] font-medium text-bt-blue-100">
                                  +{selectedPartnerStatusSummary.hiddenCount}{" "}
                                  more
                                </span>
                              ) : null}
                              {selectedPartner.isAlumni ? (
                                <span className="inline-flex items-center rounded-full border border-bt-green-300/40 bg-bt-green-300/15 px-2 py-0.5 text-[11px] font-medium text-bt-green-200">
                                  Alumni
                                </span>
                              ) : null}
                              {selectedPartner.archived ? (
                                <span className="inline-flex items-center rounded-full border border-bt-red-200/40 bg-bt-red-200/15 px-2 py-0.5 text-[11px] font-medium text-bt-red-100">
                                  Archived
                                </span>
                              ) : null}
                            </div>
                            {selectedPartner.email ||
                            selectedPartner.phone ||
                            selectedPartner.linkedin ? (
                              <div className="mt-2 flex flex-wrap items-center gap-3">
                                {selectedPartner.email ? (
                                  <a
                                    href={`mailto:${selectedPartner.email}`}
                                    className="inline-flex items-center gap-1.5 text-xs text-bt-blue-100 hover:text-white"
                                  >
                                    <Mail className="h-3 w-3" />
                                    {selectedPartner.email}
                                  </a>
                                ) : null}
                                {selectedPartner.phone ? (
                                  <span className="text-xs text-bt-blue-100">
                                    {selectedPartner.phone}
                                  </span>
                                ) : null}
                                {selectedPartner.linkedin ? (
                                  <a
                                    href={selectedPartner.linkedin}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="inline-flex items-center gap-1.5 text-xs text-bt-blue-100 hover:text-white"
                                  >
                                    <ExternalLink className="h-3 w-3" />
                                    LinkedIn
                                  </a>
                                ) : null}
                              </div>
                            ) : null}
                          </div>

                          <div className="flex flex-wrap gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              className="border-bt-blue-300/40 bg-bt-blue-500/40 text-white hover:bg-bt-blue-500/60"
                              onClick={openEditPartnerModal}
                            >
                              <Pencil className="mr-2 h-4 w-4" />
                              Edit
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="border-bt-blue-300/40 bg-bt-blue-500/40 text-white hover:bg-bt-blue-500/60"
                              onClick={() =>
                                void toggleArchivePartner(selectedPartner)
                              }
                            >
                              <Archive className="mr-2 h-4 w-4" />
                              {selectedPartner.archived ? "Restore" : "Archive"}
                            </Button>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                          <div className="rounded-md border border-bt-blue-300/25 bg-bt-blue-600/25 p-3">
                            <p className="text-[11px] uppercase tracking-wide text-bt-blue-100">
                              Relationships
                            </p>
                            <p className="mt-1 text-base font-semibold text-white">
                              {numberFormatter.format(
                                selectedPartner.relationshipCount || 0,
                              )}
                            </p>
                          </div>
                          <div className="rounded-md border border-bt-blue-300/25 bg-bt-blue-600/25 p-3">
                            <p className="text-[11px] uppercase tracking-wide text-bt-blue-100">
                              Confirmed
                            </p>
                            <p className="mt-1 text-base font-semibold text-white">
                              {numberFormatter.format(
                                selectedPartner.confirmedCount || 0,
                              )}
                            </p>
                          </div>
                          <div className="rounded-md border border-bt-blue-300/25 bg-bt-blue-600/25 p-3">
                            <p className="text-[11px] uppercase tracking-wide text-bt-blue-100">
                              Paid
                            </p>
                            <p className="mt-1 text-base font-semibold text-white">
                              {numberFormatter.format(
                                selectedPartner.paidCount || 0,
                              )}
                            </p>
                          </div>
                          <div className="rounded-md border border-bt-blue-300/25 bg-bt-blue-600/25 p-3">
                            <p className="text-[11px] uppercase tracking-wide text-bt-blue-100">
                              Pipeline Value
                            </p>
                            <p className="mt-1 text-base font-semibold text-white">
                              {formatCurrency(selectedPartner.totalAmount || 0)}
                            </p>
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-2">
                          <Button
                            size="sm"
                            className="bg-bt-green-300 text-bt-blue-700 hover:bg-bt-green-200"
                            onClick={() =>
                              openCreateLinkModal({
                                partnerId: selectedPartner.id,
                              })
                            }
                          >
                            <Handshake className="mr-2 h-4 w-4" />
                            Add Event Involvement
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-bt-blue-300/40 bg-bt-blue-500/40 text-white hover:bg-bt-blue-500/60"
                            onClick={openCreateDocumentModal}
                          >
                            <FileText className="mr-2 h-4 w-4" />
                            Add Document
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-bt-blue-300/40 bg-bt-blue-500/40 text-white hover:bg-bt-blue-500/60"
                            onClick={openCreateCommunicationModal}
                          >
                            <MessageSquare className="mr-2 h-4 w-4" />
                            Log Communication
                          </Button>
                        </div>

                        <Tabs
                          value={partnerPanelTab}
                          onValueChange={(value) =>
                            setPartnerPanelTab(
                              value as
                                | "sponsorships"
                                | "documents"
                                | "communications",
                            )
                          }
                          className="space-y-4"
                        >
                          <div className="flex w-full flex-row items-end">
                            <div className="relative flex w-full flex-wrap border-b border-bt-blue-300 md:flex-nowrap">
                              {(
                                [
                                  "sponsorships",
                                  "documents",
                                  "communications",
                                ] as const
                              ).map((tab) => {
                                const labels = {
                                  sponsorships: "Event Involvements",
                                  documents: "Documents",
                                  communications: "Comms",
                                } as const;
                                return (
                                  <button
                                    key={tab}
                                    type="button"
                                    onClick={() => setPartnerPanelTab(tab)}
                                    className={`relative flex-1 whitespace-nowrap px-2 py-2 text-center text-xs transition-colors duration-200 ease-in-out md:flex-none md:px-3 md:py-2.5 md:text-sm ${
                                      partnerPanelTab === tab
                                        ? "text-bt-green-300"
                                        : "text-bt-blue-300 hover:text-bt-blue-200"
                                    }`}
                                  >
                                    {labels[tab]}
                                    {partnerPanelTab === tab && (
                                      <motion.div
                                        layoutId="crm-panel-tab"
                                        className="absolute bottom-0 left-0 right-0 h-0.5 bg-bt-green-300"
                                        transition={{
                                          type: "spring",
                                          stiffness: 300,
                                          damping: 20,
                                        }}
                                      />
                                    )}
                                  </button>
                                );
                              })}
                            </div>
                          </div>

                          <TabsContent
                            value="sponsorships"
                            className="space-y-2"
                          >
                            {isLoadingPartnerDetail ? (
                              <div className="space-y-2">
                                <Skeleton className="h-12 w-full bg-bt-blue-300/20" />
                                <Skeleton className="h-12 w-full bg-bt-blue-300/20" />
                              </div>
                            ) : partnerDetail?.links?.length ? (
                              <>
                                <div className="hidden lg:block">
                                  <Table>
                                    <TableHeader>
                                      <TableRow className="border-bt-blue-300/20 hover:bg-transparent">
                                        <TableHead className="text-bt-blue-100">
                                          Event
                                        </TableHead>
                                        <TableHead className="text-bt-blue-100">
                                          Status
                                        </TableHead>
                                        <TableHead className="text-bt-blue-100">
                                          Involvement
                                        </TableHead>
                                        <TableHead className="text-bt-blue-100">
                                          Tier
                                        </TableHead>
                                        <TableHead className="text-right text-bt-blue-100">
                                          Amount
                                        </TableHead>
                                        <TableHead className="text-right text-bt-blue-100">
                                          Actions
                                        </TableHead>
                                      </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                      {partnerDetail.links.map((link) => (
                                        <TableRow
                                          key={link.id}
                                          className="border-bt-blue-300/20 hover:bg-bt-blue-500/30"
                                        >
                                          <TableCell>
                                            <div>
                                              <p className="text-sm font-medium text-white">
                                                {link.eventName}
                                              </p>
                                              <p className="text-xs text-bt-blue-100">
                                                Follow up:{" "}
                                                {formatDate(link.followUpDate)}
                                              </p>
                                            </div>
                                          </TableCell>
                                          <TableCell>
                                            <StatusChip status={link.status} />
                                          </TableCell>
                                          <TableCell>
                                            <p className="text-xs text-white">
                                              {link.role || "-"}
                                            </p>
                                          </TableCell>
                                          <TableCell>
                                            <p className="text-xs text-white">
                                              {link.packageTier
                                                ? toTierLabel(link.packageTier)
                                                : "-"}
                                            </p>
                                          </TableCell>
                                          <TableCell className="text-right text-sm text-white">
                                            {formatCurrency(link.amount)}
                                          </TableCell>
                                          <TableCell>
                                            <div className="flex justify-end gap-1">
                                              <Button
                                                size="icon"
                                                variant="ghost"
                                                className="h-7 w-7 text-bt-blue-100 hover:bg-bt-blue-500/50 hover:text-white"
                                                onClick={() =>
                                                  openEditLinkModal(
                                                    link,
                                                    selectedPartner.id,
                                                  )
                                                }
                                              >
                                                <Pencil className="h-3.5 w-3.5" />
                                              </Button>
                                              <Button
                                                size="icon"
                                                variant="ghost"
                                                className="h-7 w-7 text-bt-red-100 hover:bg-bt-red-300/20 hover:text-bt-red-100"
                                                onClick={() =>
                                                  void deleteLink(link)
                                                }
                                              >
                                                <Trash2 className="h-3.5 w-3.5" />
                                              </Button>
                                            </div>
                                          </TableCell>
                                        </TableRow>
                                      ))}
                                    </TableBody>
                                  </Table>
                                </div>

                                <div className="grid gap-2 lg:hidden">
                                  {partnerDetail.links.map((link) => (
                                    <div
                                      key={link.id}
                                      className="rounded-md border border-bt-blue-300/20 bg-bt-blue-600/30 p-3"
                                    >
                                      <div className="flex items-start justify-between gap-2">
                                        <div className="min-w-0">
                                          <p className="truncate text-sm font-medium text-white">
                                            {link.eventName}
                                          </p>
                                          <p className="text-xs text-bt-blue-100">
                                            {link.packageTier
                                              ? toTierLabel(link.packageTier)
                                              : "No tier"}
                                          </p>
                                        </div>
                                        <StatusChip status={link.status} />
                                      </div>
                                      <div className="mt-2 flex items-center justify-between text-xs">
                                        <span className="text-bt-blue-100">
                                          {link.role || "No involvement type"}
                                        </span>
                                        <span className="text-bt-blue-100">
                                          Follow up:{" "}
                                          {formatDate(link.followUpDate)}
                                        </span>
                                      </div>
                                      <div className="mt-1 flex items-center justify-between text-xs">
                                        <span className="text-bt-blue-100">
                                          {link.packageTier
                                            ? toTierLabel(link.packageTier)
                                            : "No tier"}
                                        </span>
                                        <span className="font-medium text-white">
                                          {formatCurrency(link.amount)}
                                        </span>
                                      </div>
                                      <div className="mt-2 flex justify-end gap-2">
                                        <Button
                                          size="sm"
                                          variant="outline"
                                          className="h-7 border-bt-blue-300/40 bg-bt-blue-500/40 px-2 text-xs text-white hover:bg-bt-blue-500/60"
                                          onClick={() =>
                                            openEditLinkModal(
                                              link,
                                              selectedPartner.id,
                                            )
                                          }
                                        >
                                          Edit
                                        </Button>
                                        <Button
                                          size="sm"
                                          variant="outline"
                                          className="h-7 border-bt-red-300/40 bg-bt-red-300/15 px-2 text-xs text-bt-red-100 hover:bg-bt-red-300/25"
                                          onClick={() => void deleteLink(link)}
                                        >
                                          Delete
                                        </Button>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </>
                            ) : (
                              <p className="text-sm text-bt-blue-100">
                                No event involvements for this partner yet.
                              </p>
                            )}
                          </TabsContent>

                          <TabsContent value="documents" className="space-y-2">
                            {isLoadingPartnerDetail ? (
                              <div className="space-y-2">
                                <Skeleton className="h-10 w-full bg-bt-blue-300/20" />
                                <Skeleton className="h-10 w-full bg-bt-blue-300/20" />
                              </div>
                            ) : partnerDetail?.documents?.length ? (
                              <div className="grid gap-2">
                                {partnerDetail.documents.map((document) => (
                                  <div
                                    key={document.id}
                                    className="rounded-md border border-bt-blue-300/20 bg-bt-blue-600/30 p-3"
                                  >
                                    <div className="flex items-start justify-between gap-2">
                                      <div className="min-w-0">
                                        <p className="truncate text-sm font-medium text-white">
                                          {document.title}
                                        </p>
                                        <p className="truncate text-xs text-bt-blue-100">
                                          {document.eventName || "General"} •{" "}
                                          {document.type}
                                        </p>
                                      </div>
                                      <span className="rounded-full border border-bt-blue-300/40 px-2 py-0.5 text-[11px] text-bt-blue-100">
                                        {document.status}
                                      </span>
                                    </div>

                                    {document.url ? (
                                      <a
                                        href={document.url}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="mt-2 inline-flex text-xs text-bt-green-200 underline-offset-2 hover:underline"
                                      >
                                        Open document
                                      </a>
                                    ) : null}

                                    <div className="mt-2 flex justify-end gap-2">
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        className="h-7 border-bt-blue-300/40 bg-bt-blue-500/40 px-2 text-xs text-white hover:bg-bt-blue-500/60"
                                        onClick={() =>
                                          openEditDocumentModal(document)
                                        }
                                      >
                                        Edit
                                      </Button>
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        className="h-7 border-bt-red-300/40 bg-bt-red-300/15 px-2 text-xs text-bt-red-100 hover:bg-bt-red-300/25"
                                        onClick={() =>
                                          void deleteDocument(document.id)
                                        }
                                      >
                                        Delete
                                      </Button>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <p className="text-sm text-bt-blue-100">
                                No documents linked yet.
                              </p>
                            )}
                          </TabsContent>

                          <TabsContent
                            value="communications"
                            className="space-y-2"
                          >
                            {isLoadingPartnerDetail ? (
                              <div className="space-y-2">
                                <Skeleton className="h-10 w-full bg-bt-blue-300/20" />
                                <Skeleton className="h-10 w-full bg-bt-blue-300/20" />
                              </div>
                            ) : partnerDetail?.communications?.length ? (
                              <div className="grid gap-2">
                                {communicationSyncSummary.count ? (
                                  <div className="rounded-md border border-[#75D450]/35 bg-[#75D450]/12 p-2">
                                    <p className="text-[11px] font-semibold uppercase tracking-wide text-[#D6F5C9]">
                                      Email Sync Activity
                                    </p>
                                    <p className="mt-1 text-xs text-[#D6F5C9]">
                                      {communicationSyncSummary.count} synced
                                      message
                                      {communicationSyncSummary.count === 1
                                        ? ""
                                        : "s"}
                                      {communicationSyncSummary.latestActor
                                        ? ` • Last synced by ${communicationSyncSummary.latestActor}`
                                        : ""}
                                      {communicationSyncSummary.latestAt
                                        ? ` • ${formatIsoTimestamp(communicationSyncSummary.latestAt)}`
                                        : ""}
                                    </p>
                                    {communicationSyncSummary.actorEmails
                                      .length > 1 ? (
                                      <p className="mt-1 line-clamp-2 text-[11px] text-[#D6F5C9]">
                                        Connected inboxes:{" "}
                                        {communicationSyncSummary.actorEmails.join(
                                          ", ",
                                        )}
                                      </p>
                                    ) : null}
                                  </div>
                                ) : null}

                                {partnerDetail.communications.map(
                                  (communication) => (
                                    <div
                                      key={communication.id}
                                      className="rounded-md border border-bt-blue-300/20 bg-bt-blue-600/30 p-3"
                                    >
                                      <div className="flex items-start justify-between gap-2">
                                        <div className="min-w-0">
                                          <p className="truncate text-sm font-medium text-white">
                                            {communication.subject ||
                                              "No subject"}
                                          </p>
                                          <div className="mt-0.5 flex flex-wrap items-center gap-1.5">
                                            <span className="text-xs text-bt-blue-100">
                                              {communication.channel}
                                            </span>
                                            <span
                                              className={cn(
                                                "inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-medium",
                                                communication.direction ===
                                                  "inbound"
                                                  ? "border-[#75D450]/40 bg-[#75D450]/15 text-[#D6F5C9]"
                                                  : "border-[#7396D5]/40 bg-[#7396D5]/15 text-[#C7D8F8]",
                                              )}
                                            >
                                              {communication.direction ===
                                              "inbound"
                                                ? "↓ Inbound"
                                                : "↑ Outbound"}
                                            </span>
                                            {communication.source ===
                                            "email_sync" ? (
                                              <span className="inline-flex items-center rounded-full border border-[#F0C66D]/35 bg-[#F0C66D]/12 px-2 py-0.5 text-[11px] font-medium text-[#FDEBC3]">
                                                Synced
                                              </span>
                                            ) : null}
                                          </div>
                                        </div>
                                        <span className="shrink-0 text-xs text-bt-blue-100">
                                          {formatIsoTimestamp(
                                            communication.occurredAt,
                                          )}
                                        </span>
                                      </div>
                                      {communication.sender ||
                                      communication.recipientEmail ? (
                                        <p className="mt-1 truncate text-[11px] text-bt-blue-100">
                                          {communication.sender ||
                                            "Unknown sender"}{" "}
                                          →{" "}
                                          {communication.recipientEmail ||
                                            (communication.direction ===
                                            "inbound"
                                              ? "Team inbox"
                                              : "Unknown recipient")}
                                        </p>
                                      ) : null}
                                      {communication.externalMessageId ? (
                                        <p className="mt-1 truncate text-[11px] text-bt-blue-100/80">
                                          Message ID:{" "}
                                          {communication.externalMessageId}
                                        </p>
                                      ) : null}
                                      <p className="mt-2 line-clamp-3 text-xs text-bt-blue-50">
                                        {communication.summary}
                                      </p>
                                      <div className="mt-2 flex justify-end gap-2">
                                        <Button
                                          size="sm"
                                          variant="outline"
                                          className="h-7 border-bt-blue-300/40 bg-bt-blue-500/40 px-2 text-xs text-white hover:bg-bt-blue-500/60"
                                          onClick={() =>
                                            openEditCommunicationModal(
                                              communication,
                                            )
                                          }
                                        >
                                          Edit
                                        </Button>
                                        <Button
                                          size="sm"
                                          variant="outline"
                                          className="h-7 border-bt-red-300/40 bg-bt-red-300/15 px-2 text-xs text-bt-red-100 hover:bg-bt-red-300/25"
                                          onClick={() =>
                                            void deleteCommunication(
                                              communication.id,
                                            )
                                          }
                                        >
                                          Delete
                                        </Button>
                                      </div>
                                    </div>
                                  ),
                                )}
                              </div>
                            ) : (
                              <p className="text-sm text-bt-blue-100">
                                No communication logs yet.
                              </p>
                            )}
                          </TabsContent>
                        </Tabs>
                      </>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="events" className="space-y-4">
              <Card className="border-bt-blue-300/30 bg-bt-blue-500/40">
                <CardContent className="space-y-3 p-4">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <h2 className="text-sm font-semibold text-white sm:text-base">
                        Partnerships Events
                      </h2>
                      <p className="text-xs text-bt-blue-100">
                        Manage CRM-specific events and partner involvement.
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={openCreateEventModal}
                      className="border-bt-blue-300/40 bg-bt-blue-500/40 text-white hover:bg-bt-blue-500/60"
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      New CRM Event
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <div className="grid gap-4 xl:grid-cols-[minmax(320px,360px)_minmax(0,1fr)]">
                <Card className="border-bt-blue-300/30 bg-bt-blue-500/40">
                  <CardContent className="space-y-2 p-3">
                    {isLoadingEvents ? (
                      <>
                        <Skeleton className="h-14 w-full bg-bt-blue-300/20" />
                        <Skeleton className="h-14 w-full bg-bt-blue-300/20" />
                      </>
                    ) : !events.length ? (
                      <p className="p-2 text-sm text-bt-blue-100">
                        No CRM events yet.
                      </p>
                    ) : (
                      events.map((event) => {
                        const goal = event.sponsorshipGoal || 0;
                        const ratio =
                          goal > 0
                            ? Math.max(
                                0,
                                Math.min(
                                  100,
                                  (event.securedAmount / goal) * 100,
                                ),
                              )
                            : 0;

                        return (
                          <button
                            key={event.id}
                            type="button"
                            onClick={() => setSelectedEventId(event.id)}
                            className={cn(
                              "w-full rounded-md border border-bt-blue-300/20 bg-bt-blue-600/30 px-3 py-3 text-left transition hover:bg-bt-blue-500/40",
                              selectedEventId === event.id &&
                                "bg-bt-blue-500/50 hover:bg-bt-blue-500/50",
                            )}
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div className="min-w-0">
                                <p className="truncate text-sm font-medium text-white">
                                  {event.name}
                                </p>
                                <p className="text-xs text-bt-blue-100">
                                  {event.year}
                                </p>
                              </div>
                              {event.archived ? (
                                <span className="rounded-full border border-bt-red-300/40 px-2 py-0.5 text-[11px] text-bt-red-100">
                                  Archived
                                </span>
                              ) : null}
                            </div>

                            <div className="mt-2 h-1.5 rounded-full bg-bt-blue-300/20">
                              <div
                                className="h-full rounded-full bg-bt-green-300"
                                style={{ width: `${ratio}%` }}
                              />
                            </div>

                            <div className="mt-2 flex items-center justify-between text-xs">
                              <span className="text-bt-blue-100">
                                {event.relationshipCount} links
                              </span>
                              <span className="font-medium text-white">
                                {formatCurrency(event.securedAmount)}
                              </span>
                            </div>
                          </button>
                        );
                      })
                    )}
                  </CardContent>
                </Card>

                <Card className="border-bt-blue-300/30 bg-bt-blue-500/40">
                  <CardContent className="space-y-4 p-4">
                    {!selectedEvent ? (
                      <div className="flex flex-col items-center justify-center gap-3 rounded-md border border-dashed border-bt-blue-300/30 bg-bt-blue-600/20 py-12 text-center">
                        <CalendarDays className="h-8 w-8 text-bt-blue-100/50" />
                        <div>
                          <p className="text-sm font-medium text-bt-blue-100">
                            No event selected
                          </p>
                          <p className="mt-1 text-xs text-bt-blue-100">
                            Select a CRM event from the list to review its
                            partnership activity and progress.
                          </p>
                        </div>
                      </div>
                    ) : isLoadingEventDetail ? (
                      <div className="space-y-2">
                        <Skeleton className="h-20 w-full bg-bt-blue-300/20" />
                        <Skeleton className="h-20 w-full bg-bt-blue-300/20" />
                      </div>
                    ) : (
                      <>
                        <div className="flex flex-wrap items-start justify-between gap-3">
                          <div className="min-w-0">
                            <h3 className="truncate text-lg font-semibold text-white">
                              {selectedEvent.name}
                            </h3>
                            <p className="text-sm text-bt-blue-100">
                              {selectedEvent.year}
                              {selectedEvent.startDate
                                ? ` • ${formatDate(selectedEvent.startDate)}`
                                : ""}
                            </p>
                          </div>

                          <div className="flex flex-wrap gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              className="border-bt-blue-300/40 bg-bt-blue-500/40 text-white hover:bg-bt-blue-500/60"
                              onClick={() => openEditEventModal(selectedEvent)}
                            >
                              <Pencil className="mr-2 h-4 w-4" />
                              Edit Event
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="border-bt-blue-300/40 bg-bt-blue-500/40 text-white hover:bg-bt-blue-500/60"
                              onClick={() =>
                                void toggleArchiveEvent(selectedEvent)
                              }
                            >
                              <Archive className="mr-2 h-4 w-4" />
                              {selectedEvent.archived ? "Restore" : "Archive"}
                            </Button>
                          </div>
                        </div>

                        <div className="grid gap-2 sm:grid-cols-3">
                          <div className="rounded-md border border-bt-blue-300/25 bg-bt-blue-600/25 p-3">
                            <p className="text-[11px] uppercase tracking-wide text-bt-blue-100">
                              Committed
                            </p>
                            <p className="mt-1 text-base font-semibold text-white">
                              {formatCurrency(selectedEvent.committedAmount)}
                            </p>
                          </div>
                          <div className="rounded-md border border-bt-blue-300/25 bg-bt-blue-600/25 p-3">
                            <p className="text-[11px] uppercase tracking-wide text-bt-blue-100">
                              Secured
                            </p>
                            <p className="mt-1 text-base font-semibold text-white">
                              {formatCurrency(selectedEvent.securedAmount)}
                            </p>
                          </div>
                          <div className="rounded-md border border-bt-blue-300/25 bg-bt-blue-600/25 p-3">
                            <p className="text-[11px] uppercase tracking-wide text-bt-blue-100">
                              Goal
                            </p>
                            <p className="mt-1 text-base font-semibold text-white">
                              {selectedEvent.sponsorshipGoal
                                ? formatCurrency(selectedEvent.sponsorshipGoal)
                                : "Not set"}
                            </p>
                          </div>
                        </div>

                        <div>
                          <div className="mb-2 flex items-center justify-between">
                            <h4 className="text-sm font-medium text-white">
                              Tier Presets
                            </h4>
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-7 border-bt-blue-300/40 bg-bt-blue-500/40 px-2 text-xs text-white hover:bg-bt-blue-500/60"
                              onClick={() => openEditEventModal(selectedEvent)}
                            >
                              Configure
                            </Button>
                          </div>

                          {selectedEvent.tierConfigs?.length ? (
                            <div className="flex flex-wrap gap-2">
                              {selectedEvent.tierConfigs.map((tier) => (
                                <span
                                  key={tier.id}
                                  className="inline-flex items-center rounded-full border border-bt-blue-300/35 bg-bt-blue-600/35 px-2.5 py-1 text-xs text-bt-blue-50"
                                >
                                  {tier.label || toTierLabel(tier.id)}
                                  <span className="ml-1 text-bt-green-200">
                                    {tier.amount === null
                                      ? "(No default)"
                                      : `(${formatCurrency(tier.amount)})`}
                                  </span>
                                </span>
                              ))}
                            </div>
                          ) : (
                            <p className="text-xs text-bt-blue-100">
                              No tier presets configured yet.
                            </p>
                          )}
                        </div>

                        <div>
                          <div className="mb-2 flex items-center justify-between">
                            <h4 className="text-sm font-medium text-white">
                              Partner Involvements
                            </h4>
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-7 border-bt-blue-300/40 bg-bt-blue-500/40 px-2 text-xs text-white hover:bg-bt-blue-500/60"
                              onClick={() =>
                                openCreateLinkModal({
                                  eventId: selectedEvent.id,
                                })
                              }
                            >
                              <Plus className="mr-1 h-3.5 w-3.5" />
                              Add Partner
                            </Button>
                          </div>

                          {!eventDetail?.sponsorships?.length ? (
                            <p className="text-sm text-bt-blue-100">
                              No partner involvements for this event yet.
                            </p>
                          ) : (
                            <>
                              <div className="hidden lg:block">
                                <Table>
                                  <TableHeader>
                                    <TableRow className="border-bt-blue-300/20 hover:bg-transparent">
                                      <TableHead className="text-bt-blue-100">
                                        Partner
                                      </TableHead>
                                      <TableHead className="text-bt-blue-100">
                                        Status
                                      </TableHead>
                                      <TableHead className="text-bt-blue-100">
                                        Involvement
                                      </TableHead>
                                      <TableHead className="text-bt-blue-100">
                                        Tier
                                      </TableHead>
                                      <TableHead className="text-right text-bt-blue-100">
                                        Amount
                                      </TableHead>
                                      <TableHead className="text-right text-bt-blue-100">
                                        Actions
                                      </TableHead>
                                    </TableRow>
                                  </TableHeader>
                                  <TableBody>
                                    {eventDetail.sponsorships.map(
                                      (sponsorship) => {
                                        const partner = sponsorship.partner;
                                        const partnerLabel = partner
                                          ? getContactDisplayName(
                                              partner.contactName,
                                            )
                                          : "Deleted partner";
                                        const companyLabel =
                                          partner?.company || "Unknown company";

                                        return (
                                          <TableRow
                                            key={sponsorship.id}
                                            className="border-bt-blue-300/20 hover:bg-bt-blue-500/30"
                                          >
                                            <TableCell>
                                              <div>
                                                <p className="text-sm font-medium text-white">
                                                  {partnerLabel}
                                                </p>
                                                <p className="text-xs text-bt-blue-100">
                                                  {companyLabel}
                                                </p>
                                              </div>
                                            </TableCell>
                                            <TableCell>
                                              <StatusChip
                                                status={sponsorship.status}
                                              />
                                            </TableCell>
                                            <TableCell className="text-xs text-white">
                                              {sponsorship.role || "-"}
                                            </TableCell>
                                            <TableCell className="text-xs text-white">
                                              {sponsorship.packageTier
                                                ? toTierLabel(
                                                    sponsorship.packageTier,
                                                  )
                                                : "-"}
                                            </TableCell>
                                            <TableCell className="text-right text-sm text-white">
                                              {formatCurrency(
                                                sponsorship.amount,
                                              )}
                                            </TableCell>
                                            <TableCell>
                                              <div className="flex justify-end gap-1">
                                                {partner?.id ? (
                                                  <Button
                                                    size="sm"
                                                    variant="outline"
                                                    className="h-7 border-bt-blue-300/40 bg-bt-blue-500/40 px-2 text-xs text-white hover:bg-bt-blue-500/60"
                                                    onClick={() => {
                                                      setSelectedPartnerId(
                                                        partner.id,
                                                      );
                                                      setActiveTab("partners");
                                                    }}
                                                  >
                                                    View
                                                  </Button>
                                                ) : null}
                                                <Button
                                                  size="sm"
                                                  variant="outline"
                                                  className="h-7 border-bt-blue-300/40 bg-bt-blue-500/40 px-2 text-xs text-white hover:bg-bt-blue-500/60"
                                                  onClick={() =>
                                                    openEditLinkModal(
                                                      sponsorship,
                                                      sponsorship.partnerId,
                                                    )
                                                  }
                                                >
                                                  Edit
                                                </Button>
                                              </div>
                                            </TableCell>
                                          </TableRow>
                                        );
                                      },
                                    )}
                                  </TableBody>
                                </Table>
                              </div>

                              <div className="grid gap-2 lg:hidden">
                                {eventDetail.sponsorships.map((sponsorship) => {
                                  const partner = sponsorship.partner;
                                  const partnerLabel = partner
                                    ? getContactDisplayName(partner.contactName)
                                    : "Deleted partner";
                                  const companyLabel =
                                    partner?.company || "Unknown company";

                                  return (
                                    <div
                                      key={sponsorship.id}
                                      className="rounded-md border border-bt-blue-300/20 bg-bt-blue-600/30 p-3"
                                    >
                                      <div className="flex items-start justify-between gap-2">
                                        <div className="min-w-0">
                                          <p className="truncate text-sm font-medium text-white">
                                            {partnerLabel}
                                          </p>
                                          <p className="truncate text-xs text-bt-blue-100">
                                            {companyLabel}
                                          </p>
                                        </div>
                                        <StatusChip
                                          status={sponsorship.status}
                                        />
                                      </div>
                                      <div className="mt-2 flex items-center justify-between text-xs">
                                        <span className="text-bt-blue-100">
                                          {sponsorship.role ||
                                            "No involvement type"}
                                        </span>
                                        <span className="text-bt-blue-100">
                                          {sponsorship.packageTier
                                            ? toTierLabel(
                                                sponsorship.packageTier,
                                              )
                                            : "No tier"}
                                        </span>
                                      </div>
                                      <div className="mt-1 flex items-center justify-between text-xs">
                                        <span className="text-bt-blue-100">
                                          {toStatusLabel(sponsorship.status)}
                                        </span>
                                        <span className="font-medium text-white">
                                          {formatCurrency(sponsorship.amount)}
                                        </span>
                                      </div>
                                      <div className="mt-2 flex justify-end gap-2">
                                        {partner?.id ? (
                                          <Button
                                            size="sm"
                                            variant="outline"
                                            className="h-7 border-bt-blue-300/40 bg-bt-blue-500/40 px-2 text-xs text-white hover:bg-bt-blue-500/60"
                                            onClick={() => {
                                              setSelectedPartnerId(partner.id);
                                              setActiveTab("partners");
                                            }}
                                          >
                                            View
                                          </Button>
                                        ) : null}
                                        <Button
                                          size="sm"
                                          variant="outline"
                                          className="h-7 border-bt-blue-300/40 bg-bt-blue-500/40 px-2 text-xs text-white hover:bg-bt-blue-500/60"
                                          onClick={() =>
                                            openEditLinkModal(
                                              sponsorship,
                                              sponsorship.partnerId,
                                            )
                                          }
                                        >
                                          Edit
                                        </Button>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            </>
                          )}
                        </div>
                      </>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="emails" className="space-y-4">
              <PartnershipsEmailTab
                recipients={partners.map((partner) => ({
                  id: partner.id,
                  company: partner.company || "",
                  contactName: partner.contactName || "",
                  email: partner.email || "",
                  latestStatus: partner.latestStatus || null,
                }))}
                events={events.map((event) => ({
                  id: event.id,
                  name: event.name,
                  year: event.year,
                }))}
                onDataMutated={refreshAll}
              />
            </TabsContent>
          </Tabs>
        </div>
      </main>

      <PartnershipsDialogs
        customStatusValue={CUSTOM_STATUS_VALUE}
        customTierValue={CUSTOM_TIER_VALUE}
        roleSuggestions={roleSuggestions}
        formatCurrency={formatCurrency}
        toTierLabel={toTierLabel}
        getContactDisplayName={getContactDisplayName}
        isPartnerModalOpen={isPartnerModalOpen}
        setIsPartnerModalOpen={setIsPartnerModalOpen}
        partnerModalMode={partnerModalMode}
        partnerForm={partnerForm}
        setPartnerForm={setPartnerForm}
        submitPartner={submitPartner}
        isSavingPartner={isSavingPartner}
        isEventModalOpen={isEventModalOpen}
        setIsEventModalOpen={setIsEventModalOpen}
        eventModalMode={eventModalMode}
        eventForm={eventForm}
        setEventForm={setEventForm}
        addTierRow={addTierRow}
        updateTierRow={updateTierRow}
        removeTierRow={removeTierRow}
        submitEvent={submitEvent}
        isSavingEvent={isSavingEvent}
        isLinkModalOpen={isLinkModalOpen}
        setIsLinkModalOpen={setIsLinkModalOpen}
        linkModalMode={linkModalMode}
        linkForm={linkForm}
        setLinkForm={setLinkForm}
        linkStatusSelectValue={linkStatusSelectValue}
        partnerLinkStatusOptions={partnerLinkStatusOptions}
        linkTierSelectValue={linkTierSelectValue}
        selectedLinkEventTierConfigs={selectedLinkEventTierConfigs}
        partners={partners}
        events={events}
        applyTierDefaultAmount={applyTierDefaultAmount}
        submitLink={submitLink}
        isSavingLink={isSavingLink}
        isDocumentModalOpen={isDocumentModalOpen}
        setIsDocumentModalOpen={setIsDocumentModalOpen}
        documentModalMode={documentModalMode}
        documentForm={documentForm}
        setDocumentForm={setDocumentForm}
        submitDocument={submitDocument}
        isSavingDocument={isSavingDocument}
        isCommunicationModalOpen={isCommunicationModalOpen}
        setIsCommunicationModalOpen={setIsCommunicationModalOpen}
        communicationModalMode={communicationModalMode}
        communicationForm={communicationForm}
        setCommunicationForm={setCommunicationForm}
        submitCommunication={submitCommunication}
        isSavingCommunication={isSavingCommunication}
      />
    </>
  );
}
