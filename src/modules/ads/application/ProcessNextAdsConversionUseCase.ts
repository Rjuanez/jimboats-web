import {
  activeAdsConsent,
  type AdsConsentStore,
} from "./ports/AdsConsentStore";
import {
  AdsConversionDeliveryError,
  type AdsConversionQueue,
  type AdsConversionSender,
} from "./ports/AdsConversions";

export class ProcessNextAdsConversionUseCase {
  private nextPurgeAt = 0;
  constructor(
    private readonly queue: AdsConversionQueue,
    private readonly sender: AdsConversionSender,
    private readonly clock: { now(): Date },
    private readonly consents: AdsConsentStore,
  ) {}

  async execute(): Promise<"IDLE" | "SENT" | "RETRY" | "FAILED"> {
    if (this.clock.now().getTime() >= this.nextPurgeAt) {
      await this.consents.purgeExpired(this.clock.now());
      await this.queue.purgeBefore(new Date(this.clock.now().getTime() - 90 * 86_400_000));
      this.nextPurgeAt = this.clock.now().getTime() + 3_600_000;
    }
    const job = await this.queue.claim(this.clock.now());
    if (!job) return "IDLE";
    try {
      const ageMs = this.clock.now().getTime() - job.conversion.timestampMs;
      if (ageMs >= 7 * 24 * 60 * 60 * 1_000) {
        throw new AdsConversionDeliveryError(
          "Ads conversion expired (seven days).",
          false,
        );
      }
      // Fail closed on missing, expired or withdrawn consent, also on retries.
      const consent = await this.consents.find(job.conversion.consentId);
      if (
        !activeAdsConsent(consent, this.clock.now()) ||
        !consent.oppref ||
        consent.grantedAt.getTime() > job.conversion.timestampMs
      ) {
        throw new AdsConversionDeliveryError(
          "Ads consent unavailable or withdrawn.",
          false,
        );
      }
      await this.sender.send({ ...job.conversion, oppref: consent.oppref });
    } catch (error) {
      const now = this.clock.now();
      const retryable =
        error instanceof AdsConversionDeliveryError && error.retryable;
      const retryAt =
        retryable && job.attempts < 10
          ? new Date(
              now.getTime() +
                Math.min(3_600_000, 60_000 * 2 ** (job.attempts - 1)),
            )
          : null;
      await this.queue.fail(job, {
        now,
        retryAt,
        reason:
          error instanceof AdsConversionDeliveryError
            ? error.message
            : "Ads conversion processing failed.",
      });
      return retryAt ? "RETRY" : "FAILED";
    }
    // If this DB write fails, the lease expires and the same event ID is retried.
    await this.queue.complete(job, this.clock.now());
    return "SENT";
  }
}
