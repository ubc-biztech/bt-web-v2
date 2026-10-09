import type { ComponentType, SVGProps } from "react";
import { useUserAttributes } from "@/queries/user";
import SapLogo from "@/assets/2026/product+/sap-logo.svg";
import { GlassCard, PageHeading, Pill } from "../components/ProductPlusUI";

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
    date: "October 22",
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
const schedule = [
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
];

export default function PortalPage() {
  const { data: user } = useUserAttributes();
  const firstName = user?.given_name || user?.name?.split(" ")[0];
  return (
    <div>
      <PageHeading
        title={firstName ? `Hi, ${firstName}!` : "Hi there!"}
        description="Welcome to Product+"
      />
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
        <GlassCard className="flex flex-col gap-[14px] rounded-[28px] p-6 min-[641px]:rounded-[28px] min-[641px]:p-6 max-[640px]:rounded-[24px]">
          <header>
            <h2>KickOff schedule</h2>
            <p className="text-product-muted">Sunday, October 18</p>
          </header>
          <ol className="m-0 flex list-none flex-col gap-[10px] p-0">
            {schedule.map((item) => (
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
        <section
          className="flex flex-col gap-[10px] rounded-[28px] bg-[linear-gradient(146.659deg,#081440,#004d8a_71.429%)] p-6 text-white shadow-[0_4px_20px_rgba(97,80,184,0.08)] max-[1200px]:p-5 max-[960px]:max-w-[380px]"
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
            SAP is a global leader in enterprise software, helping organizations
            manage their operations, data, and business processes.
          </p>
        </section>
      </div>
    </div>
  );
}
