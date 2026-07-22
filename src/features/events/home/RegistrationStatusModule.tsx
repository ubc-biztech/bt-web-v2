import { getStatusLabel } from "@/lib/registrationStatus";
import { DBRegistrationStatus } from "@/types/types";
import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  Clock3,
  Loader2,
  Ticket,
  UsersRound,
} from "lucide-react";
import Link from "next/link";
import type {
  EventCounts,
  EventHomeEvent,
  EventRegistrationRecord,
} from "./types";
import {
  formatDeadline,
  formatPrice,
  getCapacityStats,
  isDateInPast,
} from "./utils";

type RegistrationStatusModuleProps = {
  event: EventHomeEvent;
  counts?: EventCounts;
  registration?: EventRegistrationRecord;
  registrationLoading: boolean;
  registrationHref: string;
  signedIn: boolean;
};

type RegistrationCopy = {
  status: string;
  description: string;
  actionLabel: string;
  tone: "open" | "success" | "warning" | "closed" | "loading";
};

function getRegistrationCopy({
  event,
  registration,
  registrationLoading,
  signedIn,
  isFull,
}: RegistrationStatusModuleProps & { isFull: boolean }): RegistrationCopy {
  const isApplication = event.isApplicationBased;
  const registrationLabel = isApplication ? "Application" : "Registration";
  const rawStatus = registration?.registrationStatus;
  const deadlinePassed = isDateInPast(event.deadline);

  if (registrationLoading) {
    return {
      status: "Checking status...",
      description: `Checking your latest ${registrationLabel.toLowerCase()} status.`,
      actionLabel: `View ${registrationLabel.toLowerCase()}`,
      tone: "loading",
    };
  }

  if (rawStatus) {
    const statusLabel =
      rawStatus === DBRegistrationStatus.REGISTERED && isApplication
        ? "Application submitted"
        : getStatusLabel(rawStatus);

    const needsAction =
      rawStatus === DBRegistrationStatus.INCOMPLETE ||
      rawStatus === DBRegistrationStatus.ACCEPTED ||
      rawStatus === DBRegistrationStatus.ACCEPTED_PENDING;

    const confirmedDescription = `You are registered and confirmed for ${event.ename}.`;
    const description =
      rawStatus === DBRegistrationStatus.REGISTERED
        ? isApplication
          ? "Your application has been submitted and will be reviewed shortly."
          : confirmedDescription
        : rawStatus === DBRegistrationStatus.ACCEPTED_COMPLETE
          ? confirmedDescription
          : rawStatus === DBRegistrationStatus.CHECKED_IN
            ? `Thank you for attending ${event.ename}.`
            : rawStatus === DBRegistrationStatus.INCOMPLETE
              ? "Please proceed to checkout to confirm."
              : needsAction
                ? `Complete the remaining ${registrationLabel.toLowerCase()} steps to confirm your spot.`
                : `Your ${registrationLabel.toLowerCase()} is already on file for this event.`;

    return {
      status: statusLabel,
      description,
      actionLabel: needsAction
        ? `Continue ${registrationLabel.toLowerCase()}`
        : `View ${registrationLabel.toLowerCase()}`,
      tone:
        rawStatus === DBRegistrationStatus.CANCELLED
          ? "closed"
          : rawStatus === DBRegistrationStatus.WAITLISTED || needsAction
            ? "warning"
            : "success",
    };
  }

  if (deadlinePassed) {
    return {
      status: `${registrationLabel} closed`,
      description: `The ${registrationLabel.toLowerCase()} deadline has passed. Send inquiry through email if you have questions!`,
      actionLabel: `View ${registrationLabel.toLowerCase()} page`,
      tone: "closed",
    };
  }

  if (isFull) {
    return {
      status: "Event full",
      description:
        "Capacity is currently full. If available, waitlist options will appear in the registration form.",
      actionLabel: `View ${registrationLabel.toLowerCase()} page`,
      tone: "closed",
    };
  }

  if (!signedIn) {
    return {
      status: isApplication ? "Not submitted" : "Not registered",
      description: `Sign in to fill out the ${registrationLabel.toLowerCase()} form when you are ready.`,
      actionLabel: isApplication ? "Start application" : "Start registration",
      tone: "open",
    };
  }

  return {
    status: isApplication ? "Not submitted" : "Not registered",
    description: `Fill out the ${registrationLabel.toLowerCase()} form when you are ready.`,
    actionLabel: isApplication ? "Start application" : "Start registration",
    tone: "open",
  };
}

const toneClasses: Record<RegistrationCopy["tone"], string> = {
  open: "border-[#75d450]/35 bg-[#75d450]/10 text-[#9be67c]",
  success: "border-[#75d450]/35 bg-[#75d450]/10 text-[#9be67c]",
  warning: "border-[#ffd66b]/35 bg-[#ffd66b]/10 text-[#ffd66b]",
  closed: "border-[#ff647e]/35 bg-[#ff647e]/10 text-[#ff9aad]",
  loading: "border-[#444] bg-[#2a2a2a] text-[#c8c8c8]",
};

const toneIcons: Record<RegistrationCopy["tone"], typeof Ticket> = {
  open: Ticket,
  success: CheckCircle2,
  warning: AlertCircle,
  closed: AlertCircle,
  loading: Loader2,
};

export function RegistrationStatusModule(props: RegistrationStatusModuleProps) {
  const { event, counts, registrationHref, registrationLoading } = props;
  const stats = getCapacityStats(event, counts);
  const isFull = stats.capacity > 0 && stats.spotsRemaining === 0;
  const copy = getRegistrationCopy({ ...props, isFull });
  const StatusIcon = toneIcons[copy.tone];
  const statusTitle = event.isApplicationBased
    ? "Your Application Status"
    : "Your Registration Status";

  return (
    <section className="flex min-h-[275px] flex-col overflow-hidden rounded-lg border border-[#263451] bg-[#0B152C] shadow-[0_12px_28px_rgba(0,0,0,0.2)]">
      <div className="flex flex-1 flex-col gap-4 p-5 md:p-6">
        <div className="flex min-w-0 flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex flex-wrap items-center gap-2.5">
            <p className="text-xs font-800 text-[#9f9f9f] md:text-sm">
              {statusTitle}
            </p>
            <span
              className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-800 ${toneClasses[copy.tone]}`}
            >
              <StatusIcon
                className={`h-3 w-3 ${registrationLoading ? "animate-spin" : ""}`}
                aria-hidden="true"
              />
              {copy.tone === "open" ? "Open" : copy.status}
            </span>
          </div>
          <Link
            href={registrationHref}
            className="inline-flex h-9 w-full shrink-0 items-center justify-center gap-2 rounded-md bg-[#6254f3] px-4 text-sm font-800 text-white transition hover:bg-[#7568ff] sm:w-fit"
          >
            {copy.actionLabel}
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>

        <div className="min-w-0">
          <h2 className="mt-3 break-words text-2xl font-800 leading-none text-white md:text-[30px]">
            {copy.status}
          </h2>
          <p className="mt-2 max-w-xl text-xs leading-5 text-[#aaa] md:text-sm">
            {copy.description}
          </p>
        </div>
      </div>

      <div className="grid gap-0 border-t border-[#263451] sm:grid-cols-3 sm:divide-x sm:divide-[#263451]">
        <div className="flex items-start gap-2.5 border-b border-[#263451] p-4 sm:border-b-0">
          <Clock3
            className="mt-0.5 h-4 w-4 text-[#9f9f9f]"
            aria-hidden="true"
          />
          <div>
            <p className="text-[11px] font-800 uppercase tracking-[0.08em] text-[#858585]">
              Deadline
            </p>
            <p className="mt-1 text-xs font-800 text-white md:text-sm">
              {formatDeadline(event.deadline)}
            </p>
          </div>
        </div>

        <div className="flex items-start gap-2.5 border-b border-[#263451] p-4 sm:border-b-0">
          <UsersRound
            className="mt-0.5 h-4 w-4 text-[#9f9f9f]"
            aria-hidden="true"
          />
          <div className="w-full">
            <p className="text-[11px] font-800 uppercase tracking-[0.08em] text-[#858585]">
              Capacity
            </p>
            <p className="mt-1 text-xs font-800 text-white md:text-sm">
              {stats.capacity > 0
                ? `${stats.spotsRemaining} spots left`
                : "Capacity TBA"}
            </p>
            {stats.capacity > 0 && (
              <div className="mt-2 h-1 overflow-hidden rounded-full bg-[#303030]">
                <div
                  className="h-full rounded-full bg-bt-green-300"
                  style={{ width: `${stats.fillPercentage}%` }}
                />
              </div>
            )}
          </div>
        </div>

        <div className="flex items-start gap-2.5 p-4">
          <Ticket
            className="mt-0.5 h-4 w-4 text-[#9f9f9f]"
            aria-hidden="true"
          />
          <div>
            <p className="text-[11px] font-800 uppercase tracking-[0.08em] text-[#858585]">
              Pricing
            </p>
            <p className="mt-1 text-xs font-800 text-white md:text-sm">
              {formatPrice(event)}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
