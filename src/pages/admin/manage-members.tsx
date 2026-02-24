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
  FilterIcon,
  Copy,
  Check,
  Download,
  FileJson,
  Mail,
  ArrowUp,
  ArrowDown,
  ArrowUpDown,
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
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

type Member = {
  profileID: string;
  id: string;
  firstName: string;
  lastName: string;
  faculty?: string;
  year?: string;
  major?: string;
  cardCount?: number;
  international?: boolean;
  topics?: string[];
  createdAt?: number;
  updatedAt?: number;
};

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
  topics: string[];
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
const CREATE_MEMBER_DEFAULT_VALUES: MembershipFormValues = {
  email: "",
  firstName: "",
  lastName: "",
  education: "",
  studentNumber: "",
  pronouns: "",
  levelOfStudy: "",
  faculty: "",
  major: "",
  internationalStudent: "",
  previousMember: "",
  dietaryRestrictions: "None",
  referral: "",
  topics: [],
};

const validationSchema = z
  .object({
    email: z.string().email("Invalid email address"),
    firstName: z.string().min(1, "First name is required"),
    lastName: z.string().min(1, "Last name is required"),
    education: z.string().min(1, "Education selection is required"),
    studentNumber: z.string().optional(),
    pronouns: z.string().min(1, "Please select your pronouns"),
    levelOfStudy: z.string().min(1, "Level of study is required"),
    faculty: z.string().min(1, "Faculty is required"),
    major: z.string().min(1, "Major is required"),
    internationalStudent: z
      .string()
      .min(1, "Please specify if you are an international student"),
    previousMember: z
      .string()
      .min(1, "Please specify if you were a previous member"),
    dietaryRestrictions: z.string().min(1, "Dietary restrictions are required"),
    referral: z.string().min(1, "Referral source is required"),
    topics: z.array(z.string()),
  })
  .refine(
    (data) =>
      data.education === "UBC"
        ? !!data.studentNumber && /^\d{8}$/.test(data.studentNumber)
        : true,
    {
      message: "Student number must be an 8 digit number for UBC students",
      path: ["studentNumber"],
    },
  );

export default function ManageMembers({ initialData }: Props) {
  const [data, setData] = useState<Member[] | null>(initialData);
  const [searchTerm, setSearchTerm] = useState("");
  const [debounced, setDebounced] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { isNFCSupported } = useNFCSupport();
  const [showNfcWriter, setShowNfcWriter] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [copiedMemberId, setCopiedMemberId] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const { toast } = useToast();
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [visibleCols, setVisibleCols] = useState(COLS_DEFAULT);

  const methods = useForm<MembershipFormValues>({
    resolver: zodResolver(validationSchema),
    defaultValues: CREATE_MEMBER_DEFAULT_VALUES,
  });

  const openCreateMemberModal = () => {
    methods.reset(CREATE_MEMBER_DEFAULT_VALUES);
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
        topics: values.topics,
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
      methods.reset(CREATE_MEMBER_DEFAULT_VALUES);
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
  const hiddenLabels = hidden.map((h) => h.label).join(", ");

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
  const dirIcon = (key: SortKey) =>
    sortKey !== key ? (
      <ArrowUpDown className="w-4 h-4" />
    ) : sortDir === "asc" ? (
      <ArrowUp className="w-4 h-4" />
    ) : (
      <ArrowDown className="w-4 h-4" />
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
      setIsLoading(true);
      const response = await fetchBackend({
        endpoint: "/members",
        method: "GET",
      });
      setData(response || []);
    } catch (error) {
      console.error("Failed to refresh member data:", error);
      toast({ description: "Failed to refresh.", variant: "destructive" });
    } finally {
      setIsLoading(false);
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
      setData((prev) =>
        (prev || []).map((m) =>
          m.id === member.id ? { ...m, cardCount: (m.cardCount ?? 0) + 1 } : m,
        ),
      );
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

  const ariaSort = (key: SortKey): React.AriaAttributes["aria-sort"] =>
    sortKey !== key
      ? "none"
      : "ascending" && (sortDir === "asc" ? "ascending" : "descending");

  return (
    <main className="bg-primary-color min-h-screen space-y-12">
      <div className="mx-auto w-full max-w-7xl flex flex-col">
        {/* Header & Toolbar */}
        <div className="mb-4 md:mb-6 flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <h2 className="text-white text-2xl md:text-3xl font-semibold">
              Manage Members
            </h2>
            <p className="text-baby-blue">
              View and manage BizTech member information.
            </p>
          </div>

          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-3">
            {/* Search */}
            <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
              <div className="relative sm:min-w-[280px] md:min-w-[340px]">
                <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-white/60 w-4 h-4" />
                <Input
                  placeholder="Search by name, email, major…"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-white/10 border-white/15 text-white placeholder:text-white/60 focus-visible:ring-white/30 pr-9"
                />
                {searchTerm && (
                  <button
                    aria-label="Clear search"
                    onClick={() => setSearchTerm("")}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-white/70 hover:text-white"
                  >
                    ×
                  </button>
                )}
              </div>
              <Button
                onClick={refreshData}
                variant="outline"
                className="bg-transparent border-white/20 text-white hover:bg-white/10"
                disabled={isLoading}
              >
                <FilterIcon className="w-4 h-4 mr-2" />
                {isLoading ? "Refreshing…" : "Refresh"}
              </Button>
            </div>

            {/* Actions */}
            <div className="flex flex-wrap items-center gap-2">
              {/* Page size */}
              <Select
                value={String(pageSize)}
                onValueChange={(v) => setPageSize(Number(v))}
              >
                <SelectTrigger className="w-[130px] bg-white/10 border-white/15 text-white">
                  <SelectValue placeholder="Rows/page" />
                </SelectTrigger>
                <SelectContent>
                  {[10, 20, 50, 100].map((n) => (
                    <SelectItem key={n} value={String(n)}>
                      {n} / page
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Column visibility */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    className="bg-transparent border-white/20 text-white hover:bg-white/10 "
                  >
                    {hiddenCount
                      ? `Columns (${hiddenCount} hidden)`
                      : "Columns"}
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
                    Show all
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={resetColumns}>
                    Reset default
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Export */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    className="bg-transparent border-white/20 text-white hover:bg-white/10"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Export
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="w-64 max-w-[calc(100vw-2rem)]"
                >
                  <DropdownMenuLabel>CSV</DropdownMenuLabel>
                  <DropdownMenuItem onClick={() => doExportCsv("selected")}>
                    Selected rows
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => doExportCsv("page")}>
                    Current page
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => doExportCsv("filtered")}>
                    All filtered
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => doExportCsv("allMembers")}>
                    All members
                  </DropdownMenuItem>

                  <DropdownMenuSeparator />
                  <DropdownMenuLabel>JSON</DropdownMenuLabel>
                  <DropdownMenuItem onClick={() => doExportJson("selected")}>
                    <FileJson className="w-4 h-4 mr-2" /> Selected rows
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => doExportJson("page")}>
                    <FileJson className="w-4 h-4 mr-2" /> Current page
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => doExportJson("filtered")}>
                    <FileJson className="w-4 h-4 mr-2" /> All filtered
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => doExportJson("allMembers")}>
                    <FileJson className="w-4 h-4 mr-2" /> All members
                  </DropdownMenuItem>

                  <DropdownMenuSeparator />
                  <DropdownMenuLabel>Emails</DropdownMenuLabel>
                  <DropdownMenuItem onClick={() => copyEmails("selected")}>
                    <Mail className="w-4 h-4 mr-2" /> Copy selected
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => copyEmails("page")}>
                    <Mail className="w-4 h-4 mr-2" /> Copy current page
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => copyEmails("filtered")}>
                    <Mail className="w-4 h-4 mr-2" /> Copy all filtered
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => copyEmails("allMembers")}>
                    <Mail className="w-4 h-4 mr-2" /> Copy all members
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* Stats */}
          <div className="flex flex-col gap-2">
            <div className="flex flex-wrap gap-2">
              <span className="inline-flex items-center gap-2 rounded-full bg-white/10 text-white px-3 py-1 text-xs md:text-sm">
                Total: <strong>{data?.length ?? 0}</strong>
              </span>
              <span className="inline-flex items-center gap-2 rounded-full bg-white/10 text-white px-3 py-1 text-xs md:text-sm">
                Showing: <strong>{sortedData.length}</strong>
              </span>
              {debounced && (
                <span className="inline-flex items-center gap-2 rounded-full bg-white/10 text-white px-3 py-1 text-xs md:text-sm">
                  Filter: “{debounced}”
                </span>
              )}
            </div>

            {hiddenCount > 0 && (
              <div className="flex flex-wrap items-center gap-2 rounded-lg border border-white/15 bg-white/5 px-3 py-2 mt-3 text-xs md:text-sm text-white/90">
                <span>
                  <strong>{hiddenCount}</strong> column
                  {hiddenCount > 1 ? "s" : ""} hidden
                  {hiddenLabels ? ` (${hiddenLabels})` : ""}.
                </span>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-7 bg-transparent border-white/20 text-white hover:bg-white/10"
                    onClick={showAllColumns}
                  >
                    Show all
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-7 bg-transparent border-white/20 text-white hover:bg-white/10"
                    onClick={resetColumns}
                  >
                    Reset
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* MOBILE */}
        <div className="md:hidden space-y-3">
          {sortedData.length ? (
            pageData.map((m) => (
              <div
                key={m.id}
                className="rounded-xl border border-white/10 bg-white/5 p-4 text-baby-blue"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="text-white font-medium text-base truncate">
                      {m.firstName || "N/A"} {m.lastName || "N/A"}
                    </div>
                    <div className="text-xs truncate" title={m.id}>
                      {m.id}
                    </div>
                  </div>
                  <span className="inline-flex items-center gap-1 rounded-full bg-white/10 text-white px-2 py-0.5 text-xs">
                    {m.cardCount ?? 0} cards
                  </span>
                </div>

                {(m.major || m.year || m.faculty) && (
                  <div className="mt-2 text-xs text-white/70 flex flex-wrap gap-x-3 gap-y-1">
                    {m.major && <span>Major: {m.major}</span>}
                    {m.year && <span>Year: {m.year}</span>}
                    {m.faculty && <span>Faculty: {m.faculty}</span>}
                  </div>
                )}

                <div className="mt-3 grid grid-cols-2 gap-2">
                  {isNFCSupported ? (
                    <Button
                      variant="outline"
                      className="w-full bg-transparent border-white/20 text-white hover:bg-white/10"
                      onClick={() => handleAssignCard(m)}
                    >
                      Assign Card
                    </Button>
                  ) : (
                    <Button
                      variant="outline"
                      className="w-full bg-transparent border-white/20 text-white hover:bg-white/10"
                      onClick={() => copyNfcContent(m)}
                    >
                      {copiedMemberId === m.profileID ? (
                        <>
                          <Check className="w-4 h-4 mr-1.5" /> Copied
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4 mr-1.5" /> Copy NFC
                        </>
                      )}
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    className="w-full bg-transparent border-white/20 text-white hover:bg-white/10"
                    onClick={() => incrementCardCount(m)}
                    disabled={updatingId === m.id}
                  >
                    {updatingId === m.id ? "Updating…" : "Flag Written"}
                  </Button>
                </div>
              </div>
            ))
          ) : (
            <div className="rounded-xl border border-white/10 bg-white/5 p-6 text-center text-white/70">
              {debounced
                ? "No members match your search."
                : "No members available."}
            </div>
          )}
        </div>

        {/* DESKTOP */}
        <div className="hidden md:block bg-white/5 rounded-xl border border-white/10 overflow-hidden">
          <Table className="text-baby-blue">
            <TableHeader className="sticky top-0 z-10">
              <TableRow className="bg-[#6578A8] hover:bg-[#6578A8] border-none">
                <TableHead
                  className="text-white font-semibold w-[44px]"
                  aria-sort="none"
                >
                  <Checkbox
                    checked={allOnPageSelected}
                    onCheckedChange={toggleAllOnPage}
                    aria-label="Select all on page"
                  />
                </TableHead>

                {visibleCols.email && (
                  <TableHead
                    className="text-white font-semibold min-w-[240px]"
                    aria-sort={ariaSort("id")}
                  >
                    <button
                      className="inline-flex items-center gap-1 hover:opacity-90"
                      onClick={() => toggleSort("id")}
                    >
                      Email {dirIcon("id")}
                    </button>
                  </TableHead>
                )}
                {visibleCols.firstName && (
                  <TableHead
                    className="text-white font-semibold min-w-[120px]"
                    aria-sort={ariaSort("firstName")}
                  >
                    <button
                      className="inline-flex items-center gap-1 hover:opacity-90"
                      onClick={() => toggleSort("firstName")}
                    >
                      First Name {dirIcon("firstName")}
                    </button>
                  </TableHead>
                )}
                {visibleCols.lastName && (
                  <TableHead
                    className="text-white font-semibold min-w-[120px]"
                    aria-sort={ariaSort("lastName")}
                  >
                    <button
                      className="inline-flex items-center gap-1 hover:opacity-90"
                      onClick={() => toggleSort("lastName")}
                    >
                      Last Name {dirIcon("lastName")}
                    </button>
                  </TableHead>
                )}
                {visibleCols.cardCount && (
                  <TableHead
                    className="text-white font-semibold min-w-[110px] text-center"
                    aria-sort={ariaSort("cardCount")}
                  >
                    <button
                      className="inline-flex items-center gap-1 hover:opacity-90"
                      onClick={() => toggleSort("cardCount")}
                    >
                      Card Count {dirIcon("cardCount")}
                    </button>
                  </TableHead>
                )}
                {visibleCols.faculty && (
                  <TableHead
                    className="text-white font-semibold min-w-[140px]"
                    aria-sort="none"
                  >
                    Faculty
                  </TableHead>
                )}
                {visibleCols.year && (
                  <TableHead
                    className="text-white font-semibold min-w-[100px]"
                    aria-sort="none"
                  >
                    Year
                  </TableHead>
                )}
                {visibleCols.major && (
                  <TableHead
                    className="text-white font-semibold min-w-[160px]"
                    aria-sort="none"
                  >
                    Major
                  </TableHead>
                )}
                <TableHead
                  className="text-white font-semibold min-w-[320px]"
                  aria-sort="none"
                >
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {pageData.length ? (
                pageData.map((m, i) => (
                  <TableRow
                    key={m.id}
                    className={`border-white/10 ${i % 2 ? "bg-white/0" : "bg-white/[0.03]"} hover:bg-white/10`}
                  >
                    <TableCell className="w-[44px]">
                      <Checkbox
                        checked={isSelected(m.id)}
                        onCheckedChange={() => toggleRow(m.id)}
                        aria-label={`Select ${m.id}`}
                      />
                    </TableCell>

                    {visibleCols.email && (
                      <TableCell
                        className="font-medium max-w-[360px] truncate"
                        title={m.id}
                      >
                        {m.id}
                      </TableCell>
                    )}
                    {visibleCols.firstName && (
                      <TableCell className="truncate">
                        {m.firstName || "N/A"}
                      </TableCell>
                    )}
                    {visibleCols.lastName && (
                      <TableCell className="truncate">
                        {m.lastName || "N/A"}
                      </TableCell>
                    )}
                    {visibleCols.cardCount && (
                      <TableCell className="text-center">
                        {m.cardCount ?? 0}
                      </TableCell>
                    )}
                    {visibleCols.faculty && (
                      <TableCell className="truncate">
                        {m.faculty ?? "-"}
                      </TableCell>
                    )}
                    {visibleCols.year && (
                      <TableCell className="truncate">
                        {m.year ?? "-"}
                      </TableCell>
                    )}
                    {visibleCols.major && (
                      <TableCell className="truncate">
                        {m.major ?? "-"}
                      </TableCell>
                    )}

                    <TableCell className="py-3">
                      <div className="flex flex-wrap gap-2">
                        {isNFCSupported ? (
                          <Button
                            variant="outline"
                            size="sm"
                            className="bg-transparent border-white/20 text-white hover:bg-white/10"
                            onClick={() => handleAssignCard(m)}
                          >
                            Assign Card
                          </Button>
                        ) : (
                          <Button
                            variant="outline"
                            size="sm"
                            className="bg-transparent border-white/20 text-white hover:bg-white/10"
                            onClick={() => copyNfcContent(m)}
                          >
                            {copiedMemberId === m.profileID ? (
                              <>
                                <Check className="w-4 h-4 mr-2" /> Copied
                              </>
                            ) : (
                              <>
                                <Copy className="w-4 h-4 mr-2" /> Copy NFC
                                Content
                              </>
                            )}
                          </Button>
                        )}
                        <Button
                          variant="outline"
                          size="sm"
                          className="bg-transparent border-white/20 text-white hover:bg-white/10"
                          onClick={() => incrementCardCount(m)}
                          disabled={updatingId === m.id}
                        >
                          {updatingId === m.id
                            ? "Updating…"
                            : "Flag Card as Written"}
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={8}
                    className="h-24 text-center text-white/70"
                  >
                    {debounced
                      ? "No members match your search."
                      : "No members available."}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        <div className="mt-5 flex flex-row items-center justify-between gap-2 text-white/80 flex-wrap">
          <div className="text-xs sm:text-sm whitespace-nowrap">
            Page <strong>{page}</strong> of <strong>{pageCount}</strong>
            {sortedData.length > 0 && (
              <>
                {" "}
                • Showing <strong>{pageData.length}</strong> items
              </>
            )}
          </div>

          <div className="text-xs md:text-sm text-white/60 hidden md:block">
            Tip: Click a header to sort. Horizontally scroll to see more.
          </div>

          <div className="flex gap-2 shrink-0">
            <Button
              variant="outline"
              className="bg-transparent border-white/20 text-white hover:bg-white/10 px-3"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              Prev
            </Button>
            <Button
              variant="outline"
              className="bg-transparent border-white/20 text-white hover:bg-white/10 px-3"
              onClick={() => setPage((p) => Math.min(pageCount, p + 1))}
              disabled={page === pageCount}
            >
              Next
            </Button>
          </div>
        </div>
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

      <div className="mx-auto w-full max-w-7xl flex flex-col">
        <h2 className="text-white text-2xl md:text-3xl font-semibold">
          Manage Membership
        </h2>
        <Button
          onClick={openCreateMemberModal}
          variant="outline"
          className="bg-transparent border-white/20 text-white hover:bg-white/10 max-w-sm"
          disabled={isLoading}
        >
          Create Member
        </Button>
      </div>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto bg-bt-blue-500 border-white/20">
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

              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  className="bg-transparent border-white/20 text-white hover:bg-white/10"
                  onClick={closeCreateMemberModal}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={methods.formState.isSubmitting}
                  className="bg-bt-green-300 text-bt-blue-600 hover:bg-bt-green-500"
                >
                  {methods.formState.isSubmitting
                    ? "Submitting..."
                    : "Submit Member"}
                </Button>
              </div>
            </form>
          </FormProvider>
        </DialogContent>
      </Dialog>
    </main>
  );
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
