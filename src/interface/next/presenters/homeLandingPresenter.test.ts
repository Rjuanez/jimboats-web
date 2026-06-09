import { describe, expect, it } from "vitest";

import {
  createHomeLandingStructuredData,
  getHomeLandingPage,
  homeLandingContent,
} from "./homeLandingPresenter";

describe("homeLandingPresenter", () => {
  it("returns localized static landing content without booking data", async () => {
    const content = await getHomeLandingPage("es");

    expect(content.homeHref).toBe("/es");
    expect(content.headerCta.href).toBe("/es/book");
    expect(content.hero.cta.href).toBe("/es/book");
    expect(content.experiences).toEqual(homeLandingContent.experiences);
    expect(content.extras.items).toEqual(homeLandingContent.extras.items);
  });

  it("exposes contact details and structured data from static landing content", async () => {
    const content = await getHomeLandingPage("en");

    expect(content.footer.contact).toEqual({
      email: "info@jimboatscharter.com",
      phone: "+34 669707354",
      place: "Moll de Xaloc, 3, Sant Martí, 08005 Barcelona",
    });

    const structuredData = createHomeLandingStructuredData(content);

    expect(structuredData).toMatchObject({
      address: {
        postalCode: "08005",
        streetAddress: "Moll de Xaloc, 3, Sant Martí",
      },
      email: "info@jimboatscharter.com",
      sameAs: ["https://www.instagram.com/jimboatsbcn/"],
      telephone: "+34 669707354",
    });
    expect(structuredData.makesOffer).toEqual([
      expect.objectContaining({
        name: "A toast to the golden hour",
        price: 290,
        priceCurrency: "EUR",
        url: "/en/book?experience=sunset-private-cruise",
      }),
      expect.objectContaining({
        name: "Feel the Mediterranean breeze",
        price: 350,
        priceCurrency: "EUR",
        url: "/en/book?experience=morning-breeze-charter",
      }),
      expect.objectContaining({
        name: "Party on Board",
        price: 480,
        priceCurrency: "EUR",
        url: "/en/book?experience=party-on-board",
      }),
      expect.objectContaining({
        name: "Romantic Proposal",
        price: 420,
        priceCurrency: "EUR",
        url: "/en/book?experience=romantic-proposal",
      }),
    ]);
  });
});
