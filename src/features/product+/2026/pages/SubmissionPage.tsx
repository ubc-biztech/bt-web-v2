"use client";

import Link from "next/link";
import { useRouter } from "next/router";
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useUserAttributes } from "@/queries/user";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  GlassCard,
  PageHeading,
  ProductButton,
} from "../components/ProductPlusUI";
import { PRODUCT_PLUS_COMPANION_PATH } from "../access";
import { productHeadingFont } from "../font";
import { cn } from "@/lib/utils";
import SubmissionForm from "../submission/SubmissionForm";
import { errorMessage, getSubmission } from "../submission/api";
import { useProductPlusTeam } from "../team";
import type { SubmissionTeam } from "../submission/submission";

function SubmissionState({
  message,
  retry,
}: {
  message: string;
  retry?: () => void;
}) {
  return (
    <div className="flex flex-col gap-6">
      <PageHeading title="Submission" className="mb-0" />
      <GlassCard className="flex flex-col items-start gap-4">
        <p
          role={retry ? "alert" : "status"}
          className="text-[14px] leading-5 text-product-muted"
        >
          {message}
        </p>
        {retry && <ProductButton onClick={retry}>Try again</ProductButton>}
      </GlassCard>
    </div>
  );
}

function TeamRequired() {
  const router = useRouter();
  return (
    <>
      <SubmissionState message="Create or join a team to prepare your submission." />
      <Dialog
        open
        onOpenChange={(open) => {
          if (!open) void router.replace(`${PRODUCT_PLUS_COMPANION_PATH}/myteam`);
        }}
      >
        <DialogContent
          className={cn(
            productHeadingFont.variable,
            "rounded-[32px] border-white/70 bg-white/[0.95] p-8 font-product-body text-product-ink backdrop-blur-[14px] sm:rounded-[32px] [&>button_svg]:text-product-ink",
          )}
        >
          <DialogTitle className="font-product-heading text-[24px] font-normal leading-8 text-black">
            Join or create a team first
          </DialogTitle>
          <DialogDescription className="text-[14px] leading-5 text-product-muted">
            Your submission belongs to your team. Create a team even if you’re
            participating solo, or join your teammates using their code.
          </DialogDescription>
          <ProductButton asChild>
            <Link href={`${PRODUCT_PLUS_COMPANION_PATH}/myteam`}>
              Go to My team
            </Link>
          </ProductButton>
        </DialogContent>
      </Dialog>
    </>
  );
}

function TeamSubmission({
  team,
  email,
  onAccessLost,
}: {
  team: SubmissionTeam;
  email: string;
  onAccessLost: () => void;
}) {
  const client = useQueryClient();
  const [accessLost, setAccessLost] = useState(false);
  const queryKey = ["productplus", "submission", email, team.team_code];
  const query = useQuery({
    queryKey,
    queryFn: getSubmission,
    retry: false,
    staleTime: 0,
    gcTime: 0,
    refetchOnWindowFocus: "always",
  });
  if (query.isPending)
    return <SubmissionState message="Loading your submission…" />;
  if (query.isError)
    return (
      <SubmissionState
        message={errorMessage(query.error)}
        retry={() => {
          onAccessLost();
          void query.refetch();
        }}
      />
    );
  if (
    accessLost ||
    (query.data.submission &&
      query.data.submission.team_code !== team.team_code)
  )
    return (
      <SubmissionState
        message="Your team access has changed. Reload to check your access."
        retry={() => {
          onAccessLost();
          void query.refetch().then((result) => {
            if (result.isSuccess) setAccessLost(false);
          });
        }}
      />
    );
  return (
    <SubmissionForm
      team={team}
      snapshot={query.data}
      onSnapshot={async (snapshot) => {
        await client.cancelQueries({ queryKey });
        client.setQueryData(queryKey, snapshot);
      }}
      onAccessLost={() => {
        setAccessLost(true);
        client.removeQueries({ queryKey });
        onAccessLost();
      }}
    />
  );
}

export default function SubmissionPage() {
  const user = useUserAttributes();
  const email = user.data?.email ?? "";
  const team = useProductPlusTeam(email, {
    retry: false,
    refetchOnWindowFocus: "always",
  });
  if (!email || team.isPending)
    return <SubmissionState message="Loading your team…" />;
  if (team.isError)
    return (
      <SubmissionState
        message={errorMessage(team.error)}
        retry={() => void team.refetch()}
      />
    );
  if (!team.data) return <TeamRequired />;
  return (
    <TeamSubmission
      key={`${email}:${team.data.team_code}`}
      email={email}
      team={team.data}
      onAccessLost={() => void team.refetch()}
    />
  );
}
