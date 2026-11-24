export const KICKSTART_EVENT_ID = "kickstart";
export const KICKSTART_YEAR = 2026;
export const KICKSTART_EVENT_KEY = "kickstart;2026";
export const KICKSTART_EVENT_PATH = "/event/kickstart/2026";

export function companyNameError(value: string): string | undefined {
  const name = value.trim();
  if (!name) return "Enter a company name.";
  if (name.length > 100) return "Use 100 characters or fewer.";
}

export function teamCodeError(value: string): string | undefined {
  if (!/^\d{6}$/.test(value)) return "Enter the six-digit team code.";
}

export function formationIsOpen(eventId: string, phase: string): boolean {
  // The market snapshot calls PRE_IPO "SEED". Unknown states fail closed.
  return eventId === KICKSTART_EVENT_KEY && phase === "SEED";
}

export type TeamMembershipState =
  | "open"
  | "seedLocked"
  | "ipoLocked"
  | "unavailable";

export function teamMembershipState(
  snapshot:
    | { eventId: string; phase: string; ipoAt?: number | null }
    | undefined,
  company: { seedStartedAt?: number | null; seedStatus: string } | undefined,
): TeamMembershipState {
  if (!snapshot || snapshot.eventId !== KICKSTART_EVENT_KEY)
    return "unavailable";
  if (
    ["IPO_PREPARING", "IPO_LAUNCHING", "LIVE"].includes(snapshot.phase) ||
    (typeof snapshot.ipoAt === "number" && Number.isFinite(snapshot.ipoAt))
  )
    return "ipoLocked";
  if (snapshot.phase !== "SEED" || snapshot.ipoAt !== null || !company)
    return "unavailable";
  // A started window never reopens membership, including after the window ends
  // or when an inconsistent/future timestamp is still labelled NOT_STARTED.
  if (
    typeof company.seedStartedAt === "number" &&
    Number.isFinite(company.seedStartedAt)
  )
    return "seedLocked";
  if (company.seedStartedAt === null && company.seedStatus === "NOT_STARTED")
    return "open";
  return "unavailable";
}

export function leaveTeamDescription(
  team: {
    leader_user_id: string;
    members: { user_id: string }[];
  },
  email: string,
): string {
  if (team.members.length === 1)
    return "You’re the last member. Leaving deletes this team and its unused company.";
  if (team.leader_user_id === email)
    return "Leadership will pass to another remaining teammate. You’ll lose access to manage this company.";
  return "You’ll lose access to manage this company. You can rejoin with its code while team formation is open.";
}
