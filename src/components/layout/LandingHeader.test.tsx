import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { LandingHeader } from "./LandingHeader";

const { prefetch } = vi.hoisted(() => ({
  prefetch: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  usePathname: () => "/en",
  useRouter: () => ({
    prefetch,
  }),
  useSearchParams: () => new URLSearchParams("experience=sunset"),
}));

const navigation = [
  { href: "#experiences", label: "Experiences" },
  { href: "#extras", label: "Extras" },
];

describe("LandingHeader", () => {
  beforeEach(() => {
    prefetch.mockClear();
  });

  it("shows pending feedback after selecting another language", async () => {
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

    const spanishLink = screen.getByRole("link", { name: "ES" });

    await user.click(spanishLink);

    expect(spanishLink).toHaveAttribute("aria-busy", "true");
    expect(spanishLink).toHaveClass("animate-pulse");
  });

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
    expect(prefetch).toHaveBeenCalledWith("/es?experience=sunset");
    expect(prefetch).toHaveBeenCalledWith("/ca?experience=sunset");

    await user.click(screen.getByRole("button", { name: "Close menu" }));

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });
});
