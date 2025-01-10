import NavBarContainer from "@/components/companion/navigation/NavBarContainer";
import { CompanionConnectionRow } from "@/components/companion/connections/connection-row";
import Filter from "@/components/companion/Filter";
import { useEffect, useState } from "react";
import { fetchBackend } from "@/lib/db";
import { Connection } from "@/components/companion/connections/connections-list";

const Connections = () => {
  const [filter, setFilter] = useState(0);
  const [connections, setConnections] = useState([]);
  const filterOptions = ["All", "Attendees", "Delegates"];

  useEffect(() => {
    const fetchConnections = async () => {
      try {
        const data = await fetchBackend({
          // TO DO: currently hardcoded. Need GET call to Profile table to get obsfucatedID
          endpoint: `/interactions/TestDudeOne`,
          method: "GET",
          authenticatedCall: false,
        });
        setConnections(data.data);
      } catch (error) {
        console.error("Error fetching connections:", error);
      }
    };

    fetchConnections();
  }, []);
  return (
    <NavBarContainer>
      <div>
        <p className="text-[22px] font-satoshi text-white">Connections</p>
        <div className="h-[1px] my-3 bg-[#1D262F]"></div>
        <div className="flex flex-col gap-4 mb-2">
          {/* TO DO: search bar */}
          {/* <div className="bg-white rounded-full h-10 w-full"></div> */}
          <Filter
            filterOptions={filterOptions}
            setSelectedFilterOption={setFilter}
            selectedFilterOption={filter}
          />
        </div>
        {connections &&
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
            ))}
      </div>
    </NavBarContainer>
  );
};

export default Connections;
