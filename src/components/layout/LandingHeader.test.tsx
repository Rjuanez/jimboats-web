import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { LandingHeader } from "./LandingHeader";

vi.mock("next/navigation", () => ({
  usePathname: () => "/en",
  useSearchParams: () => new URLSearchParams("experience=sunset"),
}));

const navigation = [
  { href: "#experiences", label: "Experiences" },
  { href: "#extras", label: "Extras" },
];

describe("LandingHeader", () => {
  it("opens and closes the mobile menu", async () => {
    const user = userEvent.setup();

    render(
      <LandingHeader
        brand="JimBoats"
        brandMark={{
          alt: "JimBoats Charter",
          height: 514,
          src: "/images/brand/jimboats-charter-wordmark.svg",
          width: 922,
        }}
        cta={{ href: "#experiences", label: "Book now" }}
        homeHref="/en"
        navigation={navigation}
      />,
    );

    expect(screen.getByRole("img", { name: "JimBoats Charter" })).toBeVisible();
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Open menu" }));

    const dialog = screen.getByRole("dialog", { name: "Mobile navigation" });

    expect(dialog).toBeVisible();
    expect(within(dialog).getByRole("link", { name: "Extras" })).toHaveAttribute(
      "href",
      "#extras",
    );
    expect(within(dialog).getByRole("link", { name: "ES" })).toHaveAttribute(
      "href",
      "/es?experience=sunset",
    );

    await user.click(screen.getByRole("button", { name: "Close menu" }));

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });
});
