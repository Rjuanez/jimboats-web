import type { PrismaClient } from "@prisma/client";
import { z } from "zod";
import type {
  AdsConversion,
  AdsConversionJob,
  AdsConversionQueue,
} from "@/modules/ads/application/ports/AdsConversions";

const baseConversion = z.object({
  id: z.string().min(1),
  pixelId: z.string().min(1),
  timestampMs: z.number().int().nonnegative(),
  consentId: z.string().min(1),
  sourceUrl: z.url(),
});
const payloadSchema = z.object({
  attempts: z.number().int().min(0),
  conversion: z.discriminatedUnion("kind", [
    baseConversion.extend({
      kind: z.literal("order"),
      amountMinor: z.number().int().positive(),
      currency: z.string().regex(/^[A-Z]{3}$/),
    }),
    baseConversion.extend({ kind: z.literal("whatsapp") }),
  ]),
});

export class PrismaAdsConversionQueue implements AdsConversionQueue {
  constructor(private readonly prisma: Pick<PrismaClient, "outboxMessage">) {}

  async enqueue(conversion: AdsConversion): Promise<void> {
    // Stable per-consent click ID deduplicates both buttons, retries and repeat clicks.
    await this.prisma.outboxMessage.createMany({
      skipDuplicates: true,
      data: {
        id: conversion.id,
        aggregateType: "ADS_CONVERSION",
        aggregateId: conversion.consentId,
        eventType:
          conversion.kind === "order"
            ? "ChatGptOrderCreated"
            : "ChatGptBookingWhatsAppClicked",
        eventVersion: 1,
        payload: { attempts: 0, conversion },
        occurredAt: new Date(conversion.timestampMs),
        updatedAt: new Date(conversion.timestampMs),
      },
    });
  }

  async purgeBefore(cutoff: Date): Promise<void> {
    await this.prisma.outboxMessage.deleteMany({
      where: { aggregateType: "ADS_CONVERSION", occurredAt: { lt: cutoff } },
    });
  }

  async claim(now: Date): Promise<AdsConversionJob | null> {
    const row = await this.prisma.outboxMessage.findFirst({
      where: {
        aggregateType: "ADS_CONVERSION",
        eventType: {
          in: ["ChatGptOrderCreated", "ChatGptBookingWhatsAppClicked"],
        },
        status: "PENDING",
        updatedAt: { lte: now },
      },
      orderBy: { updatedAt: "asc" },
    });
    if (!row) return null;
    const parsed = payloadSchema.safeParse(row.payload);
    if (!parsed.success) {
      await this.prisma.outboxMessage.updateMany({
        where: { id: row.id, status: "PENDING", updatedAt: row.updatedAt },
        data: {
          status: "FAILED",
          failureReason: "Invalid ads conversion payload.",
          updatedAt: now,
        },
      });
      return null;
    }
    const leaseUntil = new Date(now.getTime() + 120_000);
    const attempts = parsed.data.attempts + 1;
    const claimed = await this.prisma.outboxMessage.updateMany({
      where: { id: row.id, status: "PENDING", updatedAt: row.updatedAt },
      data: {
        updatedAt: leaseUntil,
        payload: { conversion: parsed.data.conversion, attempts },
      },
    });
    return claimed.count === 1
      ? { id: row.id, leaseUntil, attempts, conversion: parsed.data.conversion }
      : null;
  }

  async complete(job: AdsConversionJob, now: Date): Promise<void> {
    await this.prisma.outboxMessage.updateMany({
      where: { id: job.id, status: "PENDING", updatedAt: job.leaseUntil },
      data: {
        status: "PUBLISHED",
        publishedAt: now,
        failureReason: null,
        updatedAt: now,
      },
    });
  }

  async fail(
    job: AdsConversionJob,
    input: {
      reason: string;
      retryAt: Date | null;
      now: Date;
    },
  ): Promise<void> {
    await this.prisma.outboxMessage.updateMany({
      where: { id: job.id, status: "PENDING", updatedAt: job.leaseUntil },
      data: {
        status: input.retryAt ? "PENDING" : "FAILED",
        failureReason: input.reason,
        updatedAt: input.retryAt ?? input.now,
      },
    });
  }
}
