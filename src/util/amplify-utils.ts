// utils/amplify-utils.ts
import { createServerRunner } from "@aws-amplify/adapter-nextjs";
import outputs from "amplify_outputs.json";

const isProduction = process.env.NODE_ENV === "production";
const isDevelopment = process.env.NODE_ENV === "development";

export const { runWithAmplifyServerContext, createAuthRouteHandlers } =
  createServerRunner({
    config: outputs,

    runtimeOptions: {
      cookies: {
        ...(isProduction && { domain: ".ubcbiztech.com" }),
        sameSite: isDevelopment ? "lax" : "strict",
        maxAge: 60 * 60 * 24 * 7,
      },
    },
  });
