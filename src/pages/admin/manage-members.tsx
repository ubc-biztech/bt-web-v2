import { useState, useEffect, useMemo, useCallback } from "react";
import { fetchBackend, fetchBackendFromServer } from "@/lib/db";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  SearchIcon,
  Copy,
  Check,
  Download,
  FileJson,
  Mail,
  ArrowUp,
  ArrowDown,
  ArrowUpDown,
  RefreshCw,
  Columns3,
  ChevronLeft,
  ChevronRight,
  Plus,
  Users,
  CreditCard,
  X,
  Eye,
  RotateCcw,
} from "lucide-react";
import { NFCWriter } from "@/components/NFCWrite/NFCWriter";
import { useNFCSupport } from "@/hooks/useNFCSupport";
import { generateNfcProfileUrl } from "@/util/nfcUtils";
import { GetServerSideProps } from "next";
import { useToast } from "@/components/ui/use-toast";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuCheckboxItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useForm, FormProvider } from "react-hook-form";
import MembershipFormSection, {
  MembershipFormValues,
} from "@/components/SignUpForm/MembershipFormSection";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  membershipValidationSchema,
  MEMBERSHIP_FORM_DEFAULTS,
} from "@/components/SignUpForm/membershipFormSchema";
import { useMembers, useInvalidateMembers, Member } from "@/queries/members";
import { useQueryClient } from "@tanstack/react-query";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

type Props = {
  initialData: Member[] | null;
};

type SortKey = "id" | "firstName" | "lastName" | "cardCount";
type SortDir = "asc" | "desc";
type CreateMemberRequest = {
  email: string;
  firstName: string;
  lastName: string;
  studentNumber?: string;
  education: string;
  pronouns: string;
  levelOfStudy: string;
  faculty: string;
  major: string;
  internationalStudent: boolean;
  previousMember: boolean;
  dietaryRestrictions: string;
  referral: string;
  topics: string;
  isMember: true;
  adminCreated: true;
};

const COLS_DEFAULT = {
  email: true,
  firstName: true,
  lastName: true,
  cardCount: true,
  faculty: false,
  year: false,
  major: false,
};

const ALL_COLS: Array<{ key: keyof typeof COLS_DEFAULT; label: string }> = [
  { key: "email", label: "Email" },
  { key: "firstName", label: "First Name" },
  { key: "lastName", label: "Last Name" },
  { key: "cardCount", label: "Card Count" },
  { key: "faculty", label: "Faculty" },
  { key: "year", label: "Year" },
  { key: "major", label: "Major" },
];

const COLS_STORAGE_KEY = "membersTable:colVisibility";
const PAGE_SIZE_STORAGE_KEY = "membersTable:pageSize";

export default function ManageMembers({ initialData }: Props) {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [debounced, setDebounced] = useState("");
  const { isNFCSupported } = useNFCSupport();
  const [showNfcWriter, setShowNfcWriter] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [copiedMemberId, setCopiedMemberId] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const { toast } = useToast();
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [visibleCols, setVisibleCols] = useState(COLS_DEFAULT);

  const { data: membersData, isLoading, refetch } = useMembers();
  const data = membersData ?? initialData ?? null;
  const invalidateMembers = useInvalidateMembers();

  const methods = useForm<MembershipFormValues>({
    resolver: zodResolver(membershipValidationSchema),
    defaultValues: MEMBERSHIP_FORM_DEFAULTS,
  });

  const openCreateMemberModal = () => {
    methods.reset(MEMBERSHIP_FORM_DEFAULTS);
    setIsModalOpen(true);
  };

  const closeCreateMemberModal = () => {
    setIsModalOpen(false);
  };

  const handleCreateMemberSubmit = async (values: MembershipFormValues) => {
    try {
      const payload: CreateMemberRequest = {
        email: values.email.trim(),
        firstName: values.firstName,
        lastName: values.lastName,
        studentNumber: values.studentNumber || undefined,
        education: values.education,
        pronouns: values.pronouns,
        levelOfStudy: values.levelOfStudy,
        faculty: values.faculty,
        major: values.major,
        internationalStudent: values.internationalStudent === "Yes",
        previousMember: values.previousMember === "Yes",
        dietaryRestrictions: values.dietaryRestrictions || "None",
        referral: values.referral,
        topics: values.topics.join(","),
        isMember: true,
        adminCreated: true,
      };

      const response = await fetchBackend({
        endpoint: "/members/grant",
        method: "POST",
        data: payload,
      });

      toast({
        title: "Member created",
        description: response?.message ?? "Membership has been granted.",
      });

      closeCreateMemberModal();
      methods.reset(MEMBERSHIP_FORM_DEFAULTS);
      await refreshData();
    } catch (err: any) {
      toast({
        title: "Failed to create member",
        description:
          err?.message?.message ?? err?.message ?? "Please try again.",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    try {
      const saved = localStorage.getItem(COLS_STORAGE_KEY);
      if (saved) setVisibleCols({ ...COLS_DEFAULT, ...JSON.parse(saved) });
    } catch {}
  }, []);
  useEffect(() => {
    try {
      localStorage.setItem(COLS_STORAGE_KEY, JSON.stringify(visibleCols));
    } catch {}
  }, [visibleCols]);
  const hidden = ALL_COLS.filter((c) => !visibleCols[c.key]);
  const hiddenCount = hidden.length;

  const showAllColumns = () =>
    setVisibleCols(
      Object.fromEntries(
        ALL_COLS.map((c) => [c.key, true]),
      ) as typeof COLS_DEFAULT,
    );
  const resetColumns = () => setVisibleCols(COLS_DEFAULT);

  // Sorting
  const [sortKey, setSortKey] = useState<SortKey>("id");
  const [sortDir, setSortDir] = useState<SortDir>("asc");
  const toggleSort = (key: SortKey) => {
    if (sortKey !== key) {
      setSortKey(key);
      setSortDir("asc");
    } else {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    }
  };
  const SortIcon = ({ col }: { col: SortKey }) =>
    sortKey !== col ? (
      <ArrowUpDown className="w-3.5 h-3.5 opacity-40" />
    ) : sortDir === "asc" ? (
      <ArrowUp className="w-3.5 h-3.5" />
    ) : (
      <ArrowDown className="w-3.5 h-3.5" />
    );

  // Page size + pagination
  const [pageSize, setPageSize] = useState<number>(20);
  const [page, setPage] = useState(1);
  useEffect(() => {
    try {
      const saved = localStorage.getItem(PAGE_SIZE_STORAGE_KEY);
      if (!saved) return;
      const parsed = Number(saved);
      if (Number.isFinite(parsed) && parsed > 0) {
        setPageSize(parsed);
      }
    } catch {}
  }, []);
  useEffect(() => {
    try {
      localStorage.setItem(PAGE_SIZE_STORAGE_KEY, String(pageSize));
    } catch {}
  }, [pageSize]);

  useEffect(() => {
    const t = setTimeout(() => setDebounced(searchTerm), 250);
    return () => clearTimeout(t);
  }, [searchTerm]);

  const filteredData = useMemo(() => {
    if (!data) return [];
    const q = debounced.trim().toLowerCase();
    if (!q) return data;
    return data.filter((m) => {
      const hay = [m.firstName, m.lastName, m.id, m.major, m.faculty, m.year]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return hay.includes(q);
    });
  }, [data, debounced]);

  const sortRows = (rows: Member[]) => {
    const copy = [...rows];
    copy.sort((a, b) => {
      const aVal: any =
        sortKey === "cardCount"
          ? (a.cardCount ?? 0)
          : ((a as any)[sortKey] ?? "");
      const bVal: any =
        sortKey === "cardCount"
          ? (b.cardCount ?? 0)
          : ((b as any)[sortKey] ?? "");
      if (aVal < bVal) return sortDir === "asc" ? -1 : 1;
      if (aVal > bVal) return sortDir === "asc" ? 1 : -1;
      return 0;
    });
    return copy;
  };

  const sortedData = useMemo(
    () => sortRows(filteredData),
    [filteredData, sortKey, sortDir],
  );
  const allMembersSorted = useMemo(
    () => sortRows(data ?? []),
    [data, sortKey, sortDir],
  );

  const pageCount = Math.max(1, Math.ceil(sortedData.length / pageSize));
  const pageData = useMemo(() => {
    const start = (page - 1) * pageSize;
    return sortedData.slice(start, start + pageSize);
  }, [sortedData, page, pageSize]);

  // Reset page + selection on filter/sort changes
  useEffect(() => {
    setPage(1);
    setSelectedIds(new Set());
  }, [debounced, sortKey, sortDir, pageSize]);

  const refreshData = async () => {
    try {
      await refetch();
      toast({ description: "Member list refreshed." });
    } catch (error) {
      console.error("Failed to refresh member data:", error);
      toast({ description: "Failed to refresh.", variant: "destructive" });
    }
  };

  const handleAssignCard = (member: Member) => {
    setSelectedMember(member);
    setShowNfcWriter(true);
  };
  const closeNfcWriter = () => {
    setShowNfcWriter(false);
    setSelectedMember(null);
  };
  const closeAllNfc = () => {
    setShowNfcWriter(false);
    setSelectedMember(null);
  };

  const copyNfcContent = async (member: Member) => {
    try {
      const nfcUrl = generateNfcProfileUrl(member.profileID);
      await navigator.clipboard.writeText(nfcUrl);
      setCopiedMemberId(member.profileID);
      setTimeout(() => setCopiedMemberId(null), 2000);
      toast({ description: "NFC URL copied." });
    } catch {
      toast({ description: "Copy failed.", variant: "destructive" });
    }
  };

  const incrementCardCount = async (member: Member) => {
    try {
      setUpdatingId(member.id);
      const currentCount = member.cardCount ?? 0;
      await fetchBackend({
        endpoint: `/members/${member.id}`,
        method: "PATCH",
        data: { cardCount: currentCount + 1 },
      });
      await invalidateMembers();
      toast({ description: "Card count updated." });
    } catch {
      toast({ description: "Update failed.", variant: "destructive" });
    } finally {
      setUpdatingId(null);
    }
  };

  // Selection helpers
  const isSelected = useCallback(
    (id: string) => selectedIds.has(id),
    [selectedIds],
  );
  const toggleRow = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };
  const allOnPageSelected =
    pageData.length > 0 && pageData.every((m) => selectedIds.has(m.id));
  const someOnPageSelected =
    pageData.some((m) => selectedIds.has(m.id)) && !allOnPageSelected;
  const toggleAllOnPage = () => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (allOnPageSelected) pageData.forEach((m) => next.delete(m.id));
      else pageData.forEach((m) => next.add(m.id));
      return next;
    });
  };

  // Export helpers
  type Scope = "selected" | "page" | "filtered" | "allMembers";

  const rowsForScope = (scope: Scope) => {
    if (scope === "selected")
      return pageData.filter((m) => selectedIds.has(m.id));
    if (scope === "page") return pageData;
    if (scope === "filtered") return sortedData;
    return allMembersSorted;
  };

  const toCsv = (rows: Member[]) => {
    const header = [
      "Email",
      "First Name",
      "Last Name",
      "Faculty",
      "Year",
      "Major",
      "Card Count",
    ];
    const lines = rows.map((m) =>
      [
        m.id,
        m.firstName ?? "",
        m.lastName ?? "",
        m.faculty ?? "",
        m.year ?? "",
        m.major ?? "",
        String(m.cardCount ?? 0),
      ]
        .map((v) => `"${String(v).replace(/"/g, '""')}"`)
        .join(","),
    );
    return [header.join(","), ...lines].join("\n");
  };

  const download = (filename: string, mime: string, content: string) => {
    const blob = new Blob([content], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const doExportCsv = (scope: Scope) => {
    const rows = rowsForScope(scope);
    download(`members-${scope}.csv`, "text/csv;charset=utf-8;", toCsv(rows));
    const label =
      scope === "selected"
        ? "Selected rows"
        : scope === "page"
          ? "Current page"
          : scope === "filtered"
            ? "All filtered"
            : "All members";
    toast({ description: `Exported ${rows.length} rows to CSV (${label}).` });
  };

  const doExportJson = (scope: Scope) => {
    const rows = rowsForScope(scope);
    download(
      `members-${scope}.json`,
      "application/json;charset=utf-8;",
      JSON.stringify(rows, null, 2),
    );
    const label =
      scope === "selected"
        ? "Selected rows"
        : scope === "page"
          ? "Current page"
          : scope === "filtered"
            ? "All filtered"
            : "All members";
    toast({ description: `Exported ${rows.length} rows to JSON (${label}).` });
  };

  const copyEmails = async (scope: Scope) => {
    const rows = rowsForScope(scope);
    const text = rows.map((m) => m.id).join(", ");
    try {
      await navigator.clipboard.writeText(text);
      const label =
        scope === "selected"
          ? "selected"
          : scope === "page"
            ? "current page"
            : scope === "filtered"
              ? "all filtered"
              : "all members";
      toast({
        description: `Copied ${rows.length} email${rows.length === 1 ? "" : "s"} (${label}).`,
      });
    } catch {
      toast({ description: "Failed to copy emails.", variant: "destructive" });
    }
  };

  const ariaSort = (key: SortKey): React.AriaAttributes["aria-sort"] => {
    if (sortKey !== key) return "none";
    return sortDir === "asc" ? "ascending" : "descending";
  };

  const desktopColSpan = Object.values(visibleCols).filter(Boolean).length + 2;

  const visibleRangeStart =
    sortedData.length === 0 ? 0 : (page - 1) * pageSize + 1;
  const visibleRangeEnd = (page - 1) * pageSize + pageData.length;

  return (
    <TooltipProvider delayDuration={200}>
      <main className="min-h-screen bg-bt-blue-600">
        <div className="mx-auto w-full max-w-7xl space-y-6 px-4 pb-12 pt-2 sm:px-6 lg:px-8">
          {/* Header */}
          <section className="space-y-1">
            <h2 className="text-xl sm:text-2xl font-semibold text-white">
              Manage Members
            </h2>
            <p className="text-sm text-bt-blue-100">
              View, search, and manage BizTech member data.
            </p>
          </section>

          {/* Stat Cards */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <StatCard
              icon={<Users className="h-4 w-4 text-bt-green-300" />}
              label="Total Members"
              value={data?.length ?? 0}
            />
            <StatCard
              icon={<SearchIcon className="h-4 w-4 text-bt-green-300" />}
              label="Filtered"
              value={sortedData.length}
            />
            <StatCard
              icon={<CreditCard className="h-4 w-4 text-bt-green-300" />}
              label="With Cards"
              value={data?.filter((m) => (m.cardCount ?? 0) > 0).length ?? 0}
            />
            <StatCard
              icon={<Check className="h-4 w-4 text-bt-green-300" />}
              label="Selected"
              value={selectedIds.size}
            />
          </div>

          {/* Toolbar */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            {/* Search */}
            <div className="relative w-full sm:max-w-sm">
              <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-bt-blue-100" />
              <Input
                placeholder="Search by name, email, major…"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-9"
              />
              {searchTerm && (
                <button
                  aria-label="Clear search"
                  onClick={() => setSearchTerm("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded p-0.5 text-bt-blue-100 hover:text-white transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 overflow-x-auto">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={refreshData}
                    disabled={isLoading}
                    className="shrink-0"
                  >
                    <RefreshCw
                      className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`}
                    />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Refresh</TooltipContent>
              </Tooltip>

              {/* Column visibility */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-1.5 shrink-0"
                  >
                    <Columns3 className="h-4 w-4" />
                    <span className="hidden sm:inline">Columns</span>
                    {hiddenCount > 0 && (
                      <span className="rounded-full bg-bt-green-300/20 px-1.5 py-0.5 text-[11px] font-semibold leading-none text-bt-green-300">
                        {hiddenCount}
                      </span>
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuLabel>Toggle columns</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {ALL_COLS.map(({ key, label }) => (
                    <DropdownMenuCheckboxItem
                      key={key}
                      checked={(visibleCols as any)[key]}
                      onCheckedChange={(v) =>
                        setVisibleCols((s) => ({ ...s, [key]: Boolean(v) }))
                      }
                    >
                      {label}
                    </DropdownMenuCheckboxItem>
                  ))}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={showAllColumns}>
                    <Eye className="mr-2 h-3.5 w-3.5" /> Show all
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={resetColumns}>
                    <RotateCcw className="mr-2 h-3.5 w-3.5" /> Reset default
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Export */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-1.5 shrink-0"
                  >
                    <Download className="h-4 w-4" />
                    <span className="hidden sm:inline">Export</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>CSV</DropdownMenuLabel>
                  {selectedIds.size > 0 && (
                    <DropdownMenuItem onClick={() => doExportCsv("selected")}>
                      Selected ({selectedIds.size})
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem onClick={() => doExportCsv("page")}>
                    Current page
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => doExportCsv("filtered")}>
                    All filtered ({sortedData.length})
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => doExportCsv("allMembers")}>
                    All members ({data?.length ?? 0})
                  </DropdownMenuItem>

                  <DropdownMenuSeparator />
                  <DropdownMenuLabel>JSON</DropdownMenuLabel>
                  {selectedIds.size > 0 && (
                    <DropdownMenuItem onClick={() => doExportJson("selected")}>
                      <FileJson className="mr-2 h-3.5 w-3.5" /> Selected (
                      {selectedIds.size})
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem onClick={() => doExportJson("page")}>
                    <FileJson className="mr-2 h-3.5 w-3.5" /> Current page
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => doExportJson("filtered")}>
                    <FileJson className="mr-2 h-3.5 w-3.5" /> All filtered
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => doExportJson("allMembers")}>
                    <FileJson className="mr-2 h-3.5 w-3.5" /> All members
                  </DropdownMenuItem>

                  <DropdownMenuSeparator />
                  <DropdownMenuLabel>Emails</DropdownMenuLabel>
                  {selectedIds.size > 0 && (
                    <DropdownMenuItem onClick={() => copyEmails("selected")}>
                      <Mail className="mr-2 h-3.5 w-3.5" /> Copy selected
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem onClick={() => copyEmails("page")}>
                    <Mail className="mr-2 h-3.5 w-3.5" /> Copy current page
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => copyEmails("filtered")}>
                    <Mail className="mr-2 h-3.5 w-3.5" /> Copy all filtered
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => copyEmails("allMembers")}>
                    <Mail className="mr-2 h-3.5 w-3.5" /> Copy all members
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Page size */}
              <Select
                value={String(pageSize)}
                onValueChange={(v) => setPageSize(Number(v))}
              >
                <SelectTrigger className="w-[100px] h-9 text-xs shrink-0">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[10, 20, 50, 100].map((n) => (
                    <SelectItem key={n} value={String(n)}>
                      {n} / page
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Button
                variant="green"
                size="sm"
                onClick={openCreateMemberModal}
                className="gap-1.5 shrink-0"
              >
                <Plus className="h-4 w-4" />
                <span className="hidden sm:inline">Add Member</span>
              </Button>
            </div>
          </div>

          {/* Selection bar */}
          {selectedIds.size > 0 && (
            <div className="flex flex-wrap items-center gap-3 rounded-lg border border-bt-green-300/30 bg-bt-green-300/10 px-4 py-2.5 text-sm text-white">
              <span className="font-medium">
                {selectedIds.size} member{selectedIds.size !== 1 ? "s" : ""}{" "}
                selected
              </span>
              <div className="ml-auto flex flex-wrap items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-7 text-xs"
                  onClick={() => copyEmails("selected")}
                >
                  <Mail className="mr-1.5 h-3 w-3" /> Copy Emails
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-7 text-xs"
                  onClick={() => doExportCsv("selected")}
                >
                  <Download className="mr-1.5 h-3 w-3" /> Export CSV
                </Button>
                <button
                  onClick={() => setSelectedIds(new Set())}
                  className="ml-1 rounded p-1 text-white/60 hover:bg-white/10 hover:text-white transition-colors"
                  aria-label="Clear selection"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* Desktop Table */}
          <div className="hidden md:block rounded-xl border border-bt-blue-300/60 overflow-hidden">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-bt-blue-300 hover:bg-bt-blue-300 border-b border-bt-blue-200">
                    <TableHead className="w-[44px] text-white font-semibold">
                      <Checkbox
                        checked={
                          allOnPageSelected
                            ? true
                            : someOnPageSelected
                              ? "indeterminate"
                              : false
                        }
                        onCheckedChange={toggleAllOnPage}
                        aria-label="Select all on page"
                      />
                    </TableHead>

                    {visibleCols.email && (
                      <TableHead
                        className="text-white font-semibold"
                        aria-sort={ariaSort("id")}
                      >
                        <button
                          className="inline-flex items-center gap-1.5 hover:text-bt-green-300 transition-colors"
                          onClick={() => toggleSort("id")}
                        >
                          Email <SortIcon col="id" />
                        </button>
                      </TableHead>
                    )}
                    {visibleCols.firstName && (
                      <TableHead
                        className="text-white font-semibold"
                        aria-sort={ariaSort("firstName")}
                      >
                        <button
                          className="inline-flex items-center gap-1.5 hover:text-bt-green-300 transition-colors"
                          onClick={() => toggleSort("firstName")}
                        >
                          First Name <SortIcon col="firstName" />
                        </button>
                      </TableHead>
                    )}
                    {visibleCols.lastName && (
                      <TableHead
                        className="text-white font-semibold"
                        aria-sort={ariaSort("lastName")}
                      >
                        <button
                          className="inline-flex items-center gap-1.5 hover:text-bt-green-300 transition-colors"
                          onClick={() => toggleSort("lastName")}
                        >
                          Last Name <SortIcon col="lastName" />
                        </button>
                      </TableHead>
                    )}
                    {visibleCols.cardCount && (
                      <TableHead
                        className="text-white font-semibold text-center"
                        aria-sort={ariaSort("cardCount")}
                      >
                        <button
                          className="inline-flex items-center gap-1.5 hover:text-bt-green-300 transition-colors"
                          onClick={() => toggleSort("cardCount")}
                        >
                          Cards <SortIcon col="cardCount" />
                        </button>
                      </TableHead>
                    )}
                    {visibleCols.faculty && (
                      <TableHead className="text-white font-semibold">
                        Faculty
                      </TableHead>
                    )}
                    {visibleCols.year && (
                      <TableHead className="text-white font-semibold">
                        Year
                      </TableHead>
                    )}
                    {visibleCols.major && (
                      <TableHead className="text-white font-semibold">
                        Major
                      </TableHead>
                    )}
                    <TableHead className="text-white font-semibold text-right">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {pageData.length ? (
                    pageData.map((m, i) => {
                      const rowSelected = isSelected(m.id);
                      return (
                        <TableRow
                          key={m.id}
                          data-state={rowSelected ? "selected" : undefined}
                          className={`border-b border-bt-blue-300/40 ${
                            rowSelected
                              ? "bg-bt-green-300/5"
                              : i % 2 === 0
                                ? "bg-bt-blue-600"
                                : "bg-bt-blue-500/30"
                          } hover:bg-bt-blue-400/40 transition-colors`}
                        >
                          <TableCell className="w-[44px]">
                            <Checkbox
                              checked={rowSelected}
                              onCheckedChange={() => toggleRow(m.id)}
                              aria-label={`Select ${m.firstName} ${m.lastName}`}
                            />
                          </TableCell>

                          {visibleCols.email && (
                            <TableCell
                              className="font-medium text-white max-w-[280px] truncate"
                              title={m.id}
                            >
                              {m.id}
                            </TableCell>
                          )}
                          {visibleCols.firstName && (
                            <TableCell className="text-white/90 truncate">
                              {m.firstName || "\u2014"}
                            </TableCell>
                          )}
                          {visibleCols.lastName && (
                            <TableCell className="text-white/90 truncate">
                              {m.lastName || "\u2014"}
                            </TableCell>
                          )}
                          {visibleCols.cardCount && (
                            <TableCell className="text-center">
                              <span
                                className={`inline-flex items-center justify-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                                  (m.cardCount ?? 0) > 0
                                    ? "bg-bt-green-300/15 text-bt-green-300"
                                    : "bg-white/5 text-white/50"
                                }`}
                              >
                                {m.cardCount ?? 0}
                              </span>
                            </TableCell>
                          )}
                          {visibleCols.faculty && (
                            <TableCell className="text-white/70 truncate">
                              {m.faculty ?? "\u2014"}
                            </TableCell>
                          )}
                          {visibleCols.year && (
                            <TableCell className="text-white/70 truncate">
                              {m.year ?? "\u2014"}
                            </TableCell>
                          )}
                          {visibleCols.major && (
                            <TableCell className="text-white/70 truncate">
                              {m.major ?? "\u2014"}
                            </TableCell>
                          )}

                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              {isNFCSupported ? (
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      className="h-8 text-xs"
                                      onClick={() => handleAssignCard(m)}
                                    >
                                      <CreditCard className="mr-1.5 h-3.5 w-3.5" />
                                      Assign
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    Write NFC card for this member
                                  </TooltipContent>
                                </Tooltip>
                              ) : (
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      className="h-8 text-xs"
                                      onClick={() => copyNfcContent(m)}
                                    >
                                      {copiedMemberId === m.profileID ? (
                                        <>
                                          <Check className="mr-1.5 h-3.5 w-3.5 text-bt-green-300" />
                                          Copied
                                        </>
                                      ) : (
                                        <>
                                          <Copy className="mr-1.5 h-3.5 w-3.5" />
                                          NFC
                                        </>
                                      )}
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    Copy NFC URL to clipboard
                                  </TooltipContent>
                                </Tooltip>
                              )}
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="h-8 text-xs"
                                    onClick={() => incrementCardCount(m)}
                                    disabled={updatingId === m.id}
                                  >
                                    {updatingId === m.id ? (
                                      <RefreshCw className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                                    ) : (
                                      <CreditCard className="mr-1.5 h-3.5 w-3.5" />
                                    )}
                                    Flag
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  Flag card as written (+1)
                                </TooltipContent>
                              </Tooltip>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  ) : (
                    <TableRow>
                      <TableCell
                        colSpan={desktopColSpan}
                        className="h-32 text-center"
                      >
                        <div className="flex flex-col items-center gap-2 text-white/50">
                          <Users className="h-8 w-8" />
                          <p>
                            {debounced
                              ? "No members match your search."
                              : "No members available."}
                          </p>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </div>

          {/* Mobile Cards */}
          <div className="space-y-2 md:hidden">
            {pageData.length ? (
              pageData.map((m) => {
                const rowSelected = isSelected(m.id);
                return (
                  <div
                    key={m.id}
                    className={`rounded-xl border p-4 transition-colors ${
                      rowSelected
                        ? "border-bt-green-300/40 bg-bt-green-300/5"
                        : "border-bt-blue-300/40 bg-bt-blue-500/20"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="pt-0.5">
                        <Checkbox
                          checked={rowSelected}
                          onCheckedChange={() => toggleRow(m.id)}
                          aria-label={`Select ${m.firstName} ${m.lastName}`}
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <p className="truncate font-medium text-white text-sm">
                            {m.firstName || "\u2014"} {m.lastName || "\u2014"}
                          </p>
                          <span
                            className={`shrink-0 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${
                              (m.cardCount ?? 0) > 0
                                ? "bg-bt-green-300/15 text-bt-green-300"
                                : "bg-white/5 text-white/40"
                            }`}
                          >
                            <CreditCard className="h-3 w-3" />
                            {m.cardCount ?? 0}
                          </span>
                        </div>
                        <p
                          className="truncate text-xs text-bt-blue-100 mt-0.5"
                          title={m.id}
                        >
                          {m.id}
                        </p>
                      </div>
                    </div>

                    {(m.faculty || m.year || m.major) && (
                      <div className="mt-2 ml-7 flex flex-wrap gap-1.5">
                        {m.faculty && (
                          <span className="rounded-md bg-bt-blue-400/50 px-2 py-0.5 text-[11px] text-white/70">
                            {m.faculty}
                          </span>
                        )}
                        {m.year && (
                          <span className="rounded-md bg-bt-blue-400/50 px-2 py-0.5 text-[11px] text-white/70">
                            {m.year}
                          </span>
                        )}
                        {m.major && (
                          <span className="rounded-md bg-bt-blue-400/50 px-2 py-0.5 text-[11px] text-white/70">
                            {m.major}
                          </span>
                        )}
                      </div>
                    )}

                    <div className="mt-3 ml-7 flex gap-2">
                      {isNFCSupported ? (
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8 flex-1 text-xs"
                          onClick={() => handleAssignCard(m)}
                        >
                          <CreditCard className="mr-1.5 h-3.5 w-3.5" />
                          Assign Card
                        </Button>
                      ) : (
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8 flex-1 text-xs"
                          onClick={() => copyNfcContent(m)}
                        >
                          {copiedMemberId === m.profileID ? (
                            <>
                              <Check className="mr-1.5 h-3.5 w-3.5 text-bt-green-300" />
                              Copied
                            </>
                          ) : (
                            <>
                              <Copy className="mr-1.5 h-3.5 w-3.5" />
                              Copy NFC
                            </>
                          )}
                        </Button>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 flex-1 text-xs"
                        onClick={() => incrementCardCount(m)}
                        disabled={updatingId === m.id}
                      >
                        {updatingId === m.id ? (
                          <RefreshCw className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <CreditCard className="mr-1.5 h-3.5 w-3.5" />
                        )}
                        Flag Written
                      </Button>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="flex flex-col items-center gap-3 rounded-xl border border-bt-blue-300/40 bg-bt-blue-500/20 py-12 text-white/50">
                <Users className="h-8 w-8" />
                <p className="text-sm">
                  {debounced
                    ? "No members match your search."
                    : "No members available."}
                </p>
              </div>
            )}
          </div>

          {/* Pagination */}
          {sortedData.length > 0 && (
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-xs text-white/50">
                Showing{" "}
                <span className="font-medium text-white/80">
                  {visibleRangeStart}&ndash;{visibleRangeEnd}
                </span>{" "}
                of{" "}
                <span className="font-medium text-white/80">
                  {sortedData.length}
                </span>{" "}
                member{sortedData.length !== 1 ? "s" : ""}
              </p>

              <div className="flex items-center gap-1.5">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 w-8 p-0"
                  onClick={() => setPage(1)}
                  disabled={page === 1}
                  aria-label="First page"
                >
                  <ChevronLeft className="h-4 w-4" />
                  <ChevronLeft className="-ml-2.5 h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 w-8 p-0"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  aria-label="Previous page"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>

                <div className="flex items-center gap-1">
                  {generatePageNumbers(page, pageCount).map((p, idx) =>
                    p === "..." ? (
                      <span
                        key={`ellipsis-${idx}`}
                        className="px-1 text-xs text-white/30"
                      >
                        &hellip;
                      </span>
                    ) : (
                      <button
                        key={p}
                        onClick={() => setPage(p as number)}
                        className={`h-8 min-w-[2rem] rounded-md px-2 text-xs font-medium transition-colors ${
                          page === p
                            ? "bg-bt-green-300 text-bt-blue-600"
                            : "text-white/70 hover:bg-bt-blue-400/50 hover:text-white"
                        }`}
                      >
                        {p}
                      </button>
                    ),
                  )}
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 w-8 p-0"
                  onClick={() => setPage((p) => Math.min(pageCount, p + 1))}
                  disabled={page === pageCount}
                  aria-label="Next page"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 w-8 p-0"
                  onClick={() => setPage(pageCount)}
                  disabled={page === pageCount}
                  aria-label="Last page"
                >
                  <ChevronRight className="h-4 w-4" />
                  <ChevronRight className="-ml-2.5 h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* NFC Writer Modal */}
        {showNfcWriter && selectedMember && (
          <NFCWriter
            token={selectedMember.profileID}
            email={selectedMember.id}
            firstName={selectedMember.firstName}
            exit={closeNfcWriter}
            closeAll={closeAllNfc}
            numCards={selectedMember.cardCount ?? 0}
          />
        )}

        {/* Create Member Dialog */}
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto bg-bt-blue-500 border-bt-blue-300">
            <div className="mb-2">
              <h3 className="text-lg font-semibold text-white">
                Create New Member
              </h3>
              <p className="text-sm text-bt-blue-100">
                Fill in the details to add a new BizTech member.
              </p>
            </div>
            <FormProvider {...methods}>
              <form
                className="space-y-6"
                onSubmit={methods.handleSubmit(handleCreateMemberSubmit)}
              >
                <MembershipFormSection
                  control={methods.control}
                  watch={methods.watch}
                  disableEmail={false}
                />

                <div className="flex justify-end gap-2 pt-2 border-t border-bt-blue-300/50">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={closeCreateMemberModal}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="green"
                    disabled={methods.formState.isSubmitting}
                  >
                    {methods.formState.isSubmitting
                      ? "Submitting..."
                      : "Create Member"}
                  </Button>
                </div>
              </form>
            </FormProvider>
          </DialogContent>
        </Dialog>
      </main>
    </TooltipProvider>
  );
}

/* Stat Card Component */
function StatCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
}) {
  return (
    <div className="rounded-xl border border-bt-blue-300/40 bg-bt-blue-500/40 p-3 sm:p-4">
      <div className="flex items-center gap-2 text-bt-blue-100 text-xs mb-1">
        {icon}
        <span>{label}</span>
      </div>
      <p className="text-lg sm:text-xl font-semibold text-white tabular-nums">
        {value.toLocaleString()}
      </p>
    </div>
  );
}

/* Pagination helpers */
function generatePageNumbers(
  current: number,
  total: number,
): (number | "...")[] {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }

  const pages: (number | "...")[] = [1];

  if (current > 3) pages.push("...");

  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);

  for (let i = start; i <= end; i++) {
    pages.push(i);
  }

  if (current < total - 2) pages.push("...");

  pages.push(total);

  return pages;
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const nextServerContext = { request: context.req, response: context.res };
  try {
    const data = await fetchBackendFromServer({
      endpoint: "/members",
      method: "GET",
      authenticatedCall: true,
      nextServerContext,
    });
    return { props: { initialData: data || [] } };
  } catch (error) {
    console.error("Failed to fetch initial member data:", error);
    return { props: { initialData: null } };
  }
};
