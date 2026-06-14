import type { AdminCouponRepository } from "./ports/AdminCouponRepository";

export class ExportAdminCouponsCsvUseCase {
  constructor(private readonly coupons: AdminCouponRepository) {}

  async execute(): Promise<string> {
    const coupons = await this.coupons.list();
    const rows = [
      [
        "code",
        "campaign",
        "status",
        "total_redemptions",
        "confirmed_redemptions",
        "reserved_redemptions",
        "discount_amount_eur",
        "confirmed_revenue_after_discount_eur",
      ],
      ...coupons.map((coupon) => {
        const confirmed = coupon.redemptions.filter(
          (redemption) => redemption.status === "CONFIRMED",
        );
        const discountAmountMinor = confirmed.reduce(
          (sum, redemption) => sum + redemption.discountAmountMinor,
          0,
        );
        const revenueAmountMinor = confirmed.reduce(
          (sum, redemption) => sum + redemption.finalTotalAmountMinor,
          0,
        );

        return [
          coupon.displayCode,
          coupon.campaignName,
          coupon.status,
          String(coupon.totalRedemptions),
          String(coupon.confirmedRedemptions),
          String(coupon.reservedRedemptions),
          cents(discountAmountMinor),
          cents(revenueAmountMinor),
        ];
      }),
    ];

    return rows.map((row) => row.map(csvCell).join(",")).join("\n");
  }
}

function cents(amountMinor: number) {
  return (amountMinor / 100).toFixed(2);
}

function csvCell(value: string) {
  return `"${value.replace(/"/g, '""')}"`;
}
