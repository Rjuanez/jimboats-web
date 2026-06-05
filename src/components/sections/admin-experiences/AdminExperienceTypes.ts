import type { AdminNavItem } from "@/components/layout/AdminNavigation";

export type AdminLocaleCode = "ca" | "en" | "es";
export type AdminPublicationStatus =
  | "archived"
  | "draft"
  | "published"
  | "ready";
export type AdminTranslationStatus =
  | "draft"
  | "missing"
  | "needs_review"
  | "published"
  | "ready";
export type AdminSlotPolicyType =
  | "any_available"
  | "fixed_slots"
  | "manual_approval";
export type AdminMediaStatus = "failed" | "missing" | "processing" | "ready";
export type AdminExtraStatus = "active" | "archived" | "draft";

export type AdminExperienceFaq = {
  answer: string;
  id: string;
  question: string;
};

export type AdminExperienceTranslation = {
  altText: string;
  bring: string;
  cardSummary: string;
  canonical: string;
  faq: AdminExperienceFaq[];
  geoSummary: string;
  h1: string;
  included: string;
  indexing: "index" | "noindex";
  keyFacts: string;
  locale: AdminLocaleCode;
  longDescription: string;
  publicPageEnabled: boolean;
  seoDescription: string;
  seoTitle: string;
  slug: string;
  status: AdminTranslationStatus;
  title: string;
  visibleTerms: string;
};

export type AdminExperienceSlot = {
  enabled: boolean;
  endTime: string;
  id: string;
  label: string;
  startTime: string;
};

export type AdminFlexibleAvailability = {
  endTime: string;
  granularityMinutes: number;
  startTime: string;
};

export type AdminExtra = {
  defaultNoticeHours: number;
  defaultPrice: number;
  id: string;
  media: AdminExperienceMedia;
  name: string;
  requiresNotice: boolean;
  status: AdminExtraStatus;
};

export type AdminExperienceExtraConfig = {
  capacityReduction: number;
  enabled: boolean;
  extraId: string;
  limitPerBooking: number;
  noticeHours: number;
  priceOverride: number | null;
};

export type AdminExperienceMediaVariant = {
  publicUrl: string;
  width: number;
};

export type AdminExperienceMediaAssetOption = {
  assetId: string;
  collection: "Experiences" | "Extras" | "Gallery" | "Pages";
  filename: string;
  primaryImageUrl: string;
  status: AdminMediaStatus;
  title: string;
  variants: AdminExperienceMediaVariant[];
};

export type AdminExperienceMedia = {
  assetId: string | null;
  filename: string;
  primaryImageUrl: string;
  status: AdminMediaStatus;
  title: string;
  variants: AdminExperienceMediaVariant[];
};

export type AdminExperience = {
  allowManualScheduling: boolean;
  basePrice: number;
  bufferMinutes: number;
  capacity: number;
  cancellationPolicyId?: string | null;
  depositAmount: number;
  departurePort: string;
  displayOrder: number;
  durationMinutes: number;
  extras: AdminExperienceExtraConfig[];
  flexibleAvailability: AdminFlexibleAvailability;
  id: string;
  includedInternal: string;
  internalName: string;
  internalNotes: string;
  maxAdvanceMonths: number;
  media: AdminExperienceMedia;
  minAdvanceHours: number;
  slotPolicyType: AdminSlotPolicyType;
  slots: AdminExperienceSlot[];
  status: AdminPublicationStatus;
  translations: Record<AdminLocaleCode, AdminExperienceTranslation>;
  type: string;
};

export type AdminExperiencesState = {
  cancellationPolicies?: AdminCancellationPolicyOption[];
  experiences: AdminExperience[];
  extras: AdminExtra[];
  locales: AdminLocaleCode[];
  mediaAssets: AdminExperienceMediaAssetOption[];
};

export type AdminCancellationPolicyOption = {
  activeVersion: number | null;
  id: string;
  isDefault: boolean;
  name: string;
  summary: string;
};

export type AdminExperiencesPageData = {
  navItems: AdminNavItem[];
  state: AdminExperiencesState;
};

export type AdminExperienceActionResult<TData = undefined> =
  | {
      data: TData;
      ok: true;
    }
  | {
      message: string;
      ok: false;
    };

export type AdminExperienceCreateInput = {
  basePrice: number;
  capacity: number;
  durationMinutes: number;
  internalName: string;
  type: string;
};

export type AdminExperienceActions = {
  archiveExperience: (input: { experienceId: string }) => Promise<
    AdminExperienceActionResult<{
      state: AdminExperiencesState;
    }>
  >;
  createExperience: (input: AdminExperienceCreateInput) => Promise<
    AdminExperienceActionResult<{
      experienceId: string;
      state: AdminExperiencesState;
    }>
  >;
  duplicateExperience: (input: { experienceId: string }) => Promise<
    AdminExperienceActionResult<{
      experienceId: string;
      state: AdminExperiencesState;
    }>
  >;
  saveExperience: (experience: AdminExperience) => Promise<
    AdminExperienceActionResult<{
      state: AdminExperiencesState;
    }>
  >;
};

export type AdminExperienceView =
  | "availability"
  | "cancellation"
  | "content"
  | "create"
  | "extras"
  | "list"
  | "media"
  | "overview"
  | "publish";

export type AdminExperienceReadiness = {
  blockingIssues: string[];
  score: number;
  warnings: string[];
};

export type AdminExperienceMutation = (
  updater: (experience: AdminExperience) => AdminExperience,
) => void;
