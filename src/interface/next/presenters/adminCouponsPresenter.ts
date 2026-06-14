import { adminNavItems } from "@/components/layout/AdminNavigation";
import type {
  AdminCoupon,
  AdminCouponCampaignSummary,
  AdminCouponEvent,
  AdminCouponMetrics,
  AdminCouponRankingItem,
  AdminCouponsPageData,
  AdminCouponVersion,
  AdminCouponUsagePoint,
} from "@/components/sections/admin-coupons/AdminCouponTypes";
import type {
  AdminCouponDto,
  AdminCouponsWorkspaceDto,
} from "@/modules/coupons/application/AdminCouponDtos";

export async function getAdminCouponsPage(): Promise<AdminCouponsPageData> {
  const { getContainer } = await import("@/container");
  const workspace = await getContainer().adminCoupons.getWorkspace();

  return {
    navItems: adminNavItems,
    state: presentAdminCouponsWorkspace(workspace),
  };
}

export function getAdminCouponsPreviewPage(): AdminCouponsPageData {
  const coupons = [
    {
      activeVersion: {
        discountType: "PERCENTAGE" as const,
        discountValue: 10,
        experienceIds: [],
        id: "coupon-test10-v1",
        maxTotalRedemptions: null,
        status: "ACTIVE" as const,
        validFrom: "2026-01-01",
        validUntil: "",
        versionNumber: 1,
      },
      campaignName: "Initial coupon test",
      code: "TEST10",
      confirmedRedemptions: 3,
      createdAt: "Jan 1, 2026, 10:00 AM",
      displayCode: "TEST10",
      events: [
        {
          actorId: "admin",
          actorType: "ADMIN" as const,
          bookingId: null,
          couponVersionId: "coupon-test10-v1",
          id: "event-test10-created",
          label: "Coupon created",
          occurredAt: "Jan 1, 2026, 10:00 AM",
          redemptionId: null,
          type: "COUPON_CREATED" as const,
        },
      ],
      id: "coupon-test10",
      name: "Test 10",
      redemptions: [
        {
          bookingId: "booking-preview-1",
          confirmedAt: "Jun 14, 2026, 10:00 AM",
          customerEmailNormalized: "sailor@example.com",
          discountAmount: 38,
          finalCashRemainingAmount: 242,
          finalDepositAmount: 100,
          finalTotalAmount: 342,
          id: "redemption-preview-1",
          originalCashRemainingAmount: 280,
          originalDepositAmount: 100,
          originalTotalAmount: 380,
          releasedAt: "",
          reservedAt: "Jun 14, 2026, 10:00 AM",
          reservedDateKey: "2026-06-14",
          status: "CONFIRMED" as const,
        },
      ],
      reservedRedemptions: 1,
      status: "ACTIVE" as const,
      totalRedemptions: 4,
      updatedAt: "Jun 14, 2026, 10:00 AM",
      versions: [
        {
          discountType: "PERCENTAGE" as const,
          discountValue: 10,
          experienceIds: [],
          id: "coupon-test10-v1",
          maxTotalRedemptions: null,
          status: "ACTIVE" as const,
          validFrom: "2026-01-01",
          validUntil: "",
          versionNumber: 1,
        },
      ],
    },
  ];

  return {
    navItems: adminNavItems,
    state: {
      campaigns: campaignSummaries(coupons),
      coupons,
      experiences: [
        {
          id: "morning-breeze-charter",
          name: "Siente la brisa mediterranea",
          status: "PUBLISHED",
        },
        {
          id: "sunset-experience",
          name: "Atardecer privado",
          status: "READY",
        },
      ],
      metrics: couponMetrics(coupons),
      ranking: couponRanking(coupons),
      usage: usagePoints(coupons),
    },
  };
}

export function presentAdminCouponsWorkspace(
  workspace: AdminCouponsWorkspaceDto,
): AdminCouponsPageData["state"] {
  const coupons = workspace.coupons.map(presentCoupon);

  return {
    campaigns: campaignSummaries(coupons),
    coupons,
    experiences: workspace.experiences,
    metrics: couponMetrics(coupons),
    ranking: couponRanking(coupons),
    usage: usagePoints(coupons),
  };
}

function presentCoupon(coupon: AdminCouponDto): AdminCoupon {
  return {
    activeVersion: coupon.activeVersion
      ? presentVersion(coupon.activeVersion)
      : null,
    campaignName: coupon.campaignName,
    code: coupon.code,
    confirmedRedemptions: coupon.confirmedRedemptions,
    createdAt: formatDateTime(coupon.createdAt),
    displayCode: coupon.displayCode,
    events: coupon.events.map(presentEvent),
    id: coupon.id,
    name: coupon.name,
    redemptions: coupon.redemptions.map((redemption) => ({
      bookingId: redemption.bookingId,
      confirmedAt: redemption.confirmedAt
        ? formatDateTime(redemption.confirmedAt)
        : "",
      customerEmailNormalized: redemption.customerEmailNormalized,
      discountAmount: fromMinor(redemption.discountAmountMinor),
      finalCashRemainingAmount: fromMinor(
        redemption.finalCashRemainingAmountMinor,
      ),
      finalDepositAmount: fromMinor(redemption.finalDepositAmountMinor),
      finalTotalAmount: fromMinor(redemption.finalTotalAmountMinor),
      id: redemption.id,
      originalCashRemainingAmount: fromMinor(
        redemption.originalCashRemainingAmountMinor,
      ),
      originalDepositAmount: fromMinor(redemption.originalDepositAmountMinor),
      originalTotalAmount: fromMinor(redemption.originalTotalAmountMinor),
      releasedAt: redemption.releasedAt ? formatDateTime(redemption.releasedAt) : "",
      reservedAt: formatDateTime(redemption.reservedAt),
      reservedDateKey: formatDate(redemption.reservedAt),
      status: redemption.status,
    })),
    reservedRedemptions: coupon.reservedRedemptions,
    status: coupon.status,
    totalRedemptions: coupon.totalRedemptions,
    updatedAt: formatDateTime(coupon.updatedAt),
    versions: coupon.versions.map(presentVersion),
  };
}

function presentVersion(version: AdminCouponDto["versions"][number]): AdminCouponVersion {
  return {
    discountType: version.discountType,
    discountValue:
      version.discountType === "PERCENTAGE"
        ? (version.discountPercentageBps ?? 0) / 100
        : fromMinor(version.discountAmountMinor ?? 0),
    experienceIds: version.experienceIds,
    id: version.id,
    maxTotalRedemptions: version.maxTotalRedemptions,
    status: version.status,
    validFrom: formatDate(version.validFrom),
    validUntil: version.validUntil ? formatDate(version.validUntil) : "",
    versionNumber: version.versionNumber,
  };
}

function presentEvent(event: AdminCouponDto["events"][number]): AdminCouponEvent {
  return {
    actorId: event.actorId,
    actorType: event.actorType,
    bookingId: event.bookingId,
    couponVersionId: event.couponVersionId,
    id: event.id,
    label: eventLabel(event),
    occurredAt: formatDateTime(event.occurredAt),
    redemptionId: event.redemptionId,
    type: event.type,
  };
}

function eventLabel(event: AdminCouponDto["events"][number]) {
  const action =
    typeof event.metadata.action === "string" ? event.metadata.action : "";

  if (action === "coupon-rules-updated") {
    return "Rules updated";
  }

  if (action === "coupon-status-changed") {
    return `Status changed to ${String(event.metadata.status ?? "")}`;
  }

  if (event.type === "COUPON_VERSION_CREATED") {
    return "Version created";
  }

  if (event.type === "COUPON_RESERVED") {
    return "Redemption reserved";
  }

  if (event.type === "COUPON_CONFIRMED") {
    return "Redemption confirmed";
  }

  if (event.type === "COUPON_RELEASED") {
    return "Redemption released";
  }

  return "Coupon created";
}

function fromMinor(amountMinor: number) {
  return amountMinor / 100;
}

function couponMetrics(coupons: AdminCoupon[]): AdminCouponMetrics {
  const redemptions = coupons.flatMap((coupon) => coupon.redemptions);
  const confirmed = redemptions.filter(
    (redemption) => redemption.status === "CONFIRMED",
  );
  const discountAmount = confirmed.reduce(
    (sum, redemption) => sum + redemption.discountAmount,
    0,
  );

  return {
    activeCoupons: coupons.filter((coupon) => coupon.status === "ACTIVE").length,
    averageDiscount: confirmed.length > 0 ? discountAmount / confirmed.length : 0,
    confirmedRevenueAfterDiscount: confirmed.reduce(
      (sum, redemption) => sum + redemption.finalTotalAmount,
      0,
    ),
    confirmedRedemptions: confirmed.length,
    conversionRate:
      redemptions.length > 0 ? Math.round((confirmed.length / redemptions.length) * 100) : 0,
    discountAmount,
    releasedRedemptions: redemptions.filter(
      (redemption) => redemption.status === "RELEASED",
    ).length,
    reservedRedemptions: redemptions.filter(
      (redemption) => redemption.status === "RESERVED",
    ).length,
    totalCoupons: coupons.length,
    totalRedemptions: redemptions.length,
  };
}

function couponRanking(coupons: AdminCoupon[]): AdminCouponRankingItem[] {
  return coupons
    .map((coupon) => {
      const confirmed = coupon.redemptions.filter(
        (redemption) => redemption.status === "CONFIRMED",
      );

      return {
        code: coupon.displayCode,
        confirmedRedemptions: confirmed.length,
        discountAmount: confirmed.reduce(
          (sum, redemption) => sum + redemption.discountAmount,
          0,
        ),
        id: coupon.id,
        revenueAfterDiscount: confirmed.reduce(
          (sum, redemption) => sum + redemption.finalTotalAmount,
          0,
        ),
      };
    })
    .sort((left, right) => right.confirmedRedemptions - left.confirmedRedemptions)
    .slice(0, 5);
}

function campaignSummaries(coupons: AdminCoupon[]): AdminCouponCampaignSummary[] {
  const summaries = new Map<string, AdminCouponCampaignSummary>();

  for (const coupon of coupons) {
    const campaignName = coupon.campaignName || "Unassigned campaign";
    const current =
      summaries.get(campaignName) ??
      {
        campaignName,
        confirmedRedemptions: 0,
        couponCount: 0,
        discountAmount: 0,
        totalRedemptions: 0,
      };
    const confirmed = coupon.redemptions.filter(
      (redemption) => redemption.status === "CONFIRMED",
    );

    current.couponCount += 1;
    current.confirmedRedemptions += confirmed.length;
    current.discountAmount += confirmed.reduce(
      (sum, redemption) => sum + redemption.discountAmount,
      0,
    );
    current.totalRedemptions += coupon.redemptions.length;
    summaries.set(campaignName, current);
  }

  return [...summaries.values()].sort(
    (left, right) => right.confirmedRedemptions - left.confirmedRedemptions,
  );
}

function usagePoints(coupons: AdminCoupon[]): AdminCouponUsagePoint[] {
  const points = new Map<string, AdminCouponUsagePoint>();

  for (const redemption of coupons.flatMap((coupon) => coupon.redemptions)) {
    const date = redemption.reservedAt.split(",")[0] ?? redemption.reservedAt;
    const current =
      points.get(redemption.reservedDateKey) ??
      {
        confirmed: 0,
        date,
        discountAmount: 0,
        released: 0,
        reserved: 0,
      };

    if (redemption.status === "CONFIRMED") {
      current.confirmed += 1;
      current.discountAmount += redemption.discountAmount;
    } else if (redemption.status === "RELEASED") {
      current.released += 1;
    } else if (redemption.status === "RESERVED") {
      current.reserved += 1;
    }

    points.set(redemption.reservedDateKey, current);
  }

  return [...points.entries()]
    .sort(([left], [right]) => right.localeCompare(left))
    .slice(0, 14)
    .map(([, point]) => point);
}

function formatDate(value: string) {
  return value.slice(0, 10);
}

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}
