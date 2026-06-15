"use client";

import { StatsigProvider, useStatsigClient } from "@statsig/react-bindings";
import { useMemo, type ReactNode } from "react";

import {
  ClientAnalyticsProvider,
  type ClientAnalytics,
  type ClientAnalyticsEventName,
  type ClientAnalyticsMetadata,
} from "@/components/analytics/ClientAnalytics";
import type { PublicStatsigConfig } from "@/interface/next/config/publicStatsigConfig";

type StatsigClientAnalyticsProviderProps = {
  children: ReactNode;
  config: PublicStatsigConfig;
};

const anonymousIdStorageKey = "jimboats_statsig_anonymous_id";

export function StatsigClientAnalyticsProvider({
  children,
  config,
}: StatsigClientAnalyticsProviderProps) {
  const user = useMemo(
    () => ({
      custom: {
        surface: "public_client",
      },
      userID: getAnonymousUserId(),
    }),
    [],
  );

  if (!config.enabled || !config.clientKey) {
    return <ClientAnalyticsProvider>{children}</ClientAnalyticsProvider>;
  }

  return (
    <StatsigProvider sdkKey={config.clientKey} user={user}>
      <StatsigAnalyticsBridge>{children}</StatsigAnalyticsBridge>
    </StatsigProvider>
  );
}

function StatsigAnalyticsBridge({ children }: { children: ReactNode }) {
  const { logEvent } = useStatsigClient();
  const analytics = useMemo<ClientAnalytics>(
    () => ({
      track: (
        eventName: ClientAnalyticsEventName,
        metadata?: ClientAnalyticsMetadata,
      ) => {
        logEvent(eventName, undefined, sanitizeMetadata(metadata));
      },
    }),
    [logEvent],
  );

  return (
    <ClientAnalyticsProvider analytics={analytics}>
      {children}
    </ClientAnalyticsProvider>
  );
}

function sanitizeMetadata(metadata: ClientAnalyticsMetadata | undefined) {
  const sanitized: Record<string, string> = {};

  for (const [key, value] of Object.entries(metadata ?? {})) {
    if (
      typeof value === "string" ||
      typeof value === "number" ||
      typeof value === "boolean"
    ) {
      sanitized[key] = String(value);
    }
  }

  return sanitized;
}

function getAnonymousUserId() {
  if (typeof window === "undefined") {
    return "anonymous";
  }

  try {
    const storedValue = window.localStorage.getItem(anonymousIdStorageKey);

    if (storedValue) {
      return storedValue;
    }

    const generatedValue = createAnonymousId();
    window.localStorage.setItem(anonymousIdStorageKey, generatedValue);

    return generatedValue;
  } catch {
    return createAnonymousId();
  }
}

function createAnonymousId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return `anon_${crypto.randomUUID()}`;
  }

  return `anon_${Math.random().toString(36).slice(2)}`;
}
