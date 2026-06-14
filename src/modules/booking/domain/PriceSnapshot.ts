import { domainError } from "@/shared/domain/DomainError";
import { Money } from "@/shared/domain/Money";
import type { MoneySnapshot } from "@/shared/domain/Money";

export type BookingExtraPriceLineProps = {
  extraId: string;
  nameSnapshot: string;
  quantity: number;
  totalPrice: Money;
  unitPrice: Money;
};

export type BookingExtraPriceLineSnapshot = {
  extraId: string;
  nameSnapshot: string;
  quantity: number;
  totalPrice: MoneySnapshot;
  unitPrice: MoneySnapshot;
};

export type PriceSnapshotProps = {
  basePrice: Money;
  capturedAt: Date;
  depositAmount: Money;
  discountAmount?: Money;
  discountSnapshot?: BookingDiscountSnapshot | null;
  extraLines: BookingExtraPriceLineProps[];
  remainingAmount: Money;
  subtotalAmount?: Money;
  totalAmount: Money;
};

export type BookingDiscountSnapshot = {
  appliedAt: string;
  campaignName: string;
  code: string;
  couponId: string;
  couponVersionId: string;
  discountAmount: MoneySnapshot;
  discountType: "FIXED_AMOUNT" | "PERCENTAGE";
  discountValue: number;
};

export type PriceSnapshotSnapshot = {
  basePrice: MoneySnapshot;
  capturedAt: string;
  depositAmount: MoneySnapshot;
  discountAmount: MoneySnapshot;
  discountSnapshot: BookingDiscountSnapshot | null;
  extraLines: BookingExtraPriceLineSnapshot[];
  remainingAmount: MoneySnapshot;
  remainingPaymentMethod: "CASH_ON_BOARD";
  subtotalAmount: MoneySnapshot;
  totalAmount: MoneySnapshot;
};

export class PriceSnapshot {
  private constructor(
    private readonly props: Omit<
      PriceSnapshotProps,
      "discountAmount" | "discountSnapshot" | "extraLines" | "subtotalAmount"
    > & {
      discountAmount: Money;
      discountSnapshot: BookingDiscountSnapshot | null;
      extraLines: BookingExtraPriceLine[];
      subtotalAmount: Money;
    },
  ) {}

  static create(input: PriceSnapshotProps) {
    const extraLines = input.extraLines.map(BookingExtraPriceLine.create);
    const currency = input.totalAmount.currency;
    const discountAmount =
      input.discountAmount ??
      Money.create({
        amountMinor: 0,
        currency,
      });

    assertSameCurrency(input.basePrice, currency);
    assertSameCurrency(input.depositAmount, currency);
    assertSameCurrency(discountAmount, currency);
    assertSameCurrency(input.remainingAmount, currency);

    const extraTotal = extraLines.reduce(
      (total, line) => total + line.totalPrice.amountMinor,
      0,
    );
    const expectedSubtotal = input.basePrice.amountMinor + extraTotal;
    const subtotalAmount =
      input.subtotalAmount ??
      Money.create({
        amountMinor: expectedSubtotal,
        currency,
      });

    assertSameCurrency(subtotalAmount, currency);

    if (subtotalAmount.amountMinor !== expectedSubtotal) {
      throw domainError(
        "BOOKING_PRICE_SNAPSHOT_INVALID",
        "Booking subtotal must match base price plus selected extras.",
      );
    }

    if (discountAmount.amountMinor > subtotalAmount.amountMinor) {
      throw domainError(
        "BOOKING_PRICE_SNAPSHOT_INVALID",
        "Booking discount cannot be greater than subtotal.",
      );
    }

    if (discountAmount.amountMinor > 0 && !input.discountSnapshot) {
      throw domainError(
        "BOOKING_PRICE_SNAPSHOT_INVALID",
        "Booking discount requires a coupon snapshot.",
      );
    }

    const expectedTotal = subtotalAmount.amountMinor - discountAmount.amountMinor;

    if (input.totalAmount.amountMinor !== expectedTotal) {
      throw domainError(
        "BOOKING_PRICE_SNAPSHOT_INVALID",
        "Booking total must match subtotal minus discount.",
      );
    }

    if (input.depositAmount.amountMinor > input.totalAmount.amountMinor) {
      throw domainError(
        "BOOKING_DEPOSIT_AMOUNT_INVALID",
        "Booking deposit cannot be greater than total amount.",
      );
    }

    if (
      input.remainingAmount.amountMinor !==
      input.totalAmount.amountMinor - input.depositAmount.amountMinor
    ) {
      throw domainError(
        "BOOKING_PRICE_SNAPSHOT_INVALID",
        "Booking remaining amount must match total minus deposit.",
      );
    }

    if (Number.isNaN(input.capturedAt.getTime())) {
      throw domainError(
        "BOOKING_PRICE_SNAPSHOT_INVALID",
        "Booking price captured date is invalid.",
      );
    }

    return new PriceSnapshot({
      ...input,
      discountAmount,
      discountSnapshot: input.discountSnapshot ?? null,
      extraLines,
      subtotalAmount,
    });
  }

  get depositAmount() {
    return this.props.depositAmount;
  }

  get totalAmount() {
    return this.props.totalAmount;
  }

  toSnapshot(): PriceSnapshotSnapshot {
    return {
      basePrice: this.props.basePrice.toSnapshot(),
      capturedAt: this.props.capturedAt.toISOString(),
      depositAmount: this.props.depositAmount.toSnapshot(),
      discountAmount: this.props.discountAmount.toSnapshot(),
      discountSnapshot: this.props.discountSnapshot,
      extraLines: this.props.extraLines.map((line) => line.toSnapshot()),
      remainingAmount: this.props.remainingAmount.toSnapshot(),
      remainingPaymentMethod: "CASH_ON_BOARD",
      subtotalAmount: this.props.subtotalAmount.toSnapshot(),
      totalAmount: this.props.totalAmount.toSnapshot(),
    };
  }
}

class BookingExtraPriceLine {
  private constructor(
    readonly extraId: string,
    readonly nameSnapshot: string,
    readonly quantity: number,
    readonly unitPrice: Money,
    readonly totalPrice: Money,
  ) {}

  static create(input: BookingExtraPriceLineProps) {
    const extraId = input.extraId.trim();
    const nameSnapshot = normalizeText(input.nameSnapshot);

    if (!extraId || !nameSnapshot) {
      throw domainError(
        "BOOKING_EXTRA_LINE_INVALID",
        "Booking extra line requires an extra id and name.",
      );
    }

    if (!Number.isInteger(input.quantity) || input.quantity <= 0) {
      throw domainError(
        "BOOKING_EXTRA_LINE_INVALID",
        "Booking extra quantity must be positive.",
      );
    }

    assertSameCurrency(input.unitPrice, input.totalPrice.currency);

    if (
      input.totalPrice.amountMinor !==
      input.unitPrice.amountMinor * input.quantity
    ) {
      throw domainError(
        "BOOKING_EXTRA_LINE_INVALID",
        "Booking extra total must match unit price times quantity.",
      );
    }

    return new BookingExtraPriceLine(
      extraId,
      nameSnapshot,
      input.quantity,
      input.unitPrice,
      input.totalPrice,
    );
  }

  toSnapshot(): BookingExtraPriceLineSnapshot {
    return {
      extraId: this.extraId,
      nameSnapshot: this.nameSnapshot,
      quantity: this.quantity,
      totalPrice: this.totalPrice.toSnapshot(),
      unitPrice: this.unitPrice.toSnapshot(),
    };
  }
}

function assertSameCurrency(money: Money, currency: Money["currency"]) {
  if (money.currency !== currency) {
    throw domainError(
      "BOOKING_PRICE_SNAPSHOT_INVALID",
      "Booking price currencies must match.",
    );
  }
}

function normalizeText(value: string) {
  return value.trim().replace(/\s+/g, " ");
}
