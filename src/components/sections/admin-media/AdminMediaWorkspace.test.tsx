import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { getAdminMediaPreviewPage } from "@/interface/next/presenters/adminMediaPresenter";

import { AdminMediaWorkspace } from "./AdminMediaWorkspace";

describe("AdminMediaWorkspace", () => {
  it("renders the media library with preview assets", () => {
    const pageData = getAdminMediaPreviewPage();

    render(<AdminMediaWorkspace pageData={pageData} view="library" />);

    expect(
      screen.getByRole("heading", { name: "Media library" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Sunset Experience hero")).toBeInTheDocument();
    expect(screen.getByText("Morning Breeze cover")).toBeInTheDocument();
  });

  it("filters the media library by search query", async () => {
    const pageData = getAdminMediaPreviewPage();
    const user = userEvent.setup();

    render(<AdminMediaWorkspace pageData={pageData} view="library" />);

    await user.type(screen.getByLabelText("Search media"), "cava");

    expect(screen.getByText("Premium cava extra")).toBeInTheDocument();
    expect(
      screen.queryByText("Sunset Experience hero"),
    ).not.toBeInTheDocument();
  });

  it("renders media detail metadata and variants", () => {
    const pageData = getAdminMediaPreviewPage();

    render(
      <AdminMediaWorkspace
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
  });
});
