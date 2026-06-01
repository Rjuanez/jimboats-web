import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Badge } from "./Badge";

describe("Badge", () => {
  it("renders the badge content", () => {
    render(<Badge>Ready</Badge>);

    expect(screen.getByText("Ready")).toBeVisible();
  });

  it("can expose a specific accessible label", () => {
    render(<Badge aria-label="English content ready">EN</Badge>);

    expect(screen.getByLabelText("English content ready")).toBeVisible();
  });
});
