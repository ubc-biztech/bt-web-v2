import { useMemo } from "react";
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
} from "lucide-react";

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

export default function AnalyticsTab({
  registrations,
  eventData,
}: AnalyticsTabProps) {
  const data = useMemo(() => registrations || [], [registrations]);

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
      return { day, count, cumulative };
    });
  }, [data]);

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
        <p className="text-muted-foreground">No registration data to analyze</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="grid grid-cols-2 gap-3 md:gap-4">
        <Card>
          <CardContent className="pt-3 pb-3 md:pt-4 md:pb-4">
            <p className="text-[11px] md:text-xs text-muted-foreground">
              Total Registrations
            </p>
            <div className="flex items-baseline gap-2">
              <p className="text-2xl md:text-3xl font-bold">{metrics.total}</p>
              {metrics.capacity > 0 && (
                <span className="text-xs md:text-sm text-muted-foreground">
                  / {metrics.capacity}
                </span>
              )}
            </div>
            {metrics.fillRate !== "N/A" && (
              <p className="text-[10px] md:text-xs text-muted-foreground mt-0.5 md:mt-1">
                {metrics.fillRate}% capacity filled
              </p>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-3 pb-3 md:pt-4 md:pb-4">
            <p className="text-[11px] md:text-xs text-muted-foreground">
              Check-In Rate
            </p>
            <p className="text-2xl md:text-3xl font-bold text-bt-green-300">
              {metrics.checkinRate}%
            </p>
            <p className="text-[10px] md:text-xs text-muted-foreground mt-0.5 md:mt-1">
              {metrics.checkedIn} / {metrics.attendees} attendees
            </p>
          </CardContent>
        </Card>
      </div>

      {/* status breakdown */}
      <Card>
        <CardHeader className="pb-3 md:pb-4">
          <CardTitle className="text-base md:text-lg flex items-center gap-2">
            <TrendingUp className="w-4 h-4 md:w-5 md:h-5" />
            Registration Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 md:grid-cols-3 lg:grid-cols-6 gap-2 md:gap-4">
            {statusCards.map((s) => (
              <div
                key={s.label}
                className="flex flex-col md:flex-row items-center md:items-center gap-1 md:gap-3 p-2 md:p-3 rounded-lg bg-bt-blue-500/20"
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

          {/* statuses */}
          {metrics.total > 0 && (
            <div className="mt-4 h-4 rounded-full overflow-hidden flex bg-bt-blue-500/30">
              {(statusCounts["checkedIn"] || 0) > 0 && (
                <div
                  className="h-full bg-bt-green-300"
                  style={{
                    width: `${((statusCounts["checkedIn"] || 0) / metrics.total) * 100}%`,
                  }}
                  title={`Checked In: ${statusCounts["checkedIn"]}`}
                />
              )}
              {(statusCounts["registered"] || 0) > 0 && (
                <div
                  className="h-full bg-bt-blue-100"
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
                  className="h-full bg-bt-green-500"
                  style={{
                    width: `${(((statusCounts["accepted"] || 0) + (statusCounts["acceptedPending"] || 0) + (statusCounts["acceptedComplete"] || 0)) / metrics.total) * 100}%`,
                  }}
                  title="Accepted"
                />
              )}
              {(statusCounts["waitlist"] || 0) > 0 && (
                <div
                  className="h-full bg-bt-blue-0"
                  style={{
                    width: `${((statusCounts["waitlist"] || 0) / metrics.total) * 100}%`,
                  }}
                  title={`Waitlisted: ${statusCounts["waitlist"]}`}
                />
              )}
              {(statusCounts["incomplete"] || 0) > 0 && (
                <div
                  className="h-full bg-bt-red-200"
                  style={{
                    width: `${((statusCounts["incomplete"] || 0) / metrics.total) * 100}%`,
                  }}
                  title={`Incomplete: ${statusCounts["incomplete"]}`}
                />
              )}
              {(statusCounts["cancelled"] || 0) > 0 && (
                <div
                  className="h-full bg-bt-red-400"
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

      {/* application status  */}
      {applicationCounts && (
        <Card>
          <CardHeader className="pb-3 md:pb-4">
            <CardTitle className="text-base md:text-lg flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 md:w-5 md:h-5" />
              Application Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-4">
              {Object.entries(applicationCounts)
                .sort(([, a], [, b]) => b - a)
                .map(([status, count]) => (
                  <div
                    key={status}
                    className="p-3 rounded-lg bg-bt-blue-500/20 text-center"
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
        <Card>
          <CardHeader className="pb-3 md:pb-4">
            <CardTitle className="text-base md:text-lg flex items-center gap-2">
              <BarChart3 className="w-4 h-4 md:w-5 md:h-5" />
              Registration Timeline
            </CardTitle>
          </CardHeader>
          <CardContent>
            {/* cum area chart */}
            <div className="relative">
              {(() => {
                const maxCumulative = Math.max(
                  ...timeline.map((t) => t.cumulative),
                  1,
                );
                const chartHeight = 160;
                const points = timeline.map((entry, idx) => {
                  const x = (idx / (timeline.length - 1)) * 100;
                  const y =
                    chartHeight -
                    (entry.cumulative / maxCumulative) * (chartHeight - 20);
                  return { x, y, ...entry };
                });

                const linePath = points
                  .map((p, i) =>
                    i === 0 ? `M ${p.x} ${p.y}` : `L ${p.x} ${p.y}`,
                  )
                  .join(" ");
                const areaPath = `${linePath} L 100 ${chartHeight} L 0 ${chartHeight} Z`;

                const yLabels = [
                  0,
                  Math.round(maxCumulative / 2),
                  maxCumulative,
                ];

                return (
                  <div className="flex gap-2">
                    <div className="flex flex-col justify-between h-[160px] text-[10px] md:text-xs text-muted-foreground shrink-0 w-6 md:w-8 text-right pr-1">
                      <span>{yLabels[2]}</span>
                      <span>{yLabels[1]}</span>
                      <span>{yLabels[0]}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <svg
                        viewBox={`0 0 100 ${chartHeight}`}
                        preserveAspectRatio="none"
                        className="w-full h-[160px]"
                      >
                        <line
                          x1="0"
                          y1={chartHeight / 2}
                          x2="100"
                          y2={chartHeight / 2}
                          stroke="currentColor"
                          className="text-bt-blue-300/20"
                          strokeWidth="0.3"
                        />
                        <line
                          x1="0"
                          y1="0"
                          x2="100"
                          y2="0"
                          stroke="currentColor"
                          className="text-bt-blue-300/20"
                          strokeWidth="0.3"
                        />

                        <path d={areaPath} fill="url(#areaGradient)" />

                        <path
                          d={linePath}
                          fill="none"
                          stroke="#75D450"
                          strokeWidth="0.8"
                          vectorEffect="non-scaling-stroke"
                        />

                        {points.map((p, i) => (
                          <circle
                            key={i}
                            cx={p.x}
                            cy={p.y}
                            r="1.2"
                            fill="#75D450"
                            vectorEffect="non-scaling-stroke"
                          >
                            <title>{`${p.day}: ${p.cumulative} total (${p.count} new)`}</title>
                          </circle>
                        ))}

                        <defs>
                          <linearGradient
                            id="areaGradient"
                            x1="0"
                            y1="0"
                            x2="0"
                            y2="1"
                          >
                            <stop
                              offset="0%"
                              stopColor="#75D450"
                              stopOpacity="0.3"
                            />
                            <stop
                              offset="100%"
                              stopColor="#75D450"
                              stopOpacity="0.02"
                            />
                          </linearGradient>
                        </defs>
                      </svg>

                      <div className="flex justify-between mt-1">
                        {timeline.length <= 12
                          ? timeline.map((entry, idx) => (
                              <span
                                key={idx}
                                className="text-[9px] md:text-[10px] text-muted-foreground"
                              >
                                {entry.day}
                              </span>
                            ))
                          : [
                              0,
                              Math.floor(timeline.length / 4),
                              Math.floor(timeline.length / 2),
                              Math.floor((3 * timeline.length) / 4),
                              timeline.length - 1,
                            ].map((idx) => (
                              <span
                                key={idx}
                                className="text-[9px] md:text-[10px] text-muted-foreground"
                              >
                                {timeline[idx]?.day}
                              </span>
                            ))}
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>
          </CardContent>
        </Card>
      )}

      {/* demographics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        {/* faculty */}
        {facultyDistribution.length > 0 && (
          <Card>
            <CardHeader className="pb-3 md:pb-4">
              <CardTitle className="text-base md:text-lg">Faculty</CardTitle>
            </CardHeader>
            <CardContent>
              <HorizontalBar items={facultyDistribution} />
            </CardContent>
          </Card>
        )}

        {/* year */}
        {yearDistribution.length > 0 && (
          <Card>
            <CardHeader className="pb-3 md:pb-4">
              <CardTitle className="text-base md:text-lg">Year Level</CardTitle>
            </CardHeader>
            <CardContent>
              <HorizontalBar items={yearDistribution} />
            </CardContent>
          </Card>
        )}

        {/* diet */}
        {dietDistribution.length > 0 && (
          <Card>
            <CardHeader className="pb-3 md:pb-4">
              <CardTitle className="text-base md:text-lg">
                Dietary Restrictions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <HorizontalBar items={dietDistribution} />
            </CardContent>
          </Card>
        )}

        {/* questions */}
        {questionDistributions.map((dist: any, idx: number) => (
          <Card key={idx}>
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
