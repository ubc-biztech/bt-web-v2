import { useState, useEffect } from "react";
import { GetServerSideProps } from "next";
import { fetchBackend } from "@/lib/db";
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
import { SearchIcon, FilterIcon } from "lucide-react";

type Member = {
  id: string;
  firstName: string;
  lastName: string;
  year?: string;
  major?: string;
  createdAt?: number;
  updatedAt?: number;
};

type Props = {
  initialData: Member[] | null;
};

export default function ManageMembers({ initialData }: Props) {
  const [data, setData] = useState<Member[] | null>(initialData);
  const [filteredData, setFilteredData] = useState<Member[] | null>(
    initialData,
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(!initialData);

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
      setData(response.data || []);
    } catch (error) {
      console.error("Failed to refresh member data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAssignCard = (memberId: string) => {
    // TODO: Implement assign card functionality
    console.log("Assign card for member:", memberId);
  };

  if (isLoading) {
    return (
      <main className="bg-primary-color min-h-screen">
        <div className="mx-auto pt-8 p-5 md:pt-20 md:l-20 md:pr-20 flex flex-col">
          <div className="text-white">Loading members...</div>
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
                    <TableCell>
                      <Button
                        variant="outline"
                        size="sm"
                        className="bg-transparent border-white/20 text-white hover:bg-white/10"
                        onClick={() => handleAssignCard(member.id)}
                      >
                        Assign Card
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
    </main>
  );
}

export const getServerSideProps: GetServerSideProps = async () => {
  try {
    const response = await fetchBackend({
      endpoint: "/members",
      method: "GET",
    });

    return {
      props: {
        initialData: response.data || [],
      },
    };
  } catch (error) {
    console.error("Failed to fetch members:", error);
    return {
      props: {
        initialData: [],
      },
    };
  }
};
