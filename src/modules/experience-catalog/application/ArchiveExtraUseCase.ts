import { applicationError } from "@/shared/application/ApplicationError";
import { Money } from "@/shared/domain/Money";

import type { AdminExtraDto, ArchiveExtraCommand } from "./AdminExtraDtos";
import { extraToAdminDto } from "./ExperienceApplicationMappers";
import type { ExtraRepository } from "./ports/ExtraRepository";
import { Extra } from "../domain/Extra";

export class ArchiveExtraUseCase {
  constructor(private readonly extras: ExtraRepository) {}

  async execute(command: ArchiveExtraCommand): Promise<AdminExtraDto> {
    const currentExtra = await this.extras.findById(command.extraId);

    if (!currentExtra) {
      throw applicationError("EXTRA_NOT_FOUND", "Extra was not found.");
    }

    const current = currentExtra.toSnapshot();
    const archived = Extra.create({
      defaultNoticeMinutes: current.defaultNoticeMinutes,
      id: current.id,
      name: current.name,
      price: Money.create(current.price),
      primaryMediaAssetId: current.primaryMediaAssetId,
      status: "ARCHIVED",
    });

    await this.extras.save(archived);

    return extraToAdminDto(archived);
  }
}
