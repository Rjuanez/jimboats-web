import type {
  AdsAttribution,
  AdsConversionQueue,
} from "./ports/AdsConversions";
import {
  activeAdsConsent,
  type AdsConsentStore,
} from "./ports/AdsConsentStore";

// A short attribution session; expiry also invalidates delayed worker delivery.
export const adsConsentLifetimeSeconds = 24 * 60 * 60;
export const adsConsentDenied = "denied-v1";

export class BookingAdsMeasurement {
  constructor(
    private readonly consents: AdsConsentStore,
    private readonly queue: AdsConversionQueue,
    private readonly clock: { now(): Date },
    private readonly ids: { next(): string },
    private readonly config: { pixelId: string; sourceUrl: string },
  ) {}

  async choice(id: string | null): Promise<boolean | null> {
    if (id === adsConsentDenied) return false;
    if (!id) return null;
    const consent = await this.consents.find(id);
    if (!consent || consent.expiresAt <= this.clock.now()) return null;
    return activeAdsConsent(consent, this.clock.now());
  }

  async save(input: {
    previousId: string | null;
    advertising: boolean;
    oppref: string | null;
  }): Promise<string> {
    const now = this.clock.now();
    const previous =
      input.previousId && input.previousId !== adsConsentDenied
        ? await this.consents.find(input.previousId)
        : null;
    if (
      input.advertising &&
      activeAdsConsent(previous, now) &&
      (!input.oppref || input.oppref === previous.oppref)
    )
      return previous.id;
    const oppref =
      input.oppref ??
      (activeAdsConsent(previous, now) ? previous.oppref : null);
    // Revoke before granting a new record: an old queued event must never revive.
    if (previous) await this.consents.revoke(previous.id, now);
    if (!input.advertising) return adsConsentDenied;
    const id = this.ids.next();
    await this.consents.create({
      id,
      version: 1,
      oppref: oppref && oppref.length <= 500 ? oppref : null,
      grantedAt: now,
      expiresAt: new Date(now.getTime() + adsConsentLifetimeSeconds * 1000),
      revokedAt: null,
    });
    return id;
  }

  async attribution(id: string | null): Promise<AdsAttribution | undefined> {
    if (!id || id === adsConsentDenied) return undefined;
    const consent = await this.consents.find(id);
    return activeAdsConsent(consent, this.clock.now()) && consent.oppref
      ? { consentGranted: true, consentId: consent.id }
      : undefined;
  }

  async whatsapp(id: string | null, locale: string): Promise<void> {
    const attribution = await this.attribution(id);
    if (!attribution) return;
    await this.queue.enqueue({
      id: `booking_whatsapp_${attribution.consentId}`,
      kind: "whatsapp",
      consentId: attribution.consentId,
      pixelId: this.config.pixelId,
      timestampMs: this.clock.now().getTime(),
      sourceUrl: new URL(`/${locale}/book`, this.config.sourceUrl).href,
    });
  }
}
