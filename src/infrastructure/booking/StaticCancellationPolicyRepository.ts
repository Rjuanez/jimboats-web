import { ApplicationError } from "@/shared/application/ApplicationError";
import {
  CancellationPolicy,
  CancellationPolicyTier,
  CancellationPolicyVersion,
} from "@/modules/booking/domain/CancellationPolicy";
import type { CancellationPolicyRepository } from "@/modules/booking/application/ports/CancellationPolicyRepository";
import { cancellationPolicy } from "@/content/booking/cancellationPolicy";
import { getBookingTermsDocument } from "@/content/booking/terms";
import { isMarketingLocale } from "@/content/marketing/routes";

// New bookings read the file definition. Persisted bookings keep their own snapshot.
// Staff review late-cancellation exceptions and handle refunds.
export class StaticCancellationPolicyRepository implements CancellationPolicyRepository {
  private readonly policy: CancellationPolicy;

  constructor() {
    const createdAt = new Date(`${cancellationPolicy.confirmedAt}T00:00:00Z`);
    const cutoff = cancellationPolicy.freeCancellationHoursBeforeDeparture * 60;
    this.policy = CancellationPolicy.create({
      id: cancellationPolicy.id,
      name: "JimBoats cancellation policy",
      status: "ACTIVE",
      isDefault: true,
      createdAt,
      updatedAt: createdAt,
      versions: [
        CancellationPolicyVersion.create({
          id: `${cancellationPolicy.id}-v${cancellationPolicy.version}`,
          policyId: cancellationPolicy.id,
          version: cancellationPolicy.version,
          status: "ACTIVE",
          createdAt,
          updatedAt: createdAt,
          activatedAt: createdAt,
          summaries: {
            es: cancellationPolicy.copy.es.summary,
            en: cancellationPolicy.copy.en.summary,
            ca: cancellationPolicy.copy.ca.summary,
          },
          tiers: [
            CancellationPolicyTier.create({
              id: "jimboats-late-contact",
              position: 0,
              label:
                "Less than 48 hours: payments normally retained; staff review exceptions via WhatsApp",
              fromMinutesBeforeDeparture: 0,
              toMinutesBeforeDeparture: cutoff,
              depositOutcome: "MANUAL_REVIEW",
              refundAmount: null,
            }),
            CancellationPolicyTier.create({
              id: "jimboats-free-cancellation",
              position: 1,
              label: "Free cancellation at least 48 hours before departure",
              fromMinutesBeforeDeparture: cutoff,
              toMinutesBeforeDeparture: null,
              depositOutcome: "FULL_REFUND",
              refundAmount: null,
            }),
          ],
        }),
      ],
    });
  }

  async findActiveBookingSnapshotForExperience(
    _experienceId?: string,
    termsLocale?: string,
  ) {
    const snapshot = this.policy.toBookingSnapshot();
    if (!snapshot || termsLocale === undefined) return snapshot;
    const locale = termsLocale === "ca" ? "es" : termsLocale;
    return {
      ...snapshot,
      termsDocument: getBookingTermsDocument(
        isMarketingLocale(locale) ? locale : "en",
      ),
    };
  }

  async list() {
    return [this.policy];
  }

  async saveNewActiveVersion(): Promise<void> {
    throw new ApplicationError(
      "CANCELLATION_POLICY_READ_ONLY",
      "Cancellation conditions are maintained in versioned files.",
    );
  }
}
