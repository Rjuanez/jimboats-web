import { applicationError } from "@/shared/application/ApplicationError";

import type {
  AdminExperienceDto,
  UpdateExperienceAvailabilityCommand,
} from "./AdminExperienceDtos";
import {
  experienceToAdminDto,
  slotPolicyFromCommand,
} from "./ExperienceApplicationMappers";
import type { ExperienceRepository } from "./ports/ExperienceRepository";
import type { ExtraRepository } from "./ports/ExtraRepository";
import type { LocalizedExperienceContentReader } from "./ports/LocalizedExperienceContentReader";

export class UpdateExperienceAvailabilityUseCase {
  constructor(
    private readonly experiences: ExperienceRepository,
    private readonly extras: ExtraRepository,
    private readonly localizedContent: LocalizedExperienceContentReader,
  ) {}

  async execute(
    command: UpdateExperienceAvailabilityCommand,
  ): Promise<AdminExperienceDto> {
    const experience = await this.experiences.findById(command.experienceId);

    if (!experience) {
      throw applicationError(
        "EXPERIENCE_NOT_FOUND",
        "Experience was not found.",
      );
    }

    const updated = experience.withAvailabilityConfiguration({
      allowsManualScheduling: command.allowsManualScheduling,
      bufferMinutes: command.bufferMinutes,
      maximumAdvanceMonths: command.maximumAdvanceMonths,
      minimumAdvanceMinutes: command.minimumAdvanceMinutes,
      slotPolicy: slotPolicyFromCommand(command.slotPolicy),
    });

    await this.experiences.save(updated);

    const snapshot = updated.toSnapshot();
    const extraIds = snapshot.extraSelectionRules.map((rule) => rule.extraId);
    const [localizedContents, selectableExtras] = await Promise.all([
      this.localizedContent.listPublishableCandidatesByExperienceId(updated.id),
      this.extras.findManyByIds(extraIds),
    ]);

    return experienceToAdminDto(updated, {
      localizedContents,
      selectableExtras,
    });
  }
}
