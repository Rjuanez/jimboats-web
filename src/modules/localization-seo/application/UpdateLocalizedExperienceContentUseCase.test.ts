import { describe, expect, it } from "vitest";

import { ApplicationError } from "@/shared/application/ApplicationError";
import { DomainError } from "@/shared/domain/DomainError";
import { LocaleCode } from "@/shared/domain/LocaleCode";

import type { LocalizedExperienceContentRepository } from "./ports/LocalizedExperienceContentRepository";
import { UpdateLocalizedExperienceContentUseCase } from "./UpdateLocalizedExperienceContentUseCase";
import type { LocalizedExperienceContent } from "../domain/LocalizedExperienceContent";

describe("UpdateLocalizedExperienceContentUseCase", () => {
  it("saves complete localized SEO and GEO content", async () => {
    const repository = new InMemoryLocalizedExperienceContentRepository();
    const result = await new UpdateLocalizedExperienceContentUseCase(
      repository,
    ).execute(createCommand());

    expect(result).toMatchObject({
      experienceId: "sunset-experience",
      locale: "en",
      publicationIssues: [],
      slug: "private-sunset-boat-tour-barcelona",
      status: "READY",
    });
    await expect(
      repository.findByExperienceAndLocale(
        "sunset-experience",
        LocaleCode.create("en"),
      ),
    ).resolves.not.toBeNull();
  });

  it("rejects unsupported locales through the domain locale object", async () => {
    const repository = new InMemoryLocalizedExperienceContentRepository();

    await expect(
      new UpdateLocalizedExperienceContentUseCase(repository).execute(
        createCommand({ locale: "fr" }),
      ),
    ).rejects.toBeInstanceOf(DomainError);
  });

  it("rejects incomplete content when marking it ready", async () => {
    const repository = new InMemoryLocalizedExperienceContentRepository();

    await expect(
      new UpdateLocalizedExperienceContentUseCase(repository).execute(
        createCommand({ seoTitle: "" }),
      ),
    ).rejects.toBeInstanceOf(DomainError);
  });

  it("allows incomplete drafts to be saved for later review", async () => {
    const repository = new InMemoryLocalizedExperienceContentRepository();
    const result = await new UpdateLocalizedExperienceContentUseCase(
      repository,
    ).execute(
      createCommand({
        seoTitle: "",
        status: "DRAFT",
      }),
    );

    expect(result.publicationIssues).toContain(
      "Localized content must be ready or published.",
    );
  });

  it("rejects missing experience ids before saving", async () => {
    const repository = new InMemoryLocalizedExperienceContentRepository();

    await expect(
      new UpdateLocalizedExperienceContentUseCase(repository).execute(
        createCommand({ experienceId: " " }),
      ),
    ).rejects.toBeInstanceOf(ApplicationError);
  });
});

class InMemoryLocalizedExperienceContentRepository implements LocalizedExperienceContentRepository {
  private readonly records = new Map<string, LocalizedExperienceContent>();

  async findByExperienceAndLocale(experienceId: string, locale: LocaleCode) {
    return this.records.get(keyFor(experienceId, locale.value)) ?? null;
  }

  async saveExperienceContent(
    experienceId: string,
    content: LocalizedExperienceContent,
  ) {
    this.records.set(keyFor(experienceId, content.locale.value), content);
  }
}

function createCommand(
  patch: Partial<
    Parameters<UpdateLocalizedExperienceContentUseCase["execute"]>[0]
  > = {},
) {
  return {
    bringText: "Comfortable clothes, swimwear and a light jacket.",
    experienceId: "sunset-experience",
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
    indexingPolicy: "INDEX" as const,
    includedText: "Skipper, fuel, welcome drinks and light snacks.",
    keyFacts:
      "Private boat; Port Olimpic departure; EUR 100 deposit; cash remainder on board.",
    locale: "en",
    mainContent:
      "Enjoy Barcelona from the sea with a private skipper, drinks and sunset views.",
    publicPageEnabled: true,
    seoDescription:
      "Book a private sunset boat tour in Barcelona with skipper and drinks.",
    seoTitle: "Private Sunset Boat Tour in Barcelona | JimBoats",
    slug: "private-sunset-boat-tour-barcelona",
    status: "READY" as const,
    summary:
      "A private sunset cruise with skipper, drinks and Mediterranean views.",
    title: "Private sunset boat tour",
    visibleTerms:
      "EUR 100 deposit online. Remaining amount paid on board in cash.",
    ...patch,
  };
}

function keyFor(experienceId: string, locale: string) {
  return `${experienceId}:${locale}`;
}
