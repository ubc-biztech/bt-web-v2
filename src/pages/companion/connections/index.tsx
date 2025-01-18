import NavBarContainer from "@/components/companion/navigation/NavBarContainer";
import { CompanionConnectionRow } from "@/components/companion/connections/connection-row";
import Filter from "@/components/companion/Filter";
import { useEffect, useState } from "react";
import { fetchBackend } from "@/lib/db";
import { Connection } from "@/components/companion/connections/connections-list";
import { COMPANION_PROFILE_ID_KEY } from '@/constants/companion';
import { SearchBar } from "@/components/companion/CompaniesList";

const Connections = () => {
  const [filter, setFilter] = useState(0);
  const [connections, setConnections] = useState([]);
  const [error, setError] = useState("");
  const filterOptions = ["All", "Attendees", "Delegates"];

  useEffect(() => {
    const fetchConnections = async () => {
      try {
        const profileId = localStorage.getItem(COMPANION_PROFILE_ID_KEY);
        if (!profileId) {
          setError("Please log in to view your connections");
          return;
        }

        // Fetch connections using the profileID
        const data = await fetchBackend({
          endpoint: `/interactions/journal/${profileId}`,
          method: "GET",
          authenticatedCall: false,
        });
        setConnections(data.data);
      } catch (error) {
        console.error("Error fetching connections:", error);
        setError("Error fetching your connections");
      }
    };

    fetchConnections();
  }, []);

  return (
    <NavBarContainer>
      <div>
        <p className="text-[22px] font-satoshi text-white">Connections</p>
        <div className="h-[1px] my-3 bg-[#1D262F]"></div>
        <div className="flex flex-row gap-4 mb-2">
          <SearchBar />
          <Filter
            filterOptions={filterOptions}
            setSelectedFilterOption={setFilter}
            selectedFilterOption={filter}
          />
        </div>
        {error ? (
          <div className="text-red-500 text-center mt-4">{error}</div>
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
            .map((connection, index) => (
              <CompanionConnectionRow key={index} connection={connection} />
            ))
        )}
      </div>
    </NavBarContainer>
  );
}

export default Connections;
