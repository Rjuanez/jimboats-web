import { describe, it, expect, vi } from "vitest";
import {
  BookingAdsMeasurement,
  adsConsentDenied,
} from "./BookingAdsMeasurement";
import type { AdsConsent, AdsConsentStore } from "./ports/AdsConsentStore";

function fixture() {
  let now = new Date("2026-11-12T10:00:00Z");
  const rows = new Map<string, AdsConsent>();
  const store: AdsConsentStore = {
    create: async (row) => {
      rows.set(row.id, { ...row });
    },
    find: async (id) => {
      const row = rows.get(id);
      return row ? { ...row } : null;
    },
    revoke: async (id, time) => {
      const row = rows.get(id);
      if (row) rows.set(id, { ...row, revokedAt: time, oppref: null });
    },
    purgeExpired: async () => {},
  };
  const queue = {
    enqueue: vi.fn(),
    purgeBefore: vi.fn(),
    claim: vi.fn(),
    complete: vi.fn(),
    fail: vi.fn(),
  };
  let count = 0;
  const service = new BookingAdsMeasurement(
    store,
    queue,
    { now: () => now },
    { next: () => `consent-${++count}` },
    {
      pixelId: "test-pixel",
      sourceUrl: "https://example.com/en/book/success",
    },
  );
  const grant = (oppref: string | null = "opaque+ref/=") =>
    service.save({ previousId: null, advertising: true, oppref });
  return {
    service,
    rows,
    store,
    queue,
    grant,
    advance: () => {
      now = new Date(now.getTime() + 86_400_000);
    },
  };
}

describe("Booking Ads consent", () => {
  it("never attributes unknown visitors, rejected choices or organic visits", async () => {
    const f = fixture();
    for (const id of [null, adsConsentDenied, "made-up", await f.grant(null)]) {
      expect(await f.service.attribution(id)).toBeUndefined();
      await f.service.whatsapp(id, "es");
    }
    expect(f.queue.enqueue).not.toHaveBeenCalled();
    expect(await f.service.choice(null)).toBeNull();
    expect(await f.service.choice(adsConsentDenied)).toBe(false);
  });
  it("stores unmodified attribution only after acceptance and sends only its internal reference to payments", async () => {
    const f = fixture();
    const id = await f.grant();
    expect(f.rows.get(id)?.oppref).toBe("opaque+ref/=");
    expect(await f.service.attribution(id)).toEqual({
      consentGranted: true,
      consentId: id,
    });
    await f.service.whatsapp(id, "fr");
    expect(f.queue.enqueue).toHaveBeenCalledWith({
      id: `booking_whatsapp_${id}`,
      kind: "whatsapp",
      consentId: id,
      pixelId: "test-pixel",
      sourceUrl: "https://example.com/fr/book",
      timestampMs: Date.parse("2026-11-12T10:00:00Z"),
    });
  });
  it("withdraws permission, clears attribution and does not revive old events on reacceptance", async () => {
    const f = fixture();
    const oldId = await f.grant();
    const rejected = await f.service.save({
      previousId: oldId,
      advertising: false,
      oppref: "ignored",
    });
    expect(rejected).toBe(adsConsentDenied);
    expect(f.rows.get(oldId)?.oppref).toBeNull();
    expect(await f.service.attribution(oldId)).toBeUndefined();
    await f.service.whatsapp(oldId, "es");
    expect(f.queue.enqueue).not.toHaveBeenCalled();
    const newId = await f.service.save({
      previousId: rejected,
      advertising: true,
      oppref: "new",
    });
    expect(newId).not.toBe(oldId);
    expect(await f.service.attribution(oldId)).toBeUndefined();
    expect(await f.service.attribution(newId)).toBeDefined();
  });
  it("expires the attribution and choice after 24 hours", async () => {
    const f = fixture();
    const id = await f.grant();
    f.advance();
    expect(await f.service.choice(id)).toBeNull();
    expect(await f.service.attribution(id)).toBeUndefined();
  });
  it("does not invalidate a pending payment when saving unchanged preferences", async () => {
    const f = fixture();
    const id = await f.grant();
    expect(
      await f.service.save({ previousId: id, advertising: true, oppref: null }),
    ).toBe(id);
    expect(await f.service.attribution(id)).toBeDefined();
  });
});
