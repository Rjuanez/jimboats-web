import { renderToStaticMarkup } from "react-dom/server";
import { within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { getMarketingPage } from "@/content/marketing";
import { marketingLocales } from "@/content/marketing/routes";
import { hourlyPrices } from "@/content/booking/hourlyPrices";
import { marketingStructuredData } from "@/interface/next/presenters/marketingSeoPresenter";
import { GET as getLlms } from "@/app/llms.txt/route";
import { SeoExperiencePrices } from "./SeoExperiencePrices";
import { SeoExperienceBookingCard } from "./SeoExperienceBookingCard";

it("preserves every published tariff, including the two-hour minimum and romantic exception", () => {
  expect(hourlyPrices).toEqual({
    daytrip: { 1: 120, 2: 210, 3: 300, 4: 390, 5: 480, 6: 570 },
    "ex-sunset": { 2: 220, 3: 310, 4: 400, 5: 490, 6: 580 },
    sunrise: { 2: 220, 3: 310, 4: 400, 5: 490, 6: 580 },
    romantic: { 1: 250, 2: 350, 3: 450, 4: 550 },
  });
});

describe("concise pricing in initial HTML", () => {
  for (const locale of marketingLocales) {
    for (const key of ["private", "sunset", "sunrise", "romantic"] as const) {
      it(`${locale}/${key} explains the rule and preserves exact machine-readable totals`, async () => {
        const page = getMarketingPage(locale, key);
        const trip = page.experiences.find((item) => item.id === key)!;
        const section = document.createElement("div");
        section.innerHTML = renderToStaticMarkup(
          <SeoExperiencePrices
            detail={page.detail!}
            capacityLabel={trip.capacityLabel}
          />,
        );
        expect(within(section).queryByRole("table")).toBeNull();
        expect(within(section).queryByRole("link")).toBeNull();
        expect(section).toHaveTextContent(
          trip.pricing.summary.replace(/\s/g, " "),
        );
        expect(section).toHaveTextContent(page.detail!.labels.finalPrice);
        expect(section).toHaveTextContent(trip.capacityLabel);
        expect(section).toHaveTextContent(
          trip.formattedPrices[trip.durationOptions[1]].replace(/\s/g, " "),
        );
        expect(page.detail!.faqs[0][1]).toContain(trip.title);
        expect(page.detail!.faqs[0][1]).toContain(trip.pricing.summary);
        expect(page.detail!.faqs[0][1]).toContain(trip.pricing.examples);
        for (const hours of trip.durationOptions.slice(1, 3)) {
          expect(trip.pricing.examples).toContain(trip.formattedPrices[hours]);
        }
        const card = document.createElement("div");
        card.innerHTML = renderToStaticMarkup(
          <SeoExperienceBookingCard page={page} experience={trip} />,
        );
        expect(card).toHaveTextContent(
          trip.pricing.extraLabel.replace(/\s/g, " "),
        );
        expect(card).toHaveTextContent(
          trip.formattedPrices[trip.durationOptions[1]].replace(/\s/g, " "),
        );
        expect(card).toHaveTextContent(
          trip.featuredHours === 1
            ? page.detail!.labels.bookingCard.snacksFrom
            : page.detail!.labels.bookingCard.snacks,
        );
        expect(trip.pricing.extraLabel).toContain(
          key === "romantic" ? "100" : "90",
        );
        const service = marketingStructuredData(page)["@graph"].find(
          (item) => item["@type"] === "Service",
        )!;
        expect(service).toMatchObject({
          offers: trip.durationOptions.map((hours) =>
            expect.objectContaining({
              price: trip.prices[hours],
              priceCurrency: "EUR",
              eligibleDuration: {
                "@type": "QuantitativeValue",
                value: hours,
                unitCode: "HUR",
              },
              url: `https://jimboatscharter.com${trip.bookingHref}&hours=${hours}`,
            }),
          ),
        });
        const english = getMarketingPage("en").experiences.find(
          (item) => item.id === key,
        )!;
        const llmsLine = (await getLlms().text())
          .split("\n")
          .find((line) => line.startsWith(`- [${english.title}]`))!;
        expect(llmsLine).toContain(english.pricing.summary);
        for (const hours of trip.durationOptions)
          expect(llmsLine).toContain(`${hours} h: EUR ${trip.prices[hours]}`);
      });
    }
  }
});
