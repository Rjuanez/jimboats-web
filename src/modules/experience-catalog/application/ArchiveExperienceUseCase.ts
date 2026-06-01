import { applicationError } from "@/shared/application/ApplicationError";

import type {
  AdminExperienceDto,
  ArchiveExperienceCommand,
} from "./AdminExperienceDtos";
import { experienceToAdminDto } from "./ExperienceApplicationMappers";
import type { ExperienceRepository } from "./ports/ExperienceRepository";
import type { ExtraRepository } from "./ports/ExtraRepository";
import type { LocalizedExperienceContentReader } from "./ports/LocalizedExperienceContentReader";

export class ArchiveExperienceUseCase {
  constructor(
    private readonly experiences: ExperienceRepository,
    private readonly extras: ExtraRepository,
    private readonly localizedContent: LocalizedExperienceContentReader,
  ) {}

  async execute(
    command: ArchiveExperienceCommand,
  ): Promise<AdminExperienceDto> {
    const experience = await this.experiences.findById(command.experienceId);

    if (!experience) {
      throw applicationError(
        "EXPERIENCE_NOT_FOUND",
        "Experience was not found.",
      );
    }

    const archived = experience.archive();

    await this.experiences.save(archived);

    const snapshot = archived.toSnapshot();
    const extraIds = snapshot.extraSelectionRules.map((rule) => rule.extraId);
    const [localizedContents, selectableExtras] = await Promise.all([
      this.localizedContent.listPublishableCandidatesByExperienceId(
        archived.id,
      ),
      this.extras.findManyByIds(extraIds),
    ]);

    return experienceToAdminDto(archived, {
      localizedContents,
      selectableExtras,
    });
  }
}
