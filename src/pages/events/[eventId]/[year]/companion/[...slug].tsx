import Events, { DynamicPageProps } from "@/constants/companion-events";
import { useRouter } from "next/router";
import { useMemo } from "react";

function matchRoute(
  pattern: string,
  pathSegments: string[]
): Record<string, string> | null {
  const patternSegments = pattern.split("/");

  if (patternSegments.length !== pathSegments.length) {
    return null;
  }

  const params: Record<string, string> = {};

  for (let i = 0; i < patternSegments.length; i++) {
    const patternPart = patternSegments[i];
    const pathPart = pathSegments[i];


    const dynamicMatch = patternPart.match(/^\[(.+)\]$/);

    if (dynamicMatch) {
      params[dynamicMatch[1]] = pathPart;
    } else if (patternPart !== pathPart) {
      return null;
    }
  }

  return params;
}

export default function CompanionSubpage() {
  const router = useRouter();
  const { eventId, year, slug } = router.query;

  const event = useMemo(() => {
    if (!eventId || !year) return null;
    return Events.find((e) => e.eventID === eventId && e.year === Number(year));
  }, [eventId, year]);

  const { PageComponent, params } = useMemo(() => {
    if (!event?.pages || !slug) {
      return { PageComponent: null, params: {} };
    }

    const pathSegments = Array.isArray(slug) ? slug : [slug];

    for (const [pattern, component] of Object.entries(event.pages)) {
      const matchedParams = matchRoute(pattern, pathSegments);
      if (matchedParams !== null) {
        return { PageComponent: component, params: matchedParams };
      }
    }

    return { PageComponent: null, params: {} };
  }, [event, slug]);

  if (!router.isReady) {
    return null;
  }

  if (!event) {
    return null;
  }

  if (!PageComponent) {
    router.replace(`/events/${eventId}/${year}/companion`);
    return null;
  }

  const pageProps: DynamicPageProps = {
    event,
    params,
    eventId: eventId as string,
    year: year as string,
  };

  return <PageComponent {...pageProps} {...params} />;
}
