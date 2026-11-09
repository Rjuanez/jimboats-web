import { localHourlyTariffs } from "@/infrastructure/booking/HourlyTariffs";
import { describe, expect, it } from "vitest";
import { getMarketingPage, marketingImage } from "./index";
import { durationOptions, experiences } from "./catalog";
import {
  marketingLocales,
  marketingPath,
  marketingStaticParams,
  pageKeys,
  resolveMarketingPage,
} from "./routes";
import {
  marketingMetadata,
  marketingSitemap,
  marketingStructuredData,
} from "@/interface/next/presenters/marketingSeoPresenter";

describe("static marketing architecture", () => {
  it("gives every experience truthful starting prices, specific FAQ and a real parent breadcrumb", () => {
    for (const locale of marketingLocales)
      for (const key of ["private", "sunset", "sunrise", "romantic"] as const) {
        const page = getMarketingPage(locale, key);
        const experience = page.experiences.find((item) => item.id === key)!;
        expect(page.title).toContain(
          experience.formattedPrices[experience.featuredHours],
        );
        expect(page.detail?.faqs).toHaveLength(9);
        expect(page.detail?.paragraphs.join(" ").length).toBeGreaterThan(250);
        const graph = marketingStructuredData(page)["@graph"];
        const breadcrumb = graph.find(
          (item) => item["@type"] === "BreadcrumbList",
        )!;
        expect(breadcrumb).toMatchObject({
          itemListElement: [
            { position: 1 },
            {
              position: 2,
              item: `https://jimboatscharter.com${page.experiencesHref}`,
            },
            { position: 3 },
          ],
        });
        expect(graph.find((item) => item["@type"] === "FAQPage")).toMatchObject(
          {
            mainEntity: [...page.detail!.faqs, ...page.planning.questions].map(
              ([name, text]) => ({
                name,
                acceptedAnswer: { text },
              }),
            ),
          },
        );
        expect(page.reviews.excerpts.map((item) => item.id)).not.toContain(
          "kateryna",
        );
        if (key === "sunrise" || key === "romantic")
          expect(page.detail?.specificReviews).toBe(false);
      }
  });
  it("describes drinks for one hour and drinks with snacks from two hours consistently in every language", () => {
    for (const locale of marketingLocales) {
      const short = getMarketingPage(locale, "private").detail!;
      expect(short.priceHighlight).toBe(short.labels.bookingCard.oneHourPrice);
      expect(short.includedItems).toContain(short.labels.bookingCard.drink);
      expect(short.includedItems).toContain(
        short.labels.bookingCard.snacksFrom,
      );
      expect(short.includedItems).not.toContain(
        short.labels.bookingCard.snacks,
      );
      for (const key of ["sunrise", "sunset"] as const) {
        const detail = getMarketingPage(locale, key).detail!;
        expect(detail.priceHighlight).toBe(
          detail.labels.bookingCard.longerPrice,
        );
        expect(detail.includedItems).toContain(
          detail.labels.bookingCard.drinks,
        );
        expect(detail.includedItems).toContain(
          detail.labels.bookingCard.snacks,
        );
        expect(detail.faqs[0][1]).toContain(
          detail.labels.bookingCard.refreshmentsFromTwo,
        );
        expect(detail.faqs[0][1]).not.toContain(
          detail.labels.bookingCard.refreshments,
        );
      }
      expect(getMarketingPage(locale, "sunrise").detail!.faqs[3][1]).toBe(
        short.labels.bookingCard.breakfast,
      );
    }
  });
  it("prefills localized WhatsApp enquiries for the chosen experience, meeting point or general booking", () => {
    for (const locale of marketingLocales)
      for (const key of pageKeys) {
        const page = getMarketingPage(locale, key);
        const url = new URL(page.operator.whatsapp);
        const experience = page.experiences.find((item) => item.id === key);
        expect(url.origin).toBe("https://wa.me");
        expect(url.pathname).toBe("/34669707354");
        const text = url.searchParams.get("text");
        expect(text).toBe(
          experience
            ? page.detailCopy.whatsappMessages.experience.replace(
                "{experience}",
                experience.title,
              )
            : key === "contact"
              ? page.copy.support.contactMessage
              : page.detailCopy.whatsappMessages.general,
        );
        expect(text).not.toMatch(/\d|\{experience\}/);
      }
  });
  it("prepares the allowed durations and six-guest capacity for each experience", () => {
    for (const locale of marketingLocales) {
      const page = getMarketingPage(locale);
      expect(page.experiences.map((item) => item.durationOptions[0])).toEqual([
        1, 2, 2, 1,
      ]);
      expect(page.experiences.every((item) => item.capacity === 6)).toBe(true);
      expect(page.premium.extraDescriptions).toHaveLength(3);
    }
  });
  it("serves production photos locally without advertising unavailable widths", () => {
    const image = marketingImage(
      "production-gallery-3",
      "Jumping into the sea",
    );
    expect(image.src).toBe(
      "/images/generated/landing/production-gallery-3-902.webp",
    );
    expect(image.srcSet).not.toContain("1024w");
    expect(image.width).toBe(902);
    expect(image.height).toBe(1600);
    expect(getMarketingPage("es").premium.extraNames).toEqual([
      "eFoil",
      "Paddle surf",
      "Fotógrafo",
    ]);
  });
  it("sums all published platform opinions independently of the featured selection", () => {
    const { reviews } = getMarketingPage("es");
    expect(reviews.sources.map(({ name, count }) => [name, count])).toEqual([
      ["Google", 35],
      ["GetYourGuide", 6],
      ["Click&Boat", 7],
    ]);
    expect(reviews.totalCount).toBe(48);
    expect(reviews.ratingLabel).toBe("5,0");
    expect(reviews.excerpts).toHaveLength(8);
  });
  it("prepares faithful translations and attributed original excerpts from all three platforms", () => {
    for (const locale of marketingLocales) {
      const { reviews } = getMarketingPage(locale);
      expect(
        new Set(reviews.excerpts.map((review) => review.platform)),
      ).toEqual(new Set(["Google Maps", "GetYourGuide", "Click&Boat"]));
      expect(new Set(reviews.excerpts.map((review) => review.id)).size).toBe(
        reviews.excerpts.length,
      );
      expect(
        reviews.excerpts
          .slice(0, 6)
          .every((review) => review.language === "en"),
      ).toBe(true);
      for (const review of reviews.excerpts) {
        expect(review.translationLanguage).toBe(locale);
        expect(review.translation.length).toBeGreaterThan(50);
        expect(review.isTranslated).toBe(locale !== review.language);
        if (!review.isTranslated) expect(review.translation).toBe(review.text);
        expect(review.url).toMatch(/^https:\/\//);
        expect(review.text.trim().split(/\s+/).length).toBeLessThanOrEqual(25);
      }
    }
  });
  it("has 45 distinct translated URLs and keeps each language switch on the same page", () => {
    expect(new Set(marketingSitemap().map((entry) => entry.url)).size).toBe(45);
    expect(marketingStaticParams()).toHaveLength(40);
    for (const locale of marketingLocales)
      for (const key of pageKeys) {
        const page = getMarketingPage(locale, key);
        expect(page.languages).toHaveLength(5);
        for (const link of page.languages)
          expect(
            resolveMarketingPage(link.locale, link.href.split("/")[2] ?? ""),
          ).toBe(key);
        expect(page.path).toBe(marketingPath(locale, key));
        expect(page.title.length).toBeGreaterThan(10);
        expect(page.copy.faqs.length).toBeGreaterThanOrEqual(12);
        expect(
          marketingMetadata(locale, key).alternates?.canonical,
        ).not.toContain("localhost");
      }
  });
  it("does not invent prices, reviews or availability in structured data", () => {
    for (const locale of marketingLocales)
      for (const key of pageKeys) {
        const schema = JSON.stringify(
          marketingStructuredData(getMarketingPage(locale, key)),
        );
        const experience = getMarketingPage(locale, key).experiences.find(
          (item) => item.id === key,
        );
        if (experience?.confirmedPrice) {
          const service = JSON.parse(schema)["@graph"].find(
            (node: { "@type": string }) => node["@type"] === "Service",
          );
          expect(
            service.offers.map((offer: { price: number }) => offer.price),
          ).toEqual(
            experience.durationOptions.map((hours) => experience.prices[hours]),
          );
        }
        expect(schema).not.toMatch(/aggregateRating|reviewCount|InStock/);
      }
    expect(
      Object.values(experiences).every((item) => item.price === null),
    ).toBe(true);
    expect(durationOptions).toEqual([1, 2, 3, 4, 5, 6]);
  });
  it("advertises the same amounts as the local hourly checkout", () => {
    const page = getMarketingPage("es");
    expect(page.experiences.map((item) => item.featuredHours)).toEqual([
      1, 2, 2, 1,
    ]);
    for (const item of page.experiences) {
      for (const rate of localHourlyTariffs[item.bookingId]) {
        expect(item.formattedPrices[rate.hours]).toBe(
          new Intl.NumberFormat("es", {
            style: "currency",
            currency: "EUR",
            maximumFractionDigits: 0,
          }).format(rate.total.amountMinor / 100),
        );
      }
    }
  });
  it("keeps the actual booking identifiers through the experience pages", () => {
    expect(
      getMarketingPage("es").experiences.map((item) => item.bookingId),
    ).toEqual(["daytrip", "ex-sunset", "sunrise", "romantic"]);
  });
  it("keeps romantic pricing, decorations, duration limits and related guides consistent in every language", () => {
    for (const locale of marketingLocales) {
      const page = getMarketingPage(locale, "romantic");
      const experience = page.experiences.find(
        (item) => item.id === "romantic",
      )!;
      expect(experience.durationOptions).toEqual([1, 2, 3, 4]);
      expect(experience.prices).toEqual({ 1: 250, 2: 350, 3: 450, 4: 550 });
      expect(experience.durationLabel).toBe(`1–4 ${page.copy.hours}`);
      expect(page.guides.map((guide) => guide.key)).toEqual(["sunset"]);
      expect(page.detail!.includedItems).toContain(
        page.detailCopy.bookingCard.decoration,
      );
      expect(page.detail!.includedSummary).toContain(
        page.detailCopy.bookingCard.decoration,
      );
      expect(page.detail!.faqs[0][1]).toContain(
        page.detailCopy.bookingCard.decoration,
      );
      expect(page.detail!.faqs[1][1]).toBe(
        page.detailCopy.durationAnswer
          .replace("{min}", "1")
          .replace("{max}", "4"),
      );
      expect(page.detail!.priceHighlight).toBe(
        page.detailCopy.bookingCard.oneHourPrice,
      );
      expect(page.detail!.includedItems).toContain(
        page.detailCopy.bookingCard.snacksFrom,
      );
      expect(page.detail!.includedItems).not.toContain(
        page.detailCopy.bookingCard.snacks,
      );
    }
  });
});

describe("search metadata regressions", () => {
  it("keeps search titles short, unique and explicitly branded once", () => {
    for (const locale of marketingLocales) {
      const titles = pageKeys.map(
        (key) => marketingMetadata(locale, key).title as { absolute: string },
      );
      expect(new Set(titles.map(({ absolute }) => absolute)).size).toBe(
        pageKeys.length,
      );
      for (const { absolute } of titles) {
        expect(absolute.match(/JimBoats/g)).toHaveLength(1);
        expect(absolute.length).toBeLessThanOrEqual(65);
      }
    }
  });
  it("publishes the boarding point, rather than the old street number or fiscal address", () => {
    const graph = marketingStructuredData(getMarketingPage("es"))["@graph"];
    expect(graph).toContainEqual(
      expect.objectContaining({
        "@id": "https://jimboatscharter.com/#business",
        address: expect.objectContaining({
          streetAddress: "Moll de Xaloc, Pantalan 5",
          postalCode: "08005",
        }),
      }),
    );
  });
});
