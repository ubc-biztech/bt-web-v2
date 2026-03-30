import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Registration } from "@/types/types";
import {
  Users,
  UserCheck,
  Clock,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  TrendingUp,
  BarChart3,
  Briefcase,
  CalendarDays,
  GraduationCap,
  Megaphone,
  Utensils,
  BookOpen,
  UserCircle,
} from "lucide-react";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

const CHART_COLORS = [
  "#75D450",
  "#A2B1D5",
  "#FF8A9E",
  "#FFC960",
  "#9F8AD1",
  "#75CFF5",
  "#FF9AF8",
  "#8AD1C2",
  "#D1C68A",
  "#EB8273",
  "#7F94FF",
  "#C082D6",
];

interface AnalyticsTabProps {
  registrations: Registration[] | null;
  eventData: any;
}

interface StatusCount {
  label: string;
  count: number;
  color: string;
  icon: React.ReactNode;
}

interface DistributionItem {
  label: string;
  count: number;
  percentage: number;
}

// chart tooltip
function ChartTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-bt-blue-300/30 bg-bt-blue-600 px-3 py-2 shadow-xl">
      <p className="text-xs font-medium text-bt-blue-0 mb-1">{label}</p>
      {payload.map((entry: any, i: number) => (
        <p key={i} className="text-sm" style={{ color: entry.color }}>
          {entry.name}: <span className="font-semibold">{entry.value}</span>
        </p>
      ))}
    </div>
  );
}

// pie tooltip
function PieTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null;
  const entry = payload[0];
  return (
    <div className="rounded-lg border border-bt-blue-300/30 bg-bt-blue-600 px-3 py-2 shadow-xl">
      <p className="text-xs text-bt-blue-0">{entry.name}</p>
      <p className="text-sm font-semibold text-white">
        {entry.value}{" "}
        <span className="text-xs font-normal text-bt-blue-100">
          ({((entry.value / entry.payload.total) * 100).toFixed(0)}%)
        </span>
      </p>
    </div>
  );
}

export default function AnalyticsTab({
  registrations,
  eventData,
}: AnalyticsTabProps) {
  const data = useMemo(() => registrations || [], [registrations]);
  const [timelineMode, setTimelineMode] = useState<"cumulative" | "daily">(
    "cumulative",
  );

  // registration status
  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    data.forEach((r) => {
      const status = r.registrationStatus || "unknown";
      counts[status] = (counts[status] || 0) + 1;
    });
    return counts;
  }, [data]);

  const statusCards: StatusCount[] = useMemo(
    () => [
      {
        label: "Registered",
        count: statusCounts["registered"] || 0,
        color: "text-bt-blue-100",
        icon: <Users className="w-5 h-5 text-bt-blue-100" />,
      },
      {
        label: "Checked In",
        count: statusCounts["checkedIn"] || 0,
        color: "text-bt-green-300",
        icon: <UserCheck className="w-5 h-5 text-bt-green-300" />,
      },
      {
        label: "Waitlisted",
        count: statusCounts["waitlist"] || 0,
        color: "text-bt-blue-0",
        icon: <Clock className="w-5 h-5 text-bt-blue-0" />,
      },
      {
        label: "Accepted",
        count:
          (statusCounts["accepted"] || 0) +
          (statusCounts["acceptedPending"] || 0) +
          (statusCounts["acceptedComplete"] || 0),
        color: "text-bt-green-400",
        icon: <CheckCircle2 className="w-5 h-5 text-bt-green-400" />,
      },
      {
        label: "Incomplete",
        count: statusCounts["incomplete"] || 0,
        color: "text-bt-red-200",
        icon: <AlertTriangle className="w-5 h-5 text-bt-red-200" />,
      },
      {
        label: "Cancelled",
        count: statusCounts["cancelled"] || 0,
        color: "text-bt-red-300",
        icon: <XCircle className="w-5 h-5 text-bt-red-300" />,
      },
    ],
    [statusCounts],
  );

  // application status
  const applicationCounts = useMemo(() => {
    if (!eventData?.isApplicationBased) return null;
    const counts: Record<string, number> = {};
    data.forEach((r) => {
      const status = r.applicationStatus || "pending";
      counts[status] = (counts[status] || 0) + 1;
    });
    return counts;
  }, [data, eventData]);

  const metrics = useMemo(() => {
    const total = data.length;
    const attendees = data.filter((r) => !r.isPartner).length;
    const partners = data.filter((r) => r.isPartner).length;
    const checkedIn = statusCounts["checkedIn"] || 0;
    const capacity = eventData?.capac || 0;
    const checkinRate =
      attendees > 0 ? ((checkedIn / attendees) * 100).toFixed(1) : "0";
    const fillRate =
      capacity > 0 ? ((total / capacity) * 100).toFixed(1) : "N/A";

    return {
      total,
      attendees,
      partners,
      checkedIn,
      capacity,
      checkinRate,
      fillRate,
    };
  }, [data, statusCounts, eventData]);

  // faculty
  const facultyDistribution = useMemo(() => {
    const counts: Record<string, number> = {};
    data.forEach((r) => {
      const faculty = r.basicInformation?.faculty || "Unknown";
      if (faculty) counts[faculty] = (counts[faculty] || 0) + 1;
    });
    const total = data.length || 1;
    return Object.entries(counts)
      .map(([label, count]) => ({
        label,
        count,
        percentage: Math.round((count / total) * 100),
      }))
      .sort((a, b) => b.count - a.count);
  }, [data]);

  // year
  const yearDistribution = useMemo(() => {
    const counts: Record<string, number> = {};
    data.forEach((r) => {
      const year = r.basicInformation?.year || "Unknown";
      if (year) counts[year] = (counts[year] || 0) + 1;
    });
    const total = data.length || 1;
    return Object.entries(counts)
      .map(([label, count]) => ({
        label,
        count,
        percentage: Math.round((count / total) * 100),
      }))
      .sort((a, b) => b.count - a.count);
  }, [data]);

  // diet
  const dietDistribution = useMemo(() => {
    const counts: Record<string, number> = {};
    data.forEach((r) => {
      const diet = r.basicInformation?.diet || "None specified";
      if (diet) counts[diet] = (counts[diet] || 0) + 1;
    });
    const total = data.length || 1;
    return Object.entries(counts)
      .map(([label, count]) => ({
        label,
        count,
        percentage: Math.round((count / total) * 100),
      }))
      .sort((a, b) => b.count - a.count);
  }, [data]);

  // gender
  const genderDistribution = useMemo(() => {
    const counts: Record<string, number> = {};
    data.forEach((r) => {
      const gender = r.basicInformation?.gender || "Not specified";
      if (gender) counts[gender] = (counts[gender] || 0) + 1;
    });
    const total = data.length || 1;
    return Object.entries(counts)
      .map(([label, count]) => ({
        label,
        count,
        percentage: Math.round((count / total) * 100),
        total,
      }))
      .sort((a, b) => b.count - a.count);
  }, [data]);

  // major
  const majorDistribution = useMemo(() => {
    const counts: Record<string, number> = {};
    data.forEach((r) => {
      const major = r.basicInformation?.major || "Unknown";
      if (major) counts[major] = (counts[major] || 0) + 1;
    });
    const total = data.length || 1;
    return Object.entries(counts)
      .map(([label, count]) => ({
        label,
        count,
        percentage: Math.round((count / total) * 100),
      }))
      .sort((a, b) => b.count - a.count);
  }, [data]);

  // heard from
  const heardFromDistribution = useMemo(() => {
    const counts: Record<string, number> = {};
    data.forEach((r) => {
      const source = r.basicInformation?.heardFrom || "Unknown";
      if (source) {
        const values = String(source)
          .split(",")
          .map((v) => v.trim());
        values.forEach((v) => {
          if (v) counts[v] = (counts[v] || 0) + 1;
        });
      }
    });
    const total = data.length || 1;
    return Object.entries(counts)
      .map(([label, count]) => ({
        label,
        count,
        percentage: Math.round((count / total) * 100),
      }))
      .sort((a, b) => b.count - a.count);
  }, [data]);

  // reg timeline
  const timeline = useMemo(() => {
    const entries = data
      .filter((r) => r.createdAt)
      .map((r) => new Date(r.createdAt!).getTime())
      .sort((a, b) => a - b);

    if (entries.length === 0) return [];

    const dayCounts: Record<string, number> = {};
    entries.forEach((ts) => {
      const day = new Date(ts).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
      dayCounts[day] = (dayCounts[day] || 0) + 1;
    });

    let cumulative = 0;
    return Object.entries(dayCounts).map(([day, count]) => {
      cumulative += count;
      return { day, daily: count, cumulative };
    });
  }, [data]);

  const peakDay = useMemo(() => {
    if (timeline.length === 0) return null;
    return timeline.reduce((max, t) => (t.daily > max.daily ? t : max));
  }, [timeline]);

  const avgDailyRegistrations = useMemo(() => {
    if (timeline.length === 0) return 0;
    const total = timeline.reduce((sum, t) => sum + t.daily, 0);
    return (total / timeline.length).toFixed(1);
  }, [timeline]);

  const questionDistributions = useMemo(() => {
    if (!eventData?.registrationQuestions) return [];
    return eventData.registrationQuestions
      .filter(
        (q: any) =>
          q.type === "select" ||
          q.type === "checkbox" ||
          q.type === "workshop" ||
          q.choices,
      )
      .map((q: any) => {
        const counts: Record<string, number> = {};
        data.forEach((r) => {
          const response = r.dynamicResponses?.[q.questionId];
          if (response) {
            const values = String(response)
              .split(",")
              .map((v) => v.trim());
            values.forEach((v) => {
              if (v) counts[v] = (counts[v] || 0) + 1;
            });
          }
        });
        const total = data.length || 1;
        return {
          question: q.label,
          items: Object.entries(counts)
            .map(([label, count]) => ({
              label,
              count,
              percentage: Math.round((count / total) * 100),
            }))
            .sort((a, b) => b.count - a.count),
        };
      })
      .filter((d: any) => d.items.length > 0);
  }, [data, eventData]);

  const HorizontalBar = ({
    items,
    maxItems = 10,
  }: {
    items: DistributionItem[];
    maxItems?: number;
  }) => {
    const displayItems = items.slice(0, maxItems);
    const maxCount = Math.max(...displayItems.map((i) => i.count), 1);
    return (
      <div className="space-y-1.5 md:space-y-2">
        {displayItems.map((item) => (
          <div key={item.label} className="flex items-center gap-2 md:gap-3">
            <span className="text-xs md:text-sm text-muted-foreground w-20 md:w-28 truncate text-right shrink-0">
              {item.label}
            </span>
            <div className="flex-1 h-5 md:h-6 bg-bt-blue-500/30 rounded overflow-hidden">
              <div
                className="h-full bg-bt-green-400/60 rounded transition-all duration-500"
                style={{ width: `${(item.count / maxCount) * 100}%` }}
              />
            </div>
            <span className="text-xs md:text-sm font-medium w-12 md:w-16 text-right shrink-0">
              {item.count}{" "}
              <span className="text-muted-foreground text-[10px] md:text-xs">
                ({item.percentage}%)
              </span>
            </span>
          </div>
        ))}
        {items.length > maxItems && (
          <p className="text-[10px] md:text-xs text-muted-foreground text-center mt-2">
            +{items.length - maxItems} more
          </p>
        )}
      </div>
    );
  };

  if (!data.length) {
    return (
      <div className="flex flex-col items-center justify-center h-40">
        <BarChart3 className="w-12 h-12 text-muted-foreground opacity-50 mb-4" />
        <p className="text-muted-foreground">no registration data yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 md:space-y-6">
      {/* kpi cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 md:gap-3">
        {/* total registrations */}
        <Card className="border-bt-blue-300/30 bg-bt-blue-500/40">
          <CardContent className="pt-3 pb-3 md:pt-4 md:pb-4 px-3 md:px-4">
            <div className="flex items-center gap-2 mb-1">
              <div className="rounded-lg bg-bt-blue-600/60 p-1.5">
                <Users className="w-3.5 h-3.5 md:w-4 md:h-4 text-bt-green-300" />
              </div>
              <p className="text-[10px] md:text-xs text-bt-blue-100">
                Registrations
              </p>
            </div>
            <div className="flex items-baseline gap-1.5">
              <p className="text-2xl md:text-3xl font-bold">{metrics.total}</p>
              {metrics.capacity > 0 && (
                <span className="text-xs md:text-sm text-bt-blue-200">
                  / {metrics.capacity}
                </span>
              )}
            </div>
            {metrics.fillRate !== "N/A" && (
              <div className="mt-1.5 h-1.5 rounded-full bg-bt-blue-500/50 overflow-hidden">
                <div
                  className="h-full rounded-full bg-bt-green-400 transition-all duration-500"
                  style={{
                    width: `${Math.min(parseFloat(metrics.fillRate), 100)}%`,
                  }}
                />
              </div>
            )}
          </CardContent>
        </Card>

        {/* check-in rate */}
        <Card className="border-bt-blue-300/30 bg-bt-blue-500/40">
          <CardContent className="pt-3 pb-3 md:pt-4 md:pb-4 px-3 md:px-4">
            <div className="flex items-center gap-2 mb-1">
              <div className="rounded-lg bg-bt-blue-600/60 p-1.5">
                <UserCheck className="w-3.5 h-3.5 md:w-4 md:h-4 text-bt-green-300" />
              </div>
              <p className="text-[10px] md:text-xs text-bt-blue-100">
                Check-In Rate
              </p>
            </div>
            <p className="text-2xl md:text-3xl font-bold text-bt-green-300">
              {metrics.checkinRate}%
            </p>
            <p className="text-[10px] md:text-xs text-bt-blue-200 mt-0.5">
              {metrics.checkedIn} / {metrics.attendees} attendees
            </p>
          </CardContent>
        </Card>

        {/* attendees vs partners */}
        <Card className="border-bt-blue-300/30 bg-bt-blue-500/40">
          <CardContent className="pt-3 pb-3 md:pt-4 md:pb-4 px-3 md:px-4">
            <div className="flex items-center gap-2 mb-1">
              <div className="rounded-lg bg-bt-blue-600/60 p-1.5">
                <Briefcase className="w-3.5 h-3.5 md:w-4 md:h-4 text-bt-green-300" />
              </div>
              <p className="text-[10px] md:text-xs text-bt-blue-100">
                Breakdown
              </p>
            </div>
            <p className="text-2xl md:text-3xl font-bold">
              {metrics.attendees}
            </p>
            <p className="text-[10px] md:text-xs text-bt-blue-200 mt-0.5">
              attendees{" "}
              {metrics.partners > 0 && (
                <span>
                  + {metrics.partners} partner{metrics.partners !== 1 && "s"}
                </span>
              )}
            </p>
          </CardContent>
        </Card>

        {/* peak day */}
        {peakDay && (
          <Card className="border-bt-blue-300/30 bg-bt-blue-500/40">
            <CardContent className="pt-3 pb-3 md:pt-4 md:pb-4 px-3 md:px-4">
              <div className="flex items-center gap-2 mb-1">
                <div className="rounded-lg bg-bt-blue-600/60 p-1.5">
                  <TrendingUp className="w-3.5 h-3.5 md:w-4 md:h-4 text-bt-green-300" />
                </div>
                <p className="text-[10px] md:text-xs text-bt-blue-100">
                  Peak Day
                </p>
              </div>
              <p className="text-2xl md:text-3xl font-bold">{peakDay.daily}</p>
              <p className="text-[10px] md:text-xs text-bt-blue-200 mt-0.5">
                on {peakDay.day}
              </p>
            </CardContent>
          </Card>
        )}

        {/* avg daily */}
        {timeline.length > 1 && (
          <Card className="border-bt-blue-300/30 bg-bt-blue-500/40">
            <CardContent className="pt-3 pb-3 md:pt-4 md:pb-4 px-3 md:px-4">
              <div className="flex items-center gap-2 mb-1">
                <div className="rounded-lg bg-bt-blue-600/60 p-1.5">
                  <CalendarDays className="w-3.5 h-3.5 md:w-4 md:h-4 text-bt-green-300" />
                </div>
                <p className="text-[10px] md:text-xs text-bt-blue-100">
                  Avg / Day
                </p>
              </div>
              <p className="text-2xl md:text-3xl font-bold">
                {avgDailyRegistrations}
              </p>
              <p className="text-[10px] md:text-xs text-bt-blue-200 mt-0.5">
                over {timeline.length} day{timeline.length !== 1 && "s"}
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* status breakdown */}
      <Card className="border-bt-blue-300/30 bg-bt-blue-500/40">
        <CardHeader className="pb-3 md:pb-4">
          <CardTitle className="text-base md:text-lg flex items-center gap-2">
            <TrendingUp className="w-4 h-4 md:w-5 md:h-5 text-bt-green-300" />
            Registration Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 lg:grid-cols-6 gap-2 md:gap-3">
            {statusCards.map((s) => (
              <div
                key={s.label}
                className="flex flex-col md:flex-row items-center md:items-center gap-1 md:gap-3 p-2 md:p-3 rounded-lg bg-bt-blue-600/40"
              >
                <span className="hidden md:block">{s.icon}</span>
                <div className="text-center md:text-left">
                  <p className={`text-lg md:text-xl font-bold ${s.color}`}>
                    {s.count}
                  </p>
                  <p className="text-[10px] md:text-xs text-muted-foreground">
                    {s.label}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* status bar */}
          {metrics.total > 0 && (
            <div className="mt-4 h-3 md:h-4 rounded-full overflow-hidden flex bg-bt-blue-600/40">
              {(statusCounts["checkedIn"] || 0) > 0 && (
                <div
                  className="h-full bg-bt-green-300 transition-all duration-500"
                  style={{
                    width: `${((statusCounts["checkedIn"] || 0) / metrics.total) * 100}%`,
                  }}
                  title={`Checked In: ${statusCounts["checkedIn"]}`}
                />
              )}
              {(statusCounts["registered"] || 0) > 0 && (
                <div
                  className="h-full bg-bt-blue-100 transition-all duration-500"
                  style={{
                    width: `${((statusCounts["registered"] || 0) / metrics.total) * 100}%`,
                  }}
                  title={`Registered: ${statusCounts["registered"]}`}
                />
              )}
              {(statusCounts["accepted"] || 0) +
                (statusCounts["acceptedPending"] || 0) +
                (statusCounts["acceptedComplete"] || 0) >
                0 && (
                <div
                  className="h-full bg-bt-green-500 transition-all duration-500"
                  style={{
                    width: `${(((statusCounts["accepted"] || 0) + (statusCounts["acceptedPending"] || 0) + (statusCounts["acceptedComplete"] || 0)) / metrics.total) * 100}%`,
                  }}
                  title="Accepted"
                />
              )}
              {(statusCounts["waitlist"] || 0) > 0 && (
                <div
                  className="h-full bg-bt-blue-0 transition-all duration-500"
                  style={{
                    width: `${((statusCounts["waitlist"] || 0) / metrics.total) * 100}%`,
                  }}
                  title={`Waitlisted: ${statusCounts["waitlist"]}`}
                />
              )}
              {(statusCounts["incomplete"] || 0) > 0 && (
                <div
                  className="h-full bg-bt-red-200 transition-all duration-500"
                  style={{
                    width: `${((statusCounts["incomplete"] || 0) / metrics.total) * 100}%`,
                  }}
                  title={`Incomplete: ${statusCounts["incomplete"]}`}
                />
              )}
              {(statusCounts["cancelled"] || 0) > 0 && (
                <div
                  className="h-full bg-bt-red-400 transition-all duration-500"
                  style={{
                    width: `${((statusCounts["cancelled"] || 0) / metrics.total) * 100}%`,
                  }}
                  title={`Cancelled: ${statusCounts["cancelled"]}`}
                />
              )}
            </div>
          )}
          <div className="flex flex-wrap gap-x-3 gap-y-1 md:gap-4 mt-2 text-[10px] md:text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-bt-green-300" /> Checked
              In
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-bt-blue-100" />{" "}
              Registered
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-bt-green-500" /> Accepted
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-bt-blue-0" /> Waitlisted
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-bt-red-200" /> Incomplete
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-bt-red-400" /> Cancelled
            </span>
          </div>
        </CardContent>
      </Card>

      {/* application status */}
      {applicationCounts && (
        <Card className="border-bt-blue-300/30 bg-bt-blue-500/40">
          <CardHeader className="pb-3 md:pb-4">
            <CardTitle className="text-base md:text-lg flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 md:w-5 md:h-5 text-bt-green-300" />
              Application Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-3">
              {Object.entries(applicationCounts)
                .sort(([, a], [, b]) => b - a)
                .map(([status, count]) => (
                  <div
                    key={status}
                    className="p-3 rounded-lg bg-bt-blue-600/40 text-center"
                  >
                    <p className="text-2xl font-bold">{count}</p>
                    <p className="text-xs text-muted-foreground capitalize">
                      {status}
                    </p>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* registration timeline */}
      {timeline.length > 1 && (
        <Card className="border-bt-blue-300/30 bg-bt-blue-500/40">
          <CardHeader className="pb-2 md:pb-3">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <CardTitle className="text-base md:text-lg flex items-center gap-2">
                <BarChart3 className="w-4 h-4 md:w-5 md:h-5 text-bt-green-300" />
                Registration Timeline
              </CardTitle>
              <div className="flex bg-bt-blue-600/60 rounded-lg p-0.5 border border-bt-blue-300/20">
                <button
                  onClick={() => setTimelineMode("cumulative")}
                  className={`px-2.5 md:px-3 py-1 text-[10px] md:text-xs rounded-md font-medium transition-colors ${
                    timelineMode === "cumulative"
                      ? "bg-bt-green-400 text-bt-blue-700"
                      : "text-bt-blue-100 hover:text-white"
                  }`}
                >
                  Cumulative
                </button>
                <button
                  onClick={() => setTimelineMode("daily")}
                  className={`px-2.5 md:px-3 py-1 text-[10px] md:text-xs rounded-md font-medium transition-colors ${
                    timelineMode === "daily"
                      ? "bg-bt-green-400 text-bt-blue-700"
                      : "text-bt-blue-100 hover:text-white"
                  }`}
                >
                  Daily
                </button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="w-full h-[200px] md:h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                {timelineMode === "cumulative" ? (
                  <AreaChart
                    data={timeline}
                    margin={{ top: 8, right: 8, left: -12, bottom: 0 }}
                  >
                    <defs>
                      <linearGradient
                        id="cumulativeGradient"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="5%"
                          stopColor="#75D450"
                          stopOpacity={0.35}
                        />
                        <stop
                          offset="95%"
                          stopColor="#75D450"
                          stopOpacity={0.02}
                        />
                      </linearGradient>
                    </defs>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="#3B4866"
                      strokeOpacity={0.3}
                      vertical={false}
                    />
                    <XAxis
                      dataKey="day"
                      tick={{ fontSize: 10, fill: "#7282A8" }}
                      tickLine={false}
                      axisLine={{ stroke: "#3B4866", strokeOpacity: 0.3 }}
                      interval={
                        timeline.length <= 10
                          ? 0
                          : Math.floor(timeline.length / 5)
                      }
                      angle={timeline.length > 14 ? -45 : 0}
                      textAnchor={timeline.length > 14 ? "end" : "middle"}
                      height={timeline.length > 14 ? 50 : 30}
                    />
                    <YAxis
                      tick={{ fontSize: 10, fill: "#7282A8" }}
                      tickLine={false}
                      axisLine={false}
                      allowDecimals={false}
                    />
                    <Tooltip content={<ChartTooltip />} />
                    <Area
                      type="monotone"
                      dataKey="cumulative"
                      name="Total"
                      stroke="#75D450"
                      strokeWidth={2}
                      fill="url(#cumulativeGradient)"
                      dot={{
                        fill: "#75D450",
                        strokeWidth: 0,
                        r: timeline.length > 30 ? 0 : 3,
                      }}
                      activeDot={{
                        r: 5,
                        fill: "#75D450",
                        stroke: "#0D172C",
                        strokeWidth: 2,
                      }}
                    />
                  </AreaChart>
                ) : (
                  <BarChart
                    data={timeline}
                    margin={{ top: 8, right: 8, left: -12, bottom: 0 }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="#3B4866"
                      strokeOpacity={0.3}
                      vertical={false}
                    />
                    <XAxis
                      dataKey="day"
                      tick={{ fontSize: 10, fill: "#7282A8" }}
                      tickLine={false}
                      axisLine={{ stroke: "#3B4866", strokeOpacity: 0.3 }}
                      interval={
                        timeline.length <= 10
                          ? 0
                          : Math.floor(timeline.length / 5)
                      }
                      angle={timeline.length > 14 ? -45 : 0}
                      textAnchor={timeline.length > 14 ? "end" : "middle"}
                      height={timeline.length > 14 ? 50 : 30}
                    />
                    <YAxis
                      tick={{ fontSize: 10, fill: "#7282A8" }}
                      tickLine={false}
                      axisLine={false}
                      allowDecimals={false}
                    />
                    <Tooltip content={<ChartTooltip />} />
                    <Bar
                      dataKey="daily"
                      name="New"
                      fill="#75D450"
                      radius={[3, 3, 0, 0]}
                      maxBarSize={40}
                      fillOpacity={0.8}
                    />
                  </BarChart>
                )}
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}

      {/* gender + heard from */}
      {(genderDistribution.length > 0 || heardFromDistribution.length > 0) && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
          {/* gender */}
          {genderDistribution.length > 0 && (
            <Card className="border-bt-blue-300/30 bg-bt-blue-500/40">
              <CardHeader className="pb-2 md:pb-3">
                <CardTitle className="text-base md:text-lg flex items-center gap-2">
                  <UserCircle className="w-4 h-4 md:w-5 md:h-5 text-bt-green-300" />
                  Gender
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="w-full h-[200px] md:h-[240px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={genderDistribution.map((d) => ({
                          ...d,
                          name: d.label,
                          value: d.count,
                          total: data.length,
                        }))}
                        cx="50%"
                        cy="50%"
                        innerRadius="45%"
                        outerRadius="75%"
                        paddingAngle={2}
                        dataKey="value"
                        stroke="none"
                      >
                        {genderDistribution.map((_, idx) => (
                          <Cell
                            key={idx}
                            fill={CHART_COLORS[idx % CHART_COLORS.length]}
                          />
                        ))}
                      </Pie>
                      <Tooltip content={<PieTooltip />} />
                      <Legend
                        iconSize={8}
                        formatter={(value: string) => (
                          <span className="text-xs text-bt-blue-100">
                            {value}
                          </span>
                        )}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          )}

          {/* heard from */}
          {heardFromDistribution.length > 0 && (
            <Card className="border-bt-blue-300/30 bg-bt-blue-500/40">
              <CardHeader className="pb-3 md:pb-4">
                <CardTitle className="text-base md:text-lg flex items-center gap-2">
                  <Megaphone className="w-4 h-4 md:w-5 md:h-5 text-bt-green-300" />
                  How Did They Hear About Us?
                </CardTitle>
              </CardHeader>
              <CardContent>
                <HorizontalBar items={heardFromDistribution} />
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* demographics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        {/* faculty */}
        {facultyDistribution.length > 0 && (
          <Card className="border-bt-blue-300/30 bg-bt-blue-500/40">
            <CardHeader className="pb-3 md:pb-4">
              <CardTitle className="text-base md:text-lg flex items-center gap-2">
                <GraduationCap className="w-4 h-4 md:w-5 md:h-5 text-bt-green-300" />
                Faculty
              </CardTitle>
            </CardHeader>
            <CardContent>
              <HorizontalBar items={facultyDistribution} />
            </CardContent>
          </Card>
        )}

        {/* year */}
        {yearDistribution.length > 0 && (
          <Card className="border-bt-blue-300/30 bg-bt-blue-500/40">
            <CardHeader className="pb-3 md:pb-4">
              <CardTitle className="text-base md:text-lg flex items-center gap-2">
                <BookOpen className="w-4 h-4 md:w-5 md:h-5 text-bt-green-300" />
                Year Level
              </CardTitle>
            </CardHeader>
            <CardContent>
              <HorizontalBar items={yearDistribution} />
            </CardContent>
          </Card>
        )}

        {/* major */}
        {majorDistribution.length > 0 && (
          <Card className="border-bt-blue-300/30 bg-bt-blue-500/40">
            <CardHeader className="pb-3 md:pb-4">
              <CardTitle className="text-base md:text-lg flex items-center gap-2">
                <GraduationCap className="w-4 h-4 md:w-5 md:h-5 text-bt-green-300" />
                Major
              </CardTitle>
            </CardHeader>
            <CardContent>
              <HorizontalBar items={majorDistribution} maxItems={12} />
            </CardContent>
          </Card>
        )}

        {/* diet */}
        {dietDistribution.length > 0 && (
          <Card className="border-bt-blue-300/30 bg-bt-blue-500/40">
            <CardHeader className="pb-3 md:pb-4">
              <CardTitle className="text-base md:text-lg flex items-center gap-2">
                <Utensils className="w-4 h-4 md:w-5 md:h-5 text-bt-green-300" />
                Dietary Restrictions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <HorizontalBar items={dietDistribution} />
            </CardContent>
          </Card>
        )}

        {/* custom questions */}
        {questionDistributions.map((dist: any, idx: number) => (
          <Card key={idx} className="border-bt-blue-300/30 bg-bt-blue-500/40">
            <CardHeader className="pb-3 md:pb-4">
              <CardTitle className="text-base md:text-lg truncate">
                {dist.question}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <HorizontalBar items={dist.items} />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
