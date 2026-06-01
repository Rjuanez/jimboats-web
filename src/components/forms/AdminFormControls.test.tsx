import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { TextField } from "./AdminFormControls";

describe("AdminFormControls", () => {
  it("renders labelled text fields", () => {
    render(<TextField label="Internal name" value="Sunset Experience" readOnly />);

    expect(screen.getByLabelText("Internal name")).toHaveValue(
      "Sunset Experience",
    );
  });
});
