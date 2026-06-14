import { describe, expect, it } from "vitest";

import { PrismaCouponRepository } from "./PrismaCouponRepository";
import type { PrismaCouponRepositoryClient } from "./PrismaCouponRepository";

describe("PrismaCouponRepository", () => {
  it("loads coupons by normalized code without list-only ordering", async () => {
    const client = new CaptureCouponClient();
    const repository = new PrismaCouponRepository(client);

    await repository.findByCodeNormalized("SUMMER001");

    expect(client.lastFindUniqueArgs).toMatchObject({
      where: {
        codeNormalized: "SUMMER001",
      },
    });
    expect(readObject(client.lastFindUniqueArgs)).not.toHaveProperty("orderBy");
  });

  it("loads coupons by id without list-only ordering", async () => {
    const client = new CaptureCouponClient();
    const repository = new PrismaCouponRepository(client);

    await repository.findById("coupon-summer001");

    expect(client.lastFindUniqueArgs).toMatchObject({
      where: {
        id: "coupon-summer001",
      },
    });
    expect(readObject(client.lastFindUniqueArgs)).not.toHaveProperty("orderBy");
  });
});

class CaptureCouponClient implements PrismaCouponRepositoryClient {
  lastFindUniqueArgs: unknown = null;

  readonly coupon: PrismaCouponRepositoryClient["coupon"] = {
    create: async () => null,
    findMany: async () => [],
    findUnique: async (args: unknown) => {
      this.lastFindUniqueArgs = args;

      return null;
    },
    update: async () => null,
  };

  readonly couponEvent: PrismaCouponRepositoryClient["couponEvent"] = {
    create: async () => null,
  };

  readonly couponRedemption: PrismaCouponRepositoryClient["couponRedemption"] = {
    count: async () => 0,
    findUnique: async () => null,
    update: async () => null,
  };

  readonly couponVersion: PrismaCouponRepositoryClient["couponVersion"] = {
    create: async () => null,
    findFirst: async () => null,
    updateMany: async () => null,
  };

  async $transaction<T>(
    _callback: Parameters<PrismaCouponRepositoryClient["$transaction"]>[0],
  ): Promise<T> {
    void _callback;

    throw new Error("Unexpected transaction in coupon repository test.");
  }
}

function readObject(value: unknown) {
  return value && typeof value === "object"
    ? (value as Record<string, unknown>)
    : {};
}
