import React, { useState } from "react";
import Judges from "../productX/Judges";
import User from "../productX/User";

const ProductX2025 = () => {
    const [isJudge, setIsJudge] = useState(true);
    const [loading, setLoading] = useState(false);

    // TODO : Check if judge with email === localStorage.getItem("companionEmail") exists, update loading to false

    if (loading) {
        return <div>Loading...</div>;
    }

    if (isJudge) {
        return (
          <Judges />
        );
    }
    return (
      <User />
    )
};

export default ProductX2025;
