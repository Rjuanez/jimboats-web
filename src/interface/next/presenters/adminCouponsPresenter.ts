import { adminNavItems } from "@/components/layout/AdminNavigation";
import type {
  AdminCoupon,
  AdminCouponEvent,
  AdminCouponsPageData,
  AdminCouponVersion,
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
  return {
    navItems: adminNavItems,
    state: {
      coupons: [
        {
          activeVersion: {
            discountType: "PERCENTAGE",
            discountValue: 10,
            experienceIds: [],
            id: "coupon-test10-v1",
            maxTotalRedemptions: null,
            status: "ACTIVE",
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
              actorType: "ADMIN",
              bookingId: null,
              couponVersionId: "coupon-test10-v1",
              id: "event-test10-created",
              label: "Coupon created",
              occurredAt: "Jan 1, 2026, 10:00 AM",
              redemptionId: null,
              type: "COUPON_CREATED",
            },
          ],
          id: "coupon-test10",
          name: "Test 10",
          redemptions: [
            {
              bookingId: "booking-preview-1",
              customerEmailNormalized: "sailor@example.com",
              discountAmount: 38,
              finalTotalAmount: 342,
              id: "redemption-preview-1",
              reservedAt: "Jun 14, 2026, 10:00 AM",
              status: "CONFIRMED",
            },
          ],
          reservedRedemptions: 1,
          status: "ACTIVE",
          totalRedemptions: 4,
          updatedAt: "Jun 14, 2026, 10:00 AM",
          versions: [
            {
              discountType: "PERCENTAGE",
              discountValue: 10,
              experienceIds: [],
              id: "coupon-test10-v1",
              maxTotalRedemptions: null,
              status: "ACTIVE",
              validFrom: "2026-01-01",
              validUntil: "",
              versionNumber: 1,
            },
          ],
        },
      ],
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
    },
  };
}

export function presentAdminCouponsWorkspace(
  workspace: AdminCouponsWorkspaceDto,
): AdminCouponsPageData["state"] {
  return {
    coupons: workspace.coupons.map(presentCoupon),
    experiences: workspace.experiences,
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
      customerEmailNormalized: redemption.customerEmailNormalized,
      discountAmount: fromMinor(redemption.discountAmountMinor),
      finalTotalAmount: fromMinor(redemption.finalTotalAmountMinor),
      id: redemption.id,
      reservedAt: formatDateTime(redemption.reservedAt),
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

function formatDate(value: string) {
  return value.slice(0, 10);
}

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}
