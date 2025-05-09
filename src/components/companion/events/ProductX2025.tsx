import React, { useEffect } from "react";
import Judges from "../productX/Judges";
import User from "../productX/User";
import { useUserRegistration } from "@/pages/companion";
import { COMPANION_EMAIL_KEY, TEAM_NAME } from "@/constants/companion";
import { useRouter } from "next/router";
import TeamCreation from "../productX/user/TeamCreation";

const ProductX2025 = () => {
  const { userRegistration } = useUserRegistration();
  const router = useRouter();

  !userRegistration?.isPartner && userRegistration?.teamID && localStorage.setItem(TEAM_NAME, userRegistration.teamID);
  userRegistration?.id && localStorage.setItem(COMPANION_EMAIL_KEY, userRegistration.id);

  useEffect(() => {
    if (!router.isReady) {
      return;
    }

    const { query } = router;
    const redirectParam = query["redirect"] ? decodeURIComponent(query["redirect"] as string) : undefined;
    redirectParam && router.push(`/${redirectParam}`);
  }, [router.isReady]);

  if (!userRegistration) {
    return <div>Loading...</div>;
  }

  if (userRegistration?.isPartner) {
    return <Judges />;
  }

  if (userRegistration?.teamID) {
    return <User teamID={userRegistration.teamID} />;
  }

  return <TeamCreation />
};

export default ProductX2025;
