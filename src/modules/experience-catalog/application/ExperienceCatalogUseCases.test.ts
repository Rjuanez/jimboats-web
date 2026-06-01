import { describe, expect, it } from "vitest";

import { ApplicationError } from "@/shared/application/ApplicationError";
import { DomainError } from "@/shared/domain/DomainError";
import { Money } from "@/shared/domain/Money";
import { TimeRange } from "@/shared/domain/TimeRange";

import type {
  CreateExperienceCommand,
  SlotPolicyCommand,
} from "./AdminExperienceDtos";
import { ArchiveExperienceUseCase } from "./ArchiveExperienceUseCase";
import { CreateExperienceUseCase } from "./CreateExperienceUseCase";
import { DuplicateExperienceUseCase } from "./DuplicateExperienceUseCase";
import { GetAdminExperienceUseCase } from "./GetAdminExperienceUseCase";
import { GetAdminExperiencesWorkspaceUseCase } from "./GetAdminExperiencesWorkspaceUseCase";
import { ListAdminExperiencesUseCase } from "./ListAdminExperiencesUseCase";
import { PublishExperienceUseCase } from "./PublishExperienceUseCase";
import { UpdateExperienceAvailabilityUseCase } from "./UpdateExperienceAvailabilityUseCase";
import { UpdateExperienceCoreUseCase } from "./UpdateExperienceCoreUseCase";
import { UpdateExperienceExtrasUseCase } from "./UpdateExperienceExtrasUseCase";
import { UpdateExperienceMediaUseCase } from "./UpdateExperienceMediaUseCase";
import { UpdateExperiencePublicationStateUseCase } from "./UpdateExperiencePublicationStateUseCase";
import type { ExperienceRepository } from "./ports/ExperienceRepository";
import type { ExtraRepository } from "./ports/ExtraRepository";
import type { AdminLocalizedExperienceContentReadModel } from "./ports/LocalizedExperienceContentReader";
import type { LocalizedExperienceContentReader } from "./ports/LocalizedExperienceContentReader";
import { Experience } from "../domain/Experience";
import type { PublishableLocalizedContent } from "../domain/Experience";
import { Extra } from "../domain/Extra";
import { ExtraSelectionRule } from "../domain/ExtraSelectionRule";
import { SlotPolicy } from "../domain/SlotPolicy";

describe("Experience catalog use cases", () => {
  it("lists admin experiences with publication readiness", async () => {
    const dependencies = createDependencies({
      experiences: [createExperience()],
      localizedContents: {
        "sunset-experience": [publishableContent()],
      },
    });

    const result = await new ListAdminExperiencesUseCase(
      dependencies.experiences,
      dependencies.extras,
      dependencies.localizedContent,
    ).execute();

    expect(result.experiences).toHaveLength(1);
    expect(result.experiences[0]).toMatchObject({
      id: "sunset-experience",
      publicationReadiness: {
        blockingIssues: [],
        score: 100,
      },
      slotPolicyMode: "FIXED_SLOTS",
    });
  });

  it("loads the admin workspace with editable localized content", async () => {
    const dependencies = createDependencies({
      experiences: [createExperience()],
      localizedContentReads: {
        "sunset-experience": [localizedContentRead()],
      },
    });

    const result = await new GetAdminExperiencesWorkspaceUseCase(
      dependencies.experiences,
      dependencies.extras,
      dependencies.localizedContent,
    ).execute({
      locales: ["en", "es", "ca"],
    });

    expect(result.experiences).toHaveLength(1);
    expect(result.experiences[0].localizedContents[0]).toMatchObject({
      locale: "en",
      slug: "private-sunset-boat-tour-barcelona",
    });
    expect(result.extras[0]).toMatchObject({
      id: "premium-champagne",
      status: "ACTIVE",
    });
  });

  it("creates an experience and stores it through the repository port", async () => {
    const dependencies = createDependencies();

    const result = await new CreateExperienceUseCase(
      dependencies.experiences,
      dependencies.extras,
    ).execute(createExperienceCommand());

    expect(result).toMatchObject({
      id: "morning-breeze",
      status: "DRAFT",
    });
    await expect(
      dependencies.experiences.findById("morning-breeze"),
    ).resolves.not.toBeNull();
  });

  it("gets a single admin experience or fails with an application error", async () => {
    const dependencies = createDependencies();
    const useCase = new GetAdminExperienceUseCase(
      dependencies.experiences,
      dependencies.extras,
      dependencies.localizedContent,
    );

    await expect(useCase.execute("missing")).rejects.toBeInstanceOf(
      ApplicationError,
    );
  });

  it("updates core configuration", async () => {
    const dependencies = createDependencies({
      experiences: [createExperience()],
      localizedContents: {
        "sunset-experience": [publishableContent()],
      },
    });

    const result = await new UpdateExperienceCoreUseCase(
      dependencies.experiences,
      dependencies.extras,
      dependencies.localizedContent,
    ).execute({
      basePrice: moneyDto(35_000),
      depositAmount: moneyDto(10_000),
      departurePort: "Marina Vela, Barcelona",
      displayOrder: 2,
      durationMinutes: 180,
      experienceId: "sunset-experience",
      internalName: "Sunset Celebration",
      internalNotes: "Staff should confirm the meeting point.",
      type: "Celebration charter",
    });

    expect(result).toMatchObject({
      basePrice: moneyDto(35_000),
      departurePort: "Marina Vela, Barcelona",
      displayOrder: 2,
      durationMinutes: 180,
      internalName: "Sunset Celebration",
      internalNotes: "Staff should confirm the meeting point.",
      type: "Celebration charter",
    });
  });

  it("updates availability and keeps domain slot rules enforced", async () => {
    const dependencies = createDependencies({
      experiences: [createExperience()],
    });
    const useCase = new UpdateExperienceAvailabilityUseCase(
      dependencies.experiences,
      dependencies.extras,
      dependencies.localizedContent,
    );

    await expect(
      useCase.execute({
        allowsManualScheduling: true,
        bufferMinutes: 30,
        experienceId: "sunset-experience",
        maximumAdvanceMonths: 6,
        minimumAdvanceMinutes: 60,
        slotPolicy: {
          fixedSlots: [
            {
              enabled: true,
              endMinutes: 12 * 60,
              id: "morning",
              label: "Morning",
              startMinutes: 10 * 60,
            },
            {
              enabled: true,
              endMinutes: 13 * 60,
              id: "late-morning",
              label: "Late morning",
              startMinutes: 11 * 60,
            },
          ],
          mode: "FIXED_SLOTS",
          timeZone: "Europe/Madrid",
        },
      }),
    ).rejects.toBeInstanceOf(DomainError);
  });

  it("updates extra selection rules and rejects unknown extras", async () => {
    const dependencies = createDependencies({
      experiences: [createExperience()],
    });
    const useCase = new UpdateExperienceExtrasUseCase(
      dependencies.experiences,
      dependencies.extras,
      dependencies.localizedContent,
    );

    await expect(
      useCase.execute({
        experienceId: "sunset-experience",
        extraSelectionRules: [
          {
            enabled: true,
            extraId: "unknown-extra",
            limitPerBooking: 1,
            noticeMinutes: 0,
          },
        ],
      }),
    ).rejects.toBeInstanceOf(ApplicationError);
  });

  it("updates media references", async () => {
    const dependencies = createDependencies({
      experiences: [createExperience()],
    });

    const result = await new UpdateExperienceMediaUseCase(
      dependencies.experiences,
      dependencies.extras,
      dependencies.localizedContent,
    ).execute({
      experienceId: "sunset-experience",
      media: {
        assetId: "asset-new",
        status: "PROCESSING",
      },
    });

    expect(result.media).toEqual({
      assetId: "asset-new",
      status: "PROCESSING",
    });
  });

  it("publishes an experience only when public content is ready", async () => {
    const dependencies = createDependencies({
      experiences: [createExperience()],
      localizedContents: {
        "sunset-experience": [publishableContent()],
      },
    });

    const result = await new PublishExperienceUseCase(
      dependencies.experiences,
      dependencies.extras,
      dependencies.localizedContent,
    ).execute({
      experienceId: "sunset-experience",
    });

    expect(result.status).toBe("PUBLISHED");
  });

  it("blocks publication when there is no publishable public content", async () => {
    const dependencies = createDependencies({
      experiences: [createExperience()],
    });

    await expect(
      new PublishExperienceUseCase(
        dependencies.experiences,
        dependencies.extras,
        dependencies.localizedContent,
      ).execute({
        experienceId: "sunset-experience",
      }),
    ).rejects.toBeInstanceOf(DomainError);
  });

  it("archives an experience", async () => {
    const dependencies = createDependencies({
      experiences: [createExperience()],
    });

    const result = await new ArchiveExperienceUseCase(
      dependencies.experiences,
      dependencies.extras,
      dependencies.localizedContent,
    ).execute({
      experienceId: "sunset-experience",
    });

    expect(result.status).toBe("ARCHIVED");
  });

  it("updates publication state without publishing validation for draft states", async () => {
    const dependencies = createDependencies({
      experiences: [createExperience()],
    });

    const result = await new UpdateExperiencePublicationStateUseCase(
      dependencies.experiences,
      dependencies.extras,
      dependencies.localizedContent,
    ).execute({
      experienceId: "sunset-experience",
      status: "READY",
    });

    expect(result.status).toBe("READY");
  });

  it("duplicates an experience as a new draft", async () => {
    const dependencies = createDependencies({
      experiences: [createExperience()],
    });

    const result = await new DuplicateExperienceUseCase(
      dependencies.experiences,
      dependencies.extras,
    ).execute({
      experienceId: "sunset-experience",
      newExperienceId: "sunset-copy",
      newInternalName: "Sunset Copy",
    });

    expect(result).toMatchObject({
      id: "sunset-copy",
      internalName: "Sunset Copy",
      status: "DRAFT",
    });
    await expect(
      dependencies.experiences.findById("sunset-copy"),
    ).resolves.not.toBeNull();
  });
});

class InMemoryExperienceRepository implements ExperienceRepository {
  private readonly records = new Map<string, Experience>();

  constructor(experiences: Experience[]) {
    for (const experience of experiences) {
      this.records.set(experience.id, experience);
    }
  }

  async findById(id: string) {
    return this.records.get(id) ?? null;
  }

  async list() {
    return [...this.records.values()];
  }

  async save(experience: Experience) {
    this.records.set(experience.id, experience);
  }
}

class InMemoryExtraRepository implements ExtraRepository {
  private readonly records = new Map<string, Extra>();

  constructor(extras: Extra[]) {
    for (const extra of extras) {
      this.records.set(extra.id, extra);
    }
  }

  async findManyByIds(ids: string[]) {
    const uniqueIds = [...new Set(ids)];

    return uniqueIds.flatMap((id) => {
      const extra = this.records.get(id);

      return extra ? [extra] : [];
    });
  }

  async list() {
    return [...this.records.values()];
  }
}

class InMemoryLocalizedContentReader implements LocalizedExperienceContentReader {
  constructor(
    private readonly records: Record<string, PublishableLocalizedContent[]>,
    private readonly readModels: Record<
      string,
      AdminLocalizedExperienceContentReadModel[]
    >,
  ) {}

  async listByExperienceId(experienceId: string) {
    return this.readModels[experienceId] ?? [];
  }

  async listPublishableCandidatesByExperienceId(experienceId: string) {
    return this.records[experienceId] ?? [];
  }
}

function createDependencies(
  input: {
    experiences?: Experience[];
    extras?: Extra[];
    localizedContentReads?: Record<
      string,
      AdminLocalizedExperienceContentReadModel[]
    >;
    localizedContents?: Record<string, PublishableLocalizedContent[]>;
  } = {},
) {
  return {
    experiences: new InMemoryExperienceRepository(input.experiences ?? []),
    extras: new InMemoryExtraRepository(input.extras ?? [createExtra()]),
    localizedContent: new InMemoryLocalizedContentReader(
      input.localizedContents ?? {},
      input.localizedContentReads ?? {},
    ),
  };
}

function createExperienceCommand(): CreateExperienceCommand {
  return {
    allowsManualScheduling: true,
    basePrice: moneyDto(29_000),
    bufferMinutes: 30,
    capacity: 8,
    depositAmount: moneyDto(10_000),
    departurePort: "Port Olimpic, Barcelona",
    displayOrder: 2,
    durationMinutes: 120,
    id: "morning-breeze",
    includedItems: "Skipper, fuel and welcome drinks.",
    internalName: "Morning Breeze",
    internalNotes:
      "EUR 100 online deposit. Remaining amount paid in cash on board.",
    maximumAdvanceMonths: 6,
    minimumAdvanceMinutes: 60,
    slotPolicy: fixedSlotPolicyCommand(),
    status: "DRAFT",
    type: "Private charter",
  };
}

function fixedSlotPolicyCommand(): SlotPolicyCommand {
  return {
    fixedSlots: [
      {
        enabled: true,
        endMinutes: 12 * 60,
        id: "morning-1000",
        label: "Morning departure",
        startMinutes: 10 * 60,
      },
    ],
    mode: "FIXED_SLOTS",
    timeZone: "Europe/Madrid",
  };
}

function createExperience(
  patch: Partial<Parameters<typeof Experience.create>[0]> = {},
) {
  return Experience.create({
    allowsManualScheduling: true,
    basePrice: Money.create(moneyDto(29_000)),
    bufferMinutes: 30,
    capacity: 8,
    depositAmount: Money.create(moneyDto(10_000)),
    departurePort: "Port Olimpic, Barcelona",
    displayOrder: 1,
    durationMinutes: 120,
    extraSelectionRules: [
      ExtraSelectionRule.create({
        enabled: true,
        extraId: "premium-champagne",
        limitPerBooking: 4,
        noticeMinutes: 0,
      }),
    ],
    id: "sunset-experience",
    includedItems: "Skipper, fuel and welcome drinks.",
    internalName: "Sunset Experience",
    internalNotes:
      "EUR 100 online deposit. Remaining amount paid in cash on board.",
    maximumAdvanceMonths: 6,
    media: {
      assetId: "asset-sunset",
      status: "READY",
    },
    minimumAdvanceMinutes: 60,
    slotPolicy: SlotPolicy.fixedSlots({
      fixedSlots: [
        {
          enabled: true,
          id: "sunset-1800",
          label: "Sunset departure",
          range: TimeRange.fromLocalTimes("18:00", "20:00"),
        },
      ],
      timeZone: "Europe/Madrid",
    }),
    status: "READY",
    type: "Private charter",
    ...patch,
  });
}

function createExtra() {
  return Extra.create({
    defaultNoticeMinutes: 0,
    id: "premium-champagne",
    name: "Premium champagne",
    price: Money.create(moneyDto(9_000)),
    status: "ACTIVE",
  });
}

function publishableContent(): PublishableLocalizedContent {
  return {
    isPublishable: () => true,
  };
}

function localizedContentRead(): AdminLocalizedExperienceContentReadModel {
  return {
    bringText: "Comfortable clothes.",
    experienceId: "sunset-experience",
    faqItems: [
      {
        answer: "The booking is confirmed with a EUR 100 deposit.",
        question: "How does the deposit work?",
      },
    ],
    geoSummary: "Private sunset boat tour in Barcelona.",
    h1: "Private sunset boat tour in Barcelona",
    imageAltText: "Private sunset boat tour in Barcelona.",
    includedText: "Skipper, fuel and welcome drinks.",
    indexingPolicy: "INDEX",
    keyFacts: "Private boat; Barcelona; EUR 100 deposit.",
    locale: "en",
    mainContent: "Enjoy Barcelona from the sea.",
    publicPageEnabled: true,
    publicationIssues: [],
    seoDescription: "Book a private sunset boat tour in Barcelona.",
    seoTitle: "Private Sunset Boat Tour in Barcelona | JimBoats",
    slug: "private-sunset-boat-tour-barcelona",
    status: "READY",
    summary: "A private sunset cruise with skipper.",
    title: "Private sunset boat tour",
    visibleTerms: "Remaining amount paid in cash on board.",
  };
}

function moneyDto(amountMinor: number) {
  return {
    amountMinor,
    currency: "EUR" as const,
  };
}
