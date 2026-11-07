import { describe, expect, it } from "vitest";
import { StaticCancellationPolicyRepository } from "./StaticCancellationPolicyRepository";
import { cancellationPolicy } from "@/content/booking/cancellationPolicy";

describe("versioned file cancellation conditions", () => {
  it("captures the same conditions as checkout in independent reservation snapshots", async () => {
    const repository = new StaticCancellationPolicyRepository();
    const first = (await repository.findActiveBookingSnapshotForExperience())!;
    expect(first.summaries.es).toBe(cancellationPolicy.copy.es.summary);
    expect(first.versionId).toBe("jimboats-static-cancellation-v2");
    first.summaries.es = "Previous reservation wording";
    first.tiers[0].label = "Historical terms";
    const next = (await repository.findActiveBookingSnapshotForExperience())!;
    expect(next.summaries.es).toBe(cancellationPolicy.copy.es.summary);
    expect(next.tiers[0].label).not.toBe("Historical terms");
    expect(first.summaries.es).toBe("Previous reservation wording");
  });

  it("includes exactly 48 hours in the free period without inventing a late deposit penalty", async () => {
    const snapshot =
      (await new StaticCancellationPolicyRepository().findActiveBookingSnapshotForExperience())!;
    const tierAt = (minutes: number) =>
      snapshot.tiers.find(
        (tier) =>
          (tier.fromMinutesBeforeDeparture === null ||
            minutes >= tier.fromMinutesBeforeDeparture) &&
          (tier.toMinutesBeforeDeparture === null ||
            minutes < tier.toMinutesBeforeDeparture),
      );
    expect(tierAt(48 * 60)?.depositOutcome).toBe("FULL_REFUND");
    expect(tierAt(48 * 60 - 1)?.depositOutcome).toBe("MANUAL_REVIEW");
    expect(
      snapshot.tiers.some((tier) => tier.depositOutcome === "NO_REFUND"),
    ).toBe(false);
    expect(snapshot.summaries.es).toContain("te devuelve todo lo abonado");
  });

  it("refuses panel writes to the file policy", async () => {
    await expect(
      new StaticCancellationPolicyRepository().saveNewActiveVersion(),
    ).rejects.toMatchObject({ code: "CANCELLATION_POLICY_READ_ONLY" });
  });

  it("captures the full terms in the language presented before checkout", async () => {
    const repository = new StaticCancellationPolicyRepository();
    const snapshot = await repository.findActiveBookingSnapshotForExperience("trip", "fr");
    expect(snapshot?.termsDocument).toContain("Conditions de réservation · JimBoats Charter");
    expect(snapshot?.termsDocument).toContain(cancellationPolicy.copy.fr.refund);
    expect((await repository.findActiveBookingSnapshotForExperience("trip"))?.termsDocument).toBeUndefined();
  });
});
