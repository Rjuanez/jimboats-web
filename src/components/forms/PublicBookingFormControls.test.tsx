import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import {
  PublicCheckboxField,
  PublicTextField,
} from "./PublicBookingFormControls";

describe("PublicBookingFormControls", () => {
  it("renders an accessible public text field", async () => {
    const user = userEvent.setup();

    render(
      <PublicTextField
        label="Full name"
        name="fullName"
        placeholder="John Smith"
      />,
    );

    await user.type(screen.getByLabelText("Full name"), "Sailor Guest");

    expect(screen.getByDisplayValue("Sailor Guest")).toBeVisible();
  });

  it("renders an accessible public checkbox field", async () => {
    const user = userEvent.setup();

    render(
      <PublicCheckboxField
        description="Send the booking pass by WhatsApp."
        label="WhatsApp pass"
        name="ticketWhatsapp"
      />,
    );

    const checkbox = screen.getByRole("checkbox", { name: /whatsapp pass/i });

    await user.click(checkbox);

    expect(checkbox).toBeChecked();
  });
});
