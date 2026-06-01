import { applicationError } from "@/shared/application/ApplicationError";

import type {
  AdminExperienceDto,
  CreateExperienceCommand,
} from "./AdminExperienceDtos";
import {
  experienceToAdminDto,
  extraRulesFromCommand,
  moneyFromMinor,
  slotPolicyFromCommand,
} from "./ExperienceApplicationMappers";
import type { ExperienceRepository } from "./ports/ExperienceRepository";
import type { ExtraRepository } from "./ports/ExtraRepository";
import { Experience } from "../domain/Experience";

export class CreateExperienceUseCase {
  constructor(
    private readonly experiences: ExperienceRepository,
    private readonly extras: ExtraRepository,
  ) {}

  async execute(command: CreateExperienceCommand): Promise<AdminExperienceDto> {
    const existingExperience = await this.experiences.findById(command.id);

    if (existingExperience) {
      throw applicationError(
        "EXPERIENCE_ALREADY_EXISTS",
        "Experience already exists.",
      );
    }

    const extraSelectionRules = extraRulesFromCommand(
      command.extraSelectionRules ?? [],
    );
    const selectableExtras = await findConfiguredExtras(
      this.extras,
      extraSelectionRules.map((rule) => rule.extraId),
    );

    const experience = Experience.create({
      allowsManualScheduling: command.allowsManualScheduling,
      basePrice: moneyFromMinor(command.basePrice),
      bufferMinutes: command.bufferMinutes,
      capacity: command.capacity,
      depositAmount: moneyFromMinor(command.depositAmount),
      departurePort: command.departurePort,
      displayOrder: command.displayOrder,
      durationMinutes: command.durationMinutes,
      extraSelectionRules,
      id: command.id,
      includedItems: command.includedItems,
      internalName: command.internalName,
      internalNotes: command.internalNotes,
      maximumAdvanceMonths: command.maximumAdvanceMonths,
      media: command.media ?? {
        assetId: null,
        status: "MISSING",
      },
      minimumAdvanceMinutes: command.minimumAdvanceMinutes,
      slotPolicy: slotPolicyFromCommand(command.slotPolicy),
      status: command.status ?? "DRAFT",
      type: command.type,
    });

    await this.experiences.save(experience);

    return experienceToAdminDto(experience, {
      localizedContents: [],
      selectableExtras,
    });
  }
}

async function findConfiguredExtras(
  extras: ExtraRepository,
  extraIds: string[],
) {
  const uniqueIds = [...new Set(extraIds)];
  const configuredExtras = await extras.findManyByIds(uniqueIds);
  const foundIds = new Set(configuredExtras.map((extra) => extra.id));
  const missingId = uniqueIds.find((extraId) => !foundIds.has(extraId));

  if (missingId) {
    throw applicationError(
      "EXTRA_NOT_FOUND",
      `Extra ${missingId} was not found.`,
    );
  }

  return configuredExtras;
}
