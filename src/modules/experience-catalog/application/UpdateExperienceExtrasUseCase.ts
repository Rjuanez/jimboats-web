import { applicationError } from "@/shared/application/ApplicationError";

import type {
  AdminExperienceDto,
  UpdateExperienceExtrasCommand,
} from "./AdminExperienceDtos";
import {
  experienceToAdminDto,
  extraRulesFromCommand,
} from "./ExperienceApplicationMappers";
import type { ExperienceRepository } from "./ports/ExperienceRepository";
import type { ExtraRepository } from "./ports/ExtraRepository";
import type { LocalizedExperienceContentReader } from "./ports/LocalizedExperienceContentReader";

export class UpdateExperienceExtrasUseCase {
  constructor(
    private readonly experiences: ExperienceRepository,
    private readonly extras: ExtraRepository,
    private readonly localizedContent: LocalizedExperienceContentReader,
  ) {}

  async execute(
    command: UpdateExperienceExtrasCommand,
  ): Promise<AdminExperienceDto> {
    const experience = await this.experiences.findById(command.experienceId);

    if (!experience) {
      throw applicationError(
        "EXPERIENCE_NOT_FOUND",
        "Experience was not found.",
      );
    }

    const extraSelectionRules = extraRulesFromCommand(
      command.extraSelectionRules,
    );
    const selectableExtras = await this.extras.findManyByIds(
      extraSelectionRules.map((rule) => rule.extraId),
    );
    const selectableExtraIds = new Set(
      selectableExtras.map((extra) => extra.id),
    );
    const missingRule = extraSelectionRules.find((rule) => {
      return !selectableExtraIds.has(rule.extraId);
    });

    if (missingRule) {
      throw applicationError(
        "EXTRA_NOT_FOUND",
        `Extra ${missingRule.extraId} was not found.`,
      );
    }

    for (const rule of extraSelectionRules) {
      if (rule.enabled) {
        selectableExtras
          .find((extra) => extra.id === rule.extraId)
          ?.assertSelectable();
      }
    }

    const updated = experience.withExtraSelectionRules(extraSelectionRules);

    await this.experiences.save(updated);

    const localizedContents =
      await this.localizedContent.listPublishableCandidatesByExperienceId(
        updated.id,
      );

    return experienceToAdminDto(updated, {
      localizedContents,
      selectableExtras,
    });
  }
}
