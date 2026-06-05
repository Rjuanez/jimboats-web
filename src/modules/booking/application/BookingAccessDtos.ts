import type { BookingCancellationPolicySnapshot } from "../domain/CancellationPolicy";

export type BuyerBookingDto = {
  cancellationPolicy: BookingCancellationPolicySnapshot | null;
  customer: {
    email: string;
    fullName: string;
    phone: string | null;
  };
  experienceTitle: string;
  extras: Array<{
    name: string;
    quantity: number;
    totalAmount: number;
  }>;
  guestCount: number;
  payment: {
    depositAmount: number;
    remainingAmount: number;
    totalAmount: number;
  };
  reference: string;
  selectedSlot: {
    date: string;
    endTime: string;
    startTime: string;
    timeZone: string;
  };
  status:
    | "CANCELLED"
    | "CONFIRMED"
    | "EXPIRED"
    | "PAYMENT_FAILED"
    | "PENDING_PAYMENT";
};

export type ViewBookingByAccessTokenQuery = {
  accessToken: string;
  reference: string;
};
