import { expect, test } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

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
  test(`${testedPage.name} has no detectable accessibility violations`, async ({
    page,
  }) => {
    await page.addInitScript(() => {
      window.localStorage.clear();
    });
    if (testedPage.name === "public booking") {
      // This scan covers date selection, before any embedded payment UI exists.
      // Stripe auto-loads on import; its external script must not hold up this scan.
      await page.route("https://js.stripe.com/**", (route) => route.abort());
    }
    await test.step("Load the page to audit", async () => {
      await page.goto(testedPage.path);
      if (testedPage.name === "public booking") {
        await expect(
          page.getByRole("heading", {
            level: 1,
            name: /Choose your duration and date/,
          }),
        ).toBeVisible();
      }
    });
    if (testedPage.name === "admin devices") {
      const activate = page.getByRole("button", {
        name: "Activar avisos",
        exact: true,
      });
      await expect(activate).toBeEnabled();
      // Device detection enables this control after hydration; measure its final colors.
      await activate.evaluate(async (element) => {
        await Promise.all(
          element.getAnimations().map((animation) => animation.finished),
        );
      });
    }

    await test.step("Scan the page with axe", async () => {
      const results = await new AxeBuilder({ page }).analyze();
      expect(results.violations).toEqual([]);
    });
  });
}
