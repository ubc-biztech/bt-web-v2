import NavBarContainer from "@/components/companion/navigation/NavBarContainer";
import { CompanionConnectionRow } from "@/components/companion/connections/connection-row";
import Filter from "@/components/companion/Filter";
import { useEffect, useState } from "react";
import { fetchBackend } from "@/lib/db";

const Connections = () => {
  const [filter, setFilter] = useState(0);
  const [connections, setConnections] = useState([]);

  useEffect(() => {
    const fetchConnections = async () => {
      try {
        const data = await fetchBackend({
          endpoint: `/interactions/TestDudeOne`,
          method: "GET",
          authenticatedCall: false,
        });
        setConnections(data.data);
      } catch (error) {
        console.error("Error fetching leaderboard:", error);
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
            options={["All", "Attendees", "Delegates"]}
            setOption={setFilter}
            option={filter}
          />
        </div>
        {connections &&
          connections.map((connection, index) => (
            <CompanionConnectionRow key={index} connection={connection} />
          ))}
      </div>
    </NavBarContainer>
  );
};

export default Connections;
