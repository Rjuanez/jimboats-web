import { beforeEach, describe, expect, it, vi } from "vitest";
const f = vi.hoisted(() => ({
  measurement: {
    choice: vi.fn(),
    save: vi.fn(),
    attribution: vi.fn(),
    whatsapp: vi.fn(),
  },
  getMeasurement: vi.fn(),
  cookieGet: vi.fn(),
  cookieSet: vi.fn(),
  cookies: vi.fn(),
}));
vi.mock("@/container", () => ({ getBookingAdsMeasurement: f.getMeasurement }));
vi.mock("next/headers", () => ({ cookies: f.cookies }));
import {
  saveBookingAdsChoiceAction,
  recordBookingWhatsAppClickAction,
} from "./bookingAdsActions";
import {
  bookingAdsConsentCookie,
  getBookingAdsAttribution,
  getBookingAdsPrivacy,
} from "../config/bookingAdsPrivacy";
const id = "a1a1a1a1-1111-4111-8111-a1a1a1a1a1a1";
beforeEach(() => {
  vi.resetAllMocks();
  f.getMeasurement.mockReturnValue(f.measurement);
  f.cookies.mockResolvedValue({ get: f.cookieGet, set: f.cookieSet });
  f.measurement.save.mockResolvedValue(id);
});
describe("Booking Ads interface", () => {
  it("does not access cookies, save or measure when disabled", async () => {
    f.getMeasurement.mockReturnValue(null);
    expect(await getBookingAdsPrivacy()).toEqual({
      enabled: false,
      initialChoice: null,
    });
    expect(await getBookingAdsAttribution()).toBeUndefined();
    expect(
      await saveBookingAdsChoiceAction({ advertising: true, oppref: "ref" }),
    ).toEqual({ ok: false });
    await recordBookingWhatsAppClickAction("es");
    expect(f.cookies).not.toHaveBeenCalled();
    expect(f.measurement.whatsapp).not.toHaveBeenCalled();
    expect(f.measurement.save).not.toHaveBeenCalled();
  });
  it("remembers only the server consent reference in a protected cookie", async () => {
    expect(
      await saveBookingAdsChoiceAction({
        advertising: true,
        oppref: "opaque+ref/=",
      }),
    ).toEqual({ ok: true });
    expect(f.measurement.save).toHaveBeenCalledWith({
      previousId: null,
      advertising: true,
      oppref: "opaque+ref/=",
    });
    expect(f.cookieSet).toHaveBeenCalledWith(
      bookingAdsConsentCookie,
      id,
      expect.objectContaining({
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        maxAge: 86_400,
      }),
    );
  });
  it("ignores client attribution on rejection and uses the existing cookie for revocation", async () => {
    f.cookieGet.mockReturnValue({ value: id });
    await saveBookingAdsChoiceAction({
      advertising: false,
      oppref: "do-not-store",
    });
    expect(f.measurement.save).toHaveBeenCalledWith({
      previousId: id,
      advertising: false,
      oppref: null,
    });
  });
  it("validates locale and input and fails closed during an outage", async () => {
    expect(
      await saveBookingAdsChoiceAction({
        advertising: true,
        oppref: "x".repeat(501),
      }),
    ).toEqual({ ok: false });
    expect(f.measurement.save).not.toHaveBeenCalled();
    await recordBookingWhatsAppClickAction("../../secret?token=x");
    expect(f.measurement.whatsapp).not.toHaveBeenCalled();
    f.measurement.attribution.mockRejectedValue(new Error("database offline"));
    expect(await getBookingAdsAttribution()).toBeUndefined();
    f.measurement.save.mockRejectedValue(new Error("database offline"));
    expect(
      await saveBookingAdsChoiceAction({ advertising: false, oppref: null }),
    ).toEqual({ ok: false });
    expect(f.cookieSet).not.toHaveBeenCalled();
  });
  it("authorizes WhatsApp in the server using the cookie, never a consent boolean from the client", async () => {
    f.cookieGet.mockReturnValue({ value: id });
    await recordBookingWhatsAppClickAction("es");
    expect(f.measurement.whatsapp).toHaveBeenCalledWith(id, "es");
  });
});
