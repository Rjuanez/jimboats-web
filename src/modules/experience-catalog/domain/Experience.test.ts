import { describe, expect, it } from "vitest";

import { DomainError } from "@/shared/domain/DomainError";
import { LocaleCode } from "@/shared/domain/LocaleCode";
import { Money } from "@/shared/domain/Money";
import { Slug } from "@/shared/domain/Slug";
import { TimeRange } from "@/shared/domain/TimeRange";
import { LocalizedExperienceContent } from "@/modules/localization-seo/domain/LocalizedExperienceContent";

import { Experience } from "./Experience";
import { Extra } from "./Extra";
import { ExtraSelectionRule } from "./ExtraSelectionRule";
import { SlotPolicy } from "./SlotPolicy";

describe("Experience", () => {
  it("publishes when commercial, media, slot, extra and locale rules are ready", () => {
    const experience = createExperience();
    const published = experience.publish({
      localizedContents: [createLocalizedContent()],
      selectableExtras: [createExtra()],
    });

    expect(published.status).toBe("PUBLISHED");
  });

  it("reports missing publishable locale as blocking issue", () => {
    const readiness = createExperience().getPublicationReadiness({
      localizedContents: [],
      selectableExtras: [createExtra()],
    });

    expect(readiness.blockingIssues).toContain(
      "At least one public locale must be publishable.",
    );
  });

  it("does not publish without ready primary media", () => {
    const experience = createExperience({
      media: {
        assetId: "asset-sunset",
        status: "PROCESSING",
      },
    });

    expect(() =>
      experience.publish({
        localizedContents: [createLocalizedContent()],
        selectableExtras: [createExtra()],
      }),
    ).toThrow(DomainError);
  });

  it("blocks publication when an enabled extra is archived", () => {
    const readiness = createExperience().getPublicationReadiness({
      localizedContents: [createLocalizedContent()],
      selectableExtras: [
        Extra.create({
          defaultNoticeMinutes: 0,
          id: "premium-champagne",
          name: "Premium champagne",
          price: Money.create({ amountMinor: 9_000, currency: "EUR" }),
          status: "ARCHIVED",
        }),
      ],
    });

    expect(readiness.blockingIssues).toContain(
      "Enabled extra premium-champagne is not selectable.",
    );
  });

  it("warns when the launch deposit is not EUR 100", () => {
    const readiness = createExperience({
      depositAmount: Money.create({ amountMinor: 20_000, currency: "EUR" }),
    }).getPublicationReadiness({
      localizedContents: [createLocalizedContent()],
      selectableExtras: [createExtra()],
    });

    expect(readiness.warnings).toContain(
      "Launch deposit is expected to be EUR 100.",
    );
  });

  it("rejects invalid core configuration", () => {
    expect(() =>
      createExperience({
        capacity: 0,
      }),
    ).toThrow(DomainError);
  });

  it("rejects admin booking configuration outside launch limits", () => {
    expect(() =>
      createExperience({
        maximumAdvanceMonths: 7,
      }),
    ).toThrow(DomainError);
  });

  it("updates core configuration through domain construction", () => {
    const updated = createExperience().withCoreConfiguration({
      departurePort: "Marina Vela, Barcelona",
      durationMinutes: 180,
      internalName: "Sunset Celebration",
      internalNotes: "Staff should confirm the meeting point.",
      type: "Celebration charter",
    });

    expect(updated.toSnapshot()).toMatchObject({
      departurePort: "Marina Vela, Barcelona",
      durationMinutes: 180,
      internalName: "Sunset Celebration",
      internalNotes: "Staff should confirm the meeting point.",
      type: "Celebration charter",
    });
  });

  it("updates availability, extras and media without mutating the original", () => {
    const original = createExperience();
    const updated = original
      .withSlotPolicy(
        SlotPolicy.anyAvailable({
          granularityMinutes: 30,
          operatingWindow: TimeRange.fromLocalTimes("10:00", "20:00"),
          timeZone: "Europe/Madrid",
        }),
      )
      .withExtraSelectionRules([
        ExtraSelectionRule.create({
          enabled: true,
          extraId: "photo-session",
          limitPerBooking: 1,
          noticeMinutes: 24 * 60,
        }),
      ])
      .withMedia({
        assetId: "asset-photo",
        status: "PROCESSING",
      });

    expect(original.toSnapshot()).toMatchObject({
      media: {
        assetId: "asset-sunset",
        status: "READY",
      },
      slotPolicy: {
        mode: "FIXED_SLOTS",
      },
    });
    expect(updated.toSnapshot()).toMatchObject({
      extraSelectionRules: [
        {
          extraId: "photo-session",
          noticeMinutes: 1440,
        },
      ],
      media: {
        assetId: "asset-photo",
        status: "PROCESSING",
      },
      slotPolicy: {
        mode: "ANY_AVAILABLE",
      },
    });
  });

  it("duplicates an experience as a draft with a new identity", () => {
    const duplicated = createExperience().duplicate({
      id: "sunset-copy",
      internalName: "Sunset Copy",
    });

    expect(duplicated.toSnapshot()).toMatchObject({
      id: "sunset-copy",
      internalName: "Sunset Copy",
      status: "DRAFT",
    });
  });
});

function createExperience(
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
        enabled: true,
        extraId: "premium-champagne",
        limitPerBooking: 4,
        noticeMinutes: 0,
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

function createExtra() {
  return Extra.create({
    defaultNoticeMinutes: 0,
    id: "premium-champagne",
    name: "Premium champagne",
    price: Money.create({ amountMinor: 9_000, currency: "EUR" }),
    status: "ACTIVE",
  });
}

function createLocalizedContent() {
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
