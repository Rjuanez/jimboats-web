import { describe, expect, it } from "vitest";

import { ApplicationError } from "@/shared/application/ApplicationError";

import { ChangeAdminCouponStatusUseCase } from "./ChangeAdminCouponStatusUseCase";
import { CreateAdminCouponUseCase } from "./CreateAdminCouponUseCase";
import { PreviewCouponDiscountUseCase } from "./PreviewCouponDiscountUseCase";
import { ReserveCouponRedemptionUseCase } from "./ReserveCouponRedemptionUseCase";
import { UpdateAdminCouponUseCase } from "./UpdateAdminCouponUseCase";
import type { AdminCouponDto } from "./AdminCouponDtos";
import type { AdminCouponRepository } from "./ports/AdminCouponRepository";
import type {
  ActiveCouponVersionReadModel,
  CouponRepository,
} from "./ports/CouponRepository";

describe("Coupon use cases", () => {
  it("previews a valid coupon without saving a redemption", async () => {
    const coupons = new FakeCouponRepository();
    const preview = await new PreviewCouponDiscountUseCase(coupons).execute({
      code: " test10 ",
      currency: "EUR",
      depositAmountMinor: 10_000,
      experienceId: "sunset-cruise",
      now: now(),
      subtotalAmountMinor: 35_000,
    });

    expect(preview).toMatchObject({
      discountAmount: money(3_500),
      remainingAmount: money(21_500),
      totalAmount: money(31_500),
    });
    expect(coupons.reserved).toHaveLength(0);
  });

  it("reserves a coupon redemption for checkout", async () => {
    const coupons = new FakeCouponRepository();
    const reserved = await new ReserveCouponRedemptionUseCase(coupons).execute({
      bookingId: "booking-1",
      code: "TEST10",
      currency: "EUR",
      customerEmail: "SAILOR@EXAMPLE.COM",
      depositAmountMinor: 10_000,
      experienceId: "sunset-cruise",
      now: now(),
      paymentRecordId: "payment-1",
      subtotalAmountMinor: 35_000,
    });

    expect(reserved.redemption).toMatchObject({
      bookingId: "booking-1",
      couponId: "coupon-test10",
      customerEmailNormalized: "sailor@example.com",
      id: "coupon-redemption-booking-1",
      status: "RESERVED",
    });
  });

  it("rejects coupons limited to another experience", async () => {
    const coupons = new FakeCouponRepository({
      experienceIds: ["morning-breeze"],
    });

    await expect(
      new PreviewCouponDiscountUseCase(coupons).execute({
        code: "TEST10",
        currency: "EUR",
        depositAmountMinor: 10_000,
        experienceId: "sunset-cruise",
        now: now(),
        subtotalAmountMinor: 35_000,
      }),
    ).rejects.toMatchObject({
      code: "COUPON_EXPERIENCE_NOT_ALLOWED",
    } satisfies Partial<ApplicationError>);
  });
});

describe("Admin coupon use cases", () => {
  it("creates a draft coupon through the admin repository", async () => {
    const coupons = new FakeAdminCouponRepository();

    const created = await new CreateAdminCouponUseCase(coupons).execute({
      actorId: "admin",
      campaignName: "Summer campaign",
      code: "SUMMER10",
      couponId: "coupon-summer10",
      discountPercentageBps: 1_000,
      discountType: "PERCENTAGE",
      experienceIds: [],
      maxTotalRedemptions: null,
      name: "Summer 10",
      now: now(),
      status: "DRAFT",
      validFrom: now(),
      validUntil: null,
    });

    expect(created).toMatchObject({
      code: "SUMMER10",
      id: "coupon-summer10",
      status: "DRAFT",
    });
  });

  it("rejects duplicate coupon codes", async () => {
    const coupons = new FakeAdminCouponRepository([adminCoupon()]);

    await expect(
      new CreateAdminCouponUseCase(coupons).execute({
        actorId: "admin",
        campaignName: "Initial coupon test",
        code: " test10 ",
        couponId: "coupon-test10-copy",
        discountPercentageBps: 1_000,
        discountType: "PERCENTAGE",
        experienceIds: [],
        maxTotalRedemptions: null,
        name: "Duplicate",
        now: now(),
        status: "ACTIVE",
        validFrom: now(),
        validUntil: null,
      }),
    ).rejects.toMatchObject({
      code: "COUPON_ALREADY_EXISTS",
    } satisfies Partial<ApplicationError>);
  });

  it("validates fixed amount discounts before updating", async () => {
    const coupons = new FakeAdminCouponRepository([adminCoupon()]);

    await expect(
      new UpdateAdminCouponUseCase(coupons).execute({
        actorId: "admin",
        campaignName: "Initial coupon test",
        couponId: "coupon-test10",
        discountAmountMinor: 0,
        discountType: "FIXED_AMOUNT",
        experienceIds: [],
        maxTotalRedemptions: null,
        name: "Test 10",
        now: now(),
        status: "ACTIVE",
        validFrom: now(),
        validUntil: null,
      }),
    ).rejects.toMatchObject({
      code: "COUPON_RULE_INVALID",
    } satisfies Partial<ApplicationError>);
  });

  it("changes admin coupon status without deleting history", async () => {
    const coupons = new FakeAdminCouponRepository([adminCoupon()]);

    const updated = await new ChangeAdminCouponStatusUseCase(coupons).execute({
      actorId: "admin",
      couponId: "coupon-test10",
      now: now(),
      status: "PAUSED",
    });

    expect(updated.status).toBe("PAUSED");
    expect(updated.versions).toHaveLength(1);
  });
});

class FakeCouponRepository implements CouponRepository {
  reserved: unknown[] = [];

  constructor(private readonly patch: Partial<ActiveCouponVersionReadModel> = {}) {}

  async findActiveVersionByCode() {
    return {
      campaignName: "Initial coupon test",
      code: "TEST10",
      couponId: "coupon-test10",
      couponStatus: "ACTIVE",
      couponVersionId: "coupon-version-test10-v1",
      currency: "EUR",
      discountAmountMinor: null,
      discountPercentageBps: 1_000,
      discountType: "PERCENTAGE",
      experienceIds: [],
      maxTotalRedemptions: null,
      validFrom: new Date("2026-01-01T00:00:00.000Z"),
      validUntil: null,
      versionStatus: "ACTIVE",
      ...this.patch,
    } satisfies ActiveCouponVersionReadModel;
  }

  async countActiveRedemptions() {
    return 0;
  }

  async saveReservedRedemption(input: unknown) {
    this.reserved.push(input);
  }

  async confirmRedemptionForBooking() {}

  async releaseRedemptionForBooking() {}
}

class FakeAdminCouponRepository implements AdminCouponRepository {
  private readonly records = new Map<string, AdminCouponDto>();

  constructor(coupons: AdminCouponDto[] = []) {
    for (const coupon of coupons) {
      this.records.set(coupon.id, coupon);
    }
  }

  async changeStatus(input: {
    actorId: string | null;
    couponId: string;
    now: Date;
    status: AdminCouponDto["status"];
  }) {
    const coupon = this.records.get(input.couponId);

    if (!coupon) {
      throw new Error("Coupon missing in fake repository.");
    }

    const updated = {
      ...coupon,
      events: [
        {
          actorId: input.actorId,
          actorType: "ADMIN" as const,
          bookingId: null,
          couponVersionId: coupon.activeVersion?.id ?? null,
          id: `event-${coupon.events.length + 1}`,
          metadata: {
            action: "coupon-status-changed",
          },
          occurredAt: input.now.toISOString(),
          redemptionId: null,
          type: "COUPON_CREATED" as const,
        },
        ...coupon.events,
      ],
      status: input.status,
    };

    this.records.set(input.couponId, updated);
    return updated;
  }

  async create(input: Parameters<AdminCouponRepository["create"]>[0]) {
    const coupon = adminCoupon({
      campaignName: input.campaignName,
      code: input.code.trim().toUpperCase(),
      id: input.couponId,
      name: input.name,
      status: input.status,
    });

    this.records.set(coupon.id, coupon);
    return coupon;
  }

  async findByCodeNormalized(codeNormalized: string) {
    return (
      [...this.records.values()].find((coupon) => coupon.code === codeNormalized) ??
      null
    );
  }

  async findById(couponId: string) {
    return this.records.get(couponId) ?? null;
  }

  async list() {
    return [...this.records.values()];
  }

  async update(input: Parameters<AdminCouponRepository["update"]>[0]) {
    const coupon = this.records.get(input.couponId);

    if (!coupon) {
      throw new Error("Coupon missing in fake repository.");
    }

    const version = {
      currency: "EUR" as const,
      discountAmountMinor: input.discountAmountMinor ?? null,
      discountPercentageBps: input.discountPercentageBps ?? null,
      discountType: input.discountType,
      experienceIds: input.experienceIds,
      id: `${input.couponId}-v${coupon.versions.length + 1}`,
      maxTotalRedemptions: input.maxTotalRedemptions ?? null,
      status: "ACTIVE" as const,
      validFrom: input.validFrom.toISOString(),
      validUntil: input.validUntil?.toISOString() ?? null,
      versionNumber: coupon.versions.length + 1,
    };
    const updated = {
      ...coupon,
      activeVersion: version,
      campaignName: input.campaignName,
      name: input.name,
      status: input.status,
      versions: [version, ...coupon.versions],
    };

    this.records.set(input.couponId, updated);
    return updated;
  }
}

function now() {
  return new Date("2026-06-14T10:00:00.000Z");
}

function money(amountMinor: number) {
  return {
    amountMinor,
    currency: "EUR",
  };
}

function adminCoupon(patch: Partial<AdminCouponDto> = {}): AdminCouponDto {
  const version = {
    currency: "EUR" as const,
    discountAmountMinor: null,
    discountPercentageBps: 1_000,
    discountType: "PERCENTAGE" as const,
    experienceIds: [],
    id: "coupon-version-test10-v1",
    maxTotalRedemptions: null,
    status: "ACTIVE" as const,
    validFrom: "2026-01-01T00:00:00.000Z",
    validUntil: null,
    versionNumber: 1,
  };

  return {
    activeVersion: version,
    campaignName: "Initial coupon test",
    code: "TEST10",
    confirmedRedemptions: 0,
    createdAt: "2026-01-01T00:00:00.000Z",
    displayCode: "TEST10",
    events: [],
    id: "coupon-test10",
    name: "Test 10",
    redemptions: [],
    reservedRedemptions: 0,
    status: "ACTIVE",
    totalRedemptions: 0,
    updatedAt: "2026-01-01T00:00:00.000Z",
    versions: [version],
    ...patch,
  };
}
