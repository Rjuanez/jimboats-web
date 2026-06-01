import { applicationError } from "@/shared/application/ApplicationError";

import type {
  AdminExperienceDto,
  DuplicateExperienceCommand,
} from "./AdminExperienceDtos";
import { experienceToAdminDto } from "./ExperienceApplicationMappers";
import type { ExperienceRepository } from "./ports/ExperienceRepository";
import type { ExtraRepository } from "./ports/ExtraRepository";

export class DuplicateExperienceUseCase {
  constructor(
    private readonly experiences: ExperienceRepository,
    private readonly extras: ExtraRepository,
  ) {}

  async execute(
    command: DuplicateExperienceCommand,
  ): Promise<AdminExperienceDto> {
    const [sourceExperience, existingDuplicate] = await Promise.all([
      this.experiences.findById(command.experienceId),
      this.experiences.findById(command.newExperienceId),
    ]);

    if (!sourceExperience) {
      throw applicationError(
        "EXPERIENCE_NOT_FOUND",
        "Experience was not found.",
      );
    }

    if (existingDuplicate) {
      throw applicationError(
        "EXPERIENCE_ALREADY_EXISTS",
        "Experience already exists.",
      );
    }

    const duplicated = sourceExperience.duplicate({
      id: command.newExperienceId,
      internalName: command.newInternalName,
    });

    await this.experiences.save(duplicated);

    const snapshot = duplicated.toSnapshot();
    const extraIds = snapshot.extraSelectionRules.map((rule) => rule.extraId);
    const selectableExtras = await this.extras.findManyByIds(extraIds);

    return experienceToAdminDto(duplicated, {
      localizedContents: [],
      selectableExtras,
    });
  }
}
