import NavBarContainer from "@/components/companion/navigation/NavBarContainer";
import { CompanionConnectionRow } from "@/components/companion/connections/connection-row";
import Filter from "@/components/companion/Filter";
import { useEffect, useState } from "react";
import { fetchBackend } from "@/lib/db";
import { Connection } from "@/components/companion/connections/connections-list";
import { SearchBar } from "@/components/companion/SearchBar";
import Loading from "@/components/Loading";
import { COMPANION_EMAIL_KEY } from "@/constants/companion";

const Connections = () => {
  const [filter, setFilter] = useState(0);
  const [connections, setConnections] = useState([]);
  const [error, setError] = useState("");
  const filterOptions = ["All", "Attendees", "Delegates"];
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchConnections = async () => {
      try {
        setIsLoading(true);
        const profileId = localStorage.getItem(COMPANION_EMAIL_KEY);
        if (!profileId) {
          setError("Please log in to view your connections");
          setIsLoading(false);
          return;
        }

        // Fetch connections using the profileID
        const data = await fetchBackend({
          endpoint: `/interactions/journal/${profileId}`,
          method: "GET",
          authenticatedCall: false
        });
        setConnections(data.data);
      } catch (error) {
        console.error("Error fetching connections:", error);
        setError("Error fetching your connections");
      } finally {
        setIsLoading(false);
      }
    };

    fetchConnections();
  }, []);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  return (
    <NavBarContainer>
      {isLoading ? (
        <div className='mt-[-90px]'>
          <Loading />
        </div>
      ) : (
        <div>
          <p className='text-[22px] font-satoshi text-white'>Connections</p>
          <div className='h-[1px] my-3 bg-[#1D262F]'></div>
          <div className='flex flex-row gap-4 mb-2'>
            <SearchBar onSearch={handleSearch} />
            <Filter filterOptions={filterOptions} setSelectedFilterOption={setFilter} selectedFilterOption={filter} />
          </div>
          {error ? (
            <div className='text-red-500 text-center mt-4'>{error}</div>
          ) : (
            connections &&
            connections
              .filter((connection: Connection) => {
                if (filterOptions[filter] === "Attendees") {
                  return connection?.year && connection?.major; // Only show if both year and major are present
                } else if (filterOptions[filter] === "Delegates") {
                  return !connection?.year && !connection?.major; // Only show if neither year nor major are present
                }
                return true; // For "All", show all connections
              })
              .filter((connection: Connection) => {
                return (
                  !searchQuery ||
                  connection.fname.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  connection.lname.toLowerCase().includes(searchQuery.toLowerCase())
                );
              })
              .map((connection: Connection, index: number) => {
                const capitalizedConnection = {
                  ...connection,
                  major: connection?.major?.toUpperCase(),
                  year: connection?.year?.toUpperCase(),
                };

                return <CompanionConnectionRow key={index} connection={capitalizedConnection} />
              })
          )}
        </div>
      )}
    </NavBarContainer>
  );
};

export default Connections;
