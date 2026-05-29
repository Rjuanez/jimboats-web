import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { LandingHeader } from "./LandingHeader";

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
        cta={{ href: "#experiences", label: "Book now" }}
        navigation={navigation}
      />,
    );

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Open menu" }));

    const dialog = screen.getByRole("dialog", { name: "Mobile navigation" });

    expect(dialog).toBeVisible();
    expect(within(dialog).getByRole("link", { name: "Extras" })).toHaveAttribute(
      "href",
      "#extras",
    );

    await user.click(screen.getByRole("button", { name: "Close menu" }));

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });
});
