import { describe, expect, it } from "vitest";

import { ApplicationError } from "@/shared/application/ApplicationError";
import { DomainError } from "@/shared/domain/DomainError";
import { parseAdminBookingCreate } from "../validators/adminBookingValidators";
import { presentAdminError } from "./adminErrorPresenter";

describe("admin error presentation", () => {
  it("explains an availability conflict in Spanish without changing its code", () => {
    const error = new ApplicationError(
      "CALENDAR_BLOCK_OVERLAP",
      "Overlapping block",
    );
    expect(presentAdminError(error)).toBe(
      "El barco ya está ocupado en ese horario. Elige otro.",
    );
    expect(error.code).toBe("CALENDAR_BLOCK_OVERLAP");
    expect(
      presentAdminError(
        new DomainError("BOOKING_RATE_UNAVAILABLE", "Missing rate"),
      ),
    ).toBe("No hay tarifa para la duración seleccionada.");
  });

  it("identifies invalid form fields without returning raw English schema errors", () => {
    try {
      parseAdminBookingCreate({ customerEmail: "invalid" } as Parameters<
        typeof parseAdminBookingCreate
      >[0]);
    } catch (error) {
      expect(presentAdminError(error)).toBe(
        "Revisa el campo «correo electrónico».",
      );
      return;
    }
    throw new Error("Expected invalid form input to fail");
  });

  it("does not expose unexpected technical errors", () => {
    expect(presentAdminError(new Error("Database connection details"))).toBe(
      "No se ha podido completar la operación. Inténtalo de nuevo.",
    );
  });
});
