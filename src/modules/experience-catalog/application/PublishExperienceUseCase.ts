import { applicationError } from "@/shared/application/ApplicationError";

import type {
  AdminExperienceDto,
  PublishExperienceCommand,
} from "./AdminExperienceDtos";
import { experienceToAdminDto } from "./ExperienceApplicationMappers";
import type { ExperienceRepository } from "./ports/ExperienceRepository";
import type { ExtraRepository } from "./ports/ExtraRepository";
import type { LocalizedExperienceContentReader } from "./ports/LocalizedExperienceContentReader";

export class PublishExperienceUseCase {
  constructor(
    private readonly experiences: ExperienceRepository,
    private readonly extras: ExtraRepository,
    private readonly localizedContent: LocalizedExperienceContentReader,
  ) {}

  async execute(
    command: PublishExperienceCommand,
  ): Promise<AdminExperienceDto> {
    const experience = await this.experiences.findById(command.experienceId);

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
    const published = experience.publish({
      localizedContents,
      selectableExtras,
    });

    await this.experiences.save(published);

    return experienceToAdminDto(published, {
      localizedContents,
      selectableExtras,
    });
  }
}
