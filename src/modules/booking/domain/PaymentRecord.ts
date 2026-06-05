import { domainError } from "@/shared/domain/DomainError";
import type { Money } from "@/shared/domain/Money";
import type { MoneySnapshot } from "@/shared/domain/Money";

export type PaymentRecordStatus =
  | "CANCELLED"
  | "FAILED"
  | "MANUALLY_PAID"
  | "PARTIALLY_REFUNDED"
  | "PENDING"
  | "REFUNDED"
  | "SUCCEEDED";

export type PaymentRecordProps = {
  amount: Money;
  bookingId: string;
  createdAt: Date;
  failureReason: string | null;
  id: string;
  paidAt: Date | null;
  provider: string;
  providerPaymentIntentId: string | null;
  providerSessionId: string | null;
  status: PaymentRecordStatus;
};

export type PaymentRecordSnapshot = {
  amount: MoneySnapshot;
  bookingId: string;
  createdAt: string;
  failureReason: string | null;
  id: string;
  paidAt: string | null;
  provider: string;
  providerPaymentIntentId: string | null;
  providerSessionId: string | null;
  status: PaymentRecordStatus;
};

const supportedStatuses = new Set<PaymentRecordStatus>([
  "PENDING",
  "SUCCEEDED",
  "MANUALLY_PAID",
  "FAILED",
  "CANCELLED",
  "REFUNDED",
  "PARTIALLY_REFUNDED",
]);

export class PaymentRecord {
  private constructor(private readonly props: PaymentRecordProps) {}

  static create(input: PaymentRecordProps) {
    const id = input.id.trim();
    const bookingId = input.bookingId.trim();
    const provider = input.provider.trim();
    const failureReason = input.failureReason?.trim() || null;
    const providerPaymentIntentId =
      input.providerPaymentIntentId?.trim() || null;
    const providerSessionId = input.providerSessionId?.trim() || null;

    if (!id || !bookingId || !provider) {
      throw domainError(
        "BOOKING_PAYMENT_RECORD_INVALID",
        "Payment record requires id, booking id and provider.",
      );
    }

    if (!supportedStatuses.has(input.status)) {
      throw domainError(
        "BOOKING_PAYMENT_RECORD_INVALID",
        "Payment record status is invalid.",
      );
    }

    if (Number.isNaN(input.createdAt.getTime())) {
      throw domainError(
        "BOOKING_PAYMENT_RECORD_INVALID",
        "Payment record creation date is invalid.",
      );
    }

    if (input.paidAt && Number.isNaN(input.paidAt.getTime())) {
      throw domainError(
        "BOOKING_PAYMENT_RECORD_INVALID",
        "Payment record paid date is invalid.",
      );
    }

    return new PaymentRecord({
      ...input,
      bookingId,
      failureReason,
      id,
      provider,
      providerPaymentIntentId,
      providerSessionId,
    });
  }

  static createManualDeposit(input: {
    amount: Money;
    bookingId: string;
    createdAt: Date;
    id: string;
    paidAt: Date;
  }) {
    return PaymentRecord.create({
      amount: input.amount,
      bookingId: input.bookingId,
      createdAt: input.createdAt,
      failureReason: null,
      id: input.id,
      paidAt: input.paidAt,
      provider: "MANUAL",
      providerPaymentIntentId: null,
      providerSessionId: null,
      status: "MANUALLY_PAID",
    });
  }

  static createStripePendingDeposit(input: {
    amount: Money;
    bookingId: string;
    createdAt: Date;
    id: string;
  }) {
    return PaymentRecord.create({
      amount: input.amount,
      bookingId: input.bookingId,
      createdAt: input.createdAt,
      failureReason: null,
      id: input.id,
      paidAt: null,
      provider: "STRIPE",
      providerPaymentIntentId: null,
      providerSessionId: null,
      status: "PENDING",
    });
  }

  get id() {
    return this.props.id;
  }

  withCheckoutSession(input: { providerSessionId: string }) {
    return PaymentRecord.create({
      ...this.props,
      providerSessionId: input.providerSessionId,
    });
  }

  markSucceeded(input: {
    paidAt: Date;
    providerPaymentIntentId: string | null;
    providerSessionId: string;
  }) {
    return PaymentRecord.create({
      ...this.props,
      failureReason: null,
      paidAt: input.paidAt,
      providerPaymentIntentId: input.providerPaymentIntentId,
      providerSessionId: input.providerSessionId,
      status: "SUCCEEDED",
    });
  }

  markFailed(input: {
    failureReason: string;
    providerPaymentIntentId?: string | null;
    providerSessionId: string;
  }) {
    return PaymentRecord.create({
      ...this.props,
      failureReason: input.failureReason,
      paidAt: null,
      providerPaymentIntentId:
        input.providerPaymentIntentId ?? this.props.providerPaymentIntentId,
      providerSessionId: input.providerSessionId,
      status: "FAILED",
    });
  }

  markCancelled(input: {
    failureReason: string;
    providerPaymentIntentId?: string | null;
    providerSessionId: string;
  }) {
    return PaymentRecord.create({
      ...this.props,
      failureReason: input.failureReason,
      paidAt: null,
      providerPaymentIntentId:
        input.providerPaymentIntentId ?? this.props.providerPaymentIntentId,
      providerSessionId: input.providerSessionId,
      status: "CANCELLED",
    });
  }

  toSnapshot(): PaymentRecordSnapshot {
    return {
      amount: this.props.amount.toSnapshot(),
      bookingId: this.props.bookingId,
      createdAt: this.props.createdAt.toISOString(),
      failureReason: this.props.failureReason,
      id: this.props.id,
      paidAt: this.props.paidAt?.toISOString() ?? null,
      provider: this.props.provider,
      providerPaymentIntentId: this.props.providerPaymentIntentId,
      providerSessionId: this.props.providerSessionId,
      status: this.props.status,
    };
  }
}
