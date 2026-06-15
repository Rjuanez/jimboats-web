"use client";

import type { ReactNode } from "react";

import {
  type ClientAnalyticsEventName,
  type ClientAnalyticsMetadata,
} from "@/components/analytics/ClientAnalytics";
import { PublicAnalyticsRouteEvents } from "@/components/analytics/PublicAnalyticsRouteEvents";
import { StatsigClientAnalyticsProvider } from "@/interface/next/analytics/StatsigClientAnalyticsProvider";
import type { PublicStatsigConfig } from "@/interface/next/config/publicStatsigConfig";

type PublicClientAnalyticsBoundaryProps = {
  children: ReactNode;
  config: PublicStatsigConfig;
  metadata?: ClientAnalyticsMetadata;
  viewEventName?: ClientAnalyticsEventName;
};

export function PublicClientAnalyticsBoundary({
  children,
  config,
  metadata,
  viewEventName,
}: PublicClientAnalyticsBoundaryProps) {
  return (
    <StatsigClientAnalyticsProvider config={config}>
      <PublicAnalyticsRouteEvents
        metadata={metadata}
        viewEventName={viewEventName}
      />
      {children}
    </StatsigClientAnalyticsProvider>
  );
}
