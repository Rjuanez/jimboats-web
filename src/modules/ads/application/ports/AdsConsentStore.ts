export type AdsConsent = {
  id: string;
  version: number;
  oppref: string | null;
  grantedAt: Date;
  expiresAt: Date;
  revokedAt: Date | null;
};

export type AdsConsentStore = {
  create(consent: AdsConsent): Promise<void>;
  find(id: string): Promise<AdsConsent | null>;
  revoke(id: string, now: Date): Promise<void>;
  purgeExpired(now: Date): Promise<void>;
};

export function activeAdsConsent(
  consent: AdsConsent | null,
  now: Date,
): consent is AdsConsent {
  return Boolean(
    consent &&
    consent.version === 1 &&
    !consent.revokedAt &&
    consent.expiresAt > now,
  );
}
