import { describe, expect, it, vi } from "vitest";
import { PrismaAdsConversionQueue } from "./PrismaAdsConversionQueue";

const now = new Date("2026-11-12T10:00:00Z");
const row = {
  id: "job-1",
  updatedAt: now,
  payload: {
    attempts: 0,
    conversion: {
      id: "booking_1_paid",
      pixelId: "pixel-1",
      timestampMs: now.getTime(),
      kind: "order",
      consentId: "consent-1",
      sourceUrl: "https://example.com/en/book/success",
      amountMinor: 10_000,
      currency: "EUR",
    },
  },
};
function fixture() {
  const client = {
    outboxMessage: {
      deleteMany: vi.fn(),
      createMany: vi.fn().mockResolvedValue({ count: 1 }),
      findFirst: vi.fn().mockResolvedValue(row),
      updateMany: vi.fn().mockResolvedValue({ count: 1 }),
    },
  };
  const queue = new PrismaAdsConversionQueue(
    client as unknown as ConstructorParameters<
      typeof PrismaAdsConversionQueue
    >[0],
  );
  return { client, queue };
}
describe("PrismaAdsConversionQueue", () => {
  it("purges only old Ads records, preserving booking notifications", async () => {
    const f = fixture();
    const cutoff = new Date(now.getTime() - 90 * 86_400_000);
    await f.queue.purgeBefore(cutoff);
    expect(f.client.outboxMessage.deleteMany).toHaveBeenCalledWith({
      where: { aggregateType: "ADS_CONVERSION", occurredAt: { lt: cutoff } },
    });
  });
  it("uses an atomic insert-on-conflict for repeated WhatsApp clicks without overwriting the first event", async () => {
    const f = fixture();
    const conversion = { kind: "whatsapp" as const, id: "click-1", consentId: "consent-1", pixelId: "pixel-1", timestampMs: now.getTime(), sourceUrl: "https://example.com/es/book" };
    await f.queue.enqueue(conversion);
    expect(f.client.outboxMessage.createMany).toHaveBeenCalledWith({
      skipDuplicates: true, data: expect.objectContaining({ id: "click-1", eventType: "ChatGptBookingWhatsAppClicked", payload: { attempts: 0, conversion } }),
    });
  });

  it("claims only due conversion jobs and guards the lease with a compare-and-set", async () => {
    const f = fixture();
    const job = await f.queue.claim(now);
    expect(f.client.outboxMessage.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          aggregateType: "ADS_CONVERSION",
          eventType: { in: ["ChatGptOrderCreated", "ChatGptBookingWhatsAppClicked"] },
          status: "PENDING",
          updatedAt: { lte: now },
        },
      }),
    );
    expect(f.client.outboxMessage.updateMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: row.id, status: "PENDING", updatedAt: now },
      }),
    );
    expect(job).toMatchObject({
      attempts: 1,
      leaseUntil: new Date(now.getTime() + 120_000),
    });
    await f.queue.complete(job!, now);
    expect(f.client.outboxMessage.updateMany).toHaveBeenLastCalledWith(
      expect.objectContaining({
        where: { id: row.id, status: "PENDING", updatedAt: job!.leaseUntil },
        data: expect.objectContaining({ status: "PUBLISHED" }),
      }),
    );
  });
  it("does not process a job claimed by another worker", async () => {
    const f = fixture();
    f.client.outboxMessage.updateMany.mockResolvedValue({ count: 0 });
    expect(await f.queue.claim(now)).toBeNull();
  });
  it("quarantines corrupt payloads without exposing them", async () => {
    const f = fixture();
    f.client.outboxMessage.findFirst.mockResolvedValue({
      ...row,
      payload: { secret: "private" },
    });
    expect(await f.queue.claim(now)).toBeNull();
    expect(f.client.outboxMessage.updateMany).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          status: "FAILED",
          failureReason: "Invalid ads conversion payload.",
        }),
      }),
    );
  });
  it("schedules retries and permanent failures separately", async () => {
    const f = fixture();
    const job = (await f.queue.claim(now))!;
    const retryAt = new Date(now.getTime() + 60_000);
    await f.queue.fail(job, { now, retryAt, reason: "network" });
    expect(f.client.outboxMessage.updateMany).toHaveBeenLastCalledWith(
      expect.objectContaining({
        data: {
          status: "PENDING",
          failureReason: "network",
          updatedAt: retryAt,
        },
      }),
    );
    await f.queue.fail(job, { now, retryAt: null, reason: "invalid" });
    expect(f.client.outboxMessage.updateMany).toHaveBeenLastCalledWith(
      expect.objectContaining({
        data: { status: "FAILED", failureReason: "invalid", updatedAt: now },
      }),
    );
  });
});
