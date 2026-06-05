import type { MoneySnapshot } from "@/shared/domain/Money";
import type { SupportedLocaleCode } from "@/shared/domain/LocaleCode";

import type { BookingSlotPolicyReadModel } from "./BookingRepository";

export type PublicBookingCatalogMediaVariantReadModel = {
  height: number;
  publicPath: string;
  width: number;
};

export type PublicBookingCatalogMediaReadModel = {
  altText: Partial<Record<SupportedLocaleCode, string>>;
  status: "FAILED" | "PROCESSING" | "READY";
  variants: PublicBookingCatalogMediaVariantReadModel[];
};

export type PublicBookingCatalogExtraReadModel = {
  capacityReduction: number;
  description: string;
  enabled: boolean;
  id: string;
  limitPerBooking: number;
  media: PublicBookingCatalogMediaReadModel | null;
  name: string;
  noticeMinutes: number;
  price: MoneySnapshot;
  priceOverride: MoneySnapshot | null;
  status: "ACTIVE" | "ARCHIVED" | "DRAFT";
};

export type PublicBookingCatalogExperienceReadModel = {
  basePrice: MoneySnapshot;
  bufferMinutes: number;
  capacity: number;
  cancellationPolicySummary?: string;
  depositAmount: MoneySnapshot;
  description: string;
  displayOrder: number;
  durationMinutes: number;
  extras: PublicBookingCatalogExtraReadModel[];
  id: string;
  internalName: string;
  maximumAdvanceMonths: number;
  media: PublicBookingCatalogMediaReadModel | null;
  minimumAdvanceMinutes: number;
  slotPolicy: BookingSlotPolicyReadModel;
  title: string;
};

export type PublicBookingCalendarBlockReadModel = {
  id: string;
  protectedEndAt: Date;
  protectedStartAt: Date;
};

export type PublicBookingCatalogReader = {
  listActiveCalendarBlocks(input: {
    from: Date;
    to: Date;
  }): Promise<PublicBookingCalendarBlockReadModel[]>;
  listBookableExperiences(input: {
    locale: SupportedLocaleCode;
  }): Promise<PublicBookingCatalogExperienceReadModel[]>;
};
