import { expect, it } from "vitest";
import { getMarketingPage } from "./index";
import { marketingLocales } from "./routes";
import { marketingStructuredData } from "@/interface/next/presenters/marketingSeoPresenter";

it("compares whole-boat daytime prices with matching duration-specific booking links in every language", () => {
  for (const locale of marketingLocales) {
    const page = getMarketingPage(locale, "prices");
    const dayTrip = page.experiences.find(({ id }) => id === "private")!;
    expect(page.planning.rows.map(({ hours }) => hours)).toEqual([1, 2, 4]);
    for (const row of page.planning.rows) {
      expect(row.price).toBe(dayTrip.formattedPrices[row.hours]);
      const url = new URL(row.href, "https://jimboatscharter.com");
      expect(url.pathname).toBe(`/${locale}/book`);
      expect(url.searchParams.get("experience")).toBe("daytrip");
      expect(url.searchParams.get("hours")).toBe(String(row.hours));
    }
    expect(page.planning.rows[0].includes).toBe(
      page.detailCopy.bookingCard.drink,
    );
    expect(page.planning.rows[1].includes).toContain(
      page.detailCopy.bookingCard.snacks,
    );
    expect(page.planning.rows[2].includes).toContain(
      page.detailCopy.bookingCard.snacks,
    );
  }
});

it("keeps the new practical answers identical in visible content and structured data", () => {
  for (const locale of marketingLocales)
    for (const key of [
      "private",
      "sunset",
      "sunrise",
      "romantic",
      "prices",
      "contact",
    ] as const) {
      const page = getMarketingPage(locale, key);
      const graph = marketingStructuredData(page)["@graph"];
      expect(graph).toContainEqual(
        expect.objectContaining({
          "@type": "FAQPage",
          mainEntity: expect.arrayContaining(
            page.planning.questions.map(([name, text]) =>
              expect.objectContaining({
                name,
                acceptedAnswer: { "@type": "Answer", text },
              }),
            ),
          ),
        }),
      );
      expect(page.planning.questions[1][1]).toContain(
        page.copy.support.accessRoute,
      );
    }
  expect(
    marketingStructuredData(getMarketingPage("es", "about"))["@graph"].some(
      (item) => item["@type"] === "FAQPage",
    ),
  ).toBe(false);
});
