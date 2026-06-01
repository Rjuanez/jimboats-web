import { applicationError } from "@/shared/application/ApplicationError";

import type { AdminExperienceDto } from "./AdminExperienceDtos";
import { experienceToAdminDto } from "./ExperienceApplicationMappers";
import type { ExperienceRepository } from "./ports/ExperienceRepository";
import type { ExtraRepository } from "./ports/ExtraRepository";
import type { LocalizedExperienceContentReader } from "./ports/LocalizedExperienceContentReader";

export class GetAdminExperienceUseCase {
  constructor(
    private readonly experiences: ExperienceRepository,
    private readonly extras: ExtraRepository,
    private readonly localizedContent: LocalizedExperienceContentReader,
  ) {}

  async execute(experienceId: string): Promise<AdminExperienceDto> {
    const experience = await this.experiences.findById(experienceId);

    if (!experience) {
      throw applicationError(
        "EXPERIENCE_NOT_FOUND",
        "Experience was not found.",
      );
    }

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
