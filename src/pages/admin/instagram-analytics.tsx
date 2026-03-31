import { useEffect, useMemo, useState } from "react";
import Head from "next/head";
import { fetchBackend } from "@/lib/db";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  BarChart,
  Bar,
  CartesianGrid,
  XAxis,
  YAxis,
  Line,
  LineChart,
} from "recharts";
import {
  AlertCircle,
  Bookmark,
  BarChart3,
  Calendar,
  Camera,
  Clock3,
  Eye,
  FileText,
  Filter,
  Heart,
  Instagram,
  MessageCircle,
  RefreshCw,
  Share2,
  TrendingUp,
  Users,
} from "lucide-react";

type InstagramPostMetrics = {
  reach?: number;
  likes?: number;
  comments?: number;
  saved?: number;
  shares?: number;
  views?: number;
};

type InstagramPostDerivedMetrics = {
  engagement?: number;
  engagementRateByReach?: number;
  saveRateByReach?: number;
  shareRateByReach?: number;
  likeRateByReach?: number;
  commentRateByReach?: number;
  viewToReachRatio?: number;
};

type InstagramPost = {
  id: string;
  caption?: string;
  media_type: string;
  timestamp: string;
  permalink: string;
  metrics: InstagramPostMetrics;
  derived: InstagramPostDerivedMetrics;
};

type BreakdownRow = {
  key: string;
  posts: number;
  reach: number;
  likes: number;
  comments: number;
  saved: number;
  shares: number;
  views: number;
  engagement: number;
  avgReachPerPost: number;
  avgEngagementPerPost: number;
  engagementRateByReach: number;
  saveRateByReach: number;
  shareRateByReach: number;
};

type MonthlyRow = {
  month: string;
  posts: number;
  reach: number;
  likes: number;
  comments: number;
  saved: number;
  shares: number;
  views: number;
  engagement: number;
  avgReachPerPost: number;
  avgEngagementPerPost: number;
  engagementRateByReach: number;
};

type InstagramAnalyticsResponse = {
  account: {
    user_id: string;
    username: string;
    account_type: string;
    followers_count?: number;
    media_count?: number;
  };
  since: string;
  until: string;
  totals: {
    posts: number;
    accountReach: number;
    netFollowers: number;
    postReach: number;
    likes: number;
    comments: number;
    saved: number;
    shares: number;
    views: number;
    engagement: number;
    avgReachPerPost: number;
    avgEngagementPerPost: number;
    avgLikesPerPost: number;
    avgCommentsPerPost: number;
    avgViewsPerPost: number;
    engagementRateByReach: number;
    likeRateByReach: number;
    commentRateByReach: number;
    saveRateByReach: number;
    shareRateByReach: number;
    viewToReachRatio: number;
  };
  accountInsights: {
    reach: any[];
    follower_count: any[];
  };
  monthly: MonthlyRow[];
  mediaTypeBreakdown: BreakdownRow[];
  weekdayBreakdown: BreakdownRow[];
  hourBreakdown: BreakdownRow[];
  topPosts: {
    byReach: InstagramPost[];
    byEngagementRate: InstagramPost[];
    bySaved: InstagramPost[];
    byShares: InstagramPost[];
  };
  posts: InstagramPost[];
  fetchedAt?: number;
  fromCache?: boolean;
};

type TopPostsTab = "byReach" | "byEngagementRate" | "bySaved" | "byShares";

const numberFormatter = new Intl.NumberFormat("en-US");
const compactFormatter = new Intl.NumberFormat("en-US", {
  notation: "compact",
  maximumFractionDigits: 1,
});
const percentFormatter = new Intl.NumberFormat("en-US", {
  style: "percent",
  maximumFractionDigits: 1,
});

const monthlyChartConfig = {
  posts: {
    label: "Posts",
    color: "#75D450",
  },
  avgReachPerPost: {
    label: "Avg Reach / Post",
    color: "#75CFF5",
  },
} satisfies ChartConfig;

const breakdownChartConfig = {
  avgReachPerPost: {
    label: "Avg Reach / Post",
    color: "#A2B1D5",
  },
} satisfies ChartConfig;

const monthlyTrendChartConfig = {
  likes: {
    label: "Likes",
    color: "#F59DAA",
  },
  views: {
    label: "Views",
    color: "#75D450",
  },
  engagementRateByReach: {
    label: "ER by Reach",
    color: "#75CFF5",
  },
} satisfies ChartConfig;

const toIsoDate = (date: Date) => date.toISOString().slice(0, 10);

const buildPresetRange = (preset: "30d" | "90d" | "ytd") => {
  const today = new Date();
  const end = toIsoDate(today);

  if (preset === "ytd") {
    return {
      since: `${today.getFullYear()}-01-01`,
      until: end,
    };
  }

  const days = preset === "30d" ? 30 : 90;
  const start = new Date(today.getTime() - days * 24 * 60 * 60 * 1000);
  return {
    since: toIsoDate(start),
    until: end,
  };
};

const formatNumber = (value: number | undefined) =>
  numberFormatter.format(value || 0);

const formatCompact = (value: number | undefined) =>
  compactFormatter.format(value || 0);

const formatPercent = (value: number | undefined) =>
  percentFormatter.format(value || 0);

const formatDateTime = (iso: string | undefined) => {
  if (!iso) return "—";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleString();
};

const formatDateShort = (iso: string | undefined) => {
  if (!iso) return "—";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
};

const safeCaption = (caption: string | undefined, max = 90) => {
  if (!caption?.trim()) return "No caption";
  const text = caption.trim();
  if (text.length <= max) return text;
  return `${text.slice(0, max - 1)}…`;
};

const formatMediaType = (mediaType: string | undefined) => {
  if (!mediaType) return "Unknown";
  if (mediaType === "CAROUSEL_ALBUM") return "Carousel";
  if (mediaType === "IMAGE") return "Image";
  if (mediaType === "VIDEO") return "Video";
  if (mediaType === "REEL") return "Reel";
  return mediaType
    .toLowerCase()
    .split("_")
    .map((word) => word[0]?.toUpperCase() + word.slice(1))
    .join(" ");
};

const getTopPostMetric = (tab: TopPostsTab, post: InstagramPost) => {
  if (tab === "byEngagementRate") {
    return {
      label: "Engagement Rate",
      value: formatPercent(post.derived.engagementRateByReach),
    };
  }

  if (tab === "bySaved") {
    return {
      label: "Saved",
      value: formatCompact(post.metrics.saved),
    };
  }

  if (tab === "byShares") {
    return {
      label: "Shares",
      value: formatCompact(post.metrics.shares),
    };
  }

  return {
    label: "Reach",
    value: formatCompact(post.metrics.reach),
  };
};

function StatCard({
  icon,
  label,
  value,
  helper,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  helper?: string;
}) {
  return (
    <Card className="border-bt-blue-300/30 bg-bt-blue-500/40">
      <CardContent className="p-4 sm:p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-wide text-bt-blue-100">
              {label}
            </p>
            <p className="mt-2 text-xl font-semibold text-white sm:text-2xl">
              {value}
            </p>
            {helper ? (
              <p className="mt-1 text-xs text-bt-blue-100">{helper}</p>
            ) : null}
          </div>
          <span className="rounded-lg bg-white/10 p-2 text-bt-green-300">
            {icon}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}

function SectionShell({
  title,
  subtitle,
  right,
  children,
  className = "",
}: {
  title: string;
  subtitle?: string;
  right?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <Card className={`border-bt-blue-300/30 bg-bt-blue-500/40 ${className}`}>
      <CardContent className="space-y-4 p-4 sm:p-5">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wide text-white">
              {title}
            </h3>
            {subtitle ? (
              <p className="text-xs text-bt-blue-100">{subtitle}</p>
            ) : null}
          </div>
          {right}
        </div>
        {children}
      </CardContent>
    </Card>
  );
}

function BreakdownChart({
  data,
  title,
  subtitle,
  emptyMessage,
}: {
  data: BreakdownRow[];
  title: string;
  subtitle: string;
  emptyMessage: string;
}) {
  return (
    <SectionShell title={title} subtitle={subtitle}>
      {data.length === 0 ? (
        <div className="rounded-lg border border-dashed border-white/20 p-6 text-center text-sm text-bt-blue-100">
          {emptyMessage}
        </div>
      ) : (
        <ChartContainer
          config={breakdownChartConfig}
          className="h-[250px] w-full"
        >
          <BarChart
            data={data}
            margin={{
              top: 8,
              right: 16,
              left: 0,
              bottom: 8,
            }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#3B486622"
              vertical={false}
            />
            <XAxis
              dataKey="key"
              tick={{ fill: "#BDC8E3", fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              interval="preserveStartEnd"
              minTickGap={18}
            />
            <YAxis
              tick={{ fill: "#BDC8E3", fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(value) =>
                compactFormatter.format(Number(value) || 0)
              }
            />
            <ChartTooltip
              cursor={{ fill: "rgba(255,255,255,0.04)" }}
              content={<ChartTooltipContent />}
            />
            <Bar
              dataKey="avgReachPerPost"
              fill="var(--color-avgReachPerPost)"
              radius={[6, 6, 0, 0]}
            />
          </BarChart>
        </ChartContainer>
      )}
    </SectionShell>
  );
}

function MetricMixRow({
  label,
  value,
  share,
  barClass,
}: {
  label: string;
  value: number;
  share: number;
  barClass: string;
}) {
  const width = share > 0 ? Math.max(share * 100, 5) : 0;
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between gap-3 text-xs">
        <span className="text-white">{label}</span>
        <span className="text-bt-blue-100">
          {formatCompact(value)} ({formatPercent(share)})
        </span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-white/10">
        <div
          className={`h-full rounded-full ${barClass}`}
          style={{ width: `${width}%` }}
        />
      </div>
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {Array.from({ length: 12 }).map((_, idx) => (
          <Skeleton key={idx} className="h-28 w-full rounded-xl bg-white/10" />
        ))}
      </div>
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <Skeleton className="h-96 rounded-xl bg-white/10 xl:col-span-2" />
        <Skeleton className="h-96 rounded-xl bg-white/10" />
      </div>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Skeleton className="h-80 rounded-xl bg-white/10" />
        <Skeleton className="h-80 rounded-xl bg-white/10" />
        <Skeleton className="h-80 rounded-xl bg-white/10" />
      </div>
      <Skeleton className="h-96 rounded-xl bg-white/10" />
    </div>
  );
}

export default function InstagramAnalyticsPage() {
  const [analytics, setAnalytics] = useState<InstagramAnalyticsResponse | null>(
    null,
  );
  const [since, setSince] = useState("");
  const [until, setUntil] = useState("");
  const [filterError, setFilterError] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [topPostsTab, setTopPostsTab] = useState<TopPostsTab>("byReach");
  const [postsPage, setPostsPage] = useState(1);

  const postsPageSize = 12;

  const loadAnalytics = async (params?: {
    since?: string;
    until?: string;
    keepInputs?: boolean;
  }) => {
    const hasData = Boolean(analytics);
    setError(null);

    if (hasData) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }

    try {
      const query = new URLSearchParams();
      if (params?.since) query.set("since", params.since);
      if (params?.until) query.set("until", params.until);

      const endpoint = query.toString()
        ? `/instagram/analytics?${query.toString()}`
        : "/instagram/analytics";

      const response = await fetchBackend({
        endpoint,
        method: "GET",
      });

      setAnalytics(response);
      setPostsPage(1);

      if (!params?.keepInputs) {
        setSince(response.since || "");
        setUntil(response.until || "");
      }
    } catch (err: any) {
      setError(
        err?.message?.message ||
          err?.message ||
          "Failed to load Instagram analytics.",
      );
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    void loadAnalytics();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const applyFilter = async () => {
    if (!since || !until) {
      setFilterError("Please pick both start and end dates.");
      return;
    }

    if (since > until) {
      setFilterError("Start date must be before or equal to end date.");
      return;
    }

    setFilterError(null);
    await loadAnalytics({ since, until, keepInputs: true });
  };

  const applyPreset = async (preset: "30d" | "90d" | "ytd") => {
    const range = buildPresetRange(preset);
    setSince(range.since);
    setUntil(range.until);
    setFilterError(null);
    await loadAnalytics({
      since: range.since,
      until: range.until,
      keepInputs: true,
    });
  };

  const posts = useMemo(() => analytics?.posts ?? [], [analytics?.posts]);
  const totalPostPages = Math.max(1, Math.ceil(posts.length / postsPageSize));

  useEffect(() => {
    if (postsPage > totalPostPages) {
      setPostsPage(totalPostPages);
    }
  }, [postsPage, totalPostPages]);

  const pagedPosts = useMemo(() => {
    const start = (postsPage - 1) * postsPageSize;
    return posts.slice(start, start + postsPageSize);
  }, [posts, postsPage]);

  const engagementMixRows = useMemo(() => {
    if (!analytics) return [];
    const total = analytics.totals.engagement || 0;
    const entries = [
      {
        label: "Likes",
        value: analytics.totals.likes || 0,
        barClass: "bg-[#F59DAA]",
      },
      {
        label: "Comments",
        value: analytics.totals.comments || 0,
        barClass: "bg-[#75CFF5]",
      },
      {
        label: "Saved",
        value: analytics.totals.saved || 0,
        barClass: "bg-[#A2B1D5]",
      },
      {
        label: "Shares",
        value: analytics.totals.shares || 0,
        barClass: "bg-[#75D450]",
      },
    ];

    return entries.map((entry) => ({
      ...entry,
      share: total > 0 ? entry.value / total : 0,
    }));
  }, [analytics]);

  const bestWeekdays = useMemo(
    () =>
      [...(analytics?.weekdayBreakdown || [])]
        .sort((a, b) => b.engagementRateByReach - a.engagementRateByReach)
        .slice(0, 3),
    [analytics?.weekdayBreakdown],
  );

  const bestHours = useMemo(
    () =>
      [...(analytics?.hourBreakdown || [])]
        .sort((a, b) => b.avgReachPerPost - a.avgReachPerPost)
        .slice(0, 3),
    [analytics?.hourBreakdown],
  );

  return (
    <>
      <Head>
        <title>Instagram Analytics | UBC BizTech Admin</title>
      </Head>

      <main className="min-h-screen bg-bt-blue-600 text-white">
        <div className="mx-auto w-full max-w-[1600px] space-y-6 ">
          <section className="space-y-1">
            <h1 className="flex items-center gap-2 text-xl font-semibold text-white sm:text-2xl">
              <Instagram className="h-5 w-5 text-bt-green-300" /> Instagram
              Analytics
            </h1>
            <p className="text-sm text-bt-blue-100">
              Account and post performance dashboard for{" "}
              {analytics?.account?.username || "@ubcbiztech"}.
            </p>
          </section>

          <Card className="border-bt-blue-300/30 bg-bt-blue-500/40">
            <CardContent className="space-y-3 p-3">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(0,1.15fr)_auto] xl:items-end">
                <div>
                  <label className="mb-1 block text-xs text-bt-blue-100">
                    Since
                  </label>
                  <Input
                    type="date"
                    value={since}
                    onChange={(event) => setSince(event.target.value)}
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs text-bt-blue-100">
                    Until
                  </label>
                  <Input
                    type="date"
                    value={until}
                    onChange={(event) => setUntil(event.target.value)}
                  />
                </div>
                <div className="flex flex-wrap gap-2 sm:col-span-2 xl:col-span-1">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => void applyPreset("30d")}
                  >
                    Last 30d
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => void applyPreset("90d")}
                  >
                    Last 90d
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => void applyPreset("ytd")}
                  >
                    YTD
                  </Button>
                </div>
                <div className="flex gap-2 sm:justify-end xl:justify-start">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() =>
                      void loadAnalytics({ since, until, keepInputs: true })
                    }
                    disabled={isLoading || isRefreshing}
                    aria-label="Refresh analytics"
                  >
                    <RefreshCw
                      className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`}
                    />
                  </Button>
                  <Button
                    onClick={() => void applyFilter()}
                    disabled={isLoading || isRefreshing}
                  >
                    <Filter className="mr-2 h-4 w-4" /> Apply
                  </Button>
                </div>
              </div>

              {filterError ? (
                <p className="text-sm text-bt-red-200">{filterError}</p>
              ) : null}
            </CardContent>
          </Card>

          {error ? (
            <Alert className="border-bt-red-200/40 bg-bt-red-200/10 text-bt-red-100">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Unable to load analytics</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          ) : null}

          {isLoading && !analytics ? (
            <LoadingSkeleton />
          ) : analytics ? (
            <>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-6">
                <StatCard
                  icon={<FileText className="h-4 w-4" />}
                  label="Posts in Range"
                  value={formatNumber(analytics.totals.posts)}
                  helper="Published between selected dates"
                />
                <StatCard
                  icon={<Users className="h-4 w-4" />}
                  label="Current Followers"
                  value={
                    typeof analytics.account.followers_count === "number"
                      ? formatNumber(analytics.account.followers_count)
                      : "—"
                  }
                  helper="Live profile follower count"
                />
                <StatCard
                  icon={<Heart className="h-4 w-4" />}
                  label="Total Likes"
                  value={formatCompact(analytics.totals.likes)}
                  helper={`Avg ${formatNumber(Math.round(analytics.totals.avgLikesPerPost || 0))}/post`}
                />
                <StatCard
                  icon={<Eye className="h-4 w-4" />}
                  label="Total Views"
                  value={formatCompact(analytics.totals.views)}
                  helper={`Avg ${formatNumber(Math.round(analytics.totals.avgViewsPerPost || 0))}/post`}
                />
                <StatCard
                  icon={<MessageCircle className="h-4 w-4" />}
                  label="Total Comments"
                  value={formatCompact(analytics.totals.comments)}
                  helper={`Avg ${formatNumber(Math.round(analytics.totals.avgCommentsPerPost || 0))}/post`}
                />
                <StatCard
                  icon={<Bookmark className="h-4 w-4" />}
                  label="Total Saves"
                  value={formatCompact(analytics.totals.saved)}
                  helper={
                    formatPercent(analytics.totals.saveRateByReach) +
                    " save rate by reach"
                  }
                />
                <StatCard
                  icon={<Share2 className="h-4 w-4" />}
                  label="Total Shares"
                  value={formatCompact(analytics.totals.shares)}
                  helper={
                    formatPercent(analytics.totals.shareRateByReach) +
                    " share rate by reach"
                  }
                />
                <StatCard
                  icon={<Camera className="h-4 w-4" />}
                  label="Content Reach"
                  value={formatCompact(analytics.totals.postReach)}
                  helper="Sum of per-post reach"
                />
                <StatCard
                  icon={<BarChart3 className="h-4 w-4" />}
                  label="Total Engagement"
                  value={formatCompact(analytics.totals.engagement)}
                  helper="Likes + comments + saves + shares"
                />
                <StatCard
                  icon={<TrendingUp className="h-4 w-4" />}
                  label="Engagement Rate"
                  value={formatPercent(analytics.totals.engagementRateByReach)}
                  helper="Engagement divided by post reach"
                />
                <StatCard
                  icon={<TrendingUp className="h-4 w-4" />}
                  label="Avg Reach / Post"
                  value={formatNumber(
                    Math.round(analytics.totals.avgReachPerPost || 0),
                  )}
                />
                <StatCard
                  icon={<Clock3 className="h-4 w-4" />}
                  label="Avg Engagement / Post"
                  value={formatNumber(
                    Math.round(analytics.totals.avgEngagementPerPost || 0),
                  )}
                />
              </div>

              <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 2xl:grid-cols-3">
                <SectionShell title="Engagement Mix">
                  <div className="space-y-3">
                    {engagementMixRows.map((row) => (
                      <MetricMixRow
                        key={row.label}
                        label={row.label}
                        value={row.value}
                        share={row.share}
                        barClass={row.barClass}
                      />
                    ))}
                    {analytics.totals.engagement === 0 ? (
                      <p className="text-xs text-bt-blue-100">
                        No engagement data in this range yet.
                      </p>
                    ) : null}
                  </div>
                </SectionShell>

                <SectionShell title="Performance Ratios">
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-2">
                    <div className="rounded-lg border border-white/10 bg-white/[0.03] p-3">
                      <p className="text-[11px] uppercase tracking-wide text-bt-blue-100">
                        Like Rate
                      </p>
                      <p className="mt-1 text-lg font-semibold text-white">
                        {formatPercent(analytics.totals.likeRateByReach)}
                      </p>
                    </div>
                    <div className="rounded-lg border border-white/10 bg-white/[0.03] p-3">
                      <p className="text-[11px] uppercase tracking-wide text-bt-blue-100">
                        Comment Rate
                      </p>
                      <p className="mt-1 text-lg font-semibold text-white">
                        {formatPercent(analytics.totals.commentRateByReach)}
                      </p>
                    </div>
                    <div className="rounded-lg border border-white/10 bg-white/[0.03] p-3">
                      <p className="text-[11px] uppercase tracking-wide text-bt-blue-100">
                        Save Rate
                      </p>
                      <p className="mt-1 text-lg font-semibold text-white">
                        {formatPercent(analytics.totals.saveRateByReach)}
                      </p>
                    </div>
                    <div className="rounded-lg border border-white/10 bg-white/[0.03] p-3">
                      <p className="text-[11px] uppercase tracking-wide text-bt-blue-100">
                        Share Rate
                      </p>
                      <p className="mt-1 text-lg font-semibold text-white">
                        {formatPercent(analytics.totals.shareRateByReach)}
                      </p>
                    </div>
                    <div className="rounded-lg border border-white/10 bg-white/[0.03] p-3 sm:col-span-3 lg:col-span-2">
                      <p className="text-[11px] uppercase tracking-wide text-bt-blue-100">
                        View / Reach Ratio
                      </p>
                      <p className="mt-1 text-lg font-semibold text-white">
                        {formatPercent(analytics.totals.viewToReachRatio)}
                      </p>
                    </div>
                  </div>
                </SectionShell>

                <SectionShell
                  title="Best Posting Windows"
                  className="lg:col-span-2 2xl:col-span-1"
                >
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-1">
                    <div className="space-y-2">
                      <p className="text-xs uppercase tracking-wide text-bt-blue-100">
                        Top Weekdays (Engagement Rate)
                      </p>
                      {bestWeekdays.length === 0 ? (
                        <p className="text-xs text-bt-blue-100">
                          No weekday data available.
                        </p>
                      ) : (
                        bestWeekdays.map((row, index) => (
                          <div
                            key={`weekday-${row.key}`}
                            className="flex items-center justify-between rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-sm"
                          >
                            <span className="text-white">
                              {index + 1}. {row.key}
                            </span>
                            <span className="text-bt-green-300">
                              {formatPercent(row.engagementRateByReach)}
                            </span>
                          </div>
                        ))
                      )}
                    </div>

                    <div className="space-y-2">
                      <p className="text-xs uppercase tracking-wide text-bt-blue-100">
                        Top Hours (Avg Reach)
                      </p>
                      {bestHours.length === 0 ? (
                        <p className="text-xs text-bt-blue-100">
                          No hourly data available.
                        </p>
                      ) : (
                        bestHours.map((row, index) => (
                          <div
                            key={`hour-${row.key}`}
                            className="flex items-center justify-between rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-sm"
                          >
                            <span className="text-white">
                              {index + 1}. {row.key}
                            </span>
                            <span className="text-bt-green-300">
                              {formatCompact(row.avgReachPerPost)}
                            </span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </SectionShell>
              </div>

              <div className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1.45fr)_minmax(0,1fr)] 2xl:grid-cols-3">
                <SectionShell
                  title="Monthly Rollups"
                  subtitle="Posts, reach, and engagement trends by month"
                  className="2xl:col-span-2"
                >
                  {analytics.monthly.length === 0 ? (
                    <div className="rounded-lg border border-dashed border-white/20 p-6 text-center text-sm text-bt-blue-100">
                      No monthly data for this date range.
                    </div>
                  ) : (
                    <>
                      <ChartContainer
                        config={monthlyChartConfig}
                        className="h-[300px] w-full"
                      >
                        <BarChart
                          data={analytics.monthly}
                          margin={{ top: 8, right: 16, left: 0, bottom: 8 }}
                        >
                          <CartesianGrid
                            strokeDasharray="3 3"
                            stroke="#3B486622"
                            vertical={false}
                          />
                          <XAxis
                            dataKey="month"
                            tick={{ fill: "#BDC8E3", fontSize: 11 }}
                            axisLine={false}
                            tickLine={false}
                            interval="preserveStartEnd"
                            minTickGap={20}
                          />
                          <YAxis
                            yAxisId="left"
                            tick={{ fill: "#BDC8E3", fontSize: 11 }}
                            axisLine={false}
                            tickLine={false}
                          />
                          <YAxis
                            yAxisId="right"
                            orientation="right"
                            tick={{ fill: "#BDC8E3", fontSize: 11 }}
                            axisLine={false}
                            tickLine={false}
                            tickFormatter={(value) =>
                              compactFormatter.format(Number(value) || 0)
                            }
                          />
                          <ChartTooltip content={<ChartTooltipContent />} />
                          <Bar
                            yAxisId="left"
                            dataKey="posts"
                            fill="var(--color-posts)"
                            radius={[6, 6, 0, 0]}
                          />
                          <Line
                            yAxisId="right"
                            type="monotone"
                            dataKey="avgReachPerPost"
                            stroke="var(--color-avgReachPerPost)"
                            strokeWidth={2}
                            dot={false}
                          />
                        </BarChart>
                      </ChartContainer>

                      <ChartContainer
                        config={monthlyTrendChartConfig}
                        className="h-[240px] w-full"
                      >
                        <LineChart
                          data={analytics.monthly}
                          margin={{ top: 8, right: 16, left: 0, bottom: 8 }}
                        >
                          <CartesianGrid
                            strokeDasharray="3 3"
                            stroke="#3B486622"
                            vertical={false}
                          />
                          <XAxis
                            dataKey="month"
                            tick={{ fill: "#BDC8E3", fontSize: 11 }}
                            axisLine={false}
                            tickLine={false}
                            interval="preserveStartEnd"
                            minTickGap={20}
                          />
                          <YAxis
                            yAxisId="left"
                            tick={{ fill: "#BDC8E3", fontSize: 11 }}
                            axisLine={false}
                            tickLine={false}
                            tickFormatter={(value) =>
                              compactFormatter.format(Number(value) || 0)
                            }
                          />
                          <YAxis
                            yAxisId="right"
                            orientation="right"
                            tick={{ fill: "#BDC8E3", fontSize: 11 }}
                            axisLine={false}
                            tickLine={false}
                            tickFormatter={(value) =>
                              `${Math.round((Number(value) || 0) * 100)}%`
                            }
                          />
                          <YAxis
                            yAxisId="likesAxis"
                            hide
                            domain={[0, "auto"]}
                          />
                          <ChartTooltip content={<ChartTooltipContent />} />
                          <Line
                            yAxisId="likesAxis"
                            type="monotone"
                            dataKey="likes"
                            stroke="var(--color-likes)"
                            strokeWidth={2}
                            dot={false}
                          />
                          <Line
                            yAxisId="left"
                            type="monotone"
                            dataKey="views"
                            stroke="var(--color-views)"
                            strokeWidth={2}
                            dot={false}
                          />
                          <Line
                            yAxisId="right"
                            type="monotone"
                            dataKey="engagementRateByReach"
                            stroke="var(--color-engagementRateByReach)"
                            strokeWidth={2}
                            strokeDasharray="5 4"
                            dot={false}
                          />
                        </LineChart>
                      </ChartContainer>

                      <div className="hidden overflow-x-auto rounded-lg border border-white/10 md:block">
                        <Table>
                          <TableHeader>
                            <TableRow className="border-white/10 bg-[#6073a5]/70 hover:bg-[#6073a5]/70">
                              <TableHead className="text-white">
                                Month
                              </TableHead>
                              <TableHead className="text-white">
                                Posts
                              </TableHead>
                              <TableHead className="text-white">
                                Reach
                              </TableHead>
                              <TableHead className="text-white">
                                Likes
                              </TableHead>
                              <TableHead className="text-white">
                                Views
                              </TableHead>
                              <TableHead className="text-white">
                                Engagement
                              </TableHead>
                              <TableHead className="text-white">
                                ER by Reach
                              </TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {analytics.monthly.map((row) => (
                              <TableRow
                                key={row.month}
                                className="border-white/10 hover:bg-white/5"
                              >
                                <TableCell>{row.month}</TableCell>
                                <TableCell>{formatNumber(row.posts)}</TableCell>
                                <TableCell>
                                  {formatCompact(row.reach)}
                                </TableCell>
                                <TableCell>
                                  {formatCompact(row.likes)}
                                </TableCell>
                                <TableCell>
                                  {formatCompact(row.views)}
                                </TableCell>
                                <TableCell>
                                  {formatCompact(row.engagement)}
                                </TableCell>
                                <TableCell>
                                  {formatPercent(row.engagementRateByReach)}
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    </>
                  )}
                </SectionShell>

                <SectionShell title="Top Posts">
                  <Tabs
                    value={topPostsTab}
                    onValueChange={(value) =>
                      setTopPostsTab(value as TopPostsTab)
                    }
                    className="space-y-3"
                  >
                    <TabsList className="grid h-auto w-full grid-cols-2 gap-1 rounded-lg bg-bt-blue-500/50 p-1 sm:grid-cols-4">
                      <TabsTrigger
                        value="byReach"
                        className="h-9 min-w-0 justify-center whitespace-normal px-2 text-center text-[11px] leading-tight text-bt-blue-100 data-[state=active]:bg-white/10 data-[state=active]:text-white data-[state=active]:shadow-none sm:text-xs"
                      >
                        Reach
                      </TabsTrigger>
                      <TabsTrigger
                        value="byEngagementRate"
                        className="h-9 min-w-0 justify-center whitespace-normal px-2 text-center text-[11px] leading-tight text-bt-blue-100 data-[state=active]:bg-white/10 data-[state=active]:text-white data-[state=active]:shadow-none sm:text-xs"
                      >
                        ER by Reach
                      </TabsTrigger>
                      <TabsTrigger
                        value="bySaved"
                        className="h-9 min-w-0 justify-center whitespace-normal px-2 text-center text-[11px] leading-tight text-bt-blue-100 data-[state=active]:bg-white/10 data-[state=active]:text-white data-[state=active]:shadow-none sm:text-xs"
                      >
                        Saves
                      </TabsTrigger>
                      <TabsTrigger
                        value="byShares"
                        className="h-9 min-w-0 justify-center whitespace-normal px-2 text-center text-[11px] leading-tight text-bt-blue-100 data-[state=active]:bg-white/10 data-[state=active]:text-white data-[state=active]:shadow-none sm:text-xs"
                      >
                        Shares
                      </TabsTrigger>
                    </TabsList>

                    {(
                      [
                        "byReach",
                        "byEngagementRate",
                        "bySaved",
                        "byShares",
                      ] as TopPostsTab[]
                    ).map((tab) => (
                      <TabsContent key={tab} value={tab} className="space-y-2">
                        {(analytics.topPosts[tab] || []).length === 0 ? (
                          <div className="rounded-lg border border-dashed border-white/20 p-4 text-center text-sm text-bt-blue-100">
                            No posts available for this metric.
                          </div>
                        ) : (
                          (analytics.topPosts[tab] || []).map((post, index) => {
                            const metric = getTopPostMetric(tab, post);
                            return (
                              <a
                                key={`${tab}-${post.id}`}
                                href={post.permalink}
                                target="_blank"
                                rel="noreferrer"
                                className="block rounded-lg border border-white/10 bg-white/[0.03] p-3 transition hover:bg-white/[0.06]"
                              >
                                <div className="flex items-start justify-between gap-3">
                                  <div className="flex items-center gap-2">
                                    <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-white/10 text-xs font-semibold text-white">
                                      {index + 1}
                                    </span>
                                    <span className="rounded bg-white/10 px-2 py-0.5 text-xs text-bt-blue-100">
                                      {formatMediaType(post.media_type)}
                                    </span>
                                  </div>
                                  <div className="text-right">
                                    <p className="text-[11px] uppercase tracking-wide text-bt-blue-100">
                                      {metric.label}
                                    </p>
                                    <p className="text-sm font-semibold text-bt-green-300">
                                      {metric.value}
                                    </p>
                                  </div>
                                </div>

                                <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-white">
                                  {safeCaption(post.caption, 90)}
                                </p>

                                <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-bt-blue-100">
                                  <div className="rounded bg-white/5 px-2 py-1.5">
                                    Reach: {formatCompact(post.metrics.reach)}
                                  </div>
                                  <div className="rounded bg-white/5 px-2 py-1.5">
                                    Views: {formatCompact(post.metrics.views)}
                                  </div>
                                  <div className="rounded bg-white/5 px-2 py-1.5">
                                    Saves: {formatCompact(post.metrics.saved)}
                                  </div>
                                  <div className="rounded bg-white/5 px-2 py-1.5">
                                    ER:{" "}
                                    {formatPercent(
                                      post.derived.engagementRateByReach,
                                    )}
                                  </div>
                                </div>

                                <p className="mt-2 text-xs text-bt-blue-100">
                                  Posted {formatDateTime(post.timestamp)}
                                </p>
                              </a>
                            );
                          })
                        )}
                      </TabsContent>
                    ))}
                  </Tabs>
                </SectionShell>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 2xl:grid-cols-3">
                <BreakdownChart
                  data={analytics.mediaTypeBreakdown}
                  title="Media Type Breakdown"
                  subtitle="Average reach per post by media type"
                  emptyMessage="No media-type breakdown available."
                />
                <BreakdownChart
                  data={analytics.weekdayBreakdown}
                  title="Weekday Breakdown"
                  subtitle="Average reach per post by day of week"
                  emptyMessage="No weekday breakdown available."
                />
                <div className="md:col-span-2 2xl:col-span-1">
                  <BreakdownChart
                    data={analytics.hourBreakdown}
                    title="Posting Hour Breakdown"
                    subtitle="Average reach per post by posting hour"
                    emptyMessage="No hourly breakdown available."
                  />
                </div>
              </div>

              <SectionShell
                title="Post-Level Analytics"
                subtitle="All posts in date range"
                right={
                  <p className="text-xs text-bt-blue-100">
                    Page {postsPage} of {totalPostPages}
                  </p>
                }
              >
                {posts.length === 0 ? (
                  <div className="rounded-lg border border-dashed border-white/20 p-6 text-center text-sm text-bt-blue-100">
                    No posts found in this date range.
                  </div>
                ) : (
                  <>
                    <div className="hidden overflow-x-auto rounded-lg border border-white/10 xl:block">
                      <Table>
                        <TableHeader>
                          <TableRow className="border-white/10 bg-[#6073a5]/70 hover:bg-[#6073a5]/70">
                            <TableHead className="text-white">Posted</TableHead>
                            <TableHead className="text-white">Type</TableHead>
                            <TableHead className="text-white">
                              Caption
                            </TableHead>
                            <TableHead className="text-white">Reach</TableHead>
                            <TableHead className="text-white">Likes</TableHead>
                            <TableHead className="text-white">Views</TableHead>
                            <TableHead className="text-white">
                              Engagement
                            </TableHead>
                            <TableHead className="text-white">ER</TableHead>
                            <TableHead className="text-white">
                              Comments
                            </TableHead>
                            <TableHead className="text-white">Saved</TableHead>
                            <TableHead className="text-white">Shares</TableHead>
                            <TableHead className="text-white">Link</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {pagedPosts.map((post) => (
                            <TableRow
                              key={post.id}
                              className="border-white/10 hover:bg-white/5"
                            >
                              <TableCell className="text-xs text-bt-blue-100">
                                {formatDateTime(post.timestamp)}
                              </TableCell>
                              <TableCell>
                                {formatMediaType(post.media_type)}
                              </TableCell>
                              <TableCell
                                className="max-w-[320px] truncate"
                                title={post.caption || ""}
                              >
                                {safeCaption(post.caption, 90)}
                              </TableCell>
                              <TableCell>
                                {formatCompact(post.metrics.reach)}
                              </TableCell>
                              <TableCell>
                                {formatCompact(post.metrics.likes)}
                              </TableCell>
                              <TableCell>
                                {formatCompact(post.metrics.views)}
                              </TableCell>
                              <TableCell>
                                {formatCompact(post.derived.engagement)}
                              </TableCell>
                              <TableCell>
                                {formatPercent(
                                  post.derived.engagementRateByReach,
                                )}
                              </TableCell>
                              <TableCell>
                                {formatNumber(post.metrics.comments)}
                              </TableCell>
                              <TableCell>
                                {formatNumber(post.metrics.saved)}
                              </TableCell>
                              <TableCell>
                                {formatNumber(post.metrics.shares)}
                              </TableCell>
                              <TableCell>
                                <a
                                  href={post.permalink}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="text-bt-green-300 hover:underline"
                                >
                                  View
                                </a>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>

                    <div className="hidden overflow-x-auto rounded-lg border border-white/10 md:block xl:hidden">
                      <Table>
                        <TableHeader>
                          <TableRow className="border-white/10 bg-[#6073a5]/70 hover:bg-[#6073a5]/70">
                            <TableHead className="text-white">Posted</TableHead>
                            <TableHead className="text-white">Type</TableHead>
                            <TableHead className="text-white">
                              Caption
                            </TableHead>
                            <TableHead className="text-white">Reach</TableHead>
                            <TableHead className="text-white">Views</TableHead>
                            <TableHead className="text-white">ER</TableHead>
                            <TableHead className="text-white">Link</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {pagedPosts.map((post) => (
                            <TableRow
                              key={`${post.id}-compact`}
                              className="border-white/10 hover:bg-white/5"
                            >
                              <TableCell className="text-xs text-bt-blue-100">
                                {formatDateShort(post.timestamp)}
                              </TableCell>
                              <TableCell>
                                {formatMediaType(post.media_type)}
                              </TableCell>
                              <TableCell
                                className="max-w-[280px] truncate"
                                title={post.caption || ""}
                              >
                                {safeCaption(post.caption, 70)}
                              </TableCell>
                              <TableCell>
                                {formatCompact(post.metrics.reach)}
                              </TableCell>
                              <TableCell>
                                {formatCompact(post.metrics.views)}
                              </TableCell>
                              <TableCell>
                                {formatPercent(
                                  post.derived.engagementRateByReach,
                                )}
                              </TableCell>
                              <TableCell>
                                <a
                                  href={post.permalink}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="text-bt-green-300 hover:underline"
                                >
                                  View
                                </a>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>

                    <div className="space-y-2 md:hidden">
                      {pagedPosts.map((post) => (
                        <div
                          key={`${post.id}-mobile-row`}
                          className="rounded-lg border border-white/10 bg-white/[0.03] p-3"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <p className="line-clamp-2 text-sm leading-relaxed text-white">
                                {safeCaption(post.caption, 88)}
                              </p>
                              <p className="mt-1 text-[11px] text-bt-blue-100">
                                {formatMediaType(post.media_type)} •{" "}
                                {formatDateShort(post.timestamp)}
                              </p>
                            </div>
                            <a
                              href={post.permalink}
                              target="_blank"
                              rel="noreferrer"
                              className="shrink-0 rounded-md bg-white/10 px-2 py-1 text-[11px] text-bt-green-300 hover:bg-white/15"
                            >
                              View
                            </a>
                          </div>

                          <div className="mt-3 grid grid-cols-3 gap-2">
                            <div className="rounded-md bg-white/5 px-2 py-1.5">
                              <p className="text-[10px] uppercase tracking-wide text-bt-blue-100">
                                Reach
                              </p>
                              <p className="text-xs font-medium text-white">
                                {formatCompact(post.metrics.reach)}
                              </p>
                            </div>
                            <div className="rounded-md bg-white/5 px-2 py-1.5">
                              <p className="text-[10px] uppercase tracking-wide text-bt-blue-100">
                                ER
                              </p>
                              <p className="text-xs font-medium text-white">
                                {formatPercent(
                                  post.derived.engagementRateByReach,
                                )}
                              </p>
                            </div>
                            <div className="rounded-md bg-white/5 px-2 py-1.5">
                              <p className="text-[10px] uppercase tracking-wide text-bt-blue-100">
                                Views
                              </p>
                              <p className="text-xs font-medium text-white">
                                {formatCompact(post.metrics.views)}
                              </p>
                            </div>
                            <div className="rounded-md bg-white/5 px-2 py-1.5">
                              <p className="text-[10px] uppercase tracking-wide text-bt-blue-100">
                                Likes
                              </p>
                              <p className="text-xs font-medium text-white">
                                {formatCompact(post.metrics.likes)}
                              </p>
                            </div>
                            <div className="rounded-md bg-white/5 px-2 py-1.5">
                              <p className="text-[10px] uppercase tracking-wide text-bt-blue-100">
                                Saved
                              </p>
                              <p className="text-xs font-medium text-white">
                                {formatNumber(post.metrics.saved)}
                              </p>
                            </div>
                            <div className="rounded-md bg-white/5 px-2 py-1.5">
                              <p className="text-[10px] uppercase tracking-wide text-bt-blue-100">
                                Shares
                              </p>
                              <p className="text-xs font-medium text-white">
                                {formatNumber(post.metrics.shares)}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="flex items-center justify-between gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={postsPage <= 1}
                        onClick={() =>
                          setPostsPage((page) => Math.max(1, page - 1))
                        }
                      >
                        Previous
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={postsPage >= totalPostPages}
                        onClick={() =>
                          setPostsPage((page) =>
                            Math.min(totalPostPages, page + 1),
                          )
                        }
                      >
                        Next
                      </Button>
                    </div>
                  </>
                )}
              </SectionShell>
            </>
          ) : null}
        </div>
      </main>
    </>
  );
}
