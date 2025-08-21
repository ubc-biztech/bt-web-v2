import { createServerRunner } from "@aws-amplify/adapter-nextjs";
import { API_URL } from "./dbconfig";
import { AuthTokens, fetchAuthSession } from "aws-amplify/auth";
import { fetchAuthSession as fetchSessionFromServer } from "aws-amplify/auth/server";
import outputs from "amplify_outputs.json";
import { GetServerSidePropsContext } from "next";
import { runWithAmplifyServerContext } from "@/util/amplify-utils";
import { UnauthenticatedUserError } from "./dbUtils";

interface FetchBackendOptions {
  endpoint: string;
  method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
  data?: Record<string, unknown>;
  authenticatedCall?: boolean;
}

interface FetchBackendServerOptions extends FetchBackendOptions {
  nextServerContext: {
    request: GetServerSidePropsContext["req"];
    response: GetServerSidePropsContext["res"];
  };
}

async function currentSession(): Promise<AuthTokens | null> {
  if (typeof window === "undefined") {
    console.log("Server-side: skipping auth session");
    return null;
  }

  try {
    const res = (await fetchAuthSession()).tokens;
    return res ?? null;
  } catch (err) {
    console.log("Auth session fetch failed:", err);
    return null;
  }
}

export async function fetchBackend({
  endpoint,
  method,
  data,
  authenticatedCall = true,
}: FetchBackendOptions): Promise<any> {
  const headers: Record<string, string> = {};

  if (method === "POST" || method === "PUT") {
    headers["Accept"] = "application/json";
    headers["Content-Type"] = "application/json";
  }

  if (authenticatedCall) {
    const session = await currentSession();
    if (session?.idToken) {
      headers["Authorization"] = `Bearer ${session.idToken}`;
    } else {
      console.warn("Skipping auth: currentSession unavailable in SSR context.");
    }
  }

  const body = data ? JSON.stringify(data) : undefined;

  try {
    const response = await fetch(API_URL + endpoint, {
      method,
      headers,
      body,
    });

    const responseData = await response.json();

    if (!response.ok) {
      throw {
        status: response.status,
        message: responseData,
      };
    }

    return responseData;
  } catch (error) {
    throw error;
  }
}

export async function fetchBackendFromServer({
  endpoint,
  method,
  data,
  authenticatedCall = true,
  nextServerContext,
}: FetchBackendServerOptions) {
  const headers: Record<string, string> = {};

  if (method === "POST" || method === "PUT") {
    headers["Accept"] = "application/json";
    headers["Content-Type"] = "application/json";
  }

  if (authenticatedCall) {
    const session = await runWithAmplifyServerContext({
      nextServerContext,
      operation: async (contextSpec) => {
        try {
          return await fetchSessionFromServer(contextSpec);
        } catch (error) {
          throw new UnauthenticatedUserError(
            "User is not authenticated or session does not exist in request",
          );
        }
      },
    });

    const idToken = session?.tokens?.idToken?.toString();

    if (idToken) {
      headers["Authorization"] = `Bearer ${idToken}`;
    } else {
      if (authenticatedCall) {
        throw new Error("Authentication required but no valid session found");
      }
    }
  }

  const body = data ? JSON.stringify(data) : undefined;

  try {
    const response = await fetch(API_URL + endpoint, {
      method,
      headers,
      body,
    });

    const responseData = await response.json();

    if (!response.ok) {
      throw {
        status: response.status,
        message: responseData,
      };
    }

    return responseData;
  } catch (error) {
    throw error;
  }
}
