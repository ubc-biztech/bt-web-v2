import type { ReactNode } from "react";
import { AlertCircle, ArrowUpToLine, CalendarDays, CircleDollarSign, Loader2, Mail, RefreshCw, Users } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { StatusChip } from "./StatusChip";
import {
  DashboardActionItem,
  DashboardEventRow,
  DashboardPipelineRow,
  PartnershipsDashboardResponse,
  PartnershipsGoogleSheetsStatus,
  PartnershipsOverviewEventOption,
} from "./types";

const paceMeta: Record<
  DashboardEventRow["paceStatus"],
  { label: string; className: string }
> = {
  ahead: {
    label: "Ahead",
    className: "border-[#57C98F]/40 bg-[#57C98F]/15 text-[#C8F4DE]",
  },
  on_track: {
    label: "On Track",
    className: "border-[#78A8F2]/40 bg-[#78A8F2]/15 text-[#D3E4FF]",
  },
  behind: {
    label: "Behind",
    className: "border-[#F59DAA]/40 bg-[#F59DAA]/15 text-[#FFD8DE]",
  },
  no_goal: {
    label: "No Goal",
    className: "border-white/25 bg-white/[0.08] text-bt-blue-50",
  },
  not_started: {
    label: "Not Started",
    className: "border-[#AE7FE8]/40 bg-[#AE7FE8]/15 text-[#E5D4FF]",
  },
};

function MetricCard({
  icon,
  label,
  value,
  helper,
}: {
  icon: ReactNode;
  label: string;
  value: string;
  helper?: string;
}) {
  return (
    <Card className="border-bt-blue-300/30 bg-bt-blue-500/40">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[10px] uppercase tracking-wide text-bt-blue-100 sm:text-xs">
              {label}
            </p>
            <p className="mt-1 text-xl font-semibold text-white sm:text-2xl">
              {value}
            </p>
            {helper ? <p className="mt-1 text-xs text-bt-blue-100">{helper}</p> : null}
          </div>
          <span className="rounded-lg bg-bt-blue-600/60 p-2 text-bt-green-300">
            {icon}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}

type PartnershipsOverviewTabProps = {
  isLoadingDashboard: boolean;
  dashboard: PartnershipsDashboardResponse | null;
  dashboardYearFilter: string;
  onDashboardYearFilterChange: (value: string) => void;
  dashboardEventFilter: string;
  onDashboardEventFilterChange: (value: string) => void;
  dashboardWindowDays: string;
  onDashboardWindowDaysChange: (value: string) => void;
  dashboardIncludeArchived: boolean;
  onDashboardIncludeArchivedChange: (value: boolean) => void;
  dashboardYearOptions: number[];
  dashboardEventOptions: PartnershipsOverviewEventOption[];
  dashboardPipelineRows: DashboardPipelineRow[];
  dashboardEventRows: DashboardEventRow[];
  dashboardActionItems: DashboardActionItem[];
  onReloadDashboard: () => void;
  onSelectPartner: (partnerId: string) => void;
  onOpenEvent: (eventId: string) => void;
  sheetsStatus: PartnershipsGoogleSheetsStatus | null;
  isSyncingSheets: "push" | "pull" | null;
  onRunSheetsSync: (mode: "push" | "pull") => void;
  emailSyncStatus: {
    enabled: boolean;
    configured: boolean;
    lastIngestAt: string | null;
    lastIngestStatusCode: number | null;
    recentActorEmails?: string[];
  } | null;
  onOpenEmailTab: () => void;
  formatCurrency: (value: number | null | undefined) => string;
  formatPercent: (value: number | null | undefined, digits?: number) => string;
  formatIsoTimestamp: (value?: string | null) => string;
  formatNumber: (value: number) => string;
};

export function PartnershipsOverviewTab({
  isLoadingDashboard,
  dashboard,
  dashboardYearFilter,
  onDashboardYearFilterChange,
  dashboardEventFilter,
  onDashboardEventFilterChange,
  dashboardWindowDays,
  onDashboardWindowDaysChange,
  dashboardIncludeArchived,
  onDashboardIncludeArchivedChange,
  dashboardYearOptions,
  dashboardEventOptions,
  dashboardPipelineRows,
  dashboardEventRows,
  dashboardActionItems,
  onReloadDashboard,
  onSelectPartner,
  onOpenEvent,
  sheetsStatus,
  isSyncingSheets,
  onRunSheetsSync,
  emailSyncStatus,
  onOpenEmailTab,
  formatCurrency,
  formatPercent,
  formatIsoTimestamp,
  formatNumber,
}: PartnershipsOverviewTabProps) {
  const lastEmailSyncAt = emailSyncStatus?.lastIngestAt
    ? Date.parse(emailSyncStatus.lastIngestAt)
    : NaN;
  const hoursSinceLastEmailSync = Number.isFinite(lastEmailSyncAt)
    ? (Date.now() - lastEmailSyncAt) / (1000 * 60 * 60)
    : null;
  const isEmailSyncStale =
    hoursSinceLastEmailSync !== null && hoursSinceLastEmailSync > 72;
  const emailSyncNeedsSetup =
    Boolean(emailSyncStatus?.enabled) && !emailSyncStatus?.configured;
  const emailSyncNeedsAttention =
    emailSyncNeedsSetup ||
    isEmailSyncStale ||
    Boolean(
      (emailSyncStatus?.lastIngestStatusCode || 0) >= 400 &&
        emailSyncStatus?.configured,
    );

  return (
    <div className="space-y-4">
      <Card className="border-bt-blue-300/30 bg-bt-blue-500/40">
        <CardContent className="space-y-3 p-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h2 className="text-sm font-semibold text-white sm:text-base">Dashboard Scope</h2>
              <p className="text-xs text-bt-blue-100">Pick what data to show here.</p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onReloadDashboard}
              className="h-8 px-2 text-bt-blue-100 hover:bg-bt-blue-500/40 hover:text-white"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Refresh
            </Button>
          </div>

          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            <Select value={dashboardYearFilter} onValueChange={onDashboardYearFilterChange}>
              <SelectTrigger className="border-bt-blue-300/40 bg-bt-blue-600/40 text-white">
                <SelectValue placeholder="Year" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="auto">Auto (Latest Year)</SelectItem>
                <SelectItem value="all">All Years</SelectItem>
                {dashboardYearOptions.map((year) => (
                  <SelectItem key={year} value={String(year)}>
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={dashboardEventFilter} onValueChange={onDashboardEventFilterChange}>
              <SelectTrigger className="border-bt-blue-300/40 bg-bt-blue-600/40 text-white">
                <SelectValue placeholder="Event" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Events</SelectItem>
                {dashboardEventOptions.map((event) => (
                  <SelectItem key={event.id} value={event.id}>
                    {event.name} ({event.year})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={dashboardWindowDays} onValueChange={onDashboardWindowDaysChange}>
              <SelectTrigger className="border-bt-blue-300/40 bg-bt-blue-600/40 text-white">
                <SelectValue placeholder="Follow-up window" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7">Next 7 days</SelectItem>
                <SelectItem value="14">Next 14 days</SelectItem>
                <SelectItem value="21">Next 21 days</SelectItem>
                <SelectItem value="30">Next 30 days</SelectItem>
                <SelectItem value="45">Next 45 days</SelectItem>
              </SelectContent>
            </Select>

            <label className="flex items-center gap-2 rounded-md border border-bt-blue-300/30 bg-bt-blue-600/30 px-3 text-sm text-bt-blue-100">
              <Checkbox
                checked={dashboardIncludeArchived}
                onCheckedChange={(checked) => onDashboardIncludeArchivedChange(Boolean(checked))}
                className="border-bt-blue-200"
              />
              Include archived
            </label>
          </div>
        </CardContent>
      </Card>

      {emailSyncStatus?.enabled ? (
        <Card className="border-bt-blue-300/30 bg-bt-blue-500/40">
          <CardContent className="space-y-2 p-4">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="text-[11px] uppercase tracking-wide text-bt-blue-100">
                  Email Sync
                </p>
                <p className="mt-1 text-sm font-semibold text-white">
                  {emailSyncNeedsAttention
                    ? "Action recommended"
                    : "Connected and healthy"}
                </p>
                <p className="mt-1 text-xs text-bt-blue-100">
                  {emailSyncNeedsSetup
                    ? "Set up Gmail sync so partner replies appear automatically in communication logs."
                    : `Last sync: ${emailSyncStatus.lastIngestAt ? new Date(emailSyncStatus.lastIngestAt).toLocaleString() : "Not synced yet"}`}
                </p>
                {emailSyncStatus.recentActorEmails?.length ? (
                  <p className="mt-1 line-clamp-1 text-xs text-bt-blue-100">
                    Connected inboxes: {emailSyncStatus.recentActorEmails.join(", ")}
                  </p>
                ) : null}
              </div>
              <Button
                size="sm"
                variant={emailSyncNeedsAttention ? "green" : "outline"}
                className={
                  emailSyncNeedsAttention
                    ? "text-xs"
                    : "border-bt-blue-300/40 bg-bt-blue-500/40 text-xs text-white hover:bg-bt-blue-500/60"
                }
                onClick={onOpenEmailTab}
              >
                <Mail className="mr-1.5 h-3.5 w-3.5" />
                Open Email Ops
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : null}

      {isLoadingDashboard ? (
        <Card className="border-bt-blue-300/30 bg-bt-blue-500/40">
          <CardContent className="space-y-3 p-4">
            <Skeleton className="h-8 w-full bg-bt-blue-300/20" />
            <Skeleton className="h-24 w-full bg-bt-blue-300/20" />
            <Skeleton className="h-24 w-full bg-bt-blue-300/20" />
          </CardContent>
        </Card>
      ) : !dashboard ? (
        <Alert className="border-bt-red-200/40 bg-bt-red-200/10 text-bt-red-100">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Dashboard unavailable</AlertTitle>
          <AlertDescription>Unable to load reporting data for this scope.</AlertDescription>
        </Alert>
      ) : (
        <>
          <Card className="border-bt-blue-300/30 bg-bt-blue-500/40">
            <CardContent className="p-4">
              <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
                <div className="rounded-md border border-bt-blue-300/25 bg-bt-blue-600/30 p-3">
                  <p className="text-[11px] uppercase tracking-wide text-bt-blue-100">Year</p>
                  <p className="mt-1 text-sm font-semibold text-white">
                    {dashboard.annual.year || "All years"}
                  </p>
                </div>
                <div className="rounded-md border border-bt-blue-300/25 bg-bt-blue-600/30 p-3">
                  <p className="text-[11px] uppercase tracking-wide text-bt-blue-100">Events In Scope</p>
                  <p className="mt-1 text-sm font-semibold text-white">
                    {formatNumber(dashboard.scope.scopedEventCount)}
                  </p>
                </div>
                <div className="rounded-md border border-bt-blue-300/25 bg-bt-blue-600/30 p-3">
                  <p className="text-[11px] uppercase tracking-wide text-bt-blue-100">Follow-up Window</p>
                  <p className="mt-1 text-sm font-semibold text-white">
                    {dashboard.scope.upcomingWindowDays} days
                  </p>
                </div>
                <div className="rounded-md border border-bt-blue-300/25 bg-bt-blue-600/30 p-3">
                  <p className="text-[11px] uppercase tracking-wide text-bt-blue-100">Archived Events</p>
                  <p className="mt-1 text-sm font-semibold text-white">
                    {dashboard.scope.includeArchived ? "Included" : "Hidden"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <MetricCard
              icon={<ArrowUpToLine className="h-4 w-4" />}
              label="Revenue Secured"
              value={formatCurrency(dashboard.annual.securedAmount)}
              helper={
                dashboard.annual.goalAmount > 0
                  ? `${formatPercent(dashboard.annual.progressToGoalPct)} of annual goal`
                  : "Annual goal not set"
              }
            />
            <MetricCard
              icon={<CircleDollarSign className="h-4 w-4" />}
              label="Goal Remaining"
              value={formatCurrency(dashboard.annual.remainingToGoal)}
              helper={
                dashboard.annual.goalAmount > 0
                  ? `Goal ${formatCurrency(dashboard.annual.goalAmount)}`
                  : "Set event goals to track gap"
              }
            />
            <MetricCard
              icon={<Users className="h-4 w-4" />}
              label="Open Pipeline"
              value={formatCurrency(dashboard.totals.pipelineAmount)}
              helper={`${formatNumber(dashboard.totals.relationshipCount)} relationships tracked`}
            />
            <MetricCard
              icon={<CalendarDays className="h-4 w-4" />}
              label="Action Items"
              value={formatNumber(dashboard.totals.actionItemCount)}
              helper={`${formatNumber(dashboard.totals.overdueFollowUps)} overdue, ${formatNumber(dashboard.totals.upcomingFollowUps)} upcoming`}
            />
          </div>

          <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
            <Card className="border-bt-blue-300/30 bg-bt-blue-500/40">
              <CardContent className="p-4">
                <h2 className="text-sm font-semibold text-white sm:text-base">Goal Pace</h2>
                <p className="mt-1 text-xs text-bt-blue-100">
                  Where we are vs the yearly goal.
                </p>

                <div className="mt-3 rounded-md border border-bt-blue-300/20 bg-bt-blue-600/30 p-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="text-xs text-bt-blue-100">Secured vs annual goal</p>
                    <p className="text-sm font-semibold text-white">
                      {formatCurrency(dashboard.annual.securedAmount)} /{" "}
                      {formatCurrency(dashboard.annual.goalAmount)}
                    </p>
                  </div>
                  <div className="mt-2 h-2 rounded-full bg-bt-blue-300/20">
                    <div
                      className="h-full rounded-full bg-bt-green-300"
                      style={{
                        width: `${Math.max(
                          0,
                          Math.min(100, dashboard.annual.progressToGoalPct || 0),
                        )}%`,
                      }}
                    />
                  </div>
                  <div className="mt-1 flex items-center justify-between text-[11px] text-bt-blue-100">
                    <span>Actual: {formatPercent(dashboard.annual.progressToGoalPct)}</span>
                    <span>Expected by today: {formatPercent(dashboard.annual.expectedProgressPct)}</span>
                  </div>
                </div>

                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <span
                    className={cn(
                      "inline-flex rounded-full border px-2 py-0.5 text-[11px] font-medium",
                      dashboard.annual.onTrack === null
                        ? paceMeta.no_goal.className
                        : dashboard.annual.onTrack
                          ? paceMeta.on_track.className
                          : paceMeta.behind.className,
                    )}
                  >
                    {dashboard.annual.onTrack === null
                      ? "No goal configured"
                      : dashboard.annual.onTrack
                        ? "On track"
                        : "Behind pace"}
                  </span>
                  <p className="text-xs text-bt-blue-100">
                    {dashboard.annual.paceDelta === null
                      ? "Set event goals to unlock pace tracking."
                      : `${dashboard.annual.paceDelta >= 0 ? "+" : ""}${formatCurrency(dashboard.annual.paceDelta)} vs expected by today`}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-bt-blue-300/30 bg-bt-blue-500/40">
              <CardContent className="p-4">
                <h2 className="text-sm font-semibold text-white sm:text-base">Pipeline Breakdown</h2>
                <p className="mt-1 text-xs text-bt-blue-100">Money split by status.</p>

                {!dashboardPipelineRows.length ? (
                  <p className="mt-3 text-sm text-bt-blue-100">No pipeline data in this scope.</p>
                ) : (
                  <div className="mt-3 space-y-2">
                    {dashboardPipelineRows.map((row) => (
                      <div
                        key={row.status}
                        className="rounded-md border border-bt-blue-300/20 bg-bt-blue-600/30 px-3 py-2"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <StatusChip status={row.status} />
                            <span className="text-xs text-bt-blue-100">
                              {formatNumber(row.count)} relationships
                            </span>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-medium text-white">{formatCurrency(row.amount)}</p>
                            <p className="text-[11px] text-bt-blue-100">
                              {formatPercent(row.shareByAmountPct, 0)} of pipeline
                            </p>
                          </div>
                        </div>
                        <div className="mt-2 h-1.5 rounded-full bg-bt-blue-300/20">
                          <div
                            className={cn(
                              "h-full rounded-full",
                              row.isSecured ? "bg-bt-green-300" : "bg-bt-blue-200",
                            )}
                            style={{
                              width: `${row.amount > 0 ? Math.max(2, row.shareByAmountPct) : 0}%`,
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <Card className="border-bt-blue-300/30 bg-bt-blue-500/40">
            <CardContent className="p-0">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-bt-blue-300/20 px-4 py-3">
                <div>
                  <h2 className="text-sm font-semibold text-white sm:text-base">Event Scoreboard</h2>
                  <p className="text-xs text-bt-blue-100">Click any row to open event details.</p>
                </div>
              </div>

              {!dashboardEventRows.length ? (
                <div className="p-4 text-sm text-bt-blue-100">No events in this scope.</div>
              ) : (
                <>
                  <div className="hidden lg:block">
                    <Table>
                      <TableHeader>
                        <TableRow className="border-bt-blue-300/20 hover:bg-transparent">
                          <TableHead className="text-bt-blue-100">Event</TableHead>
                          <TableHead className="text-bt-blue-100">Pace</TableHead>
                          <TableHead className="text-right text-bt-blue-100">Secured / Goal</TableHead>
                          <TableHead className="text-right text-bt-blue-100">Open Pipeline</TableHead>
                          <TableHead className="text-right text-bt-blue-100">Follow-ups</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {dashboardEventRows.map((row) => {
                          const pace = paceMeta[row.paceStatus] || paceMeta.no_goal;
                          return (
                            <TableRow
                              key={row.eventIdYear}
                              className="cursor-pointer border-bt-blue-300/20 hover:bg-bt-blue-500/40"
                              onClick={() => onOpenEvent(row.eventId)}
                            >
                              <TableCell>
                                <p className="truncate text-sm font-semibold text-white">{row.eventName}</p>
                                <p className="text-xs text-bt-blue-100">
                                  {row.eventYear || "Unknown year"} • {formatNumber(row.relationshipCount)} relationships
                                </p>
                              </TableCell>
                              <TableCell>
                                <span
                                  className={cn(
                                    "inline-flex rounded-full border px-2 py-0.5 text-[11px] font-medium",
                                    pace.className,
                                  )}
                                >
                                  {pace.label}
                                </span>
                              </TableCell>
                              <TableCell className="text-right">
                                <p className="text-sm font-medium text-white">
                                  {formatCurrency(row.securedAmount)} /{" "}
                                  {row.hasGoal ? formatCurrency(row.goalAmount) : "Not set"}
                                </p>
                                <p className="text-[11px] text-bt-blue-100">
                                  {row.hasGoal ? formatPercent(row.progressToGoalPct) : "No goal"}
                                </p>
                              </TableCell>
                              <TableCell className="text-right text-white">
                                {formatCurrency(row.pipelineAmount)}
                              </TableCell>
                              <TableCell className="text-right">
                                <p className="text-sm font-medium text-white">{formatNumber(row.upcomingFollowUps)}</p>
                                <p className="text-[11px] text-bt-blue-100">{formatNumber(row.overdueFollowUps)} overdue</p>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </div>

                  <div className="grid gap-2 p-3 lg:hidden">
                    {dashboardEventRows.map((row) => {
                      const pace = paceMeta[row.paceStatus] || paceMeta.no_goal;
                      return (
                        <button
                          key={row.eventIdYear}
                          type="button"
                          onClick={() => onOpenEvent(row.eventId)}
                          className="rounded-md border border-bt-blue-300/20 bg-bt-blue-600/30 p-3 text-left transition hover:bg-bt-blue-500/40"
                        >
                          <div className="flex items-center justify-between gap-2">
                            <p className="truncate text-sm font-semibold text-white">{row.eventName}</p>
                            <span
                              className={cn(
                                "inline-flex rounded-full border px-2 py-0.5 text-[11px] font-medium",
                                pace.className,
                              )}
                            >
                              {pace.label}
                            </span>
                          </div>
                          <p className="mt-2 text-xs text-bt-blue-100">
                            Secured {formatCurrency(row.securedAmount)} /{" "}
                            {row.hasGoal ? formatCurrency(row.goalAmount) : "No goal"}
                          </p>
                          <p className="mt-1 text-xs text-bt-blue-100">
                            {row.hasGoal ? `Progress ${formatPercent(row.progressToGoalPct)} • ` : ""}
                            Pipeline {formatCurrency(row.pipelineAmount)} • Follow-ups{" "}
                            {formatNumber(row.upcomingFollowUps)} upcoming /{" "}
                            {formatNumber(row.overdueFollowUps)} overdue
                          </p>
                        </button>
                      );
                    })}
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          <Card className="border-bt-blue-300/30 bg-bt-blue-500/40">
            <CardContent className="p-0">
              <div className="border-b border-bt-blue-300/20 px-4 py-3">
                <h2 className="text-sm font-semibold text-white sm:text-base">
                  Priority Follow-ups
                </h2>
                <p className="text-xs text-bt-blue-100">Sorted by urgency.</p>
              </div>

              {!dashboardActionItems.length ? (
                <div className="p-4 text-sm text-bt-blue-100">
                  No follow-ups due in this window.
                </div>
              ) : (
                <div className="divide-y divide-bt-blue-300/20">
                  {dashboardActionItems.slice(0, 12).map((item) => {
                    const dueLabel =
                      item.daysUntilDue === null
                        ? "No due date"
                        : item.daysUntilDue < 0
                          ? `${Math.abs(item.daysUntilDue)}d overdue`
                          : item.daysUntilDue === 0
                            ? "Due today"
                            : `Due in ${item.daysUntilDue}d`;

                    return (
                      <div
                        key={item.id}
                        className="flex flex-col gap-2 px-4 py-3 sm:flex-row sm:items-start sm:justify-between"
                      >
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="truncate text-sm font-semibold text-white">
                              {item.title}
                            </p>
                            <span
                              className={cn(
                                "rounded-full border px-2 py-0.5 text-[11px] font-medium",
                                item.isOverdue
                                  ? "border-[#F59DAA]/40 bg-[#F59DAA]/15 text-[#FFD8DE]"
                                  : "border-[#78A8F2]/40 bg-[#78A8F2]/15 text-[#D3E4FF]",
                              )}
                            >
                              {dueLabel}
                            </span>
                          </div>
                          <p className="mt-1 text-xs text-bt-blue-100">{item.description}</p>
                        </div>

                        <div className="flex shrink-0 gap-2">
                          {item.partnerId ? (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 px-2 text-bt-blue-100 hover:bg-bt-blue-500/40 hover:text-white"
                              onClick={() => onSelectPartner(item.partnerId!)}
                            >
                              Open Partner
                            </Button>
                          ) : null}
                          {item.eventId ? (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 px-2 text-bt-blue-100 hover:bg-bt-blue-500/40 hover:text-white"
                              onClick={() => onOpenEvent(item.eventId!)}
                            >
                              Open Event
                            </Button>
                          ) : null}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}

      <Card className="border-bt-blue-300/30 bg-bt-blue-500/40">
        <CardContent className="p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-sm font-semibold text-white sm:text-base">Google Sheets Sync</h2>
              <p className="mt-1 text-xs text-bt-blue-100 sm:text-sm">
                {sheetsStatus?.configured
                  ? sheetsStatus.accessible
                    ? `Connected: ${sheetsStatus.sheetName || "PartnershipsCRM"}`
                    : "Configured, but cannot access sheet"
                  : "Not configured"}
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onRunSheetsSync("push")}
                disabled={isSyncingSheets !== null || !sheetsStatus?.configured}
                className="border-bt-blue-300/40 bg-bt-blue-500/40 text-white hover:bg-bt-blue-500/60"
              >
                {isSyncingSheets === "push" ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <ArrowUpToLine className="mr-2 h-4 w-4" />
                )}
                Push to Sheet
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onRunSheetsSync("pull")}
                disabled={isSyncingSheets !== null || !sheetsStatus?.configured}
                className="border-bt-blue-300/40 bg-bt-blue-500/40 text-white hover:bg-bt-blue-500/60"
              >
                {isSyncingSheets === "pull" ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <RefreshCw className="mr-2 h-4 w-4" />
                )}
                Pull from Sheet
              </Button>
            </div>
          </div>

          {sheetsStatus?.message ? (
            <p className="mt-3 text-xs text-bt-blue-100">{sheetsStatus.message}</p>
          ) : null}

          {sheetsStatus?.lastSyncAt ? (
            <p className="mt-2 text-xs text-bt-blue-100">
              Last sync: {formatIsoTimestamp(sheetsStatus.lastSyncAt)}
              {sheetsStatus.lastSyncMode
                ? ` (${String(sheetsStatus.lastSyncMode).toUpperCase()})`
                : ""}
            </p>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}
