import { expect, it } from "vitest";
import { getMarketingPage } from "@/content/marketing";
import { GET } from "./route";

it("keeps machine-readable inclusions and cancellation terms aligned with the public offer", async () => {
  const response = GET();
  const text = await response.text();
  const page = getMarketingPage("en");
  expect(response.headers.get("Content-Type")).toBe("text/plain; charset=utf-8");
  expect(text).toContain(page.pricing.boatNote);
  expect(text).toContain(page.cancellationPolicy.summary);
  expect(text).not.toMatch(/decorations.*optional|decorations.*extra/i);
  expect(text).not.toContain("/ca");
});
