import { useState } from "react";
import { Search, Sparkles, X, Loader2, ArrowLeft } from "lucide-react";
import BluePrintLayout from "../layout/BluePrintLayout";
import BluePrintCard from "../components/BluePrintCard";
import BluePrintButton from "../components/BluePrintButton";
import { DynamicPageProps } from "@/constants/companion-events";
import Link from "next/link";
import { useQuizReport, useRecommendationsByMbti } from "@/queries/quiz";
import { useSemanticSearch, SearchResult } from "@/queries/connections";

const SEARCH_SUGGESTIONS = [
  "a Google intern",
  "startup founders",
  "backend engineers",
  "looking for co-founders",
];

interface DisplayPerson {
  id: string;
  name: string;
  subtitle?: string;
  roles?: string;
  industries?: string;
  mbti?: string;
  isSearchResult?: boolean;
}

export default function BluePrintDiscover2026({
  eventId,
  year,
}: DynamicPageProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"recommended" | "search">("recommended");
  const [searchResults, setSearchResults] = useState<SearchResult[] | null>(null);

  // Get user's MBTI for recommendations
  const { data: quizReport } = useQuizReport();
  const userMbti = quizReport?.mbti;

  // Get recommendations based on user's MBTI
  const { data: recommendations, isLoading: recsLoading } = useRecommendationsByMbti(userMbti);

  // Semantic search mutation
  const { mutate: search, isPending: isSearching } = useSemanticSearch();

  const handleSearch = () => {
    if (!searchQuery.trim()) return;
    
    setActiveTab("search");
    search(searchQuery, {
      onSuccess: (data) => {
        setSearchResults(data);
      },
      onError: (error) => {
        console.error("Search error:", error);
        setSearchResults([]);
      },
    });
  };

  const handleSuggestionClick = (suggestion: string) => {
    setSearchQuery(suggestion);
    setActiveTab("search");
    search(suggestion, {
      onSuccess: (data) => {
        setSearchResults(data);
      },
      onError: (error) => {
        console.error("Search error:", error);
        setSearchResults([]);
      },
    });
  };

  const clearSearch = () => {
    setSearchQuery("");
    setSearchResults(null);
    setActiveTab("recommended");
  };

  // Transform recommendations to display format
  const recommendedPeople: DisplayPerson[] = (recommendations ?? []).map((rec) => ({
    id: rec.id || "unknown",
    name: rec.id || "Unknown", // Will need to fetch profile data to get actual name
    mbti: rec.mbti,
  }));

  // Transform search results to display format - using actual API response structure
  const searchedPeople: DisplayPerson[] = (searchResults ?? []).map((result) => ({
    id: result.objectID || "unknown",
    name: result.name || "Unknown",
    subtitle: result.companiesWorkedAt || undefined,
    roles: result.rolesInterested || undefined,
    industries: result.industriesInterested || undefined,
    isSearchResult: true,
  }));

  const displayPeople = activeTab === "search" ? searchedPeople : recommendedPeople;
  const isLoading = activeTab === "recommended" ? recsLoading : isSearching;

  return (
    <BluePrintLayout>
      {/* Dark overlay for better readability */}
      <div className="fixed inset-0 bg-black/50 pointer-events-none -z-10" />
      
      <div className="flex flex-col gap-3 pb-6">
        {/* Header with Title */}
        <div className="flex items-center justify-between">
          <Link href={`/events/${eventId}/${year}/companion`}>
            <BluePrintButton className="text-xs px-2.5 py-1.5">
              <ArrowLeft size={14} />
              Back
            </BluePrintButton>
          </Link>
          <div className="flex items-center gap-2">
            <Search className="text-[#6299ff]" size={18} />
            <h1 className="text-lg font-medium text-white">
              Discover
            </h1>
          </div>
          <div className="w-16" /> {/* Spacer for centering */}
        </div>

        <div className="h-[0.5px] w-full bg-gradient-to-r from-transparent via-white/30 to-transparent" />

        {/* Semantic Search Box */}
        <BluePrintCard className="p-4">
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <Sparkles size={16} className="text-[#6299ff]" />
              <span className="text-sm font-medium text-white">AI-Powered Search</span>
            </div>
            
            <div className="relative">
              <div className="flex items-center gap-2 p-3 rounded-lg bg-white/5 border border-white/20 focus-within:border-[#6299ff] transition-colors">
                <Search size={18} className="text-white/60" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  placeholder='Try "a Google intern" or "startup founders"'
                  className="flex-1 bg-transparent text-white placeholder-white/40 text-sm outline-none"
                />
                {searchQuery && (
                  <button onClick={clearSearch} className="p-1 hover:bg-white/10 rounded">
                    <X size={16} className="text-white/60" />
                  </button>
                )}
              </div>
            </div>

            <div className="flex gap-2">
              <BluePrintButton
                onClick={handleSearch}
                className="flex-1 py-2.5 text-sm flex items-center justify-center gap-2"
                disabled={!searchQuery.trim() || isSearching}
              >
                {isSearching ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Searching...
                  </>
                ) : (
                  <>
                    <Search size={16} />
                    Search
                  </>
                )}
              </BluePrintButton>
            </div>

            {/* Search Suggestions - hide after first search */}
            {searchResults === null && (
              <div className="flex flex-col gap-2">
                <span className="text-xs text-white/50">Try searching for:</span>
                <div className="flex flex-wrap gap-2">
                  {SEARCH_SUGGESTIONS.map((suggestion) => (
                    <button
                      key={suggestion}
                      onClick={() => handleSuggestionClick(suggestion)}
                      className="px-3 py-1.5 text-xs rounded-full bg-white/10 border border-white/20 text-white/80 hover:bg-white/15 hover:border-white/30 transition-colors"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </BluePrintCard>

        {/* Tab Switcher */}
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab("recommended")}
            className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
              activeTab === "recommended"
                ? "bg-[#6299ff]/20 text-[#6299ff] border border-[#6299ff]/30"
                : "bg-white/5 text-white/60 border border-white/10 hover:bg-white/10"
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <Sparkles size={14} />
              Recommended
            </div>
          </button>
          <button
            onClick={() => searchResults && setActiveTab("search")}
            className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
              activeTab === "search"
                ? "bg-[#6299ff]/20 text-[#6299ff] border border-[#6299ff]/30"
                : "bg-white/5 text-white/60 border border-white/10 hover:bg-white/10"
            } ${!searchResults ? "opacity-50 cursor-not-allowed" : ""}`}
            disabled={!searchResults}
          >
            <div className="flex items-center justify-center gap-2">
              <Search size={14} />
              Search Results
            </div>
          </button>
        </div>

        {/* Results Section */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-white/60">
              {activeTab === "recommended" 
                ? userMbti 
                  ? `People with the same type: ${userMbti}` 
                  : "Take the quiz to get recommendations"
                : `Found ${searchResults?.length || 0} people`}
            </span>
          </div>

          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-12 gap-3">
              <Loader2 size={32} className="text-[#6299ff] animate-spin" />
              <span className="text-white/60 text-sm">
                {activeTab === "search" ? "Finding the best matches..." : "Loading recommendations..."}
              </span>
            </div>
          ) : displayPeople.length === 0 ? (
            <BluePrintCard className="p-6 text-center">
              <p className="text-white/60 text-sm">
                {activeTab === "recommended" 
                  ? userMbti 
                    ? "No recommendations found yet"
                    : "Complete the Blueprint quiz to get personalized recommendations!"
                  : "No results found. Try a different search."}
              </p>
            </BluePrintCard>
          ) : (
            <div className="flex flex-col gap-3">
              {displayPeople.map((person, index) => (
                <PersonCard 
                  key={person.id + index} 
                  person={person} 
                  userMbti={userMbti}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </BluePrintLayout>
  );
}

function PersonCard({
  person,
  userMbti,
}: {
  person: DisplayPerson;
  userMbti?: string;
}) {
  const name = person.name || "Unknown";
  const initials = name
    .split(" ")
    .map((n) => n[0]?.toUpperCase() || "")
    .join("")
    .slice(0, 2) || "?";

  const matchReason = person.mbti 
    ? person.mbti === userMbti 
      ? `Same type: ${person.mbti}`
      : `Type: ${person.mbti}`
    : undefined;

  return (
    <BluePrintCard className="p-4">
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#6299ff] to-[#EAE5D4] flex items-center justify-center flex-shrink-0">
            <span className="text-[#0A1428] font-bold text-sm">{initials}</span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-white font-semibold">{name}</span>
            {person.subtitle && (
              <span className="text-white/60 text-sm">{person.subtitle}</span>
            )}
            {person.roles && (
              <span className="text-[#6299ff] text-xs">{person.roles}</span>
            )}
            {matchReason && (
              <div className="flex items-center gap-1.5 mt-1">
                <span className="text-[#6299ff] text-xs font-medium">{matchReason}</span>
              </div>
            )}
          </div>
        </div>
        {person.mbti && (
          <div className="px-2 py-1 rounded-full bg-[#6299ff]/20 border border-[#6299ff]/30">
            <span className="text-[#6299ff] text-xs font-bold">{person.mbti}</span>
          </div>
        )}
      </div>

      {/* Industries tags */}
      {person.industries && (
        <div className="flex flex-wrap gap-1.5 mt-3">
          {person.industries.split(",").slice(0, 3).map((industry) => (
            <span
              key={industry}
              className="px-2 py-0.5 text-xs rounded-full bg-white/10 border border-white/15 text-white/70"
            >
              {industry.trim()}
            </span>
          ))}
        </div>
      )}
    </BluePrintCard>
  );
}
