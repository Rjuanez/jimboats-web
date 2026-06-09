import type { MoneySnapshot } from "@/shared/domain/Money";
import type { SupportedLocaleCode } from "@/shared/domain/LocaleCode";

export type PublicBookingMediaVariantDto = {
  height: number;
  publicPath: string;
  width: number;
};

export type PublicBookingMediaDto = {
  altText: string;
  status: "FAILED" | "MISSING" | "PROCESSING" | "READY";
  variants: PublicBookingMediaVariantDto[];
};

export type PublicBookingExperienceDto = {
  basePrice: MoneySnapshot;
  capacity: number;
  cancellationPolicySummary: string;
  depositAmount: MoneySnapshot;
  description: string;
  durationMinutes: number;
  id: string;
  media: PublicBookingMediaDto;
  title: string;
};

export type PublicBookingExtraDto = {
  description: string;
  id: string;
  media: PublicBookingMediaDto;
  noticeMinutes: number;
  price: MoneySnapshot;
  title: string;
};

export type PublicBookingCalendarDayDto = {
  available: boolean;
  localDate: string;
};

export type PublicBookingTimeSlotDto = {
  available: boolean;
  availableExtraIds: string[];
  endMinutes: number;
  id: string;
  label: string;
  slotKey: string | null;
  startMinutes: number;
};

export type PublicBookingExperienceAvailabilityDto = {
  days: PublicBookingCalendarDayDto[];
  timeSlotsByDate: Record<string, PublicBookingTimeSlotDto[]>;
};

export type PublicBookingPageDto = {
  availabilityByExperienceId: Record<
    string,
    PublicBookingExperienceAvailabilityDto
  >;
  defaultDepositAmount: MoneySnapshot;
  endLocalDate: string;
  experiences: PublicBookingExperienceDto[];
  extrasByExperienceId: Record<string, PublicBookingExtraDto[]>;
  locale: SupportedLocaleCode;
  startLocalDate: string;
};

export type GetPublicBookingAvailabilityQuery = {
  experienceId: string;
  locale: string;
};

export type GetPublicBookingPageQuery = {
  includeAvailability?: boolean;
  locale: string;
};
