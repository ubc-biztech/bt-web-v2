import EventHomePage from "@/features/events/home/EventHomePage";
import { prefetchEventHome } from "@/features/events/home/prefetchEventHome";
import type { GetServerSideProps } from "next";

export const getServerSideProps: GetServerSideProps = async (context) => {
  const result = await prefetchEventHome(context);

  if ("notFound" in result) {
    return { notFound: true };
  }

  return {
    props: {
      eventId: result.eventId,
      year: result.year,
      dehydratedState: result.dehydratedState,
    },
  };
};

export default EventHomePage;
