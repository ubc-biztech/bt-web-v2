import { fetchBackendFromServer } from "@/lib/db";
import type { Registration } from "@/queries/registrations";
import type { UserAttributes } from "@/queries/user";
import type { User } from "@/types";
import { dehydrate, QueryClient } from "@tanstack/react-query";
import type { GetServerSidePropsContext } from "next";

type PrefetchResult =
  | { notFound: true }
  | {
      dehydratedState: ReturnType<typeof dehydrate>;
      eventId: string;
      year: string;
    };

export async function prefetchEventHome(
  context: GetServerSidePropsContext,
): Promise<PrefetchResult> {
  const eventId = context.params?.eventId;
  const year = context.params?.year;

  if (typeof eventId !== "string" || typeof year !== "string") {
    return { notFound: true };
  }

  const nextServerContext = {
    request: context.req,
    response: context.res,
  };
  const queryClient = new QueryClient();

  try {
    const [event, counts] = await Promise.all([
      fetchBackendFromServer({
        endpoint: `/events/${eventId}/${year}`,
        method: "GET",
        authenticatedCall: false,
        nextServerContext,
      }),
      fetchBackendFromServer({
        endpoint: `/events/${eventId}/${year}?${new URLSearchParams({ count: String(true) })}`,
        method: "GET",
        authenticatedCall: false,
        nextServerContext,
      }),
    ]);

    queryClient.setQueryData(["events", eventId, year], event);
    queryClient.setQueryData(["events", eventId, year, "counts"], counts);
  } catch (error: any) {
    if (error?.status === 404) {
      return { notFound: true };
    }
  }

  try {
    const user: User = await fetchBackendFromServer({
      endpoint: "/users/self",
      method: "GET",
      nextServerContext,
    });
    const email = user.email ?? user.id;
    const userAttributes: UserAttributes = {
      email,
      isAdmin: Boolean(user.admin) || email.split("@")[1] === "ubcbiztech.com",
    };

    queryClient.setQueryData(["userAttributes"], userAttributes);

    const registrationsResponse = await fetchBackendFromServer({
      endpoint: `/registrations?email=${encodeURIComponent(email)}`,
      method: "GET",
      nextServerContext,
    });
    const registrations: Registration[] = registrationsResponse?.data || [];
    queryClient.setQueryData(["registrations", email], registrations);
  } catch {
    queryClient.setQueryData(["userAttributes"], null);
  }

  return {
    dehydratedState: dehydrate(queryClient),
    eventId,
    year,
  };
}
