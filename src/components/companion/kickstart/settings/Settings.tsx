import { Copy } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/router";
import { fetchBackend } from "@/lib/db";
import { useUserRegistration } from "@/pages/companion/index";
import { useTeam } from "../../events/Kickstart2025";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const Settings = () => {
  const router = useRouter();
  const { userRegistration } = useUserRegistration();
  const { team } = useTeam();
  const [copied, setCopied] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);
  const [showTeamIdDialog, setShowTeamIdDialog] = useState(false);

  const userInitials =
    `${userRegistration?.fname?.[0] || ""}${userRegistration?.lname?.[0] || ""}`.toUpperCase();
  const userName =
    `${userRegistration?.fname || ""} ${userRegistration?.lname || ""}`.trim();

  // Create members array from team data (memberNames and memberIDs are in the same order)
  const members =
    team?.memberNames && team?.memberIDs
      ? team.memberNames.map((name, index) => ({
        name,
        email: team.memberIDs[index],
      }))
      : [];

  const teamCode = team?.id || "";

  const handleCopyCode = async () => {
    try {
      if (typeof navigator === "undefined" || !navigator.clipboard) {
        console.warn("Clipboard API is not available.");
        return;
      }

      await navigator.clipboard.writeText(teamCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("Unable to copy team code", error);
    }
  };

  const handleLeaveTeam = async () => {
    if (!userRegistration) {
      alert("Registration data not loaded");
      return;
    }

    if (!confirm("Are you sure you want to leave the team?")) {
      return;
    }

    setIsLeaving(true);

    try {
      const eventIDYearString = userRegistration["eventID;year"];
      const [eventID, year] = eventIDYearString.split(";");

      await fetchBackend({
        endpoint: "/team/leave",
        method: "POST",
        authenticatedCall: true,
        data: {
          eventID: eventID,
          year: +year,
          memberID: userRegistration.id,
        },
      });

      router.push("/companion/team");
    } catch (err) {
      alert("Failed to leave team. Please try again.");
      setIsLeaving(false);
    }
  };

  return (
    <section className="w-full flex flex-col items-center justify-center text-white text-base gap-8 py-14 px-4 leading-relaxed">
      <h1 className="text-4xl md:text-5xl font-semibold tracking-tight text-center">
        KickStart Settings
      </h1>

      <div className="w-full max-w-4xl bg-[#111111] border border-white/10 rounded-lg px-8 md:px-12 py-8 flex flex-col lg:flex-row items-center lg:items-stretch gap-8 shadow-[0_26px_72px_rgba(0,0,0,0.5)]">
        <div className="flex flex-col items-center text-center gap-5 lg:w-[45%] lg:self-stretch lg:justify-center">
          <div className="h-40 w-40 rounded-full bg-white/10 border border-white/10 flex items-center justify-center">
            <span className="text-4xl font-medium text-white">
              {userInitials}
            </span>
          </div>

          <div className="text-2xl font-medium text-white/80">
            Team{" "}
            <span className="text-[#F4B73D] font-semibold">
              {team?.teamName || ""}
            </span>
          </div>

          <button
            onClick={() => setShowTeamIdDialog(true)}
            className="flex items-center gap-3 rounded-full border border-white/15 bg-[#1B1B1B] px-5 py-2.5 text-sm font-semibold uppercase tracking-[0.2em] text-white/80 transition hover:border-white/30"
          >
            View Team ID
          </button>
        </div>

        <div className="hidden lg:block w-px bg-white/10 rounded-full" />

        <div className="flex-1 w-full space-y-6 text-left">
          <div className="space-y-4">
            {members.map((member) => (
              <div key={member.email}>
                <p className="text-lg font-semibold text-white">
                  {member.name}
                </p>
                <p className="text-sm text-white/60">{member.email}</p>
              </div>
            ))}
          </div>
          <button
            onClick={handleLeaveTeam}
            disabled={isLeaving}
            className="mt-4 inline-flex h-11 items-center justify-center rounded-lg border border-[#FF4D4D] bg-[#2B0C0C] px-6 text-sm font-semibold text-[#FF6B6B] transition hover:bg-[#FF4D4D] hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLeaving ? "Leaving..." : "Leave Team"}
          </button>
        </div>
      </div>

      <Dialog open={showTeamIdDialog} onOpenChange={setShowTeamIdDialog}>
        <DialogContent className="max-w-md w-full bg-[#111111] border border-white/10">
          <DialogHeader>
            <DialogTitle className="text-white text-xl">Team ID</DialogTitle>
          </DialogHeader>

          <div className="w-full h-px bg-white/10 my-4" />

          <div className="space-y-4">
            <div className="flex items-center gap-3 p-4 rounded-lg border border-white/10 bg-[#1B1B1B]">
              <code className="flex-1 text-sm text-white/80 break-all">
                {teamCode}
              </code>
              <button
                onClick={handleCopyCode}
                className="flex items-center gap-2 px-3 py-2 rounded-lg border border-white/15 bg-[#111111] text-white/80 hover:bg-white/10 transition text-sm"
              >
                <Copy
                  size={16}
                  className={copied ? "text-[#F4B73D]" : "text-white/60"}
                />
                <span className="text-white/60">
                  {copied ? "Copied!" : "Copy"}
                </span>
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </section>
  );
};

export default Settings;
