import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, afterEach, describe, expect, it, vi } from "vitest";
import {
  BookingPrivacyPreferences,
  bookingPrivacyPreviewKey,
} from "./BookingPrivacyPreferences";

function preview() {
  return render(
    <BookingPrivacyPreferences locale="es" privacyHref="/es/privacidad">
      <a href="#booking">Continuar reserva</a>
    </BookingPrivacyPreferences>,
  );
}
beforeEach(() => sessionStorage.clear());
afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe("Booking privacy preview", () => {
  it("shows equal first-level choices without blocking the reservation", () => {
    preview();
    expect(screen.getByRole("region", { name: "Tu privacidad" })).toBeVisible();
    expect(screen.getByRole("button", { name: "Aceptar" })).toBeEnabled();
    expect(screen.getByRole("button", { name: "Rechazar" })).toBeEnabled();
    expect(
      screen.getByRole("link", { name: "Continuar reserva" }),
    ).toBeEnabled();
    expect(
      screen.queryByRole("button", { name: "Configurar" }),
    ).not.toBeInTheDocument();
    expect(sessionStorage.getItem(bookingPrivacyPreviewKey)).toBeNull();
  });
  it.each([
    ["Aceptar", true],
    ["Rechazar", false],
  ] as const)(
    "remembers %s in the preview session",
    async (label, advertising) => {
      const user = userEvent.setup();
      const view = preview();
      await user.click(screen.getByRole("button", { name: label }));
      expect(
        screen.queryByRole("region", { name: "Tu privacidad" }),
      ).not.toBeInTheDocument();
      expect(
        JSON.parse(sessionStorage.getItem(bookingPrivacyPreviewKey)!),
      ).toEqual({ version: 1, advertising });
      view.unmount();
      preview();
      expect(
        screen.queryByRole("region", { name: "Tu privacidad" }),
      ).not.toBeInTheDocument();
    },
  );
  it("keeps optional measurement off until explicitly selected and saved", async () => {
    const user = userEvent.setup();
    preview();
    await user.click(
      screen.getByRole("button", { name: "Preferencias de privacidad" }),
    );
    const checkbox = screen.getByRole("checkbox", {
      name: /Medición publicitaria/,
    });
    expect(checkbox).not.toBeChecked();
    expect(screen.getByText("Siempre activas")).toBeVisible();
    expect(screen.getByText(/Plataforma: OpenAI/)).toBeVisible();
    await user.click(checkbox);
    expect(sessionStorage.getItem(bookingPrivacyPreviewKey)).toBeNull();
    await user.click(
      screen.getByRole("button", { name: "Guardar preferencias" }),
    );
    expect(
      JSON.parse(sessionStorage.getItem(bookingPrivacyPreviewKey)!).advertising,
    ).toBe(true);
    await waitFor(() =>
      expect(
        screen.getByRole("button", { name: "Preferencias de privacidad" }),
      ).toHaveFocus(),
    );
  });
  it("allows withdrawing an accepted choice", async () => {
    const user = userEvent.setup();
    preview();
    await user.click(screen.getByRole("button", { name: "Aceptar" }));
    await user.click(
      screen.getByRole("button", { name: "Preferencias de privacidad" }),
    );
    const checkbox = screen.getByRole("checkbox", {
      name: /Medición publicitaria/,
    });
    expect(checkbox).toBeChecked();
    await user.click(checkbox);
    await user.click(
      screen.getByRole("button", { name: "Guardar preferencias" }),
    );
    expect(
      JSON.parse(sessionStorage.getItem(bookingPrivacyPreviewKey)!).advertising,
    ).toBe(false);
  });
  it("keeps booking usable when browser storage is blocked", async () => {
    vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
      throw new Error("blocked");
    });
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new Error("blocked");
    });
    const user = userEvent.setup();
    preview();
    await user.click(screen.getByRole("button", { name: "Rechazar" }));
    expect(
      screen.queryByRole("region", { name: "Tu privacidad" }),
    ).not.toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Continuar reserva" }),
    ).toBeVisible();
  });
  it("does not treat old or corrupt storage as consent", () => {
    sessionStorage.setItem(
      bookingPrivacyPreviewKey,
      JSON.stringify({ version: 0, advertising: true }),
    );
    preview();
    expect(screen.getByRole("region", { name: "Tu privacidad" })).toBeVisible();
  });
});

describe("Connected advertising consent", () => {
  async function setup() {
    const { BookingWhatsAppHelp } = await import("./BookingWhatsAppHelp");
    const actions = {
      saveChoice: vi.fn().mockResolvedValue({ ok: true }),
      whatsappClick: vi.fn().mockResolvedValue(undefined),
    };
    const user = userEvent.setup();
    const view = render(
      <BookingPrivacyPreferences
        locale="es"
        privacyHref="/es/privacidad"
        measurement={actions}
      >
        <BookingWhatsAppHelp
          link={{ href: "https://wa.me/34669707354", label: "WhatsApp" }}
        />
      </BookingPrivacyPreferences>,
    );
    return { actions, user, view };
  }
  it("ignores preview acceptance and tracks only after the server confirms a new choice", async () => {
    sessionStorage.setItem(
      bookingPrivacyPreviewKey,
      JSON.stringify({ version: 1, advertising: true }),
    );
    const f = await setup();
    await f.user.click(screen.getByRole("link", { name: "WhatsApp" }));
    expect(f.actions.whatsappClick).not.toHaveBeenCalled();
    expect(f.actions.saveChoice).not.toHaveBeenCalled();
    await f.user.click(screen.getByRole("button", { name: "Aceptar" }));
    await waitFor(() =>
      expect(
        screen.queryByRole("region", { name: "Tu privacidad" }),
      ).not.toBeInTheDocument(),
    );
    await f.user.click(screen.getByRole("link", { name: "WhatsApp" }));
    expect(f.actions.whatsappClick).toHaveBeenCalledWith("es");
  });
  it("sends the opaque reference only on acceptance and stops on withdrawal", async () => {
    window.history.replaceState({}, "", "/es/book?oppref=opaque%2Bref%2F%3D");
    const f = await setup();
    await f.user.click(screen.getByRole("button", { name: "Aceptar" }));
    expect(f.actions.saveChoice).toHaveBeenCalledWith({
      advertising: true,
      oppref: "opaque+ref/=",
    });
    expect(sessionStorage.getItem(bookingPrivacyPreviewKey)).toBeNull();
    await f.user.click(
      screen.getByRole("button", { name: "Preferencias de privacidad" }),
    );
    await f.user.click(
      screen.getByRole("checkbox", { name: /Medición publicitaria/ }),
    );
    await f.user.click(
      screen.getByRole("button", { name: "Guardar preferencias" }),
    );
    expect(f.actions.saveChoice).toHaveBeenLastCalledWith({
      advertising: false,
      oppref: null,
    });
    await f.user.click(screen.getByRole("link", { name: "WhatsApp" }));
    expect(f.actions.whatsappClick).not.toHaveBeenCalled();
    window.history.replaceState({}, "", "/");
  });
  it("shows a retryable error and leaves WhatsApp usable without measurement if saving fails", async () => {
    const f = await setup();
    f.actions.saveChoice.mockRejectedValue(new Error("offline"));
    await f.user.click(screen.getByRole("button", { name: "Aceptar" }));
    expect(await screen.findByRole("alert")).toHaveTextContent(
      /guardar tu elección/,
    );
    const whatsapp = screen.getByRole("link", { name: "WhatsApp" });
    expect(whatsapp).toHaveAttribute("href", "https://wa.me/34669707354");
    await f.user.click(whatsapp);
    expect(f.actions.whatsappClick).not.toHaveBeenCalled();
    f.actions.saveChoice.mockResolvedValue({ ok: true });
    await f.user.click(screen.getByRole("button", { name: "Rechazar" }));
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    expect(f.actions.saveChoice).toHaveBeenLastCalledWith({
      advertising: false,
      oppref: null,
    });
  });
});
