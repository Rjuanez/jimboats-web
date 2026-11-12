export type AdsAttribution = {
  consentGranted: true;
  consentId: string;
};

export type AdsConversion = {
  id: string;
  pixelId: string;
  timestampMs: number;
  consentId: string;
  sourceUrl: string;
} & (
  | { kind: "order"; amountMinor: number; currency: string }
  | { kind: "whatsapp" }
);

export type AttributedAdsConversion = AdsConversion & { oppref: string };

export type AdsConversionJob = {
  id: string;
  leaseUntil: Date;
  attempts: number;
  conversion: AdsConversion;
};

export type AdsConversionQueue = {
  enqueue(conversion: AdsConversion): Promise<void>;
  purgeBefore(cutoff: Date): Promise<void>;
  claim(now: Date): Promise<AdsConversionJob | null>;
  complete(job: AdsConversionJob, now: Date): Promise<void>;
  fail(
    job: AdsConversionJob,
    input: {
      reason: string;
      retryAt: Date | null;
      now: Date;
    },
  ): Promise<void>;
};

export type AdsConversionSender = {
  send(conversion: AttributedAdsConversion): Promise<void>;
};

export class AdsConversionDeliveryError extends Error {
  constructor(
    message: string,
    readonly retryable: boolean,
  ) {
    super(message);
  }
}
