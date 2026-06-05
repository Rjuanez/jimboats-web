import { describe, expect, it } from "vitest";

import { LocaleCode } from "@/shared/domain/LocaleCode";
import { Money } from "@/shared/domain/Money";
import { Slug } from "@/shared/domain/Slug";
import { TimeRange } from "@/shared/domain/TimeRange";
import { LocalizedExperienceContent } from "@/modules/localization-seo/domain/LocalizedExperienceContent";
import { Experience } from "@/modules/experience-catalog/domain/Experience";
import { Extra } from "@/modules/experience-catalog/domain/Extra";
import { ExtraSelectionRule } from "@/modules/experience-catalog/domain/ExtraSelectionRule";
import { SlotPolicy } from "@/modules/experience-catalog/domain/SlotPolicy";

import {
  experienceFromPrismaRecord,
  experienceToPrismaWriteModel,
  extraFromPrismaRecord,
  extraToPrismaWriteModel,
} from "./PrismaExperienceCatalogMappers";
import {
  localizedExperienceContentFromPrismaRecord,
  localizedExperienceContentToPrismaWriteModel,
} from "./PrismaLocalizedExperienceContentMappers";
import type { PrismaExperienceRecord } from "./PrismaExperienceRepository";
import type { PrismaLocalizedExperienceContentRecord } from "./PrismaLocalizedExperienceContentMappers";

describe("Prisma experience catalog mappers", () => {
  it("maps an experience record into the domain model", () => {
    const experience = experienceFromPrismaRecord(experienceRecord());

    expect(experience.toSnapshot()).toMatchObject({
      basePrice: {
        amountMinor: 29_000,
        currency: "EUR",
      },
      bufferMinutes: 30,
      departurePort: "Port Olimpic, Barcelona",
      displayOrder: 1,
      extraSelectionRules: [
        {
          capacityReduction: 1,
          extraId: "premium-champagne",
          limitPerBooking: 4,
          priceOverride: {
            amountMinor: 8_500,
            currency: "EUR",
          },
        },
      ],
      media: {
        assetId: "asset-sunset",
        status: "READY",
      },
      slotPolicy: {
        fixedSlots: [
          {
            id: "sunset-1800",
            startMinutes: 18 * 60,
          },
        ],
        mode: "FIXED_SLOTS",
      },
    });
  });

  it("maps flexible slot policy persistence into the domain model", () => {
    const experience = experienceFromPrismaRecord(
      experienceRecord({
        fixedSlots: [],
        slotGranularityMinutes: 15,
        slotOperatingEndMinutes: 18 * 60,
        slotOperatingStartMinutes: 9 * 60,
        slotPolicyMode: "ANY_AVAILABLE",
      }),
    );

    expect(experience.toSnapshot().slotPolicy).toMatchObject({
      granularityMinutes: 15,
      fixedSlots: [],
      mode: "ANY_AVAILABLE",
      operatingWindow: {
        endMinutes: 18 * 60,
        startMinutes: 9 * 60,
      },
    });
  });

  it("maps an experience domain model into persistence write data", () => {
    const writeModel = experienceToPrismaWriteModel(createExperience());

    expect(writeModel).toMatchObject({
      experience: {
        bufferMinutes: 30,
        departurePort: "Port Olimpic, Barcelona",
        displayOrder: 1,
        primaryMediaAssetId: "asset-sunset",
        primaryMediaStatus: "READY",
        slotPolicyMode: "FIXED_SLOTS",
      },
      extraRules: [
        {
          capacityReduction: 1,
          extraId: "premium-champagne",
          id: "sunset-experience:extra:premium-champagne",
          priceOverrideAmountMinor: 8_500,
          priceOverrideCurrency: "EUR",
        },
      ],
      fixedSlots: [
        {
          id: "sunset-experience:slot:sunset-1800",
          slotKey: "sunset-1800",
        },
      ],
      id: "sunset-experience",
    });
  });

  it("maps flexible slot policy domain data into persistence write data", () => {
    const writeModel = experienceToPrismaWriteModel(
      createExperience({
        slotPolicy: SlotPolicy.anyAvailable({
          granularityMinutes: 15,
          operatingWindow: TimeRange.fromLocalTimes("09:00", "18:00"),
          timeZone: "Europe/Madrid",
        }),
      }),
    );

    expect(writeModel).toMatchObject({
      experience: {
        slotGranularityMinutes: 15,
        slotOperatingEndMinutes: 18 * 60,
        slotOperatingStartMinutes: 9 * 60,
        slotPolicyMode: "ANY_AVAILABLE",
      },
      fixedSlots: [],
    });
  });

  it("maps an extra record into the domain model", () => {
    const extra = extraFromPrismaRecord({
      defaultNoticeMinutes: 0,
      id: "premium-champagne",
      name: "Premium champagne",
      priceAmountMinor: 9_000,
      priceCurrency: "EUR",
      primaryMediaAssetId: "asset-champagne",
      status: "ACTIVE",
    });

    expect(extra.toSnapshot()).toMatchObject({
      id: "premium-champagne",
      price: {
        amountMinor: 9_000,
      },
      primaryMediaAssetId: "asset-champagne",
      status: "ACTIVE",
    });
  });

  it("maps an extra domain model into persistence write data", () => {
    const writeModel = extraToPrismaWriteModel(
      createExtra({ primaryMediaAssetId: "asset-champagne" }),
    );

    expect(writeModel).toMatchObject({
      id: "premium-champagne",
      name: "Premium champagne",
      priceAmountMinor: 9_000,
      primaryMediaAssetId: "asset-champagne",
      status: "ACTIVE",
    });
  });

  it("maps localized experience content both ways", () => {
    const content = localizedExperienceContentFromPrismaRecord(
      localizedContentRecord(),
    );
    const writeModel = localizedExperienceContentToPrismaWriteModel(
      "sunset-experience",
      createLocalizedContent(),
    );

    expect(content.isPublishable()).toBe(true);
    expect(content.toSnapshot()).toMatchObject({
      imageAltText:
        "Friends clinking drinks during a private sunset boat cruise in Barcelona.",
      locale: "en",
      slug: "private-sunset-boat-tour-barcelona",
      summary:
        "A private sunset cruise with skipper, drinks and Mediterranean views.",
    });
    expect(writeModel).toMatchObject({
      content: {
        experienceId: "sunset-experience",
        locale: "en",
        status: "READY",
      },
      faqItems: [
        {
          id: "sunset-experience:content:en:faq:0",
          position: 0,
        },
      ],
      id: "sunset-experience:content:en",
    });
  });
});

export function experienceRecord(
  patch: Partial<PrismaExperienceRecord> = {},
): PrismaExperienceRecord {
  return {
    allowsManualScheduling: true,
    basePriceAmountMinor: 29_000,
    basePriceCurrency: "EUR",
    bufferMinutes: 30,
    capacity: 8,
    depositAmountMinor: 10_000,
    depositCurrency: "EUR",
    departurePort: "Port Olimpic, Barcelona",
    displayOrder: 1,
    durationMinutes: 120,
    extraRules: [
      {
        capacityReduction: 1,
        enabled: true,
        extraId: "premium-champagne",
        id: "rule-premium-champagne",
        limitPerBooking: 4,
        noticeMinutes: 0,
        priceOverrideAmountMinor: 8_500,
        priceOverrideCurrency: "EUR",
        slotKey: null,
      },
    ],
    fixedSlots: [
      {
        enabled: true,
        endMinutes: 20 * 60,
        id: "slot-sunset-1800",
        label: "Sunset departure",
        position: 0,
        slotKey: "sunset-1800",
        startMinutes: 18 * 60,
      },
    ],
    id: "sunset-experience",
    includedItems: "Skipper, fuel and welcome drinks.",
    internalName: "Sunset Experience",
    internalNotes:
      "EUR 100 online deposit. Remaining amount paid in cash on board.",
    maximumAdvanceMonths: 6,
    primaryMediaAssetId: "asset-sunset",
    primaryMediaStatus: "READY",
    minimumAdvanceMinutes: 60,
    slotGranularityMinutes: null,
    slotOperatingEndMinutes: null,
    slotOperatingStartMinutes: null,
    slotPolicyMode: "FIXED_SLOTS",
    slotPolicyTimezone: "Europe/Madrid",
    status: "READY",
    type: "Private charter",
    ...patch,
  };
}

export function localizedContentRecord(
  patch: Partial<PrismaLocalizedExperienceContentRecord> = {},
): PrismaLocalizedExperienceContentRecord {
  return {
    bringText: "Comfortable clothes, swimwear and a light jacket.",
    experienceId: "sunset-experience",
    faqItems: [
      {
        answer:
          "The booking is confirmed with a EUR 100 online deposit and the rest is paid on board in cash.",
        id: "faq-deposit",
        position: 0,
        question: "How does the deposit work?",
      },
    ],
    geoSummary:
      "Private sunset boat tour in Barcelona with skipper and Port Olimpic departure.",
    h1: "Private sunset boat tour in Barcelona",
    id: "sunset-experience:content:en",
    imageAltText:
      "Friends clinking drinks during a private sunset boat cruise in Barcelona.",
    indexingPolicy: "INDEX",
    includedText: "Skipper, fuel, welcome drinks and light snacks.",
    keyFacts:
      "Private boat; Port Olimpic departure; EUR 100 deposit; cash remainder on board.",
    locale: "en",
    mainContent:
      "Enjoy Barcelona from the sea with a private skipper, drinks and sunset views.",
    publicPageEnabled: true,
    seoDescription:
      "Book a private sunset boat tour in Barcelona with skipper and drinks.",
    seoTitle: "Private Sunset Boat Tour in Barcelona | JimBoats",
    slug: "private-sunset-boat-tour-barcelona",
    status: "READY",
    summary:
      "A private sunset cruise with skipper, drinks and Mediterranean views.",
    title: "Private sunset boat tour",
    visibleTerms:
      "EUR 100 deposit online. Remaining amount paid on board in cash.",
    ...patch,
  };
}

export function createExperience(
  patch: Partial<Parameters<typeof Experience.create>[0]> = {},
) {
  return Experience.create({
    allowsManualScheduling: true,
    basePrice: Money.create({ amountMinor: 29_000, currency: "EUR" }),
    bufferMinutes: 30,
    capacity: 8,
    depositAmount: Money.create({ amountMinor: 10_000, currency: "EUR" }),
    departurePort: "Port Olimpic, Barcelona",
    displayOrder: 1,
    durationMinutes: 120,
    extraSelectionRules: [
      ExtraSelectionRule.create({
        capacityReduction: 1,
        enabled: true,
        extraId: "premium-champagne",
        limitPerBooking: 4,
        noticeMinutes: 0,
        priceOverride: Money.create({ amountMinor: 8_500, currency: "EUR" }),
      }),
    ],
    id: "sunset-experience",
    includedItems: "Skipper, fuel and welcome drinks.",
    internalName: "Sunset Experience",
    internalNotes:
      "EUR 100 online deposit. Remaining amount paid in cash on board.",
    maximumAdvanceMonths: 6,
    media: {
      assetId: "asset-sunset",
      status: "READY",
    },
    minimumAdvanceMinutes: 60,
    slotPolicy: SlotPolicy.fixedSlots({
      fixedSlots: [
        {
          enabled: true,
          id: "sunset-1800",
          label: "Sunset departure",
          range: TimeRange.fromLocalTimes("18:00", "20:00"),
        },
      ],
      timeZone: "Europe/Madrid",
    }),
    status: "READY",
    type: "Private charter",
    ...patch,
  });
}

function createExtra(patch: Partial<Parameters<typeof Extra.create>[0]> = {}) {
  return Extra.create({
    defaultNoticeMinutes: 0,
    id: "premium-champagne",
    name: "Premium champagne",
    price: Money.create({ amountMinor: 9_000, currency: "EUR" }),
    status: "ACTIVE",
    ...patch,
  });
}

export function createLocalizedContent() {
  return LocalizedExperienceContent.create({
    bringText: "Comfortable clothes, swimwear and a light jacket.",
    faqItems: [
      {
        answer:
          "The booking is confirmed with a EUR 100 online deposit and the rest is paid on board in cash.",
        question: "How does the deposit work?",
      },
    ],
    geoSummary:
      "Private sunset boat tour in Barcelona with skipper and Port Olimpic departure.",
    h1: "Private sunset boat tour in Barcelona",
    imageAltText:
      "Friends clinking drinks during a private sunset boat cruise in Barcelona.",
    indexingPolicy: "INDEX",
    includedText: "Skipper, fuel, welcome drinks and light snacks.",
    keyFacts:
      "Private boat; Port Olimpic departure; EUR 100 deposit; cash remainder on board.",
    locale: LocaleCode.create("en"),
    mainContent:
      "Enjoy Barcelona from the sea with a private skipper, drinks and sunset views.",
    publicPageEnabled: true,
    seoDescription:
      "Book a private sunset boat tour in Barcelona with skipper and drinks.",
    seoTitle: "Private Sunset Boat Tour in Barcelona | JimBoats",
    slug: Slug.create("private-sunset-boat-tour-barcelona"),
    status: "READY",
    summary:
      "A private sunset cruise with skipper, drinks and Mediterranean views.",
    title: "Private sunset boat tour",
    visibleTerms:
      "EUR 100 deposit online. Remaining amount paid on board in cash.",
  });
}
