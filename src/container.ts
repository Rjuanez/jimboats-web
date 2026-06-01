import type {
  ArchiveExperienceCommand,
  CreateExperienceCommand,
  DuplicateExperienceCommand,
  UpdateExperienceAvailabilityCommand,
  UpdateExperienceCoreCommand,
  UpdateExperienceExtrasCommand,
  UpdateExperienceMediaCommand,
  UpdateExperiencePublicationStateCommand,
} from "@/modules/experience-catalog/application/AdminExperienceDtos";
import { ArchiveExperienceUseCase } from "@/modules/experience-catalog/application/ArchiveExperienceUseCase";
import { CreateExperienceUseCase } from "@/modules/experience-catalog/application/CreateExperienceUseCase";
import { DuplicateExperienceUseCase } from "@/modules/experience-catalog/application/DuplicateExperienceUseCase";
import { GetAdminExperiencesWorkspaceUseCase } from "@/modules/experience-catalog/application/GetAdminExperiencesWorkspaceUseCase";
import { UpdateExperienceAvailabilityUseCase } from "@/modules/experience-catalog/application/UpdateExperienceAvailabilityUseCase";
import { UpdateExperienceCoreUseCase } from "@/modules/experience-catalog/application/UpdateExperienceCoreUseCase";
import { UpdateExperienceExtrasUseCase } from "@/modules/experience-catalog/application/UpdateExperienceExtrasUseCase";
import { UpdateExperienceMediaUseCase } from "@/modules/experience-catalog/application/UpdateExperienceMediaUseCase";
import { UpdateExperiencePublicationStateUseCase } from "@/modules/experience-catalog/application/UpdateExperiencePublicationStateUseCase";
import type { UpdateLocalizedExperienceContentCommand } from "@/modules/localization-seo/application/LocalizedExperienceContentDtos";
import { UpdateLocalizedExperienceContentUseCase } from "@/modules/localization-seo/application/UpdateLocalizedExperienceContentUseCase";

import { PrismaExperienceRepository } from "./infrastructure/db/prisma/PrismaExperienceRepository";
import type { PrismaExperienceRepositoryClient } from "./infrastructure/db/prisma/PrismaExperienceRepository";
import { PrismaExtraRepository } from "./infrastructure/db/prisma/PrismaExtraRepository";
import type { PrismaExtraRepositoryClient } from "./infrastructure/db/prisma/PrismaExtraRepository";
import { PrismaLocalizedExperienceContentRepository } from "./infrastructure/db/prisma/PrismaLocalizedExperienceContentRepository";
import type { PrismaLocalizedExperienceContentClient } from "./infrastructure/db/prisma/PrismaLocalizedExperienceContentRepository";
import { getPrismaClient } from "./infrastructure/db/prisma/prismaClient";

const adminLocales = ["en", "es", "ca"] as const;

export function getContainer() {
  const prisma = getPrismaClient();
  const experienceRepository = new PrismaExperienceRepository(
    prisma as unknown as PrismaExperienceRepositoryClient,
  );
  const extraRepository = new PrismaExtraRepository(
    prisma as unknown as PrismaExtraRepositoryClient,
  );
  const localizedContentRepository =
    new PrismaLocalizedExperienceContentRepository(
      prisma as unknown as PrismaLocalizedExperienceContentClient,
    );

  const getWorkspaceUseCase = new GetAdminExperiencesWorkspaceUseCase(
    experienceRepository,
    extraRepository,
    localizedContentRepository,
  );
  const createExperienceUseCase = new CreateExperienceUseCase(
    experienceRepository,
    extraRepository,
  );
  const updateCoreUseCase = new UpdateExperienceCoreUseCase(
    experienceRepository,
    extraRepository,
    localizedContentRepository,
  );
  const updateAvailabilityUseCase = new UpdateExperienceAvailabilityUseCase(
    experienceRepository,
    extraRepository,
    localizedContentRepository,
  );
  const updateExtrasUseCase = new UpdateExperienceExtrasUseCase(
    experienceRepository,
    extraRepository,
    localizedContentRepository,
  );
  const updateMediaUseCase = new UpdateExperienceMediaUseCase(
    experienceRepository,
    extraRepository,
    localizedContentRepository,
  );
  const updatePublicationStateUseCase =
    new UpdateExperiencePublicationStateUseCase(
      experienceRepository,
      extraRepository,
      localizedContentRepository,
    );
  const archiveExperienceUseCase = new ArchiveExperienceUseCase(
    experienceRepository,
    extraRepository,
    localizedContentRepository,
  );
  const duplicateExperienceUseCase = new DuplicateExperienceUseCase(
    experienceRepository,
    extraRepository,
  );
  const updateLocalizedExperienceContentUseCase =
    new UpdateLocalizedExperienceContentUseCase(localizedContentRepository);

  return {
    adminExperiences: {
      archiveExperience: (command: ArchiveExperienceCommand) =>
        archiveExperienceUseCase.execute(command),
      createExperience: (command: CreateExperienceCommand) =>
        createExperienceUseCase.execute(command),
      duplicateExperience: (command: DuplicateExperienceCommand) =>
        duplicateExperienceUseCase.execute(command),
      getWorkspace: () =>
        getWorkspaceUseCase.execute({
          locales: [...adminLocales],
        }),
      updateAvailability: (command: UpdateExperienceAvailabilityCommand) =>
        updateAvailabilityUseCase.execute(command),
      updateCore: (command: UpdateExperienceCoreCommand) =>
        updateCoreUseCase.execute(command),
      updateExtras: (command: UpdateExperienceExtrasCommand) =>
        updateExtrasUseCase.execute(command),
      updateLocalizedContent: (
        command: UpdateLocalizedExperienceContentCommand,
      ) => updateLocalizedExperienceContentUseCase.execute(command),
      updateMedia: (command: UpdateExperienceMediaCommand) =>
        updateMediaUseCase.execute(command),
      updatePublicationState: (
        command: UpdateExperiencePublicationStateCommand,
      ) => updatePublicationStateUseCase.execute(command),
    },
  };
}

export type AppContainer = ReturnType<typeof getContainer>;
