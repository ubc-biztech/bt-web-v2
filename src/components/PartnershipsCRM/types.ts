export type DashboardPipelineRow = {
  status: string;
  label: string;
  count: number;
  amount: number;
  isSecured: boolean;
  shareByCountPct: number;
  shareByAmountPct: number;
};

export type DashboardEventRow = {
  eventId: string;
  eventIdYear: string;
  eventName: string;
  eventYear: number | null;
  archived: boolean;
  goalAmount: number;
  hasGoal: boolean;
  committedAmount: number;
  securedAmount: number;
  pipelineAmount: number;
  remainingToGoal: number;
  progressToGoalPct: number | null;
  expectedProgressPct: number | null;
  expectedSecuredByNow: number | null;
  paceDelta: number | null;
  onTrack: boolean | null;
  paceStatus: "ahead" | "on_track" | "behind" | "no_goal" | "not_started";
  relationshipCount: number;
  confirmedCount: number;
  paidCount: number;
  upcomingFollowUps: number;
  overdueFollowUps: number;
  lastActivityAt: number;
};

export type DashboardActionItem = {
  id: string;
  source: "partner_link" | "communication" | string;
  sourceId: string;
  type: "follow_up" | "stale_pipeline" | "communication_follow_up" | string;
  priority: number;
  isOverdue: boolean;
  dueDate: string | null;
  daysUntilDue: number | null;
  title: string;
  description: string;
  partnerId: string | null;
  partnerName: string | null;
  companyName: string | null;
  eventId: string | null;
  eventIdYear: string | null;
  eventName: string | null;
  eventYear: number | null;
  status: string | null;
  statusLabel: string | null;
  amount: number | null;
  staleDays?: number;
  updatedAt: number;
};

export type PartnershipsDashboardResponse = {
  generatedAt: string;
  scope: {
    selectedYear: number | null;
    requestedYear: number | null;
    requestedEventId: string | null;
    includeArchived: boolean;
    upcomingWindowDays: number;
    actionLimit: number;
    availableYears: number[];
    scopedEventCount: number;
  };
  totals: {
    partnerCount: number;
    activePartnerCount: number;
    archivedPartnerCount: number;
    partnersInScope: number;
    relationshipCount: number;
    securedRelationshipCount: number;
    pipelineAmount: number;
    securedAmount: number;
    upcomingFollowUps: number;
    overdueFollowUps: number;
    actionItemCount: number;
  };
  annual: {
    year: number | null;
    goalAmount: number;
    committedAmount: number;
    securedAmount: number;
    pipelineAmount: number;
    remainingToGoal: number;
    progressToGoalPct: number | null;
    expectedProgressPct: number | null;
    expectedSecuredByNow: number | null;
    paceDelta: number | null;
    onTrack: boolean | null;
  };
  pipeline: {
    totalCount: number;
    totalAmount: number;
    securedAmount: number;
    byStatus: DashboardPipelineRow[];
  };
  revenueByEvent: DashboardEventRow[];
  actionItems: DashboardActionItem[];
};

export type PartnershipsOverviewEventOption = {
  id: string;
  year: number;
  name: string;
};

export type PartnershipsGoogleSheetsStatus = {
  configured: boolean;
  autoSync?: boolean;
  accessible?: boolean;
  spreadsheetId?: string | null;
  sheetName?: string | null;
  message?: string;
  accessError?: string;
  diagnostics?: string[];
  lastSyncAt?: string | null;
  lastSyncMode?: string | null;
  lastSyncStatus?: "success" | "error" | string | null;
  lastSyncSummary?: Record<string, unknown> | null;
  lastSyncError?: string | null;
};
