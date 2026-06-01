import type { AdminExperienceListDto } from "./AdminExperienceDtos";
import { experienceToAdminListItemDto } from "./ExperienceApplicationMappers";
import type { ExperienceRepository } from "./ports/ExperienceRepository";
import type { ExtraRepository } from "./ports/ExtraRepository";
import type { LocalizedExperienceContentReader } from "./ports/LocalizedExperienceContentReader";

export class ListAdminExperiencesUseCase {
  constructor(
    private readonly experiences: ExperienceRepository,
    private readonly extras: ExtraRepository,
    private readonly localizedContent: LocalizedExperienceContentReader,
  ) {}

  async execute(): Promise<AdminExperienceListDto> {
    const [experiences, selectableExtras] = await Promise.all([
      this.experiences.list(),
      this.extras.list(),
    ]);

    const items = await Promise.all(
      experiences.map(async (experience) => {
        const localizedContents =
          await this.localizedContent.listPublishableCandidatesByExperienceId(
            experience.id,
          );

        return experienceToAdminListItemDto(experience, {
          localizedContents,
          selectableExtras,
        });
      }),
    );

    return {
      experiences: items,
    };
  }
}
