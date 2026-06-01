import { applicationError } from "@/shared/application/ApplicationError";
import { LocaleCode } from "@/shared/domain/LocaleCode";
import { Slug } from "@/shared/domain/Slug";

import type {
  LocalizedExperienceContentDto,
  UpdateLocalizedExperienceContentCommand,
} from "./LocalizedExperienceContentDtos";
import type { LocalizedExperienceContentRepository } from "./ports/LocalizedExperienceContentRepository";
import { LocalizedExperienceContent } from "../domain/LocalizedExperienceContent";

export class UpdateLocalizedExperienceContentUseCase {
  constructor(
    private readonly contentRepository: LocalizedExperienceContentRepository,
  ) {}

  async execute(
    command: UpdateLocalizedExperienceContentCommand,
  ): Promise<LocalizedExperienceContentDto> {
    const experienceId = command.experienceId.trim();

    if (!experienceId) {
      throw applicationError(
        "EXPERIENCE_ID_MISSING",
        "Experience id is required.",
      );
    }

    const locale = LocaleCode.create(command.locale);
    const content = LocalizedExperienceContent.create({
      bringText: command.bringText,
      faqItems: command.faqItems,
      geoSummary: command.geoSummary,
      h1: command.h1,
      imageAltText: command.imageAltText,
      indexingPolicy: command.indexingPolicy,
      includedText: command.includedText,
      keyFacts: command.keyFacts,
      locale,
      mainContent: command.mainContent,
      publicPageEnabled: command.publicPageEnabled,
      seoDescription: command.seoDescription,
      seoTitle: command.seoTitle,
      slug: Slug.create(command.slug, locale),
      status: command.status,
      summary: command.summary,
      title: command.title,
      visibleTerms: command.visibleTerms,
    });

    if (command.status === "READY" || command.status === "PUBLISHED") {
      content.assertPublishable();
    }

    await this.contentRepository.saveExperienceContent(experienceId, content);

    return toDto(experienceId, content);
  }
}

function toDto(
  experienceId: string,
  content: LocalizedExperienceContent,
): LocalizedExperienceContentDto {
  return {
    ...content.toSnapshot(),
    experienceId,
    publicationIssues: content.getPublicationIssues(),
  };
}
