export interface AudienceSubmission {
  team_code: string;
  team_name: string;
  video_url: string;
  has_voted: boolean | null;
}

export interface AudienceResponse {
  voting_opens_at: string;
  voting_deadline: string;
  voting_open: boolean;
  submissions: AudienceSubmission[];
}

export type VoteChoice = "accept" | "reject";

export function audienceSubmissionsPath(identity: string | null): string {
  return identity === null
    ? "/productplus/audience/submissions"
    : "/productplus/audience/submissions/self";
}

export function votingPhase(data: AudienceResponse, now: number) {
  if (now < Date.parse(data.voting_opens_at)) return "upcoming";
  if (now >= Date.parse(data.voting_deadline)) return "closed";
  return data.voting_open ? "open" : "paused";
}

// Keep the server's initial shuffle stable across refreshes and vote reconciliation.
export function orderSubmissions(
  submissions: AudienceSubmission[],
  order: readonly string[],
): AudienceSubmission[] {
  const byCode = new Map(submissions.map((team) => [team.team_code, team]));
  const ordered: AudienceSubmission[] = [];
  for (const code of order) {
    const team = byCode.get(code);
    if (team) {
      ordered.push(team);
      byCode.delete(code);
    }
  }
  return [...ordered, ...Array.from(byCode.values())];
}

export function youtubeVideoId(value: string): string | null {
  try {
    const url = new URL(value);
    if (url.protocol !== "https:" && url.protocol !== "http:") return null;
    const host = url.hostname.toLowerCase();
    let id: string | null = null;
    if (host === "youtu.be" || host === "www.youtu.be") {
      id = url.pathname.split("/")[1];
    } else if (
      [
        "youtube.com",
        "www.youtube.com",
        "m.youtube.com",
        "youtube-nocookie.com",
        "www.youtube-nocookie.com",
      ].includes(host)
    ) {
      const parts = url.pathname.split("/");
      id =
        url.pathname === "/watch"
          ? url.searchParams.get("v")
          : ["embed", "shorts", "live"].includes(parts[1])
            ? parts[2]
            : null;
    }
    return id && /^[a-zA-Z0-9_-]{11}$/.test(id) ? id : null;
  } catch {
    return null;
  }
}

export function formatArenaDate(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "To be announced";
  return (
    new Intl.DateTimeFormat("en-US", {
      timeZone: "America/Vancouver",
      month: "long",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    }).format(date) + " PT"
  );
}
