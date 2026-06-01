import { describe, expect, it } from "vitest";

import { DomainError } from "@/shared/domain/DomainError";
import { LocaleCode } from "@/shared/domain/LocaleCode";
import { Slug } from "@/shared/domain/Slug";

import { LocalizedExperienceContent } from "./LocalizedExperienceContent";

describe("LocalizedExperienceContent", () => {
  it("is publishable when SEO and GEO fields are complete", () => {
    const content = createPublishableContent();

    expect(content.isPublishable()).toBe(true);
    expect(content.toSnapshot()).toMatchObject({
      indexingPolicy: "INDEX",
      locale: "en",
      slug: "private-sunset-boat-tour-barcelona",
      status: "READY",
    });
  });

  it("is not publishable when public page is disabled", () => {
    const content = createPublishableContent({ publicPageEnabled: false });

    expect(content.isPublishable()).toBe(false);
    expect(content.getPublicationIssues()).toContain(
      "Public page must be enabled.",
    );
  });

  it("requires complete GEO questions", () => {
    const content = createPublishableContent({
      faqItems: [{ answer: "", question: "How does the deposit work?" }],
    });

    expect(content.isPublishable()).toBe(false);
  });

  it("throws when asserting incomplete publication", () => {
    const content = createPublishableContent({ seoTitle: "" });

    expect(() => content.assertPublishable()).toThrow(DomainError);
  });

  it("requires public summary, key facts and alt text for SEO and GEO readiness", () => {
    const content = createPublishableContent({
      imageAltText: "",
      keyFacts: "",
      summary: "",
    });

    expect(content.getPublicationIssues()).toEqual(
      expect.arrayContaining([
        "Image alt text is required.",
        "Key facts are required.",
        "Public summary is required.",
      ]),
    );
  });
});

function createPublishableContent(
  patch: Partial<Parameters<typeof LocalizedExperienceContent.create>[0]> = {},
) {
  return LocalizedExperienceContent.create({
    bringText: "Comfortable clothes, swimwear and a light jacket.",
    faqItems: [
      {
        answer:
          "The booking is confirmed with a EUR 100 online deposit and the rest is paid on board in cash.",
        question: "How does the deposit work?",
      },
    ],
    geoSummary:
      "Private sunset boat tour in Barcelona with skipper and Port Olimpic departure.",
    h1: "Private sunset boat tour in Barcelona",
    imageAltText:
      "Friends clinking drinks during a private sunset boat cruise in Barcelona.",
    indexingPolicy: "INDEX",
    includedText: "Skipper, fuel, welcome drinks and light snacks.",
    keyFacts:
      "Private boat; Port Olimpic departure; EUR 100 deposit; cash remainder on board.",
    locale: LocaleCode.create("en"),
    mainContent:
      "Enjoy Barcelona from the sea with a private skipper, drinks and sunset views.",
    publicPageEnabled: true,
    seoDescription:
      "Book a private sunset boat tour in Barcelona with skipper and drinks.",
    seoTitle: "Private Sunset Boat Tour in Barcelona | JimBoats",
    slug: Slug.create("private-sunset-boat-tour-barcelona"),
    status: "READY",
    summary:
      "A private sunset cruise with skipper, drinks and Mediterranean views.",
    title: "Private sunset boat tour",
    visibleTerms:
      "EUR 100 deposit online. Remaining amount paid on board in cash.",
    ...patch,
  });
}
