import React, { useState } from "react";
import Judges from "../productX/Judges";
import User from "../productX/User";
import { useUserRegistration } from "@/pages/companion";

const ProductX2025 = () => {
  const { userRegistration } = useUserRegistration();

  if (!userRegistration) {
    return <div>Loading...</div>;
  }

  console.log(userRegistration)


  if (userRegistration?.isPartner) {
    return <Judges judgeID={userRegistration.id} />;
  }

  // TODO: user entry
  return (
    <User teamID="???" />
  )
};

export default ProductX2025;
