import type { LocaleCode } from "@/shared/domain/LocaleCode";

import type { LocalizedExperienceContent } from "../../domain/LocalizedExperienceContent";

export type LocalizedExperienceContentRepository = {
  findByExperienceAndLocale(
    experienceId: string,
    locale: LocaleCode,
  ): Promise<LocalizedExperienceContent | null>;
  saveExperienceContent(
    experienceId: string,
    content: LocalizedExperienceContent,
  ): Promise<void>;
};
