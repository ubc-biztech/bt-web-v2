import Events, { DynamicPageProps } from "@/constants/companion-events";
import ProductPlus2026 from "@/features/product+/2026/ProductPlus2026";
import {
  isProductPlusPage,
  PRODUCT_PLUS_COMPANION_PATH,
} from "@/features/product+/2026/access";
import { useRouter } from "next/router";
import { useEffect, useMemo } from "react";

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

function LegacyCompanionSubpage() {
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

function ProductPlusSubpage() {
  const router = useRouter();
  const { slug } = router.query;
  const page = Array.isArray(slug) && slug.length === 1 ? slug[0] : slug;
  const validPage = isProductPlusPage(page);

  useEffect(() => {
    if (router.isReady && !validPage) {
      void router.replace(PRODUCT_PLUS_COMPANION_PATH);
    }
  }, [router, validPage]);

  if (!router.isReady || !validPage) return null;

  return <ProductPlus2026 page={page} />;
}

export default function CompanionSubpage() {
  const router = useRouter();

  if (router.query.event === "product+" && router.query.year === "2026") {
    return <ProductPlusSubpage />;
  }

  return <LegacyCompanionSubpage />;
}
