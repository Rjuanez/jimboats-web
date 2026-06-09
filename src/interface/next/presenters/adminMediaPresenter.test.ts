import { afterEach, describe, expect, it, vi } from "vitest";

import type { AdminExperiencesWorkspaceDto } from "@/modules/experience-catalog/application/AdminExperienceDtos";
import type { AdminExtrasWorkspaceDto } from "@/modules/experience-catalog/application/AdminExtraDtos";
import type { AdminMediaListDto } from "@/modules/media-library/application/AdminMediaDtos";

import { presentAdminMediaList } from "./adminMediaPresenter";

describe("admin media presenter", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("maps application media assets into admin page data", () => {
    vi.stubEnv("PUBLIC_SITE_URL", "https://jimboatscharter.com/");

    const pageData = presentAdminMediaList({
      assets: [
        {
          altText: {
            en: "Private sunset charter in Barcelona.",
          },
          collection: "EXPERIENCES",
          createdAt: "2026-06-01T10:00:00.000Z",
          failureReason: null,
          id: "asset-sunset",
          missingAltLocales: ["es", "ca"],
          original: {
            dimensions: {
              height: 900,
              width: 1200,
            },
            fileSizeBytes: 1_500_000,
            filename: "sunset.jpg",
            hash: "1234567890abcdef",
            mimeType: "image/jpeg",
            privatePath: "/var/lib/jimboats/media/originals/sunset.jpg",
          },
          primaryVariant: {
            dimensions: {
              height: 600,
              width: 800,
            },
            fileSizeBytes: 120_000,
            format: "webp",
            hash: "abcdef1234567890",
            id: "800w",
            publicPath: "/media/experiences/sunset-800.webp",
            publicUrl: "/media/experiences/sunset-800.webp",
          },
          status: "READY",
          title: "Sunset hero",
          updatedAt: "2026-06-01T10:05:00.000Z",
          variants: [
            {
              dimensions: {
                height: 600,
                width: 800,
              },
              fileSizeBytes: 120_000,
              format: "webp",
              hash: "abcdef1234567890",
              id: "800w",
              publicPath: "/media/experiences/sunset-800.webp",
              publicUrl: "/media/experiences/sunset-800.webp",
            },
          ],
        },
      ],
    } satisfies AdminMediaListDto);

    expect(pageData.assets[0]).toMatchObject({
      altText: {
        ca: "",
        en: "Private sunset charter in Barcelona.",
        es: "",
      },
      absolutePublicUrl:
        "https://jimboatscharter.com/media/experiences/sunset-800.webp",
      collection: "Experiences",
      dimensions: "1200 x 900",
      filename: "sunset.jpg",
      hash: "12345678",
      publicUrl: "/media/experiences/sunset-800.webp",
      status: "ready",
      title: "Sunset hero",
    });
    expect(pageData.assets[0]?.variants[0]).toMatchObject({
      dimensions: "800 x 600",
      publicUrl: "/media/experiences/sunset-800.webp",
      status: "ready",
    });
  });

  it("adds real experience usage from the admin experiences workspace", () => {
    const pageData = presentAdminMediaList(
      mediaListFixture("asset-sunset"),
      experiencesWorkspaceFixture("asset-sunset"),
    );

    expect(pageData.assets[0]?.usage).toEqual([
      {
        href: "/admin/experiences/sunset-private-cruise/media",
        id: "sunset-private-cruise",
        label: "Sunset Private Cruise",
        type: "experience",
      },
    ]);
  });

  it("adds real extra usage from the admin extras workspace", () => {
    const pageData = presentAdminMediaList(
      mediaListFixture("asset-champagne"),
      undefined,
      extrasWorkspaceFixture("asset-champagne"),
    );

    expect(pageData.assets[0]?.usage).toEqual([
      {
        href: "/admin/extras/premium-champagne",
        id: "premium-champagne",
        label: "Premium champagne",
        type: "extra",
      },
    ]);
  });
});

function mediaListFixture(assetId: string): AdminMediaListDto {
  return {
    assets: [
      {
        altText: {
          en: "Private sunset charter in Barcelona.",
        },
        collection: "EXPERIENCES",
        createdAt: "2026-06-01T10:00:00.000Z",
        failureReason: null,
        id: assetId,
        missingAltLocales: ["es", "ca"],
        original: {
          dimensions: {
            height: 900,
            width: 1200,
          },
          fileSizeBytes: 1_500_000,
          filename: "sunset.jpg",
          hash: "1234567890abcdef",
          mimeType: "image/jpeg",
          privatePath: "/var/lib/jimboats/media/originals/sunset.jpg",
        },
        primaryVariant: {
          dimensions: {
            height: 600,
            width: 800,
          },
          fileSizeBytes: 120_000,
          format: "webp",
          hash: "abcdef1234567890",
          id: "800w",
          publicPath: "/media/experiences/sunset-800.webp",
          publicUrl: "/media/experiences/sunset-800.webp",
        },
        status: "READY",
        title: "Sunset hero",
        updatedAt: "2026-06-01T10:05:00.000Z",
        variants: [
          {
            dimensions: {
              height: 600,
              width: 800,
            },
            fileSizeBytes: 120_000,
            format: "webp",
            hash: "abcdef1234567890",
            id: "800w",
            publicPath: "/media/experiences/sunset-800.webp",
            publicUrl: "/media/experiences/sunset-800.webp",
          },
        ],
      },
    ],
  };
}

function experiencesWorkspaceFixture(
  assetId: string,
): AdminExperiencesWorkspaceDto {
  return {
    experiences: [
      {
        experience: {
          allowsManualScheduling: true,
          basePrice: {
            amountMinor: 39000,
            currency: "EUR",
          },
          bufferMinutes: 30,
          capacity: 8,
          depositAmount: {
            amountMinor: 10000,
            currency: "EUR",
          },
          departurePort: "Port Olimpic, Barcelona",
          displayOrder: 1,
          durationMinutes: 120,
          extraSelectionRules: [],
          id: "sunset-private-cruise",
          includedItems: "",
          internalName: "Sunset Private Cruise",
          internalNotes: "",
          maximumAdvanceMonths: 6,
          media: {
            assetId,
            status: "READY",
          },
          minimumAdvanceMinutes: 60,
          publicationReadiness: {
            blockingIssues: [],
            score: 100,
            warnings: [],
          },
          slotPolicy: {
            fixedSlots: [
              {
                enabled: true,
                endMinutes: 12 * 60,
                id: "morning",
                label: "Morning",
                startMinutes: 10 * 60,
              },
            ],
            granularityMinutes: null,
            mode: "FIXED_SLOTS",
            operatingWindow: null,
            timeZone: "Europe/Madrid",
          },
          status: "DRAFT",
          type: "Private charter",
        },
        localizedContents: [],
      },
    ],
    extras: [],
    locales: ["en", "es", "ca"],
  };
}

function extrasWorkspaceFixture(assetId: string): AdminExtrasWorkspaceDto {
  return {
    extras: [
      {
        defaultNoticeMinutes: 24 * 60,
        id: "premium-champagne",
        name: "Premium champagne",
        price: {
          amountMinor: 9_000,
          currency: "EUR",
        },
        primaryMediaAssetId: assetId,
        status: "ACTIVE",
      },
    ],
  };
}
