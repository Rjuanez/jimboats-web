import type { MarketingImage } from "@/components/marketing/MarketingImageFrame";
import type { PublicLocale } from "@/i18n/locales";

export type PublicBookingStepId =
  | "experience"
  | "extras"
  | "payment"
  | "confirmation";

export type PublicBookingStep = {
  id: PublicBookingStepId;
  label: string;
};

export type PublicBookingExperience = {
  badge?: string;
  capacity: number;
  cancellationPolicySummary?: string;
  description: string;
  depositAmount: number;
  durationLabel: string;
  id: string;
  image: MarketingImage;
  price: number;
  title: string;
};

export type PublicBookingCalendar = {
  days: readonly PublicBookingCalendarDay[];
  monthLabel: string;
  months?: readonly PublicBookingCalendarMonth[];
  nextMonthLabel?: string;
  previousMonthLabel?: string;
  selectAvailableDateLabel?: string;
  weekdays: readonly string[];
};

export type PublicBookingCalendarMonth = {
  days: readonly PublicBookingCalendarDay[];
  id: string;
  monthLabel: string;
};

export type PublicBookingCalendarDay = {
  ariaLabel: string;
  dateLabel: string;
  dayLabel: string;
  disabled?: boolean;
  id: string;
};

export type PublicBookingTimeSlot = {
  available: boolean;
  availableExtraIds: readonly string[];
  endTime: string;
  id: string;
  label: string;
  slotKey: string | null;
  startTime: string;
};

export type PublicBookingExtra = {
  description: string;
  id: string;
  image: MarketingImage;
  notice?: string;
  price: number;
  title: string;
};

export type PublicBookingCustomer = {
  email: string;
  fullName: string;
  phone: string;
};

export type PublicBookingConsents = {
  marketing: boolean;
  ticketEmail: boolean;
  ticketWhatsapp: boolean;
};

export type PublicBookingCheckoutInput = {
  consents: PublicBookingConsents;
  couponCode?: string | null;
  customer: PublicBookingCustomer;
  endTime: string;
  experienceId: string;
  guestCount: number;
  localDate: string;
  selectedExtras: readonly {
    extraId: string;
    quantity: number;
  }[];
  slotKey: string | null;
  startTime: string;
  locale: PublicLocale;
};

export type PublicBookingCouponPreviewInput = {
  code: string;
  depositAmountMinor: number;
  experienceId: string;
  subtotalAmountMinor: number;
};

export type PublicBookingCouponPreview = {
  code: string;
  depositAmount: number;
  discountAmount: number;
  remainingAmount: number;
  totalAmount: number;
};

export type PublicBookingCheckoutActionResult<TData> =
  | {
      data: TData;
      ok: true;
    }
  | {
      message: string;
      ok: false;
    };

export type PublicBookingActions = {
  previewCoupon(
    input: PublicBookingCouponPreviewInput,
  ): Promise<PublicBookingCheckoutActionResult<PublicBookingCouponPreview>>;
  startCheckout(
    input: PublicBookingCheckoutInput,
  ): Promise<
    PublicBookingCheckoutActionResult<{
      checkoutClientSecret: string;
      paymentProviderSessionId: string;
    }>
  >;
};

export type PublicBookingExperienceAvailability = {
  calendar: PublicBookingCalendar;
  timeSlotsByDate: Record<string, readonly PublicBookingTimeSlot[]>;
};

export type PublicBookingContent = {
  availabilityByExperienceId: Record<
    string,
    PublicBookingExperienceAvailability
  >;
  brand: string;
  bookHref: string;
  calendar: PublicBookingCalendar;
  confirmation: {
    bookingReference: string;
    subtitle: string;
    title: string;
  };
  currencySymbol: string;
  depositAmount: number;
  experiences: readonly PublicBookingExperience[];
  extras: readonly PublicBookingExtra[];
  extrasByExperienceId: Record<string, readonly PublicBookingExtra[]>;
  footerLinks: readonly {
    href: string;
    label: string;
  }[];
  homeHref: string;
  locale: PublicLocale;
  maxAdvanceLabel: string;
  payment: {
    depositCopy: string;
    secureCopy: string;
    subtitle: string;
    title: string;
  };
  policies: {
    cancellation: string;
    meetingPoint: string;
    remainingPayment: string;
  };
  steps: readonly PublicBookingStep[];
  support: {
    email: string;
    phone: string;
  };
  timeSlots: readonly PublicBookingTimeSlot[];
};
