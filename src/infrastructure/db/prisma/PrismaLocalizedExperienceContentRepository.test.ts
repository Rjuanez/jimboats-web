import { describe, expect, it } from "vitest";

import { LocaleCode } from "@/shared/domain/LocaleCode";

import { PrismaLocalizedExperienceContentRepository } from "./PrismaLocalizedExperienceContentRepository";
import type {
  PrismaLocalizedExperienceContentClient,
  PrismaLocalizedExperienceContentTransaction,
} from "./PrismaLocalizedExperienceContentRepository";
import type {
  PrismaLocalizedExperienceContentRecord,
  PrismaLocalizedExperienceFaqRecord,
} from "./PrismaLocalizedExperienceContentMappers";
import {
  createLocalizedContent,
  localizedContentRecord,
} from "./PrismaExperienceCatalogMappers.test";

describe("Prisma localized experience content repository", () => {
  it("saves and loads localized content by experience and locale", async () => {
    const client = new InMemoryLocalizedContentClient();
    const repository = new PrismaLocalizedExperienceContentRepository(client);

    await repository.saveExperienceContent(
      "sunset-experience",
      createLocalizedContent(),
    );

    const loaded = await repository.findByExperienceAndLocale(
      "sunset-experience",
      LocaleCode.create("en"),
    );
    const editableContents =
      await repository.listByExperienceId("sunset-experience");
    const candidates =
      await repository.listPublishableCandidatesByExperienceId(
        "sunset-experience",
      );

    expect(loaded?.toSnapshot()).toMatchObject({
      locale: "en",
      slug: "private-sunset-boat-tour-barcelona",
    });
    expect(editableContents[0]).toMatchObject({
      experienceId: "sunset-experience",
      locale: "en",
      publicationIssues: [],
    });
    expect(candidates).toHaveLength(1);
    expect(candidates[0].isPublishable()).toBe(true);
  });
});

class InMemoryLocalizedContentClient implements PrismaLocalizedExperienceContentClient {
  private readonly contents = new Map<
    string,
    Omit<PrismaLocalizedExperienceContentRecord, "faqItems">
  >();
  private readonly faqs: Array<
    PrismaLocalizedExperienceFaqRecord & { localizedContentId: string }
  > = [];

  readonly localizedExperienceContent = {
    findMany: async (
      args: Parameters<
        PrismaLocalizedExperienceContentClient["localizedExperienceContent"]["findMany"]
      >[0],
    ) => {
      const experienceId = readStringProperty(args.where, "experienceId");

      return [...this.contents.values()]
        .filter((content) => {
          return !experienceId || content.experienceId === experienceId;
        })
        .map((content) => this.hydrate(content.id));
    },
    findUnique: async (
      args: Parameters<
        PrismaLocalizedExperienceContentClient["localizedExperienceContent"]["findUnique"]
      >[0],
    ) => {
      const lookup = readExperienceLocaleLookup(args.where);
      const record = [...this.contents.values()].find((content) => {
        return (
          content.experienceId === lookup?.experienceId &&
          content.locale === lookup.locale
        );
      });

      return record ? this.hydrate(record.id) : null;
    },
    upsert: async (
      args: Parameters<
        PrismaLocalizedExperienceContentClient["localizedExperienceContent"]["upsert"]
      >[0],
    ) => {
      const current = [...this.contents.values()].find((content) => {
        return (
          content.experienceId ===
            args.where.experienceId_locale.experienceId &&
          content.locale === args.where.experienceId_locale.locale
        );
      });
      const next = current
        ? {
            id: current.id,
            ...args.update,
          }
        : args.create;

      this.contents.set(next.id, next);
    },
  };

  readonly localizedExperienceFaq = {
    createMany: async (
      args: Parameters<
        PrismaLocalizedExperienceContentClient["localizedExperienceFaq"]["createMany"]
      >[0],
    ) => {
      this.faqs.push(...args.data);
    },
    deleteMany: async (
      args: Parameters<
        PrismaLocalizedExperienceContentClient["localizedExperienceFaq"]["deleteMany"]
      >[0],
    ) => {
      for (let index = this.faqs.length - 1; index >= 0; index -= 1) {
        if (
          this.faqs[index].localizedContentId === args.where.localizedContentId
        ) {
          this.faqs.splice(index, 1);
        }
      }
    },
  };

  async $transaction<T>(
    operation: (
      transaction: PrismaLocalizedExperienceContentTransaction,
    ) => Promise<T>,
  ) {
    return operation(this);
  }

  private hydrate(id: string): PrismaLocalizedExperienceContentRecord {
    const record = this.contents.get(id) ?? localizedContentRecord({ id });

    return {
      ...record,
      faqItems: this.faqs.filter((faq) => faq.localizedContentId === id),
    };
  }
}

function readExperienceLocaleLookup(value: unknown) {
  if (!isRecord(value) || !isRecord(value.experienceId_locale)) {
    return null;
  }

  const experienceId = value.experienceId_locale.experienceId;
  const locale = value.experienceId_locale.locale;

  if (typeof experienceId !== "string" || typeof locale !== "string") {
    return null;
  }

  return {
    experienceId,
    locale,
  };
}

function readStringProperty(value: unknown, property: string) {
  if (!isRecord(value)) {
    return null;
  }

  const field = value[property];

  return typeof field === "string" ? field : null;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}
