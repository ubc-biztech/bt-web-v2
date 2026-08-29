import { fetchUserAttributes } from "@aws-amplify/auth";
import { Check } from "lucide-react";
import { DM_Sans } from "next/font/google";
import Link from "next/link";
import { useEffect, useState } from "react";
import MISBackground from "@/assets/2026/mis-night/background.svg";
import { fetchBackend } from "@/lib/db";
import type { BiztechEvent } from "@/types";
import { MIS_CAREER_INTERESTS, type MISCareerInterest } from "../Definition";
import { BUILDING_BLOCKS } from "../buildingBlocks";
import { ConfettiBackground } from "../components/ConfettiBackground";

type RegistrationSuccessPageProps = {
  eventId: string;
  year: string;
};

type MISRegistrationRecord = {
  "eventID;year"?: string;
  fname?: string;
  pronouns?: string;
  basicInformation?: Record<string, unknown>;
  dynamicResponses?: Record<string, unknown>;
};

type SuccessDetails = {
  profileName: string;
  pronouns?: string;
  careerInterest?: MISCareerInterest;
  schedule: string;
};

const DISPLAYED_EVENT_TIME = "5:00 PM – 8:00 PM";
const FALLBACK_SCHEDULE = `Friday, Sep 9, ${DISPLAYED_EVENT_TIME} @ AMS Great Hall`;
const dmSans = DM_Sans({ subsets: ["latin"] });

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  weekday: "long",
  month: "short",
  day: "numeric",
  timeZone: "America/Vancouver",
});

function readString(value: unknown) {
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

function isMISCareerInterest(value: unknown): value is MISCareerInterest {
  return MIS_CAREER_INTERESTS.includes(value as MISCareerInterest);
}

function formatSchedule(event?: BiztechEvent) {
  if (!event?.startDate) return FALLBACK_SCHEDULE;

  const start = new Date(event.startDate);

  if (Number.isNaN(start.getTime())) return FALLBACK_SCHEDULE;

  const date = dateFormatter.format(start);
  const location = event.elocation?.trim()
    ? ` @ ${event.elocation.trim()}`
    : "";

  return `${date}, ${DISPLAYED_EVENT_TIME}${location}`;
}

export function MISRegistrationSuccessPage({
  eventId,
  year,
}: RegistrationSuccessPageProps) {
  const [details, setDetails] = useState<SuccessDetails>({
    profileName: "BizTech attendee",
    schedule: FALLBACK_SCHEDULE,
  });

  useEffect(() => {
    let isActive = true;

    async function loadSuccessDetails() {
      try {
        const attributes = await fetchUserAttributes();
        const email = attributes.email;

        const [event, registrationResponse, user] = await Promise.all([
          fetchBackend({
            endpoint: `/events/${eventId}/${year}`,
            method: "GET",
            authenticatedCall: false,
          }) as Promise<BiztechEvent>,
          email
            ? fetchBackend({
                endpoint: `/registrations?email=${email}`,
                method: "GET",
                authenticatedCall: false,
              })
            : Promise.resolve({ data: [] }),
          email
            ? fetchBackend({ endpoint: `/users/${email}`, method: "GET" })
            : Promise.resolve(undefined),
        ]);

        if (!isActive) return;

        const records = Array.isArray(registrationResponse?.data)
          ? (registrationResponse.data as MISRegistrationRecord[])
          : [];
        const registration = records.find(
          (record) => record["eventID;year"] === `${eventId};${year}`,
        );
        const basicInformation = registration?.basicInformation;
        const dynamicResponses = registration?.dynamicResponses;
        const firstName =
          readString(basicInformation?.fname) ??
          readString(registration?.fname) ??
          readString(user?.fname) ??
          readString(attributes.name);
        const lastName =
          readString(basicInformation?.lname) ?? readString(user?.lname);
        const profileName = [firstName, lastName].filter(Boolean).join(" ");
        const pronouns =
          readString(basicInformation?.pronouns) ??
          readString(registration?.pronouns) ??
          readString(user?.pronouns);
        const savedCareerInterest = dynamicResponses?.careerInterest;

        setDetails({
          profileName: profileName || "BizTech attendee",
          pronouns,
          careerInterest: isMISCareerInterest(savedCareerInterest)
            ? savedCareerInterest
            : undefined,
          schedule: formatSchedule(event),
        });
      } catch (error) {
        console.error("Unable to load MIS registration confirmation:", error);
      }
    }

    void loadSuccessDetails();

    return () => {
      isActive = false;
    };
  }, [eventId, year]);

  const result = details.careerInterest
    ? BUILDING_BLOCKS[details.careerInterest]
    : undefined;
  const Mascot = result?.image;
  const profileHeading = details.pronouns
    ? `${details.profileName} (${details.pronouns})`
    : details.profileName;

  return (
    <div
      className={`${dmSans.className} fixed inset-y-0 left-0 right-0 z-20 isolate overflow-x-hidden overflow-y-auto bg-black text-white md:left-[250px]`}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-y-0 left-0 right-0 overflow-hidden md:left-[250px]"
      >
        <MISBackground
          focusable="false"
          preserveAspectRatio="xMidYMid slice"
          className="block h-full w-full max-w-none"
        />
      </div>

      <main className="relative z-10 min-h-[100dvh] overflow-hidden px-6 py-10 md:px-10 md:py-12">
        <ConfettiBackground />

        <div className="relative z-10 mx-auto flex min-h-[calc(100dvh-5rem)] w-full max-w-[520px] flex-col items-center pt-[clamp(5rem,10dvh,6.5rem)] text-center md:min-h-[calc(100dvh-6rem)]">
          <div className="flex size-[80px] items-center justify-center rounded-full border-4 border-[#A7F2FC] bg-[#A7F2FC]/10 md:size-[88px]">
            <Check
              aria-hidden="true"
              className="size-10 text-[#A7F2FC] md:size-11"
              strokeWidth={2.2}
            />
          </div>

          <h1 className="mt-7 text-[36px] font-[900] leading-none tracking-[-0.025em] text-[#A7F2FC] md:mt-9 md:text-[44px]">
            You&apos;re all set!
          </h1>

          <section
            aria-label="Registration summary"
            className="mt-[clamp(3rem,8dvh,6rem)] w-full rounded-[22px] border border-[#2A2A2A] bg-[#1A1A1A] px-5 py-6 text-left shadow-[0_18px_60px_rgba(0,0,0,0.2)] md:mt-12 md:px-7 md:py-7"
          >
            <div className="flex items-center gap-4">
              <span className="flex size-[54px] shrink-0 items-center justify-center rounded-full border border-[#333333] bg-[#1A1A1A]">
                {Mascot ? (
                  <Mascot
                    focusable="false"
                    aria-hidden="true"
                    className="max-h-[38px] max-w-[43px]"
                  />
                ) : (
                  <span className="text-[20px] font-[900] text-[#A7F2FC]">
                    {details.profileName.charAt(0).toUpperCase()}
                  </span>
                )}
              </span>

              <div className="min-w-0">
                <h2 className="text-[17px] font-[900] leading-tight text-white md:text-[18px]">
                  {profileHeading}
                </h2>
                {result ? (
                  <p className="mt-1 text-[11px] font-[900] uppercase leading-none tracking-[0.08em] text-[#A7F2FC] md:text-[12px]">
                    {result.header}
                  </p>
                ) : null}
              </div>
            </div>

            <div className="my-5 h-px bg-[#292929]" />

            <h3 className="text-[10px] font-[900] uppercase tracking-[0.1em] text-white/50">
              Date &amp; location
            </h3>
            <p className="mt-2 text-[14px] leading-[1.4] text-white/85 md:text-[15px]">
              {details.schedule}
            </p>
          </section>

          <Link
            href={`/event/${eventId}/${year}`}
            className="mt-auto flex h-[68px] w-full items-center justify-center rounded-[24px] bg-[#917EF4] px-6 text-[22px] font-[900] text-white transition-colors hover:bg-[#A698FA] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#B2A3FF]/50 md:mt-11 md:h-[60px] md:max-w-[376px] md:rounded-[22px] md:text-[19px]"
          >
            View Registration
          </Link>
        </div>
      </main>
    </div>
  );
}
