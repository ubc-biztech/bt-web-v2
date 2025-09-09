"use client";

import React, { forwardRef } from "react";
import ForceGraph2D, {
  ForceGraphMethods,
  ForceGraphProps,
} from "react-force-graph-2d";

const FG2D = forwardRef<ForceGraphMethods, ForceGraphProps<any, any>>(
  (props, ref) => <ForceGraph2D ref={ref as any} {...props} />,
);

FG2D.displayName = "ForceGraph2DClient";
export type FGRef = ForceGraphMethods;
export default FG2D;
