import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { expect, it, vi } from "vitest";
import { LocalBookingPayment } from "./LocalBookingPayment";

it("does not show confirmation when the simulator ignores the payment", async () => {
  const confirmed = vi.fn();
  render(
    <LocalBookingPayment
      locale="es"
      sessionId="local-test"
      actions={{
        simulate: vi
          .fn()
          .mockResolvedValue({
            ok: true,
            value: { action: "IGNORED", bookingId: null, eventType: "ignored" },
          }),
        abandon: vi.fn(),
      }}
      onConfirmed={confirmed}
      onAbandoned={vi.fn()}
    />,
  );
  await userEvent.click(
    screen.getByRole("button", { name: "Simular pago correcto" }),
  );
  expect(confirmed).not.toHaveBeenCalled();
  expect(screen.getByRole("alert")).toBeVisible();
});
