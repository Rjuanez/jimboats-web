import { afterEach, describe, expect, it, vi } from "vitest";
import { marketingLocales } from "@/content/marketing/routes";
import { getPublicDictionary } from "@/i18n/public";
import { privacyPath } from "@/content/privacy/routes";
import {
  getHourlyPublicBookingAvailability,
  getHourlyPublicBookingPage,
} from "./hourlyPublicBookingPresenter";

describe("hourly original booking presentation", () => {
  afterEach(() => vi.unstubAllEnvs());
  it("locks the correct experience, prices and minimum duration in every language", async () => {
    vi.stubEnv("JIMBOATS_SEO_PREVIEW", "1");
    vi.stubEnv("JIMBOATS_LOCAL_BOOKINGS", "0");
    for (const locale of marketingLocales) {
      for (const [id, minimum, amount] of [
        ["daytrip", 1, 120],
        ["ex-sunset", 2, 220],
        ["sunrise", 2, 220],
        ["romantic", 1, 250],
      ] as const) {
        const content = await getHourlyPublicBookingPage(locale, id, 1);
        expect(content?.experiences).toHaveLength(1);
        expect(content?.experiences[0]).toMatchObject({
          id,
          price: amount,
          capacity: 6,
        });
        expect(content?.hourly?.hours).toBe(minimum);
        expect(
          content?.hourly?.rates.every((rate) => rate.hours >= minimum),
        ).toBe(true);
        expect(content?.extras.map((extra) => [extra.id, extra.price])).toEqual(
          [["paddle-surf", 20]],
        );
        expect(
          content?.languageLinks?.every((link) =>
            link.href.includes(`experience=${id}&hours=${minimum}`),
          ),
        ).toBe(true);
        expect(content?.previewNotice).toBeTruthy();
        expect(content?.privacy.href).toBe(privacyPath(locale));
        expect(content?.footerLinks).toContainEqual({
          href: privacyPath(locale),
          label: getPublicDictionary(locale).common.privacyPolicy,
        });
        expect(content?.confirmation.bookingReference).not.toBeTruthy();
      }
    }
  });
  it("keeps duration in each available slot and rejects unsupported selections", async () => {
    vi.stubEnv("JIMBOATS_SEO_PREVIEW", "1");
    vi.stubEnv("JIMBOATS_LOCAL_BOOKINGS", "0");
    expect(
      await getHourlyPublicBookingAvailability("es", "romantic", 5),
    ).toBeNull();
    expect(await getHourlyPublicBookingAvailability("es", "romantic", 6)).toBeNull();
    expect(await getHourlyPublicBookingAvailability("es", "romantic", 1)).not.toBeNull();
    expect(
      await getHourlyPublicBookingAvailability("es", "unknown", 2),
    ).toBeNull();
    const availability = await getHourlyPublicBookingAvailability(
      "de",
      "daytrip",
      5,
    );
    const slot = Object.values(availability!.timeSlotsByDate)[0][0];
    expect(slot.endTime).toBe("15:00");
    expect(availability?.calendar.weekdays).toEqual([
      "Mo",
      "Di",
      "Mi",
      "Do",
      "Fr",
      "Sa",
      "So",
    ]);
  });
  it("provides every checkout translation key and formatted labels in all languages", () => {
    const keys = (obj: object, prefix = ""): string[] =>
      Object.entries(obj).flatMap(([key, value]) =>
        typeof value === "object" && value !== null
          ? keys(value, `${prefix}${key}.`)
          : [`${prefix}${key}`],
      );
    for (const locale of marketingLocales) {
      const copy = getPublicDictionary(locale).booking;
      expect(keys(copy).sort()).toEqual(
        keys(getPublicDictionary("en").booking).sort(),
      );
      expect(copy.labels.capacity(6)).toContain("6");
      expect(copy.labels.remainingBalance("149 €")).toContain("149 €");
    }
  });
});
