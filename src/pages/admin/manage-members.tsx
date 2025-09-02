import { useState, useEffect } from "react";
import { fetchBackend, fetchBackendFromServer } from "@/lib/db";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { SearchIcon, FilterIcon, Copy, Check } from "lucide-react";
import { NFCWriter } from "@/components/NFCWrite/NFCWriter";
import { useNFCSupport } from "@/hooks/useNFCSupport";
import { generateNfcProfileUrl } from "@/util/nfcUtils";
import { GetServerSideProps } from "next";

type Member = {
  profileID: string;
  id: string;
  firstName: string;
  lastName: string;
  faculty?: string;
  year?: string;
  major?: string;
  cardCount?: number;
  international?: boolean;
  topics?: string[];
  createdAt?: number;
  updatedAt?: number;
};

type Props = {
  initialData: Member[] | null;
};

export default function ManageMembers({ initialData }: Props) {
  const [data, setData] = useState<Member[] | null>(initialData);
  const [filteredData, setFilteredData] = useState<Member[] | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { isNFCSupported } = useNFCSupport();
  const [showNfcWriter, setShowNfcWriter] = useState(false);
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [copiedMemberId, setCopiedMemberId] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    if (!data) return;

    const filtered = data.filter((member) => {
      const searchLower = searchTerm.toLowerCase();
      return (
        member.firstName?.toLowerCase().includes(searchLower) ||
        member.lastName?.toLowerCase().includes(searchLower) ||
        member.id?.toLowerCase().includes(searchLower) ||
        member.major?.toLowerCase().includes(searchLower)
      );
    });

    setFilteredData(filtered);
  }, [data, searchTerm]);

  const refreshData = async () => {
    try {
      setIsLoading(true);
      const response = await fetchBackend({
        endpoint: "/members",
        method: "GET",
      });
      setData(response || []);
      console.log(response);
    } catch (error) {
      console.error("Failed to refresh member data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAssignCard = (member: Member) => {
    setSelectedMember(member);
    setShowNfcWriter(true);
  };

  const closeNfcWriter = () => {
    setShowNfcWriter(false);
    setSelectedMember(null);
  };

  const closeAllNfc = () => {
    setShowNfcWriter(false);
    setSelectedMember(null);
  };

  const copyNfcContent = async (member: Member) => {
    try {
      const nfcUrl = generateNfcProfileUrl(member.profileID);
      await navigator.clipboard.writeText(nfcUrl);
      setCopiedMemberId(member.profileID);
      // Reset the copied state after 2 seconds
      setTimeout(() => setCopiedMemberId(null), 2000);
    } catch (err) {
      console.error("Failed to copy to clipboard:", err);
    }
  };

  const incrementCardCount = async (member: Member) => {
    try {
      setUpdatingId(member.id);
      const currentCount = member.cardCount ?? 0;
      await fetchBackend({
        endpoint: `/members/${member.id}`,
        method: "PATCH",
        data: {
          cardCount: currentCount + 1,
        },
      });
      setData((prev) =>
        (prev || []).map((m) =>
          m.id === member.id ? { ...m, cardCount: (m.cardCount ?? 0) + 1 } : m,
        ),
      );
      setFilteredData((prev) =>
        (prev || []).map((m) =>
          m.id === member.id ? { ...m, cardCount: (m.cardCount ?? 0) + 1 } : m,
        ),
      );
    } catch (err) {
      console.error("Failed to increment card count:", err);
    } finally {
      setUpdatingId(null);
    }
  };

  if (isLoading) {
    return (
      <main className="bg-primary-color min-h-screen">
        <div className="mx-auto pt-8 p-5 md:pt-20 md:l-20 md:pr-20 flex flex-col">
          <div className="text-white">Refreshing members...</div>
        </div>
      </main>
    );
  }

  return (
    <main className="bg-primary-color min-h-screen">
      <div className="mx-auto pt-8 p-5 md:pt-20 md:l-20 md:pr-20 flex flex-col">
        {/* Header */}
        <div className="mb-8">
          <h2 className="text-white text-2xl font-semibold mb-2">
            Manage Members
          </h2>
          <p className="text-baby-blue font-poppins">
            View and manage BizTech member information.
          </p>
        </div>

        {/* Search and Filter Bar */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search members by name, email, or major..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-gray-400"
            />
          </div>
          <Button
            onClick={refreshData}
            variant="outline"
            className="bg-transparent border-white/20 text-white hover:bg-white/10"
          >
            <FilterIcon className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>

        {/* Members Table */}
        <div className="bg-white/5 rounded-lg border border-white/10 overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-[#6578A8] hover:bg-[#6578A8] border-none">
                <TableHead className="text-white font-semibold">
                  Email
                </TableHead>
                <TableHead className="text-white font-semibold">
                  First Name
                </TableHead>
                <TableHead className="text-white font-semibold">
                  Last Name
                </TableHead>
                <TableHead className="text-white font-semibold">
                  Card Count
                </TableHead>
                <TableHead className="text-white font-semibold">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="text-baby-blue">
              {filteredData && filteredData.length > 0 ? (
                filteredData.map((member) => (
                  <TableRow
                    key={member.id}
                    className="border-white/10 hover:bg-white/5"
                  >
                    <TableCell className="font-medium">{member.id}</TableCell>
                    <TableCell>{member.firstName || "N/A"}</TableCell>
                    <TableCell>{member.lastName || "N/A"}</TableCell>
                    <TableCell>{member.cardCount ?? 0}</TableCell>
                    <TableCell>
                      {isNFCSupported ? (
                        <Button
                          variant="outline"
                          size="sm"
                          className="bg-transparent border-white/20 text-white hover:bg-white/10"
                          onClick={() => handleAssignCard(member)}
                        >
                          Assign Card
                        </Button>
                      ) : (
                        <Button
                          variant="outline"
                          size="sm"
                          className="bg-transparent border-white/20 text-white hover:bg-white/10"
                          onClick={() => copyNfcContent(member)}
                        >
                          {copiedMemberId === member.profileID ? (
                            <>
                              <Check className="w-4 h-4 mr-2" />
                              Copied!
                            </>
                          ) : (
                            <>
                              <Copy className="w-4 h-4 mr-2" />
                              Copy NFC Content
                            </>
                          )}
                        </Button>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        className="ml-2 bg-transparent border-white/20 text-white hover:bg-white/10"
                        onClick={() => incrementCardCount(member)}
                        disabled={updatingId === member.id}
                      >
                        {updatingId === member.id
                          ? "Updating..."
                          : "Manually Flag Card as Written"}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={4}
                    className="h-24 text-center text-gray-400"
                  >
                    {searchTerm
                      ? "No members found matching your search."
                      : "No members available."}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* Summary Stats */}
        {filteredData && (
          <div className="mt-6 text-baby-blue text-sm">
            Showing {filteredData.length} of {data?.length || 0} members
          </div>
        )}
      </div>

      {/* NFC Writer Modal */}
      {showNfcWriter && selectedMember && (
        <NFCWriter
          token={selectedMember.profileID}
          email={selectedMember.id}
          firstName={selectedMember.firstName}
          exit={closeNfcWriter}
          closeAll={closeAllNfc}
          numCards={selectedMember.cardCount ?? 0}
        />
      )}
    </main>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const nextServerContext = { request: context.req, response: context.res };

  try {
    const data = await fetchBackendFromServer({
      endpoint: "/members",
      method: "GET",
      authenticatedCall: true,
      nextServerContext,
    });

    return {
      props: {
        initialData: data || [],
      },
    };
  } catch (error) {
    console.error("Failed to fetch initial member data:", error);
    return {
      props: {
        initialData: null,
      },
    };
  }
};
