import { expect, test } from "@playwright/test";

const viewports = [
  { name: "mobile", width: 360, height: 740 },
  { name: "tablet", width: 768, height: 1024 },
  { name: "desktop", width: 1280, height: 900 },
];

const pages = [
  { name: "home", path: "/" },
  { name: "admin experiences", path: "/admin/experiences" },
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
    });
  }
}
