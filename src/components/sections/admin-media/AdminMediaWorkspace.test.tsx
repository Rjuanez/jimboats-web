import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { getAdminMediaPreviewPage } from "@/interface/next/presenters/adminMediaPresenter";

import type { AdminMediaActions } from "./AdminMediaTypes";
import { AdminMediaWorkspace } from "./AdminMediaWorkspace";

describe("AdminMediaWorkspace", () => {
  it("renders the media library with preview assets", () => {
    const pageData = getAdminMediaPreviewPage();
    const actions = createActions(pageData);

    render(
      <AdminMediaWorkspace
        actions={actions}
        pageData={pageData}
        view="library"
      />,
    );

    expect(
      screen.getByRole("heading", { name: "Media library" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Upload media")).toBeInTheDocument();
    expect(screen.getByText("Home gallery")).toBeInTheDocument();
    expect(screen.getByText("Sunset Experience hero")).toBeInTheDocument();
    expect(screen.getByText("Morning Breeze cover")).toBeInTheDocument();
  });

  it("filters the media library by search query", async () => {
    const pageData = getAdminMediaPreviewPage();
    const actions = createActions(pageData);
    const user = userEvent.setup();

    render(
      <AdminMediaWorkspace
        actions={actions}
        pageData={pageData}
        view="library"
      />,
    );

    await user.type(screen.getByLabelText("Search media"), "cava");

    expect(screen.getByText("Premium cava extra")).toBeInTheDocument();
    expect(
      screen.queryByText("Sunset Experience hero"),
    ).not.toBeInTheDocument();
  });

  it("renders media detail metadata and variants", () => {
    const pageData = getAdminMediaPreviewPage();
    const actions = createActions(pageData);

    render(
      <AdminMediaWorkspace
        actions={actions}
        assetId="sunset-experience-hero"
        pageData={pageData}
        view="detail"
      />,
    );

    expect(
      screen.getByRole("heading", { name: "Sunset Experience hero" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Generated variants")).toBeInTheDocument();
    expect(screen.getByLabelText("EN alt text")).toHaveValue(
      "Private catamaran sailing at sunset in Barcelona.",
    );
    expect(
      screen.getByRole("img", {
        name: "Private catamaran sailing at sunset in Barcelona.",
      }),
    ).toHaveAttribute(
      "src",
      "/images/generated/landing/experience-sunset-toast-1024.webp",
    );
    expect(
      screen.getByRole("link", { name: /Sunset Experience/i }),
    ).toHaveAttribute("href", "/admin/experiences/sunset-experience");
  });

  it("renders an empty usage state when an asset is not linked", () => {
    const pageData = getAdminMediaPreviewPage();
    const unlinkedPageData = {
      ...pageData,
      assets: pageData.assets.map((asset) =>
        asset.id === "sunset-experience-hero"
          ? {
              ...asset,
              usage: [],
            }
          : asset,
      ),
    };
    const actions = createActions(unlinkedPageData);

    render(
      <AdminMediaWorkspace
        actions={actions}
        assetId="sunset-experience-hero"
        pageData={unlinkedPageData}
        view="detail"
      />,
    );

    expect(
      screen.getByText("No linked admin content yet."),
    ).toBeInTheDocument();
  });

  it("submits edited media metadata", async () => {
    const pageData = getAdminMediaPreviewPage();
    const actions = createActions(pageData);
    const user = userEvent.setup();

    render(
      <AdminMediaWorkspace
        actions={actions}
        assetId="sunset-experience-hero"
        pageData={pageData}
        view="detail"
      />,
    );

    await user.clear(screen.getByLabelText("Asset title"));
    await user.type(screen.getByLabelText("Asset title"), "Updated hero");
    await user.click(screen.getByRole("button", { name: /save metadata/i }));

    expect(actions.updateMetadata).toHaveBeenCalledWith(
      expect.objectContaining({
        assetId: "sunset-experience-hero",
        title: "Updated hero",
      }),
    );
  });

  it("forces a home gallery rotation from the media library", async () => {
    const basePageData = getAdminMediaPreviewPage();
    const pageData = {
      ...basePageData,
      assets: Array.from({ length: 5 }, (_, index) => ({
        ...basePageData.assets[0],
        collection: "Gallery" as const,
        id: `gallery-ready-${index + 1}`,
        status: "ready" as const,
        title: `Ready gallery ${index + 1}`,
      })),
    };
    const actions = createActions(pageData);
    const user = userEvent.setup();

    render(
      <AdminMediaWorkspace
        actions={actions}
        pageData={pageData}
        view="library"
      />,
    );

    await user.click(
      screen.getByRole("button", { name: /rotate gallery now/i }),
    );

    expect(actions.rotateHomeGallery).toHaveBeenCalledWith();
  });
});

function createActions(state = getAdminMediaPreviewPage()): AdminMediaActions {
  return {
    rotateHomeGallery: vi.fn(async () => ({
      data: {
        state,
      },
      ok: true as const,
    })),
    requestReprocess: vi.fn(async () => ({
      data: {
        state,
      },
      ok: true as const,
    })),
    updateMetadata: vi.fn(async () => ({
      data: {
        state,
      },
      ok: true as const,
    })),
    uploadAsset: vi.fn(async () => ({
      data: {
        assetId: "uploaded-asset",
        state,
      },
      ok: true as const,
    })),
  };
}
