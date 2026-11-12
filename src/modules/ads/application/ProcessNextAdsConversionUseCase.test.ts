import { describe, expect, it, vi } from "vitest";
import { ProcessNextAdsConversionUseCase } from "./ProcessNextAdsConversionUseCase";
import {
  AdsConversionDeliveryError,
  type AdsConversionJob,
  type AdsConversionQueue,
} from "./ports/AdsConversions";

const now = new Date("2026-11-12T10:00:00Z");
function fixture() {
  const job: AdsConversionJob = {
    id: "queue-1",
    leaseUntil: new Date(now.getTime() + 120_000),
    attempts: 1,
    conversion: {
      id: "booking_1_paid",
      pixelId: "pixel-1",
      consentId: "consent-1",
      kind: "order",
      sourceUrl: "https://example.com/en/book/success",
      amountMinor: 10_000,
      currency: "EUR",
      timestampMs: now.getTime(),
    },
  };
  const queue = {
    enqueue: vi.fn(),
    purgeBefore: vi.fn(),
    claim: vi.fn().mockResolvedValue(job),
    complete: vi.fn(),
    fail: vi.fn(),
  } satisfies AdsConversionQueue;
  const sender = { send: vi.fn() };
  const consent = {
    id: "consent-1",
    version: 1,
    oppref: "opaque+ref/=",
    grantedAt: now,
    expiresAt: new Date(now.getTime() + 86_400_000),
    revokedAt: null as Date | null,
  };
  const consents = {
    create: vi.fn(),
    revoke: vi.fn(),
    purgeExpired: vi.fn(),
    find: vi.fn().mockResolvedValue(consent),
  };
  const useCase = new ProcessNextAdsConversionUseCase(
    queue,
    sender,
    { now: () => now },
    consents,
  );
  return { job, queue, sender, useCase, consents, consent };
}
describe("ProcessNextAdsConversionUseCase", () => {
  it("runs consent expiry and 90-day delivery retention once per hour", async () => {
    const f = fixture();
    f.queue.claim.mockResolvedValue(null);
    await f.useCase.execute();
    await f.useCase.execute();
    expect(f.consents.purgeExpired).toHaveBeenCalledTimes(1);
    expect(f.queue.purgeBefore).toHaveBeenCalledTimes(1);
    expect(f.queue.purgeBefore).toHaveBeenCalledWith(new Date(now.getTime() - 90 * 86_400_000));
  });
  it("does nothing with an empty queue", async () => {
    const f = fixture();
    f.queue.claim.mockResolvedValue(null);
    expect(await f.useCase.execute()).toBe("IDLE");
    expect(f.sender.send).not.toHaveBeenCalled();
  });
  it("publishes delivered jobs", async () => {
    const f = fixture();
    expect(await f.useCase.execute()).toBe("SENT");
    expect(f.queue.complete).toHaveBeenCalledWith(f.job, now);
  });
  it("schedules retry with the same conversion ID and timestamp", async () => {
    const f = fixture();
    f.sender.send.mockRejectedValueOnce(
      new AdsConversionDeliveryError("temporarily unavailable", true),
    );
    expect(await f.useCase.execute()).toBe("RETRY");
    expect(f.queue.fail).toHaveBeenCalledWith(f.job, {
      now,
      retryAt: new Date(now.getTime() + 60_000),
      reason: "temporarily unavailable",
    });
    expect(f.queue.complete).not.toHaveBeenCalled();
    expect(await f.useCase.execute()).toBe("SENT");
    expect(f.sender.send.mock.calls[0][0]).toEqual(
      f.sender.send.mock.calls[1][0],
    );
  });
  it.each(["expired", "exhausted", "invalid"])(
    "stops retrying %s jobs",
    async (kind) => {
      const f = fixture();
      if (kind === "expired") f.job.conversion.timestampMs -= 7 * 86_400_000;
      if (kind === "exhausted") f.job.attempts = 10;
      if (kind !== "expired")
        f.sender.send.mockRejectedValue(
          new AdsConversionDeliveryError("failure", kind === "exhausted"),
        );
      expect(await f.useCase.execute()).toBe("FAILED");
      expect(f.queue.fail).toHaveBeenCalledWith(
        f.job,
        expect.objectContaining({ retryAt: null }),
      );
      if (kind === "expired") expect(f.sender.send).not.toHaveBeenCalled();
    },
  );
  it.each(["missing", "revoked", "expired", "no-attribution"])(
    "does not deliver when consent is %s",
    async (state) => {
      const f = fixture();
      if (state === "missing") f.consents.find.mockResolvedValue(null);
      if (state === "revoked") f.consent.revokedAt = now;
      if (state === "expired") f.consent.expiresAt = now;
      if (state === "no-attribution") f.consent.oppref = "";
      expect(await f.useCase.execute()).toBe("FAILED");
      expect(f.sender.send).not.toHaveBeenCalled();
    },
  );
  it("checks withdrawal again before a retry", async () => {
    const f = fixture();
    f.sender.send.mockRejectedValueOnce(
      new AdsConversionDeliveryError("network", true),
    );
    expect(await f.useCase.execute()).toBe("RETRY");
    f.consent.revokedAt = now;
    expect(await f.useCase.execute()).toBe("FAILED");
    expect(f.sender.send).toHaveBeenCalledTimes(1);
  });
  it("leaves the lease for recovery if acknowledgement fails after delivery", async () => {
    const f = fixture();
    f.queue.complete.mockRejectedValue(new Error("DB offline"));
    await expect(f.useCase.execute()).rejects.toThrow("DB offline");
    expect(f.queue.fail).not.toHaveBeenCalled();
  });
});
