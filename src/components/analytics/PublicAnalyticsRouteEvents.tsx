"use client";

import { useEffect, useMemo } from "react";

import {
  isClientAnalyticsEventName,
  type ClientAnalyticsEventName,
  type ClientAnalyticsMetadata,
  type ClientAnalyticsMetadataValue,
} from "./ClientAnalytics";
import { useClientAnalytics } from "./ClientAnalytics";

type PublicAnalyticsRouteEventsProps = {
  metadata?: ClientAnalyticsMetadata;
  viewEventName?: ClientAnalyticsEventName;
};

const utmKeys = [
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_content",
  "utm_term",
] as const;

const storageKey = "jimboats_analytics_utm";

export function PublicAnalyticsRouteEvents({
  metadata,
  viewEventName,
}: PublicAnalyticsRouteEventsProps) {
  const analytics = useClientAnalytics();
  const stableMetadata = useMemo(() => metadata ?? {}, [metadata]);

  useEffect(() => {
    const browserMetadata = createBrowserMetadata(stableMetadata);

    if (viewEventName) {
      analytics.track(viewEventName, browserMetadata);
    }

    const handleClick = (event: MouseEvent) => {
      if (!(event.target instanceof Element)) {
        return;
      }

      const target = event.target.closest<HTMLElement>(
        "[data-analytics-event]",
      );
      const eventName = target?.dataset.analyticsEvent;

      if (!target || !isClientAnalyticsEventName(eventName)) {
        return;
      }

      analytics.track(eventName, {
        ...browserMetadata,
        ...datasetToMetadata(target.dataset),
      });
    };

    document.addEventListener("click", handleClick, true);

    return () => {
      document.removeEventListener("click", handleClick, true);
    };
  }, [analytics, stableMetadata, viewEventName]);

  return null;
}

function createBrowserMetadata(
  metadata: ClientAnalyticsMetadata,
): ClientAnalyticsMetadata {
  return sanitizeMetadata({
    ...readAndStoreUtmMetadata(),
    device_type: getDeviceType(),
    path: getCurrentPath(),
    referrer: getReferrer(),
    ...metadata,
  });
}

function datasetToMetadata(
  dataset: DOMStringMap,
): Record<string, ClientAnalyticsMetadataValue> {
  return sanitizeMetadata({
    contact_method: dataset.analyticsContactMethod,
    cta_location: dataset.analyticsCtaLocation,
    experience_id: dataset.analyticsExperienceId,
    experience_slug: dataset.analyticsExperienceSlug,
    section_id: dataset.analyticsSectionId,
    social_network: dataset.analyticsSocialNetwork,
    step: dataset.analyticsStep,
  });
}

function readAndStoreUtmMetadata() {
  const fromUrl = readUtmMetadataFromUrl();

  if (Object.keys(fromUrl).length > 0) {
    writeStoredUtmMetadata(fromUrl);

    return fromUrl;
  }

  return readStoredUtmMetadata();
}

function readUtmMetadataFromUrl() {
  if (typeof window === "undefined") {
    return {};
  }

  const params = new URLSearchParams(window.location.search);
  const metadata: Record<string, string> = {};

  for (const key of utmKeys) {
    const value = params.get(key)?.trim();

    if (value) {
      metadata[key] = value;
    }
  }

  return metadata;
}

function readStoredUtmMetadata() {
  if (typeof window === "undefined") {
    return {};
  }

  try {
    const rawValue = window.sessionStorage.getItem(storageKey);

    if (!rawValue) {
      return {};
    }

    const parsedValue = JSON.parse(rawValue) as unknown;

    if (!parsedValue || typeof parsedValue !== "object") {
      return {};
    }

    return sanitizeMetadata(parsedValue as Record<string, unknown>);
  } catch {
    return {};
  }
}

function writeStoredUtmMetadata(metadata: Record<string, string>) {
  if (typeof window === "undefined") {
    return;
  }

  try {
    window.sessionStorage.setItem(storageKey, JSON.stringify(metadata));
  } catch {
    return;
  }
}

function getCurrentPath() {
  if (typeof window === "undefined") {
    return "";
  }

  return window.location.pathname;
}

function getReferrer() {
  if (typeof document === "undefined") {
    return "";
  }

  return document.referrer;
}

function getDeviceType() {
  if (typeof window === "undefined") {
    return "unknown";
  }

  if (window.innerWidth < 768) {
    return "mobile";
  }

  if (window.innerWidth < 1280) {
    return "tablet";
  }

  return "desktop";
}

function sanitizeMetadata(metadata: Record<string, unknown>) {
  const sanitized: ClientAnalyticsMetadata = {};

  for (const [key, value] of Object.entries(metadata)) {
    if (
      typeof value === "string" ||
      typeof value === "number" ||
      typeof value === "boolean"
    ) {
      sanitized[key] = value;
    }
  }

  return sanitized;
}
