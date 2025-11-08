import { useState, useEffect } from "react";
import { fetchBackend } from "@/lib/db";
import {
  COMPANION_EMAIL_KEY,
  COMPANION_PROFILE_ID_KEY,
} from "@/constants/companion";

interface KickstartProps {
  event: any;
  registrations: any[];
  userRegistration: any;
}

const Kickstart2025 = ({
  event,
  registrations,
  userRegistration,
}: KickstartProps
) => {
  return (
    <div className="w-full max-w-4xl mx-auto p-4 space-y-8 font-bricolage text-[100px]">
     Kickstart!
    </div>
  );
};

export default Kickstart2025;
