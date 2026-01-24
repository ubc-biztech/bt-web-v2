import BluePrintCard from "./BluePrintCard";
import BluePrintButton from "./BluePrintButton";
import Link from "next/link";
import { Search, Loader2 } from "lucide-react";
import { useQuizReport, useRecommendationsByMbti } from "@/queries/quiz";
import { useUserProfile, getProfileId } from "@/queries/userProfile";

export default function RecommendedConnectionsPreview() {
  // Get user profile to extract profile ID
  const { data: userProfile } = useUserProfile();
  const profileId = userProfile?.compositeID
    ? getProfileId(userProfile.compositeID)
    : null;

  // Get user's MBTI for recommendations
  const { data: quizReport } = useQuizReport(profileId ?? undefined);
  const userMbti = quizReport?.mbti;

  // Get recommendations based on user's MBTI
  const { data: recommendations, isLoading } =
    useRecommendationsByMbti(userMbti);

  const displayRecs = (recommendations ?? []).slice(0, 2).map((rec) => {
    let fullName: string;
    if (rec.fname && rec.lname) {
      fullName = `${rec.fname} ${rec.lname}`;
    } else if (rec.fname || rec.lname) {
      fullName = rec.fname || rec.lname || "Unknown";
    } else {
      fullName = "Unknown";
    }
    return {
      id: rec.id || "unknown",
      name: fullName,
      mbti: rec.mbti,
    };
  });

  return (
    <BluePrintCard>
      <div className="flex flex-row items-center justify-between">
        <div className="flex items-center gap-2">
          <Search size={16} className="text-[#6299ff]" />
          <div className="text-md font-medium">Recommended For You</div>
        </div>
        <Link href="/events/blueprint/2026/companion/discover">
          <BluePrintButton className="text-xs px-3 py-1.5 bg-white/20 border-white/50">
            DISCOVER
          </BluePrintButton>
        </Link>
      </div>
      <div className="h-[0.5px] mt-2 w-full bg-gradient-to-r from-transparent via-white to-transparent" />

      {/* Semantic Search Teaser */}
      <Link href="/events/blueprint/2026/companion/discover">
        <div className="mt-4 p-3 rounded-lg bg-black/40 border border-[#6299ff]/40 hover:border-[#6299ff]/60 transition-colors cursor-pointer">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#6299ff]/30 flex items-center justify-center">
              <Search size={18} className="text-[#6299ff]" />
            </div>
            <div className="flex flex-col">
              <span className="text-white font-medium text-sm">
                Find your perfect connection
              </span>
              <span className="text-white/70 text-xs">
                Search semantically for your perfect match
              </span>
            </div>
          </div>
        </div>
      </Link>

      {/* Quick Recommendations */}
      <div className="flex flex-col gap-2 mt-3">
        {isLoading ? (
          <div className="flex items-center justify-center py-4 rounded-lg bg-black/30">
            <Loader2 size={20} className="text-[#6299ff] animate-spin" />
          </div>
        ) : !userMbti ? (
          <div className="rounded-lg bg-black/30 py-3">
            <p className="text-white/60 text-xs text-center">
              Take the quiz to get recommendations!
            </p>
          </div>
        ) : displayRecs.length === 0 ? (
          <div className="rounded-lg bg-black/30 py-3">
            <p className="text-white/60 text-xs text-center">
              No recommendations yet
            </p>
          </div>
        ) : (
          displayRecs.map((rec) => {
            const displayName = rec.name || rec.id || "Unknown";
            const initials = displayName.slice(0, 2).toUpperCase();
            return (
              <Link
                key={rec.id}
                href={`/events/blueprint/2026/companion/profile/${rec.id}`}
              >
                <div className="flex items-center justify-between p-2.5 rounded-lg bg-black/40 border border-white/15 hover:bg-black/50 hover:border-white/25 transition-colors cursor-pointer">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#6299ff] to-[#EAE5D4] flex items-center justify-center">
                      <span className="text-[#0A1428] font-medium text-xs">
                        {initials}
                      </span>
                    </div>
                    <span className="text-white font-medium text-sm">
                      {displayName}
                    </span>
                  </div>
                  <div className="flex items-center">
                    <span className="text-[#6299ff] text-xs font-medium px-2 py-1 rounded-full bg-[#6299ff]/20 border border-[#6299ff]/30">
                      {rec.mbti}
                    </span>
                  </div>
                </div>
              </Link>
            );
          })
        )}
      </div>

      <Link href="/events/blueprint/2026/companion/discover">
        <p className="text-center text-white text-sm mt-3 hover:underline cursor-pointer font-medium">
          View all recommendations →
        </p>
      </Link>
    </BluePrintCard>
  );
}
