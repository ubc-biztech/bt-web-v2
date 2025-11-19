import React, { useState } from "react";
import { fetchBackend } from "@/lib/db";
import { useUserRegistration } from "@/pages/companion/index";
import { useRouter } from "next/router";

const ManageTeam = () => {
  const router = useRouter();
  const { userRegistration } = useUserRegistration();
  const [isLeaving, setIsLeaving] = useState(false);

  const handleLeaveTeam = async () => {
    if (!userRegistration) {
      alert("Registration data not loaded");
      return;
    }

    if (!confirm("Are you sure you want to leave the team?")) {
      return;
    }

    setIsLeaving(true);

    try {
      const response = await fetchBackend({
        endpoint: "/team/leave",
        method: "POST",
        authenticatedCall: true,
        data: {
          eventID: "kickstart",
          year: 2025,
          memberID: userRegistration.id,
        },
      });

      router.push("/companion/team");
    } catch (err) {
      alert("Failed to leave team. Please try again.");
      setIsLeaving(false);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-4 space-y-8 font-bricolage">
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-6">
        <h1 className="text-3xl font-bold text-white">My Team</h1>
        <button
          onClick={handleLeaveTeam}
          disabled={isLeaving}
          className="px-6 py-3 bg-red-600 hover:bg-red-700 disabled:bg-red-800 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors duration-200"
        >
          {isLeaving ? "Leaving..." : "Leave Team"}
        </button>
      </div>
    </div>
  );
};

export default ManageTeam;
