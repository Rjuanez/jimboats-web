import type { BookingCancellationPolicySnapshot } from "../../domain/CancellationPolicy";

export type BookingAccessTokenWriteModel = {
  accessPath: string;
  algorithm: "SHA256";
  bookingId: string;
  expiresAt: Date | null;
  id: string;
  issuedAt: Date;
  status: "ACTIVE";
  tokenHash: string;
};

export type BuyerBookingAccessExtraReadModel = {
  name: string;
  quantity: number;
  totalAmountMinor: number;
  totalCurrency: string;
};

export type BuyerBookingAccessReadModel = {
  accessToken: {
    expiresAt: Date | null;
    id: string;
    status: "ACTIVE" | "EXPIRED" | "REVOKED";
  };
  booking: {
    cancellationPolicySnapshot: BookingCancellationPolicySnapshot | null;
    cashRemainingAmountMinor: number;
    cashRemainingCurrency: string;
    confirmedAt: Date | null;
    customerEmail: string;
    customerLocale: string;
    customerName: string;
    customerPhone: string | null;
    depositAmountMinor: number;
    depositCurrency: string;
    experienceName: string;
    guestCount: number;
    reference: string;
    selectedEndMinutes: number;
    selectedLocalDate: string;
    selectedStartMinutes: number;
    status:
      | "CANCELLED"
      | "CONFIRMED"
      | "EXPIRED"
      | "PAYMENT_FAILED"
      | "PENDING_PAYMENT";
    timeZone: string;
    totalAmountMinor: number;
    totalCurrency: string;
  };
  extras: BuyerBookingAccessExtraReadModel[];
};

export type BookingAccessRepository = {
  findByReferenceAndTokenHash(input: {
    reference: string;
    tokenHash: string;
  }): Promise<BuyerBookingAccessReadModel | null>;
  markAccessed(input: { accessTokenId: string; accessedAt: Date }): Promise<void>;
  saveAccessToken(token: BookingAccessTokenWriteModel): Promise<void>;
};
