import { expect, test } from "@playwright/test";

const viewports = [
  { name: "mobile", width: 360, height: 740 },
  { name: "tablet", width: 768, height: 1024 },
  { name: "desktop", width: 1280, height: 900 },
];

const pages = [
  { name: "home", path: "/" },
  { name: "public booking", path: "/en/book?experience=daytrip&hours=1" },
  { name: "admin entry", path: "/admin" },
  { name: "admin calendar", path: "/admin/calendar" },
  { name: "admin bookings", path: "/admin/bookings" },
  { name: "admin new booking", path: "/admin/bookings/new" },
  { name: "admin booking detail", path: "/admin/bookings/booking-preview-1" },
  { name: "admin coupons", path: "/admin/coupons" },
  { name: "admin coupon detail", path: "/admin/coupons/coupon-test10" },
  { name: "admin new coupon", path: "/admin/coupons/new" },
  { name: "admin notification rules", path: "/admin/notifications/rules" },
  {
    name: "admin notification templates",
    path: "/admin/notifications/templates",
  },
  {
    name: "admin notification template detail",
    path: "/admin/notifications/templates/template-preview-email-created",
  },
  { name: "admin notification logs", path: "/admin/notifications/logs" },
  { name: "admin devices", path: "/admin/device-notifications" },
];

for (const testedPage of pages) {
  for (const viewport of viewports) {
    test(`${testedPage.name} has no horizontal overflow on ${viewport.name}`, async ({
      page,
    }) => {
      await page.setViewportSize(viewport);
      await page.addInitScript(() => {
        window.localStorage.clear();
      });
      await page.goto(testedPage.path);

      const dimensions = await page.evaluate(() => ({
        innerWidth: window.innerWidth,
        scrollWidth: document.documentElement.scrollWidth,
      }));

      expect(dimensions.scrollWidth).toBeLessThanOrEqual(dimensions.innerWidth);
      if (testedPage.name === "admin bookings") {
        for (const label of ["Confirmadas", "Canceladas"]) {
          const fits = await page
            .getByText(label, { exact: true })
            .evaluate((element) => element.scrollWidth <= element.clientWidth);
          expect(fits, `${label} must fit on ${viewport.name}`).toBe(true);
        }
      }
    });
  }
}
