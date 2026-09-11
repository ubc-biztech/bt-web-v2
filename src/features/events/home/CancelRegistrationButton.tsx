import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { fetchBackend } from "@/lib/db";
import type { Registration } from "@/queries/registrations";
import { useUserAttributes } from "@/queries/user";
import { DBRegistrationStatus } from "@/types/types";
import type { EventHomeEvent, EventRegistrationRecord } from "./types";
import { isDateInPast } from "./utils";

const cancellableStatuses = new Set<string>([
  DBRegistrationStatus.REGISTERED,
  DBRegistrationStatus.WAITLISTED,
  DBRegistrationStatus.INCOMPLETE,
  DBRegistrationStatus.ACCEPTED,
  DBRegistrationStatus.ACCEPTED_PENDING,
  DBRegistrationStatus.ACCEPTED_COMPLETE,
]);

export function CancelRegistrationButton({
  event,
  registration,
}: {
  event: EventHomeEvent;
  registration: EventRegistrationRecord;
}) {
  const [open, setOpen] = useState(false);
  const { data: user } = useUserAttributes();
  const queryClient = useQueryClient();
  const cancellation = useMutation({
    mutationFn: async () => {
      if (!user?.email) throw new Error("Sign in to cancel your registration.");
      const firstName =
        (typeof registration.fname === "string" && registration.fname) ||
        user.given_name ||
        user.name ||
        "Attendee";

      // Keep valid email path characters literal for deployed API handlers that
      // validate path parameters before URL-decoding them.
      const emailPath = encodeURIComponent(user.email)
        .replace(/%40/g, "@")
        .replace(/%2B/g, "+");

      await fetchBackend({
        endpoint: `/registrations/${emailPath}/${encodeURIComponent(firstName)}`,
        method: "PUT",
        data: {
          eventID: event.id,
          year: Number(event.year),
          registrationStatus: DBRegistrationStatus.CANCELLED,
        },
      });
    },
    onSuccess: async () => {
      const queryKey = ["registrations", user?.email];
      await queryClient.cancelQueries({ queryKey });
      queryClient.setQueryData<Registration[]>(queryKey, (registrations) =>
        registrations?.map((item) =>
          item["eventID;year"] === `${event.id};${event.year}`
            ? { ...item, registrationStatus: DBRegistrationStatus.CANCELLED }
            : item,
        ),
      );
      setOpen(false);
      void queryClient.invalidateQueries({ queryKey });
      void queryClient.invalidateQueries({ queryKey: ["events", event.id] });
    },
  });

  if (
    !user?.email ||
    !cancellableStatuses.has(registration.registrationStatus ?? "") ||
    isDateInPast(event.endDate)
  ) {
    return null;
  }

  const hasPaidTickets =
    event.pricing?.members > 0 || event.pricing?.nonMembers > 0;

  return (
    <AlertDialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (cancellation.isPending) return;
        cancellation.reset();
        setOpen(nextOpen);
      }}
    >
      <AlertDialogTrigger asChild>
        <button
          type="button"
          className="mt-3 min-h-11 w-full rounded-md px-3 py-2 text-sm font-600 text-[#ff9aad] transition hover:bg-white/5 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ff9aad]"
        >
          Cancel registration
        </button>
      </AlertDialogTrigger>
      <AlertDialogContent className="w-[calc(100%-2rem)] rounded-xl border-[#26314a] bg-[#111a30] text-white">
        <AlertDialogHeader>
          <AlertDialogTitle>Cancel your registration?</AlertDialogTitle>
          <AlertDialogDescription className="text-[#aeb7c8]">
            You are giving up your place at {event.ename}. If you change your
            mind, contact the event team to register again.
            {hasPaidTickets && " Cancelling does not issue a refund."}
          </AlertDialogDescription>
        </AlertDialogHeader>
        {cancellation.isError && (
          <p role="alert" className="text-sm text-[#ff9aad]">
            We couldn&apos;t cancel your registration. Please try again.
          </p>
        )}
        <AlertDialogFooter className="gap-2 sm:space-x-0">
          <AlertDialogCancel
            disabled={cancellation.isPending}
            className="border-[#A2B1D5] bg-transparent text-white hover:bg-white/10 hover:text-white"
          >
            Keep registration
          </AlertDialogCancel>
          <Button
            variant="destructive"
            disabled={cancellation.isPending}
            onClick={() => cancellation.mutate()}
          >
            {cancellation.isPending && (
              <Loader2
                className="mr-2 h-4 w-4 animate-spin"
                aria-hidden="true"
              />
            )}
            {cancellation.isPending ? "Cancelling..." : "Cancel registration"}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
