export type PublicSelectedBookingExtraCommand = {
  extraId: string;
  quantity: number;
};

export type PublicBookingNotificationConsentCommand = {
  marketing: boolean;
  ticketEmail: boolean;
  ticketWhatsapp: boolean;
};

export type CreatePublicBookingCheckoutCommand = {
  consents: PublicBookingNotificationConsentCommand;
  customer: {
    email: string;
    fullName: string;
    phone: string | null;
    preferredLocale: string;
  };
  endTime: string;
  experienceId: string;
  guestCount: number;
  localDate: string;
  selectedExtras: PublicSelectedBookingExtraCommand[];
  slotKey: string | null;
  startTime: string;
  returnUrl: string;
};

export type PublicBookingCheckoutDto = {
  bookingId: string;
  checkoutClientSecret: string;
  holdExpiresAt: string;
  paymentProviderSessionId: string;
  reference: string;
};

export type HandleDepositPaymentWebhookCommand = {
  rawBody: string;
  signature: string | null;
};

export type DepositPaymentWebhookResultDto = {
  action: "DUPLICATE" | "IGNORED" | "PROCESSED";
  bookingId: string | null;
  eventType: string;
};

export type GetPublicBookingCheckoutReturnQuery = {
  providerSessionId: string;
};

export type PublicBookingCheckoutReturnDto = {
  bookingId: string;
  customerEmail: string;
  experienceTitle: string;
  paidDepositAmount: number;
  reference: string;
  remainingAmount: number;
  status:
    | "CANCELLED"
    | "CONFIRMED"
    | "EXPIRED"
    | "PAYMENT_FAILED"
    | "PENDING_PAYMENT";
};
