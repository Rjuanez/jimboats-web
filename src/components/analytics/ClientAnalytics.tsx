"use client";

import { createContext, type ReactNode, useContext, useMemo } from "react";

export const clientAnalyticsEventNames = [
  "landing_viewed",
  "booking_cta_clicked",
  "landing_section_viewed",
  "contact_link_clicked",
  "social_link_clicked",
  "booking_page_viewed",
  "booking_experience_selected",
  "booking_availability_loaded",
  "booking_availability_failed",
  "booking_date_selected",
  "booking_time_selected",
  "booking_extras_viewed",
  "booking_extra_toggled",
  "booking_payment_viewed",
  "booking_coupon_entered",
  "booking_coupon_applied",
  "booking_coupon_failed",
  "booking_validation_failed",
  "booking_checkout_started",
  "booking_checkout_failed",
  "booking_checkout_ready",
  "booking_success_viewed",
  "booking_confirmed",
  "booking_access_viewed",
  "booking_access_failed",
  "booking_access_support_clicked",
  "booking_access_home_clicked",
] as const;

export type ClientAnalyticsEventName =
  (typeof clientAnalyticsEventNames)[number];

export type ClientAnalyticsMetadataValue = boolean | number | string;

export type ClientAnalyticsMetadata = Record<
  string,
  ClientAnalyticsMetadataValue
>;

export type ClientAnalytics = {
  track: (
    eventName: ClientAnalyticsEventName,
    metadata?: ClientAnalyticsMetadata,
  ) => void;
};

type ClientAnalyticsProviderProps = {
  analytics?: ClientAnalytics;
  children: ReactNode;
};

const noopAnalytics: ClientAnalytics = {
  track: () => {},
};

const clientAnalyticsContext = createContext<ClientAnalytics>(noopAnalytics);
const validEventNames = new Set<string>(clientAnalyticsEventNames);

export function ClientAnalyticsProvider({
  analytics = noopAnalytics,
  children,
}: ClientAnalyticsProviderProps) {
  const value = useMemo(() => analytics, [analytics]);

  return (
    <clientAnalyticsContext.Provider value={value}>
      {children}
    </clientAnalyticsContext.Provider>
  );
}

export function useClientAnalytics() {
  return useContext(clientAnalyticsContext);
}

export function isClientAnalyticsEventName(
  value: string | undefined,
): value is ClientAnalyticsEventName {
  return Boolean(value && validEventNames.has(value));
}
