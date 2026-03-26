import { useState, useEffect, useCallback, useMemo } from "react";
import { fetchBackend } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Users,
  Trophy,
  Search,
  RefreshCw,
  ChevronDown,
  ChevronRight,
  UserMinus,
  Pencil,
  Hash,
  Crown,
} from "lucide-react";

interface TeamMember {
  id: string;
  fname?: string;
  lname?: string;
  email?: string;
  basicInformation?: {
    fname?: string;
    lname?: string;
  };
}

interface Team {
  id: string;
  teamName: string;
  "eventID;year": string;
  memberIDs: string[];
  points: number;
  pointsSpent?: number;
  scannedQRs?: string[];
  submission?: string;
  metadata?: Record<string, unknown>;
  // Enriched client-side from registration data
  members?: TeamMember[];
}

interface TeamsTabProps {
  eventId: string;
  year: string;
  registrations?: any[];
}

export default function TeamsTab({
  eventId,
  year,
  registrations,
}: TeamsTabProps) {
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedTeam, setExpandedTeam] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // rename
  const [renameTeam, setRenameTeam] = useState<Team | null>(null);
  const [newTeamName, setNewTeamName] = useState("");

  // remove member dialog
  const [removeMember, setRemoveMember] = useState<{
    team: Team;
    memberId: string;
    memberName: string;
  } | null>(null);

  // point adjustment dialog
  const [pointsDialog, setPointsDialog] = useState<{
    team: Team;
    memberId: string;
  } | null>(null);
  const [pointsChange, setPointsChange] = useState<number>(0);

  const loadTeams = useCallback(async () => {
    try {
      setLoading(true);
      const data = await fetchBackend({
        endpoint: `/team/${eventId}/${year}`,
        method: "GET",
      });

      // enrich teams with registration data for member names
      const enriched = (data || []).map((team: Team) => {
        const members = team.memberIDs.map((memberId: string) => {
          const reg = registrations?.find((r: any) => r.id === memberId);
          return {
            id: memberId,
            fname: reg?.basicInformation?.fname || reg?.fname || "",
            lname: reg?.basicInformation?.lname || reg?.lname || "",
            email: reg?.id || memberId,
          };
        });
        return { ...team, members };
      });

      setTeams(enriched);
      setError(null);
    } catch (err: any) {
      console.error("Failed to load teams:", err);
      setError(err.message || "Failed to load teams");
    } finally {
      setLoading(false);
    }
  }, [eventId, year, registrations]);

  useEffect(() => {
    loadTeams();
  }, [loadTeams]);

  const filteredTeams = useMemo(() => {
    if (!searchQuery) return teams;
    const q = searchQuery.toLowerCase();
    return teams.filter(
      (t) =>
        t.teamName.toLowerCase().includes(q) ||
        t.memberIDs.some((id) => id.toLowerCase().includes(q)) ||
        t.members?.some(
          (m) =>
            m.fname?.toLowerCase().includes(q) ||
            m.lname?.toLowerCase().includes(q) ||
            m.email?.toLowerCase().includes(q),
        ),
    );
  }, [teams, searchQuery]);

  const sortedTeams = useMemo(() => {
    return [...filteredTeams].sort((a, b) => b.points - a.points);
  }, [filteredTeams]);

  // stats
  const totalTeams = teams.length;
  const totalMembers = teams.reduce((sum, t) => sum + t.memberIDs.length, 0);
  const avgTeamSize =
    totalTeams > 0 ? (totalMembers / totalTeams).toFixed(1) : "0";
  const topTeam = teams.reduce(
    (top, t) => (t.points > (top?.points || 0) ? t : top),
    teams[0],
  );

  const handleRename = async () => {
    if (!renameTeam || !newTeamName.trim()) return;
    setIsSubmitting(true);
    try {
      const firstMember = renameTeam.memberIDs[0];
      if (!firstMember) throw new Error("Team has no members");
      await fetchBackend({
        endpoint: "/team/changeName",
        method: "POST",
        authenticatedCall: false,
        data: {
          user_id: firstMember,
          eventID: eventId,
          year: Number(year),
          team_name: newTeamName.trim(),
        },
      });
      setRenameTeam(null);
      setNewTeamName("");
      await loadTeams();
    } catch (err: any) {
      setError(err.message || "Failed to rename team");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRemoveMember = async () => {
    if (!removeMember) return;
    setIsSubmitting(true);
    try {
      await fetchBackend({
        endpoint: "/team/leave",
        method: "POST",
        data: {
          memberID: removeMember.memberId,
          eventID: eventId,
          year: Number(year),
        },
      });
      setRemoveMember(null);
      await loadTeams();
    } catch (err: any) {
      setError(err.message || "Failed to remove member");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePointsUpdate = async () => {
    if (!pointsDialog || pointsChange === 0) return;
    setIsSubmitting(true);
    try {
      await fetchBackend({
        endpoint: "/team/updatePoints",
        method: "PUT",
        authenticatedCall: false,
        data: {
          user_id: pointsDialog.memberId,
          eventID: eventId,
          year: Number(year),
          change_points: pointsChange,
        },
      });
      setPointsDialog(null);
      setPointsChange(0);
      await loadTeams();
    } catch (err: any) {
      setError(err.message || "Failed to update points");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getMemberName = (member: TeamMember) => {
    const first = member.fname || "";
    const last = member.lname || "";
    return first || last
      ? `${first} ${last}`.trim()
      : member.email || member.id;
  };

  return (
    <div className="space-y-4 md:space-y-6">
      {/* stats row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        <Card>
          <CardContent className="pt-3 pb-3 md:pt-4 md:pb-4">
            <div className="flex items-center gap-2 md:gap-3">
              <Users className="w-4 h-4 md:w-5 md:h-5 text-bt-green-400" />
              <div>
                <p className="text-[11px] md:text-xs text-muted-foreground">
                  Teams
                </p>
                <p className="text-xl md:text-2xl font-bold">{totalTeams}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-3 pb-3 md:pt-4 md:pb-4">
            <div className="flex items-center gap-2 md:gap-3">
              <Hash className="w-4 h-4 md:w-5 md:h-5 text-bt-blue-100" />
              <div>
                <p className="text-[11px] md:text-xs text-muted-foreground">
                  Total Members
                </p>
                <p className="text-xl md:text-2xl font-bold">{totalMembers}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-3 pb-3 md:pt-4 md:pb-4">
            <div className="flex items-center gap-2 md:gap-3">
              <Users className="w-4 h-4 md:w-5 md:h-5 text-bt-blue-0" />
              <div>
                <p className="text-[11px] md:text-xs text-muted-foreground">
                  Avg Size
                </p>
                <p className="text-xl md:text-2xl font-bold">{avgTeamSize}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-3 pb-3 md:pt-4 md:pb-4">
            <div className="flex items-center gap-2 md:gap-3">
              <Crown className="w-4 h-4 md:w-5 md:h-5 text-bt-green-300" />
              <div>
                <p className="text-[11px] md:text-xs text-muted-foreground">
                  Top Team
                </p>
                <p className="text-base md:text-lg font-bold truncate max-w-[100px] md:max-w-[120px]">
                  {topTeam?.teamName || "—"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* controls */}
      <div className="flex flex-col sm:flex-row gap-3 md:gap-4 items-stretch sm:items-center justify-between">
        <div className="relative flex-1 sm:max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search teams or members..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 text-sm"
          />
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={loadTeams}
          disabled={loading}
        >
          <RefreshCw
            className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`}
          />
          Refresh
        </Button>
      </div>

      {error && (
        <div className="bg-bt-red-300/20 border border-bt-red-300/50 text-bt-red-200 px-4 py-3 rounded flex justify-between items-center">
          <span>{error}</span>
          <button onClick={() => setError(null)} className="font-bold">
            ×
          </button>
        </div>
      )}

      {/* teams list */}
      {loading ? (
        <div className="flex justify-center items-center h-40">
          <p className="text-muted-foreground">Loading teams...</p>
        </div>
      ) : sortedTeams.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
            <p className="text-muted-foreground">
              {searchQuery
                ? "No teams match your search"
                : "No teams created for this event yet"}
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              {!searchQuery &&
                'Select registrations in the Data Table and use "Create Team" to get started.'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2 md:space-y-3">
          {sortedTeams.map((team, rank) => (
            <Card
              key={team.id}
              className="overflow-hidden transition-colors hover:border-bt-green-400/30"
            >
              <div
                className="flex items-center justify-between px-3 py-3 md:px-5 md:py-4 cursor-pointer"
                onClick={() =>
                  setExpandedTeam(expandedTeam === team.id ? null : team.id)
                }
              >
                <div className="flex items-center gap-2.5 md:gap-4 min-w-0">
                  {/* Rank badge */}
                  <div
                    className={`w-7 h-7 md:w-8 md:h-8 rounded-full flex items-center justify-center text-xs md:text-sm font-bold shrink-0 ${
                      rank === 0
                        ? "bg-bt-green-300/20 text-bt-green-300"
                        : rank === 1
                          ? "bg-bt-blue-0/20 text-bt-blue-0"
                          : rank === 2
                            ? "bg-bt-blue-100/20 text-bt-blue-100"
                            : "bg-bt-blue-400/50 text-muted-foreground"
                    }`}
                  >
                    {rank + 1}
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-semibold text-white text-sm md:text-base truncate">
                      {team.teamName}
                    </h3>
                    <p className="text-xs md:text-sm text-muted-foreground">
                      {team.memberIDs.length} member
                      {team.memberIDs.length !== 1 ? "s" : ""}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 md:gap-6 shrink-0">
                  <div className="text-right">
                    <p className="text-base md:text-lg font-bold text-bt-green-400">
                      {team.points}
                    </p>
                    <p className="text-xs text-muted-foreground">points</p>
                  </div>
                  {expandedTeam === team.id ? (
                    <ChevronDown className="w-5 h-5 text-muted-foreground" />
                  ) : (
                    <ChevronRight className="w-5 h-5 text-muted-foreground" />
                  )}
                </div>
              </div>

              {expandedTeam === team.id && (
                <div className="border-t border-bt-blue-300/30 px-3 py-3 md:px-5 md:py-4">
                  {/* team actions */}
                  <div className="flex gap-2 mb-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        setRenameTeam(team);
                        setNewTeamName(team.teamName);
                      }}
                    >
                      <Pencil className="w-3 h-3 mr-1" />
                      Rename
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (team.memberIDs.length > 0) {
                          setPointsDialog({
                            team,
                            memberId: team.memberIDs[0],
                          });
                          setPointsChange(0);
                        }
                      }}
                    >
                      <Trophy className="w-3 h-3 mr-1" />
                      Adjust Points
                    </Button>
                  </div>

                  {/* Members table */}
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead className="hidden sm:table-cell">
                          Email
                        </TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {(team.members || []).map((member) => (
                        <TableRow key={member.id}>
                          <TableCell className="font-medium text-sm">
                            {getMemberName(member)}
                            <span className="block sm:hidden text-xs text-muted-foreground">
                              {member.email || member.id}
                            </span>
                          </TableCell>
                          <TableCell className="text-muted-foreground hidden sm:table-cell">
                            {member.email || member.id}
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-bt-red-300 hover:text-bt-red-200"
                              onClick={() =>
                                setRemoveMember({
                                  team,
                                  memberId: member.id,
                                  memberName: getMemberName(member),
                                })
                              }
                            >
                              <UserMinus className="w-4 h-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                      {(!team.members || team.members.length === 0) && (
                        <TableRow>
                          <TableCell
                            colSpan={3}
                            className="text-center text-muted-foreground py-3 md:py-4 text-sm"
                          >
                            No member data available
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>

                  {/* Extra info */}
                  {team.submission && (
                    <div className="mt-3 p-3 bg-bt-blue-500/30 rounded-md">
                      <p className="text-xs text-muted-foreground mb-1">
                        Submission
                      </p>
                      <p className="text-sm text-white break-all">
                        {team.submission}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </Card>
          ))}
        </div>
      )}

      {/* rename dialog */}
      <Dialog
        open={!!renameTeam}
        onOpenChange={(open) => !open && setRenameTeam(null)}
      >
        <DialogContent className="max-w-md bg-bt-blue-400">
          <DialogHeader>
            <DialogTitle className="text-white">Rename Team</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Current name: <strong>{renameTeam?.teamName}</strong>
            </p>
            <Input
              value={newTeamName}
              onChange={(e) => setNewTeamName(e.target.value)}
              placeholder="New team name"
              className="bg-bt-blue-500 text-white border-bt-blue-300"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRenameTeam(null)}>
              Cancel
            </Button>
            <Button
              onClick={handleRename}
              disabled={isSubmitting || !newTeamName.trim()}
            >
              {isSubmitting ? "Saving..." : "Rename"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* remove member dialog */}
      <Dialog
        open={!!removeMember}
        onOpenChange={(open) => !open && setRemoveMember(null)}
      >
        <DialogContent className="max-w-md bg-bt-blue-400">
          <DialogHeader>
            <DialogTitle className="text-white">Remove Team Member</DialogTitle>
          </DialogHeader>
          <p className="text-muted-foreground">
            Remove{" "}
            <strong className="text-white">{removeMember?.memberName}</strong>{" "}
            from{" "}
            <strong className="text-white">
              {removeMember?.team.teamName}
            </strong>
            ? They will be unlinked from this team.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRemoveMember(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleRemoveMember}
              disabled={isSubmitting}
            >
              {isSubmitting ? "Removing..." : "Remove"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={!!pointsDialog}
        onOpenChange={(open) => !open && setPointsDialog(null)}
      >
        <DialogContent className="max-w-md bg-bt-blue-400">
          <DialogHeader>
            <DialogTitle className="text-white">Adjust Team Points</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Team:{" "}
              <strong className="text-white">
                {pointsDialog?.team.teamName}
              </strong>
              <br />
              Current points:{" "}
              <strong className="text-white">
                {pointsDialog?.team.points}
              </strong>
            </p>
            <div>
              <label className="block text-sm font-medium text-white mb-1">
                Points to add/subtract
              </label>
              <Input
                type="number"
                value={pointsChange}
                onChange={(e) => setPointsChange(Number(e.target.value))}
                placeholder="e.g. 50 or -25"
                className="bg-bt-blue-500 text-white border-bt-blue-300"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Use negative numbers to deduct points
              </p>
            </div>
            {pointsChange !== 0 && (
              <p className="text-sm">
                New total:{" "}
                <strong className="text-bt-green-400">
                  {(pointsDialog?.team.points || 0) + pointsChange}
                </strong>
              </p>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPointsDialog(null)}>
              Cancel
            </Button>
            <Button
              onClick={handlePointsUpdate}
              disabled={isSubmitting || pointsChange === 0}
            >
              {isSubmitting ? "Updating..." : "Update Points"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
