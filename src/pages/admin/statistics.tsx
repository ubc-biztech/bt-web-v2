import React, { useMemo, useState } from "react";
import { fetchBackendFromServer } from "@/lib/db";
import { GetServerSideProps } from "next";
import { Member, BiztechEvent } from "@/types";
import {
  Users,
  GraduationCap,
  Globe,
  Utensils,
  MessageCircle,
  BarChart3,
  BookOpen,
  Megaphone,
  ArrowLeft,
  ChevronDown,
  CalendarDays,
  TrendingUp,
  MapPin,
  Ticket,
  Activity,
  ClipboardCheck,
  UserCheck,
  Repeat,
  QrCode,
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
      className={`rounded-xl border border-bt-blue-300/30 bg-bt-blue-500/40 p-5 ${span ? "xl:col-span-2" : ""} ${className}`}
    >
      <div className="flex items-center gap-2.5 mb-4">
        <span className="text-bt-green-300">{icon}</span>
        <h3 className="text-sm font-semibold text-white tracking-wide uppercase">
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
    <div className="rounded-xl border border-bt-blue-300/30 bg-bt-blue-500/40 p-4 flex items-center gap-4">
      <div className={`p-2.5 rounded-lg bg-bt-blue-600/60 ${accent}`}>
        {icon}
      </div>
      <div>
        <p className="text-2xl font-bold text-white">{value}</p>
        <p className="text-xs text-bt-blue-100">{label}</p>
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
          margin={{ left: 8, right: 16, top: 4, bottom: 4 }}
        >
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="#3B486622"
            horizontal={false}
          />
          <XAxis
            type="number"
            tick={{ fill: "#A2B1D5", fontSize: 12 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            type="category"
            dataKey="name"
            tick={{ fill: "#BDC8E3", fontSize: 12 }}
            width={140}
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
      <BarChart
        data={sliced}
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
          interval={0}
          angle={-35}
          textAnchor="end"
          height={70}
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
      <div className="flex h-8 w-full rounded-md overflow-hidden">
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
      <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2.5">
        {data.map((d, i) => (
          <span
            key={d.name}
            className="inline-flex items-center gap-1.5 text-xs text-bt-blue-100"
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

type Registration = {
  id: string; // email
  "eventID;year": string;
  registrationStatus?: string;
  applicationStatus?: string;
  isPartner?: boolean;
  createdAt?: number;
  updatedAt?: number;
  points?: number;
  scannedQRs?: string;
  basicInformation?: {
    fname?: string;
    lname?: string;
    [key: string]: any;
  };
  [key: string]: any;
};

// main page
type Props = {
  membersData: Member[] | null;
  eventsData: BiztechEvent[] | null;
  registrationsData: Registration[] | null;
};

export default function StatisticsPage({
  membersData,
  eventsData,
  registrationsData,
}: Props) {
  const members = useMemo(() => membersData ?? [], [membersData]);
  const events = useMemo(() => eventsData ?? [], [eventsData]);
  const registrations = useMemo(
    () => registrationsData ?? [],
    [registrationsData],
  );

  // tab state
  const [activeTab, setActiveTab] = useState<"members" | "events">("events");

  // event selector for registration filtering
  const [selectedEventKey, setSelectedEventKey] = useState<string>("all");

  // events that have registrations
  const eventsWithRegistrations = useMemo(() => {
    const eventKeys = new Set(registrations.map((r) => r["eventID;year"]));
    return events
      .filter((e) => eventKeys.has(`${e.id};${e.year}`))
      .sort(
        (a, b) =>
          new Date(b.startDate ?? 0).getTime() -
          new Date(a.startDate ?? 0).getTime(),
      );
  }, [events, registrations]);

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

  const publishedEvents = useMemo(
    () => events.filter((e) => e.isPublished),
    [events],
  );
  const completedEvents = useMemo(
    () => events.filter((e) => e.isCompleted),
    [events],
  );

  // events by year
  const eventsByYear = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const e of events) {
      const yr = String(e.year);
      counts[yr] = (counts[yr] || 0) + 1;
    }
    return Object.entries(counts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [events]);

  const eventsByMonth = useMemo(() => {
    const monthNames = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];
    const counts: Record<string, number> = {};
    for (const e of events) {
      if (!e.startDate) continue;
      const d = new Date(e.startDate);
      if (isNaN(d.getTime())) continue;
      const key = monthNames[d.getMonth()];
      counts[key] = (counts[key] || 0) + 1;
    }
    return monthNames
      .filter((m) => counts[m])
      .map((name) => ({ name, value: counts[name] }));
  }, [events]);

  // event locations
  const eventLocationData = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const e of events) {
      if (!e.elocation || !e.elocation.trim()) continue;
      const loc = e.elocation.trim();
      counts[loc] = (counts[loc] || 0) + 1;
    }
    return Object.entries(counts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [events]);

  const capacityData = useMemo(() => {
    const buckets: Record<string, number> = {
      "1–50": 0,
      "51–100": 0,
      "101–200": 0,
      "201–500": 0,
      "500+": 0,
    };
    for (const e of events) {
      const cap = e.capac || 0;
      if (cap <= 50) buckets["1–50"]++;
      else if (cap <= 100) buckets["51–100"]++;
      else if (cap <= 200) buckets["101–200"]++;
      else if (cap <= 500) buckets["201–500"]++;
      else buckets["500+"]++;
    }
    return Object.entries(buckets)
      .filter(([, v]) => v > 0)
      .map(([name, value]) => ({ name, value }));
  }, [events]);

  const eventsWithCounts = useMemo(() => {
    return events
      .filter((e) => e.counts)
      .map((e) => ({
        name: e.ename.length > 25 ? e.ename.slice(0, 25) + "…" : e.ename,
        fullName: e.ename,
        registered: e.counts?.registeredCount ?? 0,
        checkedIn: e.counts?.checkedInCount ?? 0,
        capacity: e.capac,
        year: e.year,
        fillRate:
          e.capac > 0
            ? Math.round(((e.counts?.registeredCount ?? 0) / e.capac) * 100)
            : 0,
      }))
      .sort((a, b) => b.registered - a.registered);
  }, [events]);

  const totalCapacity = useMemo(
    () => eventsWithCounts.reduce((s, e) => s + e.capacity, 0),
    [eventsWithCounts],
  );
  const totalRegistered = useMemo(
    () => eventsWithCounts.reduce((s, e) => s + e.registered, 0),
    [eventsWithCounts],
  );
  const totalCheckedIn = useMemo(
    () => eventsWithCounts.reduce((s, e) => s + e.checkedIn, 0),
    [eventsWithCounts],
  );
  const avgFillRate = useMemo(
    () =>
      totalCapacity > 0
        ? Math.round((totalRegistered / totalCapacity) * 100)
        : 0,
    [totalRegistered, totalCapacity],
  );
  const avgAttendanceRate = useMemo(
    () =>
      totalRegistered > 0
        ? Math.round((totalCheckedIn / totalRegistered) * 100)
        : 0,
    [totalCheckedIn, totalRegistered],
  );

  const eventTimeline = useMemo(() => {
    if (!events.length) return [];
    const monthMap: Record<string, number> = {};
    for (const e of events) {
      if (!e.startDate) continue;
      const d = new Date(e.startDate);
      if (isNaN(d.getTime())) continue;
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      monthMap[key] = (monthMap[key] || 0) + 1;
    }
    return Object.entries(monthMap)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([name, value]) => ({ name, value }));
  }, [events]);

  // registration analytics
  const filteredRegistrations = useMemo(() => {
    if (selectedEventKey === "all") return registrations;
    return registrations.filter((r) => r["eventID;year"] === selectedEventKey);
  }, [registrations, selectedEventKey]);

  const attendeeRegistrations = useMemo(
    () => filteredRegistrations.filter((r) => !r.isPartner),
    [filteredRegistrations],
  );

  // registration status breakdown
  const registrationStatusData = useMemo(() => {
    const STATUS_LABELS: Record<string, string> = {
      registered: "Registered",
      checkedIn: "Checked In",
      waitlist: "Waitlisted",
      cancelled: "Cancelled",
      incomplete: "Incomplete",
      accepted: "Accepted",
      acceptedPending: "Accepted (Pending)",
      acceptedComplete: "Accepted (Complete)",
    };
    const counts: Record<string, number> = {};
    for (const r of attendeeRegistrations) {
      const status = r.registrationStatus || "unknown";
      const label = STATUS_LABELS[status] || titleCase(status);
      counts[label] = (counts[label] || 0) + 1;
    }
    return Object.entries(counts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [attendeeRegistrations]);

  // check-in rate per event
  const perEventCheckIn = useMemo(() => {
    // group registrations by event
    const byEvent: Record<
      string,
      { registered: number; checkedIn: number; eventName: string }
    > = {};
    for (const r of attendeeRegistrations) {
      const ey = r["eventID;year"];
      if (!ey) continue;
      if (!byEvent[ey]) {
        const [eid] = ey.split(";");
        const ev = events.find(
          (e) => e.id === eid && String(e.year) === ey.split(";")[1],
        );
        byEvent[ey] = {
          registered: 0,
          checkedIn: 0,
          eventName: ev?.ename || eid,
        };
      }
      const status = r.registrationStatus;
      if (status === "registered" || status === "checkedIn")
        byEvent[ey].registered++;
      if (status === "checkedIn") byEvent[ey].checkedIn++;
    }
    return Object.entries(byEvent)
      .filter(([, v]) => v.registered > 0)
      .map(([key, v]) => ({
        name:
          v.eventName.length > 28
            ? v.eventName.slice(0, 28) + "…"
            : v.eventName,
        fullName: v.eventName,
        registered: v.registered,
        checkedIn: v.checkedIn,
        rate: Math.round((v.checkedIn / v.registered) * 100),
      }))
      .sort((a, b) => b.registered - a.registered);
  }, [attendeeRegistrations, events]);

  // application-based event analytics
  const applicationEvents = useMemo(
    () => events.filter((e) => e.isApplicationBased),
    [events],
  );
  const applicationRegistrations = useMemo(() => {
    const appEventKeys = new Set(
      applicationEvents.map((e) => `${e.id};${e.year}`),
    );
    return attendeeRegistrations.filter((r) =>
      appEventKeys.has(r["eventID;year"]),
    );
  }, [attendeeRegistrations, applicationEvents]);
  const applicationStatusData = useMemo(() => {
    const STATUS_LABELS: Record<string, string> = {
      accepted: "Accepted",
      rejected: "Rejected",
      reviewing: "Under Review",
      waitlist: "Waitlisted",
    };
    const counts: Record<string, number> = {};
    for (const r of applicationRegistrations) {
      const status = r.applicationStatus;
      if (!status) continue;
      const label = STATUS_LABELS[status] || titleCase(status);
      counts[label] = (counts[label] || 0) + 1;
    }
    return Object.entries(counts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [applicationRegistrations]);

  const qrEngagement = useMemo(() => {
    let totalScans = 0;
    let usersWithScans = 0;
    let totalPoints = 0;
    for (const r of attendeeRegistrations) {
      if (r.scannedQRs) {
        try {
          const scans = JSON.parse(r.scannedQRs);
          if (Array.isArray(scans) && scans.length > 0) {
            usersWithScans++;
            totalScans += scans.length;
          }
        } catch {}
      }
      if (r.points && r.points > 0) {
        totalPoints += r.points;
      }
    }
    return { totalScans, usersWithScans, totalPoints };
  }, [attendeeRegistrations]);

  // unique attendees (unique emails across all registrations)
  const uniqueAttendees = useMemo(
    () => new Set(attendeeRegistrations.map((r) => r.id)).size,
    [attendeeRegistrations],
  );

  // eepeat attendees (emails that appear in 2+ events)
  const repeatAttendeeCount = useMemo(() => {
    const emailCounts: Record<string, number> = {};
    for (const r of attendeeRegistrations) {
      emailCounts[r.id] = (emailCounts[r.id] || 0) + 1;
    }
    return Object.values(emailCounts).filter((c) => c >= 2).length;
  }, [attendeeRegistrations]);

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
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* page header  */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Link
              href="/admin"
              className="text-bt-blue-100 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-white">
                Statistics Dashboard
              </h1>
              <p className="text-sm text-bt-blue-100 mt-0.5">
                {members.length.toLocaleString()} members ·{" "}
                {events.length.toLocaleString()} events ·{" "}
                {registrations
                  .filter((r) => !r.isPartner)
                  .length.toLocaleString()}{" "}
                registrations
              </p>
            </div>
          </div>
        </div>

        {/* tab switcher */}
        <div className="flex gap-1 bg-bt-blue-500/40 rounded-lg p-1 w-fit border border-bt-blue-300/30">
          <button
            onClick={() => setActiveTab("members")}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${
              activeTab === "members"
                ? "bg-bt-green-400 text-bt-blue-700 shadow-sm"
                : "text-bt-blue-100 hover:text-white hover:bg-bt-blue-400/30"
            }`}
          >
            <span className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              Members
            </span>
          </button>
          <button
            onClick={() => setActiveTab("events")}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${
              activeTab === "events"
                ? "bg-bt-green-400 text-bt-blue-700 shadow-sm"
                : "text-bt-blue-100 hover:text-white hover:bg-bt-blue-400/30"
            }`}
          >
            <span className="flex items-center gap-2">
              <CalendarDays className="w-4 h-4" />
              Events & Registrations
            </span>
          </button>
        </div>

        {/* events tab                                       */}
        {activeTab === "events" && (
          <>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard
                label="Total Events"
                value={events.length.toLocaleString()}
                icon={<CalendarDays className="w-5 h-5" />}
              />
              <StatCard
                label="Published Events"
                value={publishedEvents.length.toLocaleString()}
                icon={<Ticket className="w-5 h-5" />}
                accent="text-[#75CFF5]"
              />
              <StatCard
                label="Avg Fill Rate"
                value={eventsWithCounts.length ? `${avgFillRate}%` : "—"}
                icon={<Activity className="w-5 h-5" />}
                accent="text-[#FFC960]"
              />
              <StatCard
                label="Avg Attendance"
                value={eventsWithCounts.length ? `${avgAttendanceRate}%` : "—"}
                icon={<TrendingUp className="w-5 h-5" />}
                accent="text-[#9F8AD1]"
              />
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
              {/* event timeline */}
              {eventTimeline.length > 0 && (
                <SectionCard
                  icon={<TrendingUp className="w-4 h-4" />}
                  title="Event Timeline"
                  span
                >
                  <p className="text-xs text-bt-blue-100 mb-2">
                    Number of events per month over time
                  </p>
                  <ResponsiveContainer width="100%" height={280}>
                    <AreaChart
                      data={eventTimeline}
                      margin={{ left: 0, right: 16, top: 4, bottom: 4 }}
                    >
                      <defs>
                        <linearGradient
                          id="eventGradient"
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >
                          <stop
                            offset="5%"
                            stopColor="#75CFF5"
                            stopOpacity={0.3}
                          />
                          <stop
                            offset="95%"
                            stopColor="#75CFF5"
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
                          Math.floor(eventTimeline.length / 10) - 1,
                        )}
                        angle={-35}
                        textAnchor="end"
                        height={50}
                      />
                      <YAxis
                        tick={{ fill: "#A2B1D5", fontSize: 12 }}
                        axisLine={false}
                        tickLine={false}
                        allowDecimals={false}
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
                                {payload[0]?.value} event
                                {payload[0]?.value !== 1 ? "s" : ""}
                              </p>
                            </div>
                          );
                        }}
                      />
                      <Area
                        type="monotone"
                        dataKey="value"
                        stroke="#75CFF5"
                        strokeWidth={2}
                        fill="url(#eventGradient)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </SectionCard>
              )}

              {/* events by year */}
              <SectionCard
                icon={<CalendarDays className="w-4 h-4" />}
                title="Events by Year"
              >
                <ThemedBarChart
                  data={eventsByYear}
                  layout="horizontal"
                  height={280}
                  unit="events"
                />
              </SectionCard>

              {/* events by month */}
              <SectionCard
                icon={<CalendarDays className="w-4 h-4" />}
                title="Events by Month"
              >
                <ThemedBarChart
                  data={eventsByMonth}
                  layout="horizontal"
                  height={280}
                  unit="events"
                />
              </SectionCard>

              {/* capacity distribution */}
              <SectionCard
                icon={<Ticket className="w-4 h-4" />}
                title="Event Capacity Distribution"
              >
                <ThemedDonutChart
                  data={capacityData}
                  height={280}
                  unit="events"
                />
              </SectionCard>

              {/* venue / location */}
              {eventLocationData.length > 0 && (
                <SectionCard
                  icon={<MapPin className="w-4 h-4" />}
                  title="Top Event Venues"
                >
                  <ThemedBarChart
                    data={eventLocationData}
                    layout="vertical"
                    maxBars={10}
                    height={300}
                    unit="events"
                  />
                </SectionCard>
              )}

              {/* top events */}
              {eventsWithCounts.length > 0 && (
                <SectionCard
                  icon={<Activity className="w-4 h-4" />}
                  title="Top Events by Registration"
                  span
                >
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div>
                      <p className="text-xs text-bt-blue-100 mb-2">
                        Registered vs. Checked-In (top{" "}
                        {Math.min(12, eventsWithCounts.length)})
                      </p>
                      <ResponsiveContainer
                        width="100%"
                        height={Math.max(
                          300,
                          Math.min(12, eventsWithCounts.length) * 36,
                        )}
                      >
                        <BarChart
                          data={eventsWithCounts.slice(0, 12)}
                          layout="vertical"
                          margin={{ left: 8, right: 16, top: 4, bottom: 4 }}
                        >
                          <CartesianGrid
                            strokeDasharray="3 3"
                            stroke="#3B486622"
                            horizontal={false}
                          />
                          <XAxis
                            type="number"
                            tick={{ fill: "#A2B1D5", fontSize: 12 }}
                            axisLine={false}
                            tickLine={false}
                          />
                          <YAxis
                            type="category"
                            dataKey="name"
                            tick={{ fill: "#BDC8E3", fontSize: 11 }}
                            width={160}
                            axisLine={false}
                            tickLine={false}
                          />
                          <Tooltip
                            content={({ active, payload }: any) => {
                              if (!active || !payload?.length) return null;
                              const d = payload[0]?.payload;
                              return (
                                <div className="rounded-lg bg-bt-blue-600 border border-bt-blue-300/40 px-3 py-2 shadow-lg">
                                  <p className="text-sm font-medium text-white">
                                    {d?.fullName}
                                  </p>
                                  <p className="text-xs text-bt-green-300">
                                    Registered: {d?.registered}
                                  </p>
                                  <p className="text-xs text-[#75CFF5]">
                                    Checked-In: {d?.checkedIn}
                                  </p>
                                  <p className="text-xs text-bt-blue-100">
                                    Capacity: {d?.capacity} · Fill:{" "}
                                    {d?.fillRate}%
                                  </p>
                                </div>
                              );
                            }}
                            cursor={{ fill: "#3B486633" }}
                          />
                          <Bar
                            dataKey="registered"
                            name="Registered"
                            fill="#75D450"
                            radius={[0, 4, 4, 0]}
                            maxBarSize={20}
                          />
                          <Bar
                            dataKey="checkedIn"
                            name="Checked-In"
                            fill="#75CFF5"
                            radius={[0, 4, 4, 0]}
                            maxBarSize={20}
                          />
                          <Legend
                            iconType="circle"
                            wrapperStyle={{ fontSize: 12 }}
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                    <div>
                      <p className="text-xs text-bt-blue-100 mb-2">
                        Fill Rate (% of capacity filled)
                      </p>
                      <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2">
                        {eventsWithCounts.slice(0, 15).map((e) => (
                          <div key={`${e.fullName}-${e.year}`}>
                            <div className="flex justify-between text-xs mb-1">
                              <span className="text-white truncate max-w-[200px]">
                                {e.fullName}
                              </span>
                              <span className="text-bt-blue-100 shrink-0 ml-2">
                                {e.fillRate}%
                              </span>
                            </div>
                            <div className="h-2 w-full bg-bt-blue-600/60 rounded-full overflow-hidden">
                              <div
                                className="h-full rounded-full transition-all"
                                style={{
                                  width: `${Math.min(100, e.fillRate)}%`,
                                  backgroundColor:
                                    e.fillRate >= 90
                                      ? "#75D450"
                                      : e.fillRate >= 60
                                        ? "#FFC960"
                                        : "#FF8A9E",
                                }}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </SectionCard>
              )}

              {/* events data table */}
              <SectionCard
                icon={<CalendarDays className="w-4 h-4" />}
                title="All Events"
                span
              >
                <EventsDataTable events={events} />
              </SectionCard>
            </div>

            {/* registration analytics */}
            <div className="pt-2">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-5">
                <h2 className="text-base font-semibold text-white flex items-center gap-2">
                  <ClipboardCheck className="w-5 h-5 text-bt-green-300" />
                  Registration Analytics
                </h2>
                <div className="flex items-center gap-2">
                  <Filter className="w-4 h-4 text-bt-blue-100" />
                  <select
                    value={selectedEventKey}
                    onChange={(e) => setSelectedEventKey(e.target.value)}
                    className="rounded-lg border border-bt-blue-300/30 bg-bt-blue-500/60 text-white text-sm px-3 py-2 min-w-[280px] focus:outline-none focus:ring-1 focus:ring-bt-green-400/50"
                  >
                    <option value="all">
                      All Events ({eventsWithRegistrations.length} events ·{" "}
                      {registrations.filter((r) => !r.isPartner).length}{" "}
                      registrations)
                    </option>
                    {eventsWithRegistrations.map((ev) => {
                      const key = `${ev.id};${ev.year}`;
                      const count = registrations.filter(
                        (r) => r["eventID;year"] === key && !r.isPartner,
                      ).length;
                      const date = ev.startDate
                        ? new Date(ev.startDate).toLocaleDateString("en-US", {
                            month: "short",
                            year: "numeric",
                          })
                        : "";
                      return (
                        <option key={key} value={key}>
                          {ev.ename} {date && `(${date})`} · {count}{" "}
                          registrations
                        </option>
                      );
                    })}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-5">
                <StatCard
                  label="Total Registrations"
                  value={attendeeRegistrations.length.toLocaleString()}
                  icon={<ClipboardCheck className="w-5 h-5" />}
                />
                <StatCard
                  label={
                    selectedEventKey === "all"
                      ? "Unique Attendees"
                      : "Checked In"
                  }
                  value={
                    selectedEventKey === "all"
                      ? uniqueAttendees.toLocaleString()
                      : attendeeRegistrations
                          .filter((r) => r.registrationStatus === "checkedIn")
                          .length.toLocaleString()
                  }
                  icon={<UserCheck className="w-5 h-5" />}
                  accent="text-[#75CFF5]"
                />
                <StatCard
                  label={
                    selectedEventKey === "all"
                      ? "Repeat Attendees"
                      : "Check-in Rate"
                  }
                  value={
                    selectedEventKey === "all"
                      ? repeatAttendeeCount.toLocaleString()
                      : (() => {
                          const total = attendeeRegistrations.filter(
                            (r) =>
                              r.registrationStatus === "registered" ||
                              r.registrationStatus === "checkedIn",
                          ).length;
                          const checked = attendeeRegistrations.filter(
                            (r) => r.registrationStatus === "checkedIn",
                          ).length;
                          return total > 0
                            ? `${Math.round((checked / total) * 100)}%`
                            : "—";
                        })()
                  }
                  icon={<Repeat className="w-5 h-5" />}
                  accent="text-[#FFC960]"
                />
                <StatCard
                  label="QR Scans"
                  value={qrEngagement.totalScans.toLocaleString()}
                  icon={<QrCode className="w-5 h-5" />}
                  accent="text-[#9F8AD1]"
                />
              </div>

              {/* registration charts grid */}
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
                {/* registration status breakdown */}
                {registrationStatusData.length > 0 && (
                  <SectionCard
                    icon={<ClipboardCheck className="w-4 h-4" />}
                    title="Registration Status Breakdown"
                  >
                    <ThemedDonutChart
                      data={registrationStatusData}
                      unit="registrations"
                    />
                  </SectionCard>
                )}

                {selectedEventKey === "all" && perEventCheckIn.length > 0 && (
                  <SectionCard
                    icon={<UserCheck className="w-4 h-4" />}
                    title="Check-in Rate by Event"
                  >
                    <p className="text-xs text-bt-blue-100 mb-2">
                      Percentage of registered attendees who checked in
                    </p>
                    <div className="space-y-2 max-h-[420px] overflow-y-auto pr-2">
                      {perEventCheckIn.map((e) => (
                        <div key={e.fullName}>
                          <div className="flex justify-between text-xs mb-1">
                            <span
                              className="text-white truncate max-w-[200px]"
                              title={e.fullName}
                            >
                              {e.name}
                            </span>
                            <span className="text-bt-blue-100 shrink-0 ml-2">
                              {e.rate}% ({e.checkedIn}/{e.registered})
                            </span>
                          </div>
                          <div className="h-2 w-full bg-bt-blue-600/60 rounded-full overflow-hidden">
                            <div
                              className="h-full rounded-full transition-all"
                              style={{
                                width: `${e.rate}%`,
                                backgroundColor:
                                  e.rate >= 80
                                    ? "#75D450"
                                    : e.rate >= 50
                                      ? "#FFC960"
                                      : "#FF8A9E",
                              }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </SectionCard>
                )}

                {applicationStatusData.length > 0 && (
                  <SectionCard
                    icon={<Activity className="w-4 h-4" />}
                    title="Application Status"
                  >
                    <p className="text-xs text-bt-blue-100 mb-2">
                      Breakdown across {applicationEvents.length}{" "}
                      application-based event
                      {applicationEvents.length !== 1 && "s"} (
                      {applicationRegistrations.length} total applications)
                    </p>
                    <ThemedDonutChart
                      data={applicationStatusData}
                      unit="applications"
                    />
                  </SectionCard>
                )}

                {/* partner vs attendee registration split */}
                {selectedEventKey !== "all" &&
                  (() => {
                    const allForEvent = filteredRegistrations;
                    const partners = allForEvent.filter(
                      (r) => r.isPartner,
                    ).length;
                    const attendees = allForEvent.filter(
                      (r) => !r.isPartner,
                    ).length;
                    if (partners === 0) return null;
                    const splitData = [
                      { name: "Attendees", value: attendees },
                      { name: "Partners", value: partners },
                    ];
                    return (
                      <SectionCard
                        icon={<Users className="w-4 h-4" />}
                        title="Attendees vs Partners"
                      >
                        <ThemedDonutChart
                          data={splitData}
                          unit="registrations"
                        />
                      </SectionCard>
                    );
                  })()}
              </div>

              {attendeeRegistrations.length === 0 && (
                <div className="text-center py-12 text-bt-blue-100">
                  <ClipboardCheck className="w-10 h-10 mx-auto mb-3 opacity-40" />
                  <p className="text-sm">
                    No registration data available for the selected event.
                  </p>
                </div>
              )}
            </div>
          </>
        )}

        {/* members                                                      */}
        {activeTab === "members" && (
          <>
            {/* year filter */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
              <div className="flex items-center gap-2 text-bt-blue-100">
                <Filter className="w-4 h-4" />
                <span className="text-sm font-medium">Membership year:</span>
              </div>
              <select
                value={selectedMemberYear}
                onChange={(e) => setSelectedMemberYear(e.target.value)}
                className="rounded-lg border border-bt-blue-300/30 bg-bt-blue-500/60 text-white text-sm px-3 py-2 min-w-[200px] focus:outline-none focus:ring-1 focus:ring-bt-green-400/50"
              >
                <option value="all">
                  All years ({members.length} members)
                </option>
                {memberYears.map((yr) => {
                  const count =
                    filteredMembers.length === members.length
                      ? members.filter((m) => {
                          if (!m.createdAt) return false;
                          const ts =
                            m.createdAt > 1e12
                              ? m.createdAt
                              : m.createdAt * 1000;
                          const d = new Date(ts);
                          const calYear = d.getFullYear();
                          const month = d.getMonth();
                          const academicStart =
                            month >= 8 ? calYear : calYear - 1;
                          return academicStart === Number(yr.split("-")[0]);
                        }).length
                      : filteredMembers.length;
                  return (
                    <option key={yr} value={yr}>
                      {yr} (
                      {selectedMemberYear === yr
                        ? filteredMembers.length
                        : count}{" "}
                      members)
                    </option>
                  );
                })}
              </select>
              <p className="text-xs text-bt-blue-100/60">
                Data from{" "}
                <code className="text-bt-green-300/70">biztechMembers2026</code>{" "}
                table
              </p>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
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
                  <code className="text-bt-green-300/80">
                    biztechMembers2026
                  </code>{" "}
                  table.
                </p>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div>
                    <p className="text-xs text-bt-blue-100 mb-2">
                      Cumulative signups
                    </p>
                    <ResponsiveContainer width="100%" height={280}>
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
                  <div>
                    <p className="text-xs text-bt-blue-100 mb-2">
                      New signups per month
                    </p>
                    <ResponsiveContainer width="100%" height={280}>
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

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
              {/* education / type of member */}
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
                <ThemedBarChart
                  data={yearData}
                  layout="horizontal"
                  height={280}
                />
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
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div>
                    <p className="text-xs text-bt-blue-100 mb-2">
                      Top {Math.min(20, majorData.length)} majors (size = member
                      count)
                    </p>
                    <ResponsiveContainer width="100%" height={340}>
                      <Treemap
                        data={majorData.slice(0, 20)}
                        dataKey="value"
                        nameKey="name"
                        content={<TreemapContent />}
                      />
                    </ResponsiveContainer>
                  </div>
                  <DataTable data={majorData} maxRows={12} />
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
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
                  <ThemedDonutChart data={internationalData} height={240} />
                  <div className="space-y-3">
                    {internationalData.map((d, i) => (
                      <div
                        key={d.name}
                        className="flex items-center justify-between rounded-lg bg-bt-blue-600/60 px-4 py-3"
                      >
                        <div className="flex items-center gap-2">
                          <span
                            className="w-3 h-3 rounded-sm"
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
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
                  <ThemedDonutChart data={prevMemberData} height={240} />
                  <div className="space-y-3">
                    {prevMemberData.map((d, i) => (
                      <div
                        key={d.name}
                        className="flex items-center justify-between rounded-lg bg-bt-blue-600/60 px-4 py-3"
                      >
                        <div className="flex items-center gap-2">
                          <span
                            className="w-3 h-3 rounded-sm"
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
                <ThemedBarChart
                  data={topicsData}
                  layout="vertical"
                  height={300}
                />
              </SectionCard>

              {/* heard from */}
              <SectionCard
                icon={<Megaphone className="w-4 h-4" />}
                title="How Did You Hear About Us?"
                span
              >
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <ThemedBarChart
                    data={heardFromData}
                    layout="horizontal"
                    height={300}
                  />
                  <PercentageBar data={heardFromData} />
                </div>
              </SectionCard>
            </div>
          </>
        )}
      </div>
    </main>
  );
}

// event data
function EventsDataTable({ events }: { events: BiztechEvent[] }) {
  const [expanded, setExpanded] = useState(false);
  const [sortKey, setSortKey] = useState<"date" | "name" | "capacity">("date");
  const [sortAsc, setSortAsc] = useState(false);

  const sorted = useMemo(() => {
    const sorted = [...events];
    sorted.sort((a, b) => {
      let cmp = 0;
      if (sortKey === "date") {
        cmp =
          new Date(a.startDate || 0).getTime() -
          new Date(b.startDate || 0).getTime();
      } else if (sortKey === "name") {
        cmp = (a.ename || "").localeCompare(b.ename || "");
      } else if (sortKey === "capacity") {
        cmp = (a.capac || 0) - (b.capac || 0);
      }
      return sortAsc ? cmp : -cmp;
    });
    return sorted;
  }, [events, sortKey, sortAsc]);

  const visible = expanded ? sorted : sorted.slice(0, 15);

  const handleSort = (key: typeof sortKey) => {
    if (sortKey === key) {
      setSortAsc(!sortAsc);
    } else {
      setSortKey(key);
      setSortAsc(key === "name");
    }
  };

  return (
    <div>
      <div className="rounded-lg border border-bt-blue-300/20 overflow-x-auto">
        <table className="w-full text-sm min-w-[600px]">
          <thead>
            <tr className="bg-bt-blue-300/30">
              <th
                className="text-left px-3 py-2 text-bt-blue-100 font-medium text-xs cursor-pointer hover:text-white"
                onClick={() => handleSort("name")}
              >
                Event Name {sortKey === "name" ? (sortAsc ? "↑" : "↓") : ""}
              </th>
              <th
                className="text-left px-3 py-2 text-bt-blue-100 font-medium text-xs cursor-pointer hover:text-white"
                onClick={() => handleSort("date")}
              >
                Date {sortKey === "date" ? (sortAsc ? "↑" : "↓") : ""}
              </th>
              <th className="text-left px-3 py-2 text-bt-blue-100 font-medium text-xs">
                Location
              </th>
              <th
                className="text-right px-3 py-2 text-bt-blue-100 font-medium text-xs cursor-pointer hover:text-white"
                onClick={() => handleSort("capacity")}
              >
                Capacity {sortKey === "capacity" ? (sortAsc ? "↑" : "↓") : ""}
              </th>
              <th className="text-center px-3 py-2 text-bt-blue-100 font-medium text-xs">
                Status
              </th>
            </tr>
          </thead>
          <tbody>
            {visible.map((e, i) => {
              const date = e.startDate
                ? new Date(e.startDate).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })
                : "—";
              return (
                <tr
                  key={`${e.id}-${e.year}`}
                  className={i % 2 === 0 ? "bg-bt-blue-600/30" : ""}
                >
                  <td className="px-3 py-1.5 text-white max-w-[250px] truncate">
                    {e.ename}
                  </td>
                  <td className="px-3 py-1.5 text-bt-blue-100 whitespace-nowrap">
                    {date}
                  </td>
                  <td className="px-3 py-1.5 text-bt-blue-100 max-w-[180px] truncate">
                    {e.elocation || "—"}
                  </td>
                  <td className="px-3 py-1.5 text-bt-blue-100 text-right font-mono">
                    {e.capac}
                  </td>
                  <td className="px-3 py-1.5 text-center">
                    {e.isCompleted ? (
                      <span className="inline-flex items-center rounded-full bg-bt-blue-300/20 px-2 py-0.5 text-[10px] font-medium text-bt-blue-100">
                        Completed
                      </span>
                    ) : e.isPublished ? (
                      <span className="inline-flex items-center rounded-full bg-bt-green-400/20 px-2 py-0.5 text-[10px] font-medium text-bt-green-300">
                        Published
                      </span>
                    ) : (
                      <span className="inline-flex items-center rounded-full bg-bt-red-300/20 px-2 py-0.5 text-[10px] font-medium text-bt-red-200">
                        Draft
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {sorted.length > 15 && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="mt-2 text-xs text-bt-green-300 hover:underline flex items-center gap-1"
        >
          <ChevronDown
            className={`w-3 h-3 transition-transform ${expanded ? "rotate-180" : ""}`}
          />
          {expanded ? "Show less" : `Show all ${sorted.length} events`}
        </button>
      )}
    </div>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  try {
    const [membersData, eventsData] = await Promise.all([
      fetchBackendFromServer({
        endpoint: `/members`,
        method: "GET",
        nextServerContext: {
          request: context.req,
          response: context.res,
        },
      }),
      fetchBackendFromServer({
        endpoint: `/events`,
        method: "GET",
        authenticatedCall: false,
        nextServerContext: {
          request: context.req,
          response: context.res,
        },
      }),
    ]);

    let registrationsData: Registration[] = [];
    try {
      const allEvents: BiztechEvent[] = Array.isArray(eventsData)
        ? eventsData
        : [];
      const sorted = [...allEvents]
        .filter((e) => e.id && e.year)
        .sort(
          (a, b) =>
            new Date(b.startDate ?? 0).getTime() -
            new Date(a.startDate ?? 0).getTime(),
        )
        .slice(0, 20);

      const regResults = await Promise.allSettled(
        sorted.map((ev) =>
          fetchBackendFromServer({
            endpoint: `/registrations?eventID=${encodeURIComponent(ev.id)}&year=${ev.year}`,
            method: "GET",
            authenticatedCall: false,
            nextServerContext: {
              request: context.req,
              response: context.res,
            },
          }),
        ),
      );

      for (const result of regResults) {
        if (result.status === "fulfilled" && result.value?.data) {
          registrationsData.push(...result.value.data);
        }
      }
    } catch (regError) {
      console.error("Failed to fetch registrations:", regError);
    }

    return {
      props: { membersData, eventsData, registrationsData },
    };
  } catch (error) {
    console.error("Failed to fetch statistics data:", error);
    return {
      props: { membersData: null, eventsData: null, registrationsData: null },
    };
  }
};
