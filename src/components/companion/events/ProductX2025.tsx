import React, { useState } from "react";
import Box from "@/components/ui/productX/box";
import Judges from "../productX/judges/Judges";

const ProductX2025 = () => {
    const [isJudge, setIsJudge] = useState(true);

    if (isJudge) {
        return (
          <Judges />
        );
    }
};

export default ProductX2025;
