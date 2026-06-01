import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { IconButton } from "./IconButton";

describe("IconButton", () => {
  it("renders an accessible button", () => {
    render(<IconButton icon={<span aria-hidden>i</span>} label="Edit" />);

    expect(screen.getByRole("button", { name: "Edit" })).toBeVisible();
  });

  it("renders an accessible link when href is provided", () => {
    render(
      <IconButton href="/admin" icon={<span aria-hidden>i</span>} label="Go" />,
    );

    expect(screen.getByRole("link", { name: "Go" })).toHaveAttribute(
      "href",
      "/admin",
    );
  });
});
