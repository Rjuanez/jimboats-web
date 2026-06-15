export type PublicStatsigConfig = {
  clientKey: string | null;
  enabled: boolean;
};

export function getPublicStatsigConfig(): PublicStatsigConfig {
  const clientKey = process.env.NEXT_PUBLIC_STATSIG_CLIENT_KEY?.trim() || null;
  const explicitlyEnabled =
    process.env.NEXT_PUBLIC_STATSIG_ANALYTICS_ENABLED?.trim().toLowerCase() ===
    "true";

  return {
    clientKey,
    enabled: explicitlyEnabled && Boolean(clientKey),
  };
}
