import React, { useMemo, useState } from "react";
import { fetchBackendFromServer } from "@/lib/db";
import { GetServerSideProps } from "next";
import { Member } from "@/types";
import {
  Users,
  GraduationCap,
  Globe,
  Utensils,
  MessageCircle,
  BarChart3,
  BookOpen,
  Megaphone,
  ChevronDown,
  TrendingUp,
  Filter,
} from "lucide-react";
import Link from "next/link";
import {
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
  Treemap,
  AreaChart,
  Area,
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

// data normalization maps

const MAJOR_ALIASES: Record<string, string> = {
  cs: "Computer Science",
  "comp sci": "Computer Science",
  "computer science": "Computer Science",
  cpsc: "Computer Science",
  compsci: "Computer Science",
  bucs: "BUCS",
  "business + computer science": "BUCS",
  "combined business and computer science": "BUCS",
  "business and computer science": "BUCS",
  "business computer science": "BUCS",
  bcom: "Commerce",
  commerce: "Commerce",
  "general business": "Commerce",
  stats: "Statistics",
  statistics: "Statistics",
  stat: "Statistics",
  math: "Mathematics",
  mathematics: "Mathematics",
  maths: "Mathematics",
  cpen: "Computer Engineering",
  "computer engineering": "Computer Engineering",
  "electrical engineering": "Electrical Engineering",
  elec: "Electrical Engineering",
  ece: "Electrical & Computer Eng.",
  cogs: "Cognitive Systems",
  "cognitive systems": "Cognitive Systems",
  "data science": "Data Science",
  ds: "Data Science",
  econ: "Economics",
  economics: "Economics",
  psych: "Psychology",
  psychology: "Psychology",
  finance: "Finance",
  btm: "Business Technology Mgmt.",
  "business technology management": "Business Technology Mgmt.",
  marketing: "Marketing",
  accounting: "Accounting",
  "information systems": "Information Systems",
  compeng: "Computer Engineering",
};

const FACULTY_ALIASES: Record<string, string> = {
  science: "Science",
  sciences: "Science",
  "faculty of science": "Science",
  arts: "Arts",
  "faculty of arts": "Arts",
  commerce: "Commerce",
  "sauder school of business": "Commerce",
  sauder: "Commerce",
  "applied science": "Applied Science",
  engineering: "Applied Science",
  "faculty of applied science": "Applied Science",
  kinesiology: "Kinesiology",
  "land and food systems": "Land & Food Systems",
  lfs: "Land & Food Systems",
  forestry: "Forestry",
  education: "Education",
  medicine: "Medicine",
};

const YEAR_ALIASES: Record<string, string> = {
  "1": "1st Year",
  "1st": "1st Year",
  "1st year": "1st Year",
  "2": "2nd Year",
  "2nd": "2nd Year",
  "2nd year": "2nd Year",
  "3": "3rd Year",
  "3rd": "3rd Year",
  "3rd year": "3rd Year",
  "4": "4th Year",
  "4th": "4th Year",
  "4th year": "4th Year",
  "5": "5+ Year",
  "5+": "5+ Year",
  "5th": "5+ Year",
  "5+ year": "5+ Year",
  graduate: "Graduate",
  grad: "Graduate",
  alumni: "Alumni",
  other: "Other",
};

const DIET_ALIASES: Record<string, string> = {
  none: "None",
  "no restrictions": "None",
  "n/a": "None",
  na: "None",
  no: "None",
  vegetarian: "Vegetarian",
  vegan: "Vegan",
  halal: "Halal",
  kosher: "Kosher",
  "gluten-free": "Gluten-Free",
  "gluten free": "Gluten-Free",
};

const PRONOUN_ALIASES: Record<string, string> = {
  "he/him": "He/Him",
  "she/her": "She/Her",
  "they/them": "They/Them",
  "he/him/his": "He/Him",
  "she/her/hers": "She/Her",
  "they/them/theirs": "They/Them",
};

const HEARD_FROM_ALIASES: Record<string, string> = {
  instagram: "Instagram",
  ig: "Instagram",
  linkedin: "LinkedIn",
  discord: "Discord",
  "word of mouth": "Word of Mouth",
  friend: "Word of Mouth",
  friends: "Word of Mouth",
  "biztech newsletter": "BizTech Newsletter",
  newsletter: "BizTech Newsletter",
  "faculty newsletter": "Faculty Newsletter",
  boothing: "Boothing / Tabling",
  tabling: "Boothing / Tabling",
  facebook: "Facebook",
  other: "Other",
};

function normalize(
  value: string | undefined | null,
  aliases: Record<string, string>,
): string | null {
  if (!value || !value.trim()) return null;
  const key = value.trim().toLowerCase();
  return aliases[key] ?? titleCase(value.trim());
}

function titleCase(str: string): string {
  return str
    .split(" ")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(" ");
}

// aggregation
type ChartDatum = { name: string; value: number };

function getFieldCounts(
  members: Member[],
  field: keyof Member,
  aliases?: Record<string, string>,
  parser?: (val: any) => string[],
): ChartDatum[] {
  const counts: Record<string, number> = {};

  for (const m of members) {
    const raw = m[field];
    if (raw == null || raw === "") continue;

    if (parser) {
      const values = parser(raw);
      for (const v of values) {
        const clean = aliases ? (normalize(v, aliases) ?? v) : v;
        counts[clean] = (counts[clean] || 0) + 1;
      }
    } else {
      const clean = aliases
        ? (normalize(String(raw), aliases) ?? String(raw))
        : String(raw);
      counts[clean] = (counts[clean] || 0) + 1;
    }
  }

  return Object.entries(counts)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);
}

// components

function SectionCard({
  icon,
  title,
  children,
  className = "",
  span = false,
}: {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
  className?: string;
  span?: boolean;
}) {
  return (
    <div
      className={`rounded-xl border border-bt-blue-300/30 bg-bt-blue-500/40 p-3 sm:p-5 ${span ? "xl:col-span-2" : ""} ${className}`}
    >
      <div className="flex items-center gap-2 sm:gap-2.5 mb-3 sm:mb-4">
        <span className="text-bt-green-300 shrink-0">{icon}</span>
        <h3 className="text-xs sm:text-sm font-semibold text-white tracking-wide uppercase">
          {title}
        </h3>
      </div>
      {children}
    </div>
  );
}

function StatCard({
  label,
  value,
  icon,
  accent = "text-bt-green-300",
}: {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  accent?: string;
}) {
  return (
    <div className="rounded-xl border border-bt-blue-300/30 bg-bt-blue-500/40 p-2.5 sm:p-4 flex items-center gap-2.5 sm:gap-4">
      <div
        className={`p-1.5 sm:p-2.5 rounded-lg bg-bt-blue-600/60 ${accent} shrink-0 [&>svg]:w-4 [&>svg]:h-4 sm:[&>svg]:w-5 sm:[&>svg]:h-5`}
      >
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-lg sm:text-2xl font-bold text-white truncate">
          {value}
        </p>
        <p className="text-[10px] sm:text-xs text-bt-blue-100 leading-tight">
          {label}
        </p>
      </div>
    </div>
  );
}

function ChartTooltip({ active, payload, label, unit = "members" }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg bg-bt-blue-600 border border-bt-blue-300/40 px-3 py-2 shadow-lg">
      <p className="text-sm font-medium text-white">
        {label ?? payload[0]?.name}
      </p>
      <p className="text-xs text-bt-green-300">
        {payload[0]?.value} {unit}
      </p>
    </div>
  );
}

function PieTooltipContent({ active, payload, unit = "members" }: any) {
  if (!active || !payload?.length) return null;
  const d = payload[0];
  return (
    <div className="rounded-lg bg-bt-blue-600 border border-bt-blue-300/40 px-3 py-2 shadow-lg">
      <p className="text-sm font-medium text-white">{d.name}</p>
      <p className="text-xs text-bt-green-300">
        {d.value} {unit} ({((d.value / d.payload.total) * 100).toFixed(1)}%)
      </p>
    </div>
  );
}

function CustomLegend({ payload }: any) {
  if (!payload) return null;
  return (
    <div className="flex flex-wrap justify-center gap-x-4 gap-y-1 mt-2">
      {payload.map((entry: any, i: number) => (
        <span
          key={i}
          className="inline-flex items-center gap-1.5 text-xs text-bt-blue-100"
        >
          <span
            className="inline-block w-2.5 h-2.5 rounded-sm shrink-0"
            style={{ backgroundColor: entry.color }}
          />
          {entry.value}
        </span>
      ))}
    </div>
  );
}

function ThemedBarChart({
  data,
  height = 300,
  layout = "vertical",
  maxBars,
  unit = "members",
}: {
  data: ChartDatum[];
  height?: number;
  layout?: "vertical" | "horizontal";
  maxBars?: number;
  unit?: string;
}) {
  const sliced = maxBars ? data.slice(0, maxBars) : data;
  if (layout === "vertical") {
    const dynamicHeight = Math.max(height, sliced.length * 36);
    return (
      <ResponsiveContainer width="100%" height={dynamicHeight}>
        <BarChart
          data={sliced}
          layout="vertical"
          margin={{ left: 0, right: 8, top: 4, bottom: 4 }}
        >
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="#3B486622"
            horizontal={false}
          />
          <XAxis
            type="number"
            tick={{ fill: "#A2B1D5", fontSize: 11 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            type="category"
            dataKey="name"
            tick={{ fill: "#BDC8E3", fontSize: 10 }}
            width={80}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            content={<ChartTooltip unit={unit} />}
            cursor={{ fill: "#3B486633" }}
          />
          <Bar dataKey="value" radius={[0, 4, 4, 0]} maxBarSize={28}>
            {sliced.map((_, i) => (
              <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    );
  }

  // horizontal layout
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={sliced} margin={{ left: 0, right: 8, top: 4, bottom: 4 }}>
        <CartesianGrid
          strokeDasharray="3 3"
          stroke="#3B486622"
          vertical={false}
        />
        <XAxis
          dataKey="name"
          tick={{ fill: "#BDC8E3", fontSize: 9 }}
          axisLine={false}
          tickLine={false}
          interval={0}
          angle={-35}
          textAnchor="end"
          height={55}
        />
        <YAxis
          tick={{ fill: "#A2B1D5", fontSize: 12 }}
          axisLine={false}
          tickLine={false}
        />
        <Tooltip
          content={<ChartTooltip unit={unit} />}
          cursor={{ fill: "#3B486633" }}
        />
        <Bar dataKey="value" radius={[4, 4, 0, 0]} maxBarSize={40}>
          {sliced.map((_, i) => (
            <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

function ThemedDonutChart({
  data,
  height = 300,
  unit = "members",
}: {
  data: ChartDatum[];
  height?: number;
  unit?: string;
}) {
  const total = data.reduce((s, d) => s + d.value, 0);
  const withTotal = data.map((d) => ({ ...d, total }));

  return (
    <ResponsiveContainer width="100%" height={height}>
      <PieChart>
        <Pie
          data={withTotal}
          cx="50%"
          cy="45%"
          innerRadius="45%"
          outerRadius="75%"
          dataKey="value"
          nameKey="name"
          paddingAngle={2}
          stroke="none"
        >
          {withTotal.map((_, i) => (
            <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
          ))}
        </Pie>
        <Tooltip content={<PieTooltipContent unit={unit} />} />
        <Legend content={<CustomLegend />} />
      </PieChart>
    </ResponsiveContainer>
  );
}

function PercentageBar({ data }: { data: ChartDatum[] }) {
  const total = data.reduce((s, d) => s + d.value, 0);
  if (total === 0) return <p className="text-bt-blue-100 text-sm">No data</p>;

  return (
    <div>
      <div className="flex h-6 sm:h-8 w-full rounded-md overflow-hidden">
        {data.map((d, i) => {
          const pct = (d.value / total) * 100;
          if (pct < 0.5) return null;
          return (
            <div
              key={d.name}
              className="relative group flex items-center justify-center text-[10px] font-semibold text-white/90 transition-all"
              style={{
                width: `${pct}%`,
                backgroundColor: CHART_COLORS[i % CHART_COLORS.length],
              }}
            >
              {pct >= 5 && `${pct.toFixed(0)}%`}
              <div className="absolute -top-9 left-1/2 -translate-x-1/2 hidden group-hover:block rounded bg-bt-blue-600 border border-bt-blue-300/40 px-2 py-1 text-xs whitespace-nowrap z-10 shadow-lg">
                {d.name}: {d.value} ({pct.toFixed(1)}%)
              </div>
            </div>
          );
        })}
      </div>
      <div className="flex flex-wrap gap-x-3 sm:gap-x-4 gap-y-1 mt-2">
        {data.map((d, i) => (
          <span
            key={d.name}
            className="inline-flex items-center gap-1 sm:gap-1.5 text-[10px] sm:text-xs text-bt-blue-100"
          >
            <span
              className="inline-block w-2.5 h-2.5 rounded-sm shrink-0"
              style={{
                backgroundColor: CHART_COLORS[i % CHART_COLORS.length],
              }}
            />
            {d.name} ({d.value})
          </span>
        ))}
      </div>
      <p className="text-xs text-bt-blue-200 mt-1.5">Total: {total}</p>
    </div>
  );
}

function DataTable({
  data,
  maxRows = 10,
}: {
  data: ChartDatum[];
  maxRows?: number;
}) {
  const [expanded, setExpanded] = useState(false);
  const visible = expanded ? data : data.slice(0, maxRows);
  const total = data.reduce((s, d) => s + d.value, 0);

  return (
    <div>
      <div className="rounded-lg border border-bt-blue-300/20 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-bt-blue-300/30">
              <th className="text-left px-3 py-2 text-bt-blue-100 font-medium text-xs">
                Category
              </th>
              <th className="text-right px-3 py-2 text-bt-blue-100 font-medium text-xs">
                Count
              </th>
              <th className="text-right px-3 py-2 text-bt-blue-100 font-medium text-xs">
                %
              </th>
            </tr>
          </thead>
          <tbody>
            {visible.map((d, i) => (
              <tr
                key={d.name}
                className={i % 2 === 0 ? "bg-bt-blue-600/30" : ""}
              >
                <td className="px-3 py-1.5 text-white">{d.name}</td>
                <td className="px-3 py-1.5 text-bt-blue-100 text-right font-mono">
                  {d.value}
                </td>
                <td className="px-3 py-1.5 text-bt-blue-100 text-right font-mono">
                  {((d.value / total) * 100).toFixed(1)}%
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {data.length > maxRows && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="mt-2 text-xs text-bt-green-300 hover:underline flex items-center gap-1"
        >
          <ChevronDown
            className={`w-3 h-3 transition-transform ${expanded ? "rotate-180" : ""}`}
          />
          {expanded ? "Show less" : `Show all ${data.length} entries`}
        </button>
      )}
    </div>
  );
}

function TreemapContent(props: any) {
  const { x, y, width, height, name, value, index } = props;
  if (width < 30 || height < 20) return null;
  return (
    <g>
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        rx={4}
        fill={CHART_COLORS[index % CHART_COLORS.length]}
        stroke="#0D172C"
        strokeWidth={2}
      />
      {width > 50 && height > 30 && (
        <>
          <text
            x={x + width / 2}
            y={y + height / 2 - 6}
            textAnchor="middle"
            fill="#fff"
            fontSize={Math.min(12, width / 8)}
            fontWeight={600}
          >
            {name && name.length > Math.floor(width / 8)
              ? name.slice(0, Math.floor(width / 8)) + "…"
              : name}
          </text>
          <text
            x={x + width / 2}
            y={y + height / 2 + 10}
            textAnchor="middle"
            fill="#ffffffcc"
            fontSize={10}
          >
            {value}
          </text>
        </>
      )}
    </g>
  );
}

// main page
type Props = {
  membersData: Member[] | null;
};

export default function StatisticsPage({ membersData }: Props) {
  const members = useMemo(() => membersData ?? [], [membersData]);
  const memberYears = useMemo(() => {
    const years = new Set<string>();
    for (const m of members) {
      if (!m.createdAt) continue;
      const ts = m.createdAt > 1e12 ? m.createdAt : m.createdAt * 1000;
      const d = new Date(ts);
      // academic year runs sep–aug. signup in Jan 2026 → "2025-2026"
      const calYear = d.getFullYear();
      const month = d.getMonth();
      const academicStart = month >= 8 ? calYear : calYear - 1;
      years.add(`${academicStart}-${academicStart + 1}`);
    }
    return Array.from(years).sort().reverse();
  }, [members]);

  const [selectedMemberYear, setSelectedMemberYear] = useState<string>("all");

  const filteredMembers = useMemo(() => {
    if (selectedMemberYear === "all") return members;
    const [startYr] = selectedMemberYear.split("-").map(Number);
    return members.filter((m) => {
      if (!m.createdAt) return false;
      const ts = m.createdAt > 1e12 ? m.createdAt : m.createdAt * 1000;
      const d = new Date(ts);
      const calYear = d.getFullYear();
      const month = d.getMonth();
      const academicStart = month >= 8 ? calYear : calYear - 1;
      return academicStart === startYr;
    });
  }, [members, selectedMemberYear]);

  const yearData = useMemo(
    () => getFieldCounts(filteredMembers, "year", YEAR_ALIASES),
    [filteredMembers],
  );
  const facultyData = useMemo(
    () => getFieldCounts(filteredMembers, "faculty", FACULTY_ALIASES),
    [filteredMembers],
  );
  const majorData = useMemo(
    () => getFieldCounts(filteredMembers, "major", MAJOR_ALIASES),
    [filteredMembers],
  );
  const pronounsData = useMemo(
    () => getFieldCounts(filteredMembers, "pronouns", PRONOUN_ALIASES),
    [filteredMembers],
  );
  const dietData = useMemo(
    () => getFieldCounts(filteredMembers, "diet", DIET_ALIASES),
    [filteredMembers],
  );
  const heardFromData = useMemo(
    () => getFieldCounts(filteredMembers, "heardFrom", HEARD_FROM_ALIASES),
    [filteredMembers],
  );
  const topicsData = useMemo(
    () =>
      getFieldCounts(
        filteredMembers,
        "topics",
        undefined,
        (t: string | string[]) => {
          if (typeof t === "string")
            return t
              .split(",")
              .map((s) => s.trim())
              .filter(Boolean);
          if (Array.isArray(t)) return t.filter(Boolean);
          return [];
        },
      ),
    [filteredMembers],
  );
  const internationalData = useMemo(
    () =>
      getFieldCounts(filteredMembers, "international", {
        true: "International",
        false: "Domestic",
      }),
    [filteredMembers],
  );
  const prevMemberData = useMemo(
    () =>
      getFieldCounts(filteredMembers, "prevMember", {
        true: "Returning",
        false: "New",
      }),
    [filteredMembers],
  );
  const educationData = useMemo(
    () => getFieldCounts(filteredMembers, "education"),
    [filteredMembers],
  );

  const memberGrowthData = useMemo(() => {
    if (!filteredMembers.length) return [];
    const sorted = [...filteredMembers]
      .filter((m) => m.createdAt)
      .sort((a, b) => a.createdAt - b.createdAt);
    if (!sorted.length) return [];

    const monthMap: Record<string, number> = {};
    for (const m of sorted) {
      const ts = m.createdAt > 1e12 ? m.createdAt : m.createdAt * 1000;
      const date = new Date(ts);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
      monthMap[key] = (monthMap[key] || 0) + 1;
    }

    const months = Object.keys(monthMap).sort();
    let cumulative = 0;
    return months.map((month) => {
      cumulative += monthMap[month];
      return {
        name: month,
        newMembers: monthMap[month],
        totalMembers: cumulative,
      };
    });
  }, [filteredMembers]);

  // member stuff
  const totalMembers = filteredMembers.length;
  const internationalCount = filteredMembers.filter(
    (m) => m.international === true || String(m.international) === "true",
  ).length;
  const internationalPct = totalMembers
    ? ((internationalCount / totalMembers) * 100).toFixed(0)
    : "0";
  const returningCount = filteredMembers.filter(
    (m) => m.prevMember === true || String(m.prevMember) === "true",
  ).length;
  const topFaculty = facultyData[0]?.name ?? "—";

  return (
    <main className="bg-bt-blue-600 min-h-screen w-full text-white">
      <div className="max-w-[1600px] mx-auto sm:px-6 lg:px-8 py-4 sm:py-6 space-y-4 sm:space-y-6">
        {/* header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div>
              <h1 className="text-lg sm:text-2xl font-bold text-white">
                Statistics Dashboard
              </h1>
              <p className="text-xs sm:text-sm text-bt-blue-100 mt-0.5">
                {members.length.toLocaleString()} members
              </p>
            </div>
          </div>
        </div>

        {/* members */}
        {/* year filter */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 w-full">
          <div className="flex items-center gap-2 text-bt-blue-100">
            <Filter className="w-4 h-4 shrink-0" />
            <span className="text-xs sm:text-sm font-medium whitespace-nowrap">
              Membership year:
            </span>
          </div>
          <select
            value={selectedMemberYear}
            onChange={(e) => setSelectedMemberYear(e.target.value)}
            className="rounded-lg border border-bt-blue-300/30 bg-bt-blue-500/60 text-white text-xs sm:text-sm px-2 sm:px-3 py-2 w-full sm:w-auto sm:min-w-[200px] focus:outline-none focus:ring-1 focus:ring-bt-green-400/50"
          >
            <option value="all">All years ({members.length} members)</option>
            {memberYears.map((yr) => {
              const count =
                filteredMembers.length === members.length
                  ? members.filter((m) => {
                      if (!m.createdAt) return false;
                      const ts =
                        m.createdAt > 1e12 ? m.createdAt : m.createdAt * 1000;
                      const d = new Date(ts);
                      const calYear = d.getFullYear();
                      const month = d.getMonth();
                      const academicStart = month >= 8 ? calYear : calYear - 1;
                      return academicStart === Number(yr.split("-")[0]);
                    }).length
                  : filteredMembers.length;
              return (
                <option key={yr} value={yr}>
                  {yr} (
                  {selectedMemberYear === yr ? filteredMembers.length : count}{" "}
                  members)
                </option>
              );
            })}
          </select>
          <p className="hidden sm:block text-xs text-bt-blue-100/60">
            Data from{" "}
            <code className="text-bt-green-300/70">biztechMembers2026</code>{" "}
            table
          </p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4">
          <StatCard
            label="Total Members"
            value={totalMembers.toLocaleString()}
            icon={<Users className="w-5 h-5" />}
          />
          <StatCard
            label="International Students"
            value={`${internationalPct}%`}
            icon={<Globe className="w-5 h-5" />}
            accent="text-[#75CFF5]"
          />
          <StatCard
            label="Returning Members"
            value={returningCount.toLocaleString()}
            icon={<BarChart3 className="w-5 h-5" />}
            accent="text-[#FFC960]"
          />
          <StatCard
            label="Top Faculty"
            value={topFaculty}
            icon={<GraduationCap className="w-5 h-5" />}
            accent="text-[#9F8AD1]"
          />
        </div>

        {/* member signups */}
        {memberGrowthData.length > 0 && (
          <SectionCard
            icon={<TrendingUp className="w-4 h-4" />}
            title={`Member Signups${selectedMemberYear !== "all" ? ` (${selectedMemberYear})` : ""}`}
            span
          >
            <p className="text-xs text-bt-blue-100 mb-3">
              Signup activity
              {selectedMemberYear !== "all"
                ? ` for ${selectedMemberYear}`
                : ""}{" "}
              ({filteredMembers.length} members). Data from{" "}
              <code className="text-bt-green-300/80">biztechMembers2026</code>{" "}
              table.
            </p>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
              <div className="min-h-0">
                <p className="text-xs text-bt-blue-100 mb-2">
                  Cumulative signups
                </p>
                <ResponsiveContainer width="100%" height={200}>
                  <AreaChart
                    data={memberGrowthData}
                    margin={{ left: 0, right: 16, top: 4, bottom: 4 }}
                  >
                    <defs>
                      <linearGradient
                        id="growthGradient"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="5%"
                          stopColor="#75D450"
                          stopOpacity={0.3}
                        />
                        <stop
                          offset="95%"
                          stopColor="#75D450"
                          stopOpacity={0}
                        />
                      </linearGradient>
                    </defs>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="#3B486622"
                      vertical={false}
                    />
                    <XAxis
                      dataKey="name"
                      tick={{ fill: "#BDC8E3", fontSize: 11 }}
                      axisLine={false}
                      tickLine={false}
                      interval={Math.max(
                        0,
                        Math.floor(memberGrowthData.length / 8) - 1,
                      )}
                      angle={-35}
                      textAnchor="end"
                      height={50}
                    />
                    <YAxis
                      tick={{ fill: "#A2B1D5", fontSize: 12 }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip
                      content={({ active, payload, label }: any) => {
                        if (!active || !payload?.length) return null;
                        return (
                          <div className="rounded-lg bg-bt-blue-600 border border-bt-blue-300/40 px-3 py-2 shadow-lg">
                            <p className="text-sm font-medium text-white">
                              {label}
                            </p>
                            <p className="text-xs text-bt-green-300">
                              {payload[0]?.value} total signups
                            </p>
                          </div>
                        );
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="totalMembers"
                      stroke="#75D450"
                      strokeWidth={2}
                      fill="url(#growthGradient)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
              <div className="min-h-0">
                <p className="text-xs text-bt-blue-100 mb-2">
                  New signups per month
                </p>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart
                    data={memberGrowthData}
                    margin={{ left: 0, right: 16, top: 4, bottom: 4 }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="#3B486622"
                      vertical={false}
                    />
                    <XAxis
                      dataKey="name"
                      tick={{ fill: "#BDC8E3", fontSize: 11 }}
                      axisLine={false}
                      tickLine={false}
                      interval={Math.max(
                        0,
                        Math.floor(memberGrowthData.length / 8) - 1,
                      )}
                      angle={-35}
                      textAnchor="end"
                      height={50}
                    />
                    <YAxis
                      tick={{ fill: "#A2B1D5", fontSize: 12 }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip
                      content={({ active, payload, label }: any) => {
                        if (!active || !payload?.length) return null;
                        return (
                          <div className="rounded-lg bg-bt-blue-600 border border-bt-blue-300/40 px-3 py-2 shadow-lg">
                            <p className="text-sm font-medium text-white">
                              {label}
                            </p>
                            <p className="text-xs text-[#75CFF5]">
                              +{payload[0]?.value} new signups
                            </p>
                          </div>
                        );
                      }}
                    />
                    <Bar
                      dataKey="newMembers"
                      radius={[4, 4, 0, 0]}
                      maxBarSize={32}
                      fill="#75CFF5"
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </SectionCard>
        )}

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-3 sm:gap-5">
          {/* education */}
          <SectionCard
            icon={<GraduationCap className="w-4 h-4" />}
            title="Member Type (Education)"
            span
          >
            <PercentageBar data={educationData} />
          </SectionCard>

          {/* academic year */}
          <SectionCard
            icon={<BookOpen className="w-4 h-4" />}
            title="Academic Year"
          >
            <ThemedBarChart data={yearData} layout="horizontal" height={280} />
          </SectionCard>

          {/* faculty */}
          <SectionCard
            icon={<GraduationCap className="w-4 h-4" />}
            title="Faculty Distribution"
          >
            <ThemedDonutChart data={facultyData} height={320} />
          </SectionCard>

          {/* major */}
          <SectionCard
            icon={<BookOpen className="w-4 h-4" />}
            title="Major Distribution"
            span
          >
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
              <div>
                <p className="text-xs text-bt-blue-100 mb-2">
                  Top {Math.min(20, majorData.length)} majors (size = member
                  count)
                </p>
                <ResponsiveContainer width="100%" height={260}>
                  <Treemap
                    data={majorData.slice(0, 20)}
                    dataKey="value"
                    nameKey="name"
                    content={<TreemapContent />}
                  />
                </ResponsiveContainer>
              </div>
              <div className="-mx-1 sm:mx-0">
                <DataTable data={majorData} maxRows={12} />
              </div>
            </div>
          </SectionCard>

          {/* pronouns */}
          <SectionCard
            icon={<MessageCircle className="w-4 h-4" />}
            title="Preferred Pronouns"
          >
            <ThemedDonutChart data={pronounsData} height={280} />
          </SectionCard>

          {/* diet */}
          <SectionCard
            icon={<Utensils className="w-4 h-4" />}
            title="Dietary Restrictions"
          >
            <ThemedDonutChart data={dietData} height={280} />
          </SectionCard>

          {/* international */}
          <SectionCard
            icon={<Globe className="w-4 h-4" />}
            title="International vs. Domestic"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 items-center">
              <ThemedDonutChart data={internationalData} height={220} />
              <div className="space-y-2 sm:space-y-3">
                {internationalData.map((d, i) => (
                  <div
                    key={d.name}
                    className="flex items-center justify-between rounded-lg bg-bt-blue-600/60 px-3 sm:px-4 py-2.5 sm:py-3"
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className="w-3 h-3 rounded-sm shrink-0"
                        style={{
                          backgroundColor:
                            CHART_COLORS[i % CHART_COLORS.length],
                        }}
                      />
                      <span className="text-sm text-white">{d.name}</span>
                    </div>
                    <span className="text-lg font-bold text-white">
                      {d.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </SectionCard>

          {/* previous member */}
          <SectionCard
            icon={<Users className="w-4 h-4" />}
            title="New vs. Returning Members"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 items-center">
              <ThemedDonutChart data={prevMemberData} height={220} />
              <div className="space-y-2 sm:space-y-3">
                {prevMemberData.map((d, i) => (
                  <div
                    key={d.name}
                    className="flex items-center justify-between rounded-lg bg-bt-blue-600/60 px-3 sm:px-4 py-2.5 sm:py-3"
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className="w-3 h-3 rounded-sm shrink-0"
                        style={{
                          backgroundColor:
                            CHART_COLORS[i % CHART_COLORS.length],
                        }}
                      />
                      <span className="text-sm text-white">{d.name}</span>
                    </div>
                    <span className="text-lg font-bold text-white">
                      {d.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </SectionCard>

          {/* topics of interest */}
          <SectionCard
            icon={<BarChart3 className="w-4 h-4" />}
            title="Topics of Interest"
            span
          >
            <ThemedBarChart data={topicsData} layout="vertical" height={300} />
          </SectionCard>

          {/* heard from */}
          <SectionCard
            icon={<Megaphone className="w-4 h-4" />}
            title="How Did You Hear About Us?"
            span
          >
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
              <ThemedBarChart
                data={heardFromData}
                layout="horizontal"
                height={280}
              />
              <PercentageBar data={heardFromData} />
            </div>
          </SectionCard>
        </div>
      </div>
    </main>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  try {
    const membersData = await fetchBackendFromServer({
      endpoint: "/members",
      method: "GET",
      nextServerContext: {
        request: context.req,
        response: context.res,
      },
    });

    return {
      props: { membersData },
    };
  } catch (error) {
    console.error("Failed to fetch member statistics data:", error);
    return {
      props: { membersData: null },
    };
  }
};
