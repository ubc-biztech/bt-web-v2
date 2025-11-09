import { useState, useEffect } from "react";
import { fetchBackend } from "@/lib/db";
import { useUserRegistration } from "@/pages/companion/index";
import router from "next/router";

const Kickstart2025 = () => {
  const [team, setTeam] = useState("");
  const [loading, setLoading] = useState(true);

  const { userRegistration } = useUserRegistration();
  // check if user is assigned to a team
  const fetchUserTeam = async () => {
    const email = userRegistration?.id;
    const [eventID, year] = userRegistration?.["eventID;year"].split(";");
    console.log("Fetching team for user:", email);
    console.log("EventID and Year:", eventID, year);
    try {
      const userTeam = await fetchBackend({
        endpoint: `/team/getTeamFromUserID`,
        method: "POST",
        data: {
          user_id: userRegistration?.id,
          eventID: eventID,
          year: +year,
        },
        authenticatedCall: false,
      });

      if (userTeam) {
        setTeam(userTeam.response);
        console.log(userTeam);
      }
      setLoading(false);
    } catch (error) {
      console.error("Error fetching user team:", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userRegistration) {
      fetchUserTeam();
    }
  }, [userRegistration]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!team) {
    // redirect to team assignment
    router.push("/companion/team"); 
    return;
  }

  // route to kickstart dashboard (OVERVIEW)
  return (
    <div className="w-full max-w-4xl mx-auto p-4 space-y-8 font-bricolage text-[100px]">
     Kickstart dashboard!
    </div>
  );
};

export default Kickstart2025;
