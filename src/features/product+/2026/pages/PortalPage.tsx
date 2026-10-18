import type { ComponentType, SVGProps } from "react";
import { useState } from "react";
import Link from "next/link";
import { useUserAttributes } from "@/queries/user";
import SapLogo from "@/assets/2026/product+/sap-logo.svg";
import PortalTeamCard from "../components/PortalTeamCard";
import {
  GlassCard,
  PageHeading,
  Pill,
  ProductButton,
} from "../components/ProductPlusUI";
import { PRODUCT_PLUS_EVENT_PATH } from "../access";
import { cn } from "@/lib/utils";

const SAP = SapLogo as unknown as ComponentType<SVGProps<SVGSVGElement>>;
const competition = [
  {
    title: "KickOff",
    date: "October 18",
    inPerson: true,
    description: "Team formation, workshops, mentor support, and case reveal.",
  },
  {
    title: "Product Arena",
    date: "October 20",
    inPerson: false,
    description: "Product pitch & doc submission for preliminary judging.",
  },
  {
    title: "Product+ Summit",
    date: "October 25",
    inPerson: true,
    description: "Finalist presentations, boothing, and awarding.",
  },
];
const scheduleHeader = [
  {
    title: "KickOff Schedule",
    date: "Sunday, October 18"
  },
  {
    title: "Summit Schedule",
    date: "Sunday, October 25"
  }
]
const schedule = [
  [
    { time: "10:00 AM", title: "Check-in", location: "HA 492" },
    { time: "10:30 AM", title: "Opening Remarks", location: "HA 492" },
    {
      time: "11:00 AM",
      title: "Workshop 1: Building with Codex",
      location: "HA 491, OpenAI Student Collective",
    },
    {
      time: "",
      title: "Workshop 2: Designing a Prototype",
      location: "HA 492, Friends of Figma",
    },
    {
      time: "12:00 PM",
      title: "Case Release & Team Formation",
      location: "HA 492",
      highlight: true,
    },
    { time: "12:30 PM", title: "Lunch", location: "Birmingham" },
    { time: "1:00 PM", title: "Mentor Assignments", location: "Birmingham" },
    {
      time: "3:00 PM",
      title: "Workshop 3: Product Management Career",
      location: "Birmingham",
    },
    { time: "6:00 PM", title: "Dinner & Activity", location: "Birmingham" },
  ],
  [
    { time: "9:00 AM", title: "Check-in", location: "HA 492" },
    { time: "9:30 AM", title: "Attendee ", location: "HA 492" },
    {
      time: "10:00 AM",
      title: "Semi-finalist Presentations",
      location: "Sauder",
    },
    {
      time: "12:00 PM",
      title: "Lunch",
      location: "Great Hall South",
    },
    { time: "1:00 PM", title: "Conference Opening Ceremony", location: "Great Hall South", highlight: true },
    {
      time: "1:30 PM",
      title: "Finalist Presentations",
      location: "Great Hall South",
    },
    { time: "2:45 PM", title: "Awards Ceremony", location: "Great Hall South" },
    { time: "3:00 PM", title: "Open Networking & Company Booths", location: "Great Hall South", highlight: true  },
  ]
];

export default function PortalPage() {
  const { data: user } = useUserAttributes();
  const [scheduleID, setScheduleID] = useState(0);
  const firstName = user?.given_name || user?.name?.split(" ")[0];
  return (
    <div>
      <PageHeading
        title={firstName ? `Hi, ${firstName}!` : "Hi there!"}
        description="Welcome to Product+"
      >
        <ProductButton asChild variant="secondary">
          <Link href={PRODUCT_PLUS_EVENT_PATH}>Return to BizTech portal</Link>
        </ProductButton>
      </PageHeading>
      <section aria-labelledby="competition-format">
        <h2
          id="competition-format"
          className="mb-4 font-product-body text-[14px] font-semibold leading-5 tracking-normal"
        >
          Competition format
        </h2>
        <div className="grid grid-cols-3 gap-4 max-[960px]:grid-cols-1">
          {competition.map((event) => (
            <GlassCard
              key={event.title}
              className="flex flex-col gap-2 rounded-[24px] p-5 min-[641px]:rounded-[24px] min-[641px]:p-5 shadow-[0_4px_20px_rgba(97,80,184,0.08)] max-[640px]:p-6"
            >
              <div className="flex flex-wrap items-start justify-between gap-2">
                <Pill>{event.title}</Pill>
                {event.inPerson ? <Pill tone="neutral">IN-PERSON</Pill> : null}
              </div>
              <strong>{event.date}</strong>
              <p>{event.description}</p>
            </GlassCard>
          ))}
        </div>
      </section>
      <div className="mt-4 grid grid-cols-[minmax(0,1fr)_380px] items-start gap-4 max-[1200px]:grid-cols-[minmax(0,1fr)_32%] max-[960px]:grid-cols-1">
        <GlassCard className="flex flex-col gap-[14px] rounded-[28px] p-6 min-[641px]:rounded-[28px] min-[641px]:p-6 max-[640px]:rounded-[24px] max-[359px]:px-4">
          <div className="flex flex-wrap items-start justify-between gap-3 max-[640px]:flex-nowrap max-[640px]:items-center max-[640px]:gap-2">
            <header className="min-w-0">
              <h2 className="max-[640px]:whitespace-nowrap max-[640px]:text-[18px] max-[640px]:leading-6 max-[359px]:text-[16px]">
                {scheduleHeader[scheduleID].title}
              </h2>
              <p className="text-product-muted max-[640px]:whitespace-nowrap max-[640px]:text-[12px] max-[640px]:leading-4 max-[359px]:text-[11px]">
                {scheduleHeader[scheduleID].date}
              </p>
            </header>
            <div
              role="group"
              aria-label="Schedule"
              className="inline-flex shrink-0 gap-1 rounded-full bg-product-primary/[0.08] p-1 max-[640px]:gap-0.5 max-[640px]:p-0.5"
            >
              {["KickOff", "Summit"].map((label, index) => (
                <button
                  key={label}
                  type="button"
                  aria-pressed={scheduleID === index}
                  onClick={() => setScheduleID(index)}
                  className={cn(
                    "rounded-full border border-transparent bg-transparent px-5 py-2.5 text-[14px] font-normal leading-[normal] text-product-muted transition-[background,box-shadow,color] duration-150 hover:bg-white/30 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-product-primary motion-reduce:transition-none max-[640px]:px-1.5 max-[640px]:text-[12px] max-[359px]:text-[11px]",
                    scheduleID === index &&
                      "border-white/70 bg-white/60 font-semibold text-product-primary shadow-[0_4px_20px_rgba(97,80,184,0.08),inset_0_1px_2px_rgba(255,255,255,0.65)] backdrop-blur-[14.5px] hover:bg-white/60",
                  )}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
          <ol className="m-0 flex list-none flex-col gap-[10px] p-0">
            {schedule[scheduleID].map((item) => (
              <li
                key={item.title}
                className={`flex items-start gap-4 max-[640px]:gap-3 ${item.highlight ? "text-product-primary" : ""}`}
              >
                <span className="basis-20 shrink-0 grow-0 text-right font-semibold max-[640px]:basis-[72px]">
                  {item.time}
                </span>
                <div className="min-w-0">
                  <span>{item.title}</span>
                  <p className="text-[13px] leading-[18px] text-product-muted">
                    {item.location}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </GlassCard>
        <div className="flex min-w-0 flex-col gap-4 max-[960px]:max-w-[380px]">
          <PortalTeamCard />
          <section
            className="flex flex-col gap-[10px] rounded-[28px] bg-[linear-gradient(146.659deg,#081440,#004d8a_71.429%)] p-6 text-white shadow-[0_4px_20px_rgba(97,80,184,0.08)] max-[1200px]:p-5"
            aria-labelledby="case-sponsor"
          >
            <h2
              id="case-sponsor"
              className="font-product-body text-[13px] font-bold leading-[18px] tracking-normal"
            >
              OFFICIAL CASE SPONSOR
            </h2>
            <div className="h-[104px] w-[210px] [&>svg]:block [&>svg]:origin-top-left [&>svg]:scale-[0.1640625]">
              <SAP role="img" aria-label="SAP" />
            </div>
            <p>
              SAP is a global leader in enterprise software, helping
              organizations manage their operations, data, and business
              processes.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
