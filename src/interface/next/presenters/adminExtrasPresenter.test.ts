import { describe, expect, it } from "vitest";

import type { AdminExtrasWorkspaceDto } from "@/modules/experience-catalog/application/AdminExtraDtos";
import type { AdminMediaListDto } from "@/modules/media-library/application/AdminMediaDtos";

import { presentAdminExtrasWorkspace } from "./adminExtrasPresenter";

describe("adminExtrasPresenter", () => {
  it("presents extras with their media assets", () => {
    const state = presentAdminExtrasWorkspace(
      {
        extras: [
          {
            defaultNoticeMinutes: 24 * 60,
            id: "premium-champagne",
            name: "Premium champagne",
            price: {
              amountMinor: 9_000,
              currency: "EUR",
            },
            primaryMediaAssetId: "asset-champagne",
            status: "ACTIVE",
          },
        ],
      },
      mediaListFixture(),
    );

    expect(state.extras[0]).toMatchObject({
      defaultNoticeHours: 24,
      media: {
        assetId: "asset-champagne",
        primaryImageUrl: "/media/extras/champagne-720.webp",
        status: "ready",
      },
      price: 90,
      status: "active",
    });
    expect(state.mediaAssets).toHaveLength(1);
  });

  it("uses a stable missing media state when the asset is not available", () => {
    const state = presentAdminExtrasWorkspace(workspaceFixture());

    expect(state.extras[0].media).toMatchObject({
      assetId: "asset-champagne",
      primaryImageUrl: "",
      status: "missing",
    });
  });
});

function workspaceFixture(): AdminExtrasWorkspaceDto {
  return {
    extras: [
      {
        defaultNoticeMinutes: 0,
        id: "premium-champagne",
        name: "Premium champagne",
        price: {
          amountMinor: 9_000,
          currency: "EUR",
        },
        primaryMediaAssetId: "asset-champagne",
        status: "ACTIVE",
      },
    ],
  };
}

function mediaListFixture(): AdminMediaListDto {
  return {
    assets: [
      {
        altText: {
          en: "Premium champagne served on a private boat.",
        },
        collection: "EXTRAS",
        createdAt: "2026-06-01T10:00:00.000Z",
        failureReason: null,
        id: "asset-champagne",
        missingAltLocales: ["ca", "es"],
        original: {
          dimensions: {
            height: 720,
            width: 720,
          },
          fileSizeBytes: 200_000,
          filename: "champagne.jpg",
          hash: "hash-champagne",
          mimeType: "image/jpeg",
          privatePath: "/private/champagne.jpg",
        },
        primaryVariant: {
          dimensions: {
            height: 720,
            width: 720,
          },
          fileSizeBytes: 80_000,
          format: "webp",
          hash: "hash-champagne-720",
          id: "variant-720",
          publicPath: "/var/lib/jimboats/media/public/extras/champagne.webp",
          publicUrl: "/media/extras/champagne-720.webp",
        },
        status: "READY",
        title: "Premium champagne",
        updatedAt: "2026-06-01T10:05:00.000Z",
        variants: [],
      },
    ],
  };
}
