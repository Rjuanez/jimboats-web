import { applicationError } from "@/shared/application/ApplicationError";

import type {
  AdminExperienceDto,
  UpdateExperiencePublicationStateCommand,
} from "./AdminExperienceDtos";
import { experienceToAdminDto } from "./ExperienceApplicationMappers";
import type { ExperienceRepository } from "./ports/ExperienceRepository";
import type { ExtraRepository } from "./ports/ExtraRepository";
import type { LocalizedExperienceContentReader } from "./ports/LocalizedExperienceContentReader";
import type { Experience } from "../domain/Experience";

export class UpdateExperiencePublicationStateUseCase {
  constructor(
    private readonly experiences: ExperienceRepository,
    private readonly extras: ExtraRepository,
    private readonly localizedContent: LocalizedExperienceContentReader,
  ) {}

  async execute(
    command: UpdateExperiencePublicationStateCommand,
  ): Promise<AdminExperienceDto> {
    const experience = await this.experiences.findById(command.experienceId);

    if (!experience) {
      throw applicationError(
        "EXPERIENCE_NOT_FOUND",
        "Experience was not found.",
      );
    }

    const context = await this.getPublicationContext(experience);
    const updated =
      command.status === "PUBLISHED"
        ? experience.publish(context)
        : experience.withPublicationState(command.status);

    await this.experiences.save(updated);

    return experienceToAdminDto(updated, context);
  }

  private async getPublicationContext(experience: Experience) {
    const snapshot = experience.toSnapshot();
    const extraIds = snapshot.extraSelectionRules.map((rule) => rule.extraId);
    const [localizedContents, selectableExtras] = await Promise.all([
      this.localizedContent.listPublishableCandidatesByExperienceId(
        experience.id,
      ),
      this.extras.findManyByIds(extraIds),
    ]);

    return {
      localizedContents,
      selectableExtras,
    };
  }
}
