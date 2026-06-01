import type { AdminExperiencesWorkspaceDto } from "./AdminExperienceDtos";
import { experienceToAdminDto } from "./ExperienceApplicationMappers";
import type { ExperienceRepository } from "./ports/ExperienceRepository";
import type { ExtraRepository } from "./ports/ExtraRepository";
import type { LocalizedExperienceContentReader } from "./ports/LocalizedExperienceContentReader";
import type { Experience } from "../domain/Experience";
import type { Extra } from "../domain/Extra";

export class GetAdminExperiencesWorkspaceUseCase {
  constructor(
    private readonly experiences: ExperienceRepository,
    private readonly extras: ExtraRepository,
    private readonly localizedContent: LocalizedExperienceContentReader,
  ) {}

  async execute(input: {
    locales: string[];
  }): Promise<AdminExperiencesWorkspaceDto> {
    const [experiences, selectableExtras] = await Promise.all([
      this.experiences.list(),
      this.extras.list(),
    ]);

    const items = await Promise.all(
      experiences.map((experience) =>
        this.toWorkspaceItem(experience, selectableExtras),
      ),
    );

    return {
      experiences: items,
      extras: selectableExtras.map((extra) => extra.toSnapshot()),
      locales: input.locales,
    };
  }

  private async toWorkspaceItem(
    experience: Experience,
    selectableExtras: Extra[],
  ) {
    const localizedContents = await this.localizedContent.listByExperienceId(
      experience.id,
    );

    return {
      experience: experienceToAdminDto(experience, {
        localizedContents: localizedContents.map((content) => ({
          isPublishable: () => content.publicationIssues.length === 0,
        })),
        selectableExtras,
      }),
      localizedContents,
    };
  }
}
