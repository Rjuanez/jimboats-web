import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Surface } from "./Surface";

describe("Surface", () => {
  it("renders a labelled section", () => {
    render(
      <Surface description="Description" title="Settings">
        <p>Body</p>
      </Surface>,
    );

    expect(screen.getByRole("region", { name: "Settings" })).toBeVisible();
    expect(screen.getByText("Description")).toBeVisible();
    expect(screen.getByText("Body")).toBeVisible();
  });
});
