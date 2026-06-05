import { applicationError } from "@/shared/application/ApplicationError";

import type {
  AdminExperienceDto,
  UpdateExperienceCoreCommand,
} from "./AdminExperienceDtos";
import {
  experienceToAdminDto,
  moneyFromMinor,
} from "./ExperienceApplicationMappers";
import type { ExperienceRepository } from "./ports/ExperienceRepository";
import type { ExtraRepository } from "./ports/ExtraRepository";
import type { LocalizedExperienceContentReader } from "./ports/LocalizedExperienceContentReader";
import type { Experience } from "../domain/Experience";

export class UpdateExperienceCoreUseCase {
  constructor(
    private readonly experiences: ExperienceRepository,
    private readonly extras: ExtraRepository,
    private readonly localizedContent: LocalizedExperienceContentReader,
  ) {}

  async execute(
    command: UpdateExperienceCoreCommand,
  ): Promise<AdminExperienceDto> {
    const experience = await this.experiences.findById(command.experienceId);

    if (!experience) {
      throw applicationError(
        "EXPERIENCE_NOT_FOUND",
        "Experience was not found.",
      );
    }

    const updated = experience.withCoreConfiguration({
      basePrice:
        command.basePrice !== undefined
          ? moneyFromMinor(command.basePrice)
          : undefined,
      capacity: command.capacity,
      cancellationPolicyId: command.cancellationPolicyId,
      depositAmount:
        command.depositAmount !== undefined
          ? moneyFromMinor(command.depositAmount)
          : undefined,
      departurePort: command.departurePort,
      displayOrder: command.displayOrder,
      durationMinutes: command.durationMinutes,
      includedItems: command.includedItems,
      internalName: command.internalName,
      internalNotes: command.internalNotes,
      type: command.type,
    });

    await this.experiences.save(updated);

    return this.toDto(updated);
  }

  private async toDto(experience: Experience) {
    const snapshot = experience.toSnapshot();
    const extraIds = snapshot.extraSelectionRules.map((rule) => rule.extraId);
    const [localizedContents, selectableExtras] = await Promise.all([
      this.localizedContent.listPublishableCandidatesByExperienceId(
        experience.id,
      ),
      this.extras.findManyByIds(extraIds),
    ]);

    return experienceToAdminDto(experience, {
      localizedContents,
      selectableExtras,
    });
  }
}
