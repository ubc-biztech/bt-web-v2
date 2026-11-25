import { useEffect, useState } from "react";
import Link from "next/link";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import type { Team, TeamMember } from "@/features/events/teams";
import {
  AngledPanel,
  StatusBanner,
  teamPanelClass,
  teamPrimaryButton,
  teamSecondaryButton,
} from "./BtxUI";
import { exchangePath } from "./market";
import { leaveTeamDescription, type TeamMembershipState } from "./teamRules";

const dangerButton =
  "min-h-11 rounded-full border border-[#a63859] bg-[#351629] px-4 text-[13px] text-[#ff879a] hover:bg-[#4b1e37] hover:text-[#ffb1bd] disabled:opacity-50";

type Confirmation =
  | { action: "leave" }
  | { action: "remove"; member: TeamMember };

interface TeamManagementProps {
  team: Team;
  email: string;
  created: boolean;
  removed: boolean;
  membershipState: TeamMembershipState;
  checkingPermissions: boolean;
  busy: boolean;
  leaving: boolean;
  removingUserId?: string;
  onLeave: () => Promise<void>;
  onRemove: (member: TeamMember) => Promise<void>;
  onRefresh: () => void;
  onFindTeam: () => void;
}

function initials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

export function TeamManagement({
  team,
  email,
  created,
  removed,
  membershipState,
  checkingPermissions,
  busy,
  leaving,
  removingUserId,
  onLeave,
  onRemove,
  onRefresh,
  onFindTeam,
}: TeamManagementProps) {
  const [copied, setCopied] = useState(false);
  const [copyFailed, setCopyFailed] = useState(false);
  const [confirmation, setConfirmation] = useState<Confirmation | null>(null);
  const isLeader = team.leader_user_id === email;
  const canManage = !removed && membershipState === "open";
  const locked =
    membershipState === "seedLocked" || membershipState === "ipoLocked";

  useEffect(() => {
    if (!copied) return;
    const timer = window.setTimeout(() => setCopied(false), 2000);
    return () => window.clearTimeout(timer);
  }, [copied]);

  useEffect(() => {
    if (
      removed ||
      membershipState !== "open" ||
      (confirmation?.action === "remove" &&
        (!isLeader ||
          !team.members.some(
            (member) => member.user_id === confirmation.member.user_id,
          )))
    ) {
      setConfirmation(null);
    }
  }, [confirmation, isLeader, membershipState, removed, team.members]);

  async function copyCode() {
    try {
      await navigator.clipboard.writeText(team.team_code);
      setCopied(true);
      setCopyFailed(false);
    } catch {
      setCopyFailed(true);
    }
  }

  async function confirmAction() {
    if (!confirmation || !canManage || busy) return;
    if (confirmation.action === "leave") await onLeave();
    else await onRemove(confirmation.member);
    setConfirmation(null);
  }

  return (
    <div className="mx-auto max-w-[1000px] space-y-5 md:space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div className="min-w-0 space-y-2">
          <p className="text-[12px] text-[#1fbef9]">My company</p>
          <h1 className="break-words text-[32px] font-medium leading-tight md:text-[44px]">
            {team.team_name}
          </h1>
        </div>
        {!removed && (
          <span className="inline-flex items-center gap-2 rounded-full border border-[#38d3a2]/40 bg-[#38d3a2]/10 px-3 py-1 text-[12px] text-[#38d3a2]">
            <Check size={14} aria-hidden="true" />
            Team formed
          </span>
        )}
      </header>

      {removed ? (
        <>
          <StatusBanner
            tone="warning"
            title="You’re no longer on this company team"
            description="Your membership changed. You can still browse companies, but team-management access has been removed."
          />
          <AngledPanel className={teamPanelClass}>
            <div className="space-y-4">
              <h2 className="text-[20px] font-medium">Company team</h2>
              <p className="text-[14px] leading-6 text-[#b5c1da]">
                The team code and membership controls are available only to
                current members.
              </p>
              <Button className={teamPrimaryButton} onClick={onFindTeam}>
                Find another team
              </Button>
            </div>
          </AngledPanel>
        </>
      ) : (
        <>
          {created && (
            <StatusBanner
              tone="success"
              title="Company team created"
              description="Your team and its linked company have been created. Share the six-digit code with your teammates."
            />
          )}
          {checkingPermissions ? (
            <StatusBanner tone="info" title="Checking team permissions…" />
          ) : membershipState === "seedLocked" ? (
            <StatusBanner
              tone="warning"
              title="Team membership is locked"
              description="This company has started seeding. Joining, leaving, and removing members stay closed even after its seed window ends. Contact an organizer for changes."
            />
          ) : membershipState === "ipoLocked" ? (
            <StatusBanner
              tone="warning"
              title="Team membership is locked"
              description="IPO preparation has started. Joining, leaving, and removing members are closed. Contact an organizer for changes."
            />
          ) : membershipState === "unavailable" ? (
            <StatusBanner
              tone="warning"
              title="Team permissions are unavailable"
              description="We can’t confirm the company’s current state, so membership changes are paused. Try again or contact an organizer."
              onRetry={onRefresh}
            />
          ) : null}

          <AngledPanel className={teamPanelClass}>
            <div className="space-y-5 md:space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h2 className="text-[12px] text-[#98a9c8]">Team code</h2>
                  <p
                    className={`select-all text-[36px] leading-tight tabular-nums ${copied ? "text-[#38d3a2]" : "text-[#82c3fb]"}`}
                  >
                    {team.team_code}
                  </p>
                </div>
                <Button
                  className={teamSecondaryButton}
                  onClick={() => void copyCode()}
                  aria-label={copied ? "Team code copied" : "Copy team code"}
                >
                  {copied ? "Copied" : "Copy"}
                </Button>
              </div>
              <p role="status" className="text-[13px] text-[#98a9c8]">
                {copyFailed
                  ? "Couldn’t copy the code. Select it above and copy it manually."
                  : copied
                    ? "Team code copied."
                    : canManage
                      ? "Share this six-digit code so your teammates can join."
                      : "This code identifies your team. Membership changes are currently closed."}
              </p>
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-[13px] text-[#1fbef9]">
                  Members ({team.members.length})
                </h2>
                <span className="text-[12px] text-[#98a9c8]">
                  {isLeader ? "You’re the team leader" : "You’re a team member"}
                </span>
              </div>
              <ul className="space-y-3">
                {team.members.map((member) => {
                  const leader = member.user_id === team.leader_user_id;
                  const removing = busy && removingUserId === member.user_id;
                  return (
                    <li
                      key={member.user_id}
                      className="flex min-h-[72px] items-center gap-3 rounded-2xl border border-[#263850] bg-[#080f1b] p-3 md:p-4"
                    >
                      <span
                        aria-hidden="true"
                        className="grid size-10 shrink-0 place-items-center rounded-full bg-gradient-to-br from-[#1fbef9] to-[#276aca] text-[13px] font-semibold text-white"
                      >
                        {initials(member.name)}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="break-words text-[14px] font-medium">
                          {member.name}
                          {member.user_id === email ? " (you)" : ""}
                        </p>
                        <p
                          className={`text-[12px] ${leader ? "text-[#ffddad]" : "text-[#98a9c8]"}`}
                        >
                          {leader ? "Leader" : "Member"}
                        </p>
                      </div>
                      {isLeader && !leader && (
                        <Button
                          className={`${dangerButton} shrink-0 px-3`}
                          disabled={busy || !canManage}
                          aria-label={`Remove ${member.name}`}
                          onClick={() =>
                            setConfirmation({ action: "remove", member })
                          }
                        >
                          {removing ? "Removing…" : "Remove"}
                        </Button>
                      )}
                    </li>
                  );
                })}
              </ul>
              <div className="flex justify-end border-t border-[#263850] pt-5">
                <Button
                  className={`${dangerButton} w-full md:w-auto`}
                  disabled={busy || !canManage}
                  onClick={() => setConfirmation({ action: "leave" })}
                >
                  {leaving
                    ? "Leaving…"
                    : locked
                      ? "Leave company (locked)"
                      : "Leave company"}
                </Button>
              </div>
            </div>
          </AngledPanel>
        </>
      )}

      <Button asChild className={`${teamSecondaryButton} w-full md:w-auto`}>
        <Link href={exchangePath + "/catalog"}>
          Browse KickStart companies →
        </Link>
      </Button>

      <AlertDialog
        open={!!confirmation && !removed}
        onOpenChange={(open) => {
          if (!open && !busy) setConfirmation(null);
        }}
      >
        <AlertDialogContent className="w-[calc(100vw-32px)] max-w-[520px] rounded-2xl border-[#324a68] bg-[#101a2b] text-[#e6ebf6] sm:rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="break-words text-[24px] leading-8">
              {confirmation?.action === "remove"
                ? `Remove ${confirmation.member.name}?`
                : `Leave ${team.team_name}?`}
            </AlertDialogTitle>
            <AlertDialogDescription className="text-[14px] leading-6 text-[#b5c1da]">
              {confirmation?.action === "remove"
                ? "They’ll lose access to manage this company. They can rejoin with its code while team formation is open."
                : leaveTeamDescription(team, email)}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-3 sm:space-x-0">
            <AlertDialogCancel className={teamSecondaryButton} disabled={busy}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              className={dangerButton}
              disabled={busy || !canManage}
              onClick={(event) => {
                event.preventDefault();
                void confirmAction();
              }}
            >
              {busy
                ? "Please wait…"
                : confirmation?.action === "remove"
                  ? "Remove member"
                  : "Leave company"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
