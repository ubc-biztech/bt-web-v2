import { getStatusLabel } from "@/lib/registrationStatus";
import { DBRegistrationStatus } from "@/types/types";
import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  Loader2,
  Ticket,
} from "lucide-react";
import Link from "next/link";
import type {
  EventCounts,
  EventHomeEvent,
  EventRegistrationRecord,
} from "./types";
import {
  formatDeadlineStatus,
  formatPrimaryPrice,
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
      actionLabel: isApplication ? "Start application" : "Register now",
      tone: "open",
    };
  }

  return {
    status: isApplication ? "Not submitted" : "Not registered",
    description: `Fill out the ${registrationLabel.toLowerCase()} form when you are ready.`,
    actionLabel: isApplication ? "Start application" : "Register now",
    tone: "open",
  };
}

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
  const deadlineStatus = formatDeadlineStatus(event.deadline);
  const ctaDisabled = copy.tone === "loading";
  const isConfirmed = copy.tone === "success";
  const showAction = !isConfirmed;
  const statusLine = isConfirmed
    ? event.isApplicationBased
      ? copy.status
      : "You're registered"
    : copy.tone === "open"
      ? deadlineStatus
      : copy.status;

  return (
    <section className="flex min-h-[128px] flex-col justify-between rounded-[14px] border border-[#26314a] bg-[#111a30] p-5 shadow-[0_12px_28px_rgba(0,0,0,0.18)] lg:p-6">
      <div>
        <div className="flex min-w-0 items-center gap-2">
          <Ticket className="h-6 w-6 text-[#0ec58c]" aria-hidden="true" />
          <h2 className="break-words text-[24px] font-800 leading-none text-white">
            {formatPrimaryPrice(event)}
          </h2>
        </div>

        <div
          className={`mt-4 flex items-center gap-3 text-[14px] font-600 ${
            copy.tone === "success"
              ? "text-[#0ec58c]"
              : copy.tone === "closed"
                ? "text-[#ff9aad]"
                : copy.tone === "warning"
                  ? "text-[#ffd66b]"
                  : "text-[#9f9f9f]"
          }`}
        >
          <StatusIcon
            className={`h-5 w-5 ${registrationLoading ? "animate-spin" : ""}`}
            aria-hidden="true"
          />
          <span>{statusLine}</span>
        </div>

        {!isConfirmed && copy.tone !== "open" && (
          <p className="mt-3 text-xs leading-5 text-[#aeb7c8]">
            {copy.description}
          </p>
        )}
      </div>

      {showAction && (
        <Link
          href={registrationHref}
          aria-disabled={ctaDisabled}
          className={`mt-4 inline-flex h-9 w-full items-center justify-center gap-2 rounded-md border px-4 text-xs font-800 transition ${
            ctaDisabled
              ? "pointer-events-none border-[#263451] bg-[#263451] text-[#9f9f9f]"
              : "border-[#4D9CFF] bg-[#4D9CFF] text-white hover:border-[#67adff] hover:bg-[#67adff]"
          }`}
        >
          {copy.actionLabel}
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </Link>
      )}
    </section>
  );
}
