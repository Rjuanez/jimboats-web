import { describe, expect, it } from "vitest";
import { presentSunTimes } from "./weatherView";
import { marketingLocales } from "@/content/marketing/routes";

describe("Barcelona solar times", () => {
  it.each(marketingLocales)(
    "uses local winter and summer time in %s",
    (locale) => {
      const winter = presentSunTimes(
        {
          date: "2026-11-03",
          sunrise: "2026-11-03T06:24+00:00",
          sunset: "2026-11-03T16:44+00:00",
        },
        locale,
      );
      expect(winter.sunrise.label).toBe("07:24");
      expect(winter.sunset.label).toBe("17:44");
      const summer = presentSunTimes(
        {
          date: "2026-07-01",
          sunrise: "2026-07-01T04:20+00:00",
          sunset: "2026-07-01T19:28+00:00",
        },
        locale,
      );
      expect(summer.sunrise.label).toBe("06:20");
      expect(summer.sunset.label).toBe("21:28");
    },
  );
});
