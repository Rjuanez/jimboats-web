import { expect, test } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

const pages = [
  { name: "home", path: "/" },
  { name: "public booking", path: "/en/book" },
  { name: "admin experiences", path: "/admin/experiences" },
  { name: "admin calendar", path: "/admin/calendar" },
  { name: "admin bookings", path: "/admin/bookings" },
  { name: "admin coupons", path: "/admin/coupons" },
  { name: "admin new booking", path: "/admin/bookings/new" },
  {
    name: "admin booking detail",
    path: "/admin/bookings/booking-preview-1",
  },
  { name: "admin new experience", path: "/admin/experiences/new" },
  {
    name: "admin experience overview",
    path: "/admin/experiences/sunset-experience",
  },
  {
    name: "admin experience content",
    path: "/admin/experiences/sunset-experience/content",
  },
  {
    name: "admin experience availability",
    path: "/admin/experiences/sunset-experience/availability",
  },
  {
    name: "admin experience extras",
    path: "/admin/experiences/sunset-experience/extras",
  },
  {
    name: "admin experience media",
    path: "/admin/experiences/sunset-experience/media",
  },
  {
    name: "admin experience publish",
    path: "/admin/experiences/sunset-experience/publish",
  },
  { name: "admin media library", path: "/admin/media" },
  {
    name: "admin media detail",
    path: "/admin/media/sunset-experience-hero",
  },
];

for (const testedPage of pages) {
  test(`${testedPage.name} has no detectable accessibility violations`, async ({
    page,
  }) => {
    await page.addInitScript(() => {
      window.localStorage.clear();
    });
    await page.goto(testedPage.path);

    const results = await new AxeBuilder({ page }).analyze();

    expect(results.violations).toEqual([]);
  });
}
