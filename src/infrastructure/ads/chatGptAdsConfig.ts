export type ChatGptAdsConfig = {
  pixelId: string;
  apiKey: string;
  sourceUrl: string;
  validateOnly: boolean;
};

export function getChatGptAdsConfig(
  env: Record<string, string | undefined> = process.env,
): ChatGptAdsConfig | null {
  if (env.CHATGPT_ADS_ENABLED !== "true") return null;
  const pixelId = env.CHATGPT_ADS_PIXEL_ID?.trim();
  const apiKey = env.CHATGPT_ADS_CAPI_KEY?.trim();
  if (!pixelId || !apiKey) {
    throw new Error(
      "ChatGPT Ads requires CHATGPT_ADS_PIXEL_ID and CHATGPT_ADS_CAPI_KEY when enabled.",
    );
  }
  const siteUrl = env.PUBLIC_SITE_URL?.trim();
  if (!siteUrl) throw new Error("ChatGPT Ads requires PUBLIC_SITE_URL.");
  const url = new URL(siteUrl);
  if (!["http:", "https:"].includes(url.protocol)) {
    throw new Error("ChatGPT Ads requires an HTTP(S) PUBLIC_SITE_URL.");
  }
  return {
    pixelId,
    apiKey,
    // Never send checkout session IDs, booking access tokens or query strings.
    sourceUrl: new URL("/en/book/success", url.origin).href,
    validateOnly: env.CHATGPT_ADS_VALIDATE_ONLY !== "false",
  };
}
