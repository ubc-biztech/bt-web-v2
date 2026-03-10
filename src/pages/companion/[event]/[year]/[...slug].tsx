import Events, { DynamicPageProps } from "@/constants/companion-events";
import { useRouter } from "next/router";
import { useMemo } from "react";

function matchRoute(
  pattern: string,
  pathSegments: string[],
): Record<string, string> | null {
  const patternSegments = pattern.split("/");
  if (patternSegments.length !== pathSegments.length) return null;

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
  const { event, year, slug } = router.query;
  const slugPath = Array.isArray(slug) ? slug.join("/") : slug;

  const eventConfig = useMemo(() => {
    if (!event || !year) return null;
    return Events.find((e) => e.eventID === event && e.year === Number(year));
  }, [event, year]);

  const { PageComponent, params } = useMemo(() => {
    if (!eventConfig?.pages || !slug) {
      return { PageComponent: null, params: {} };
    }
    const pathSegments = Array.isArray(slug) ? slug : [slug];
    for (const [pattern, component] of Object.entries(eventConfig.pages)) {
      const matchedParams = matchRoute(pattern, pathSegments);
      if (matchedParams !== null) {
        return { PageComponent: component, params: matchedParams };
      }
    }
    return { PageComponent: null, params: {} };
  }, [eventConfig, slug]);

  if (!router.isReady || !eventConfig) return null;

  if (!PageComponent) {
    if (slugPath) {
      router.replace(`/companion/${slugPath}`);
      return null;
    }
    router.replace(`/companion/${event}/${year}`);
    return null;
  }

  const pageProps: DynamicPageProps = {
    event: eventConfig,
    params,
    eventId: event as string,
    year: year as string,
  };

  return <PageComponent {...pageProps} />;
}
