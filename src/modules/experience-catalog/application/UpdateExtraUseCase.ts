import { applicationError } from "@/shared/application/ApplicationError";
import { Money } from "@/shared/domain/Money";

import type { AdminExtraDto, UpdateExtraCommand } from "./AdminExtraDtos";
import { extraToAdminDto, moneyFromMinor } from "./ExperienceApplicationMappers";
import type { ExtraRepository } from "./ports/ExtraRepository";
import { Extra } from "../domain/Extra";

export class UpdateExtraUseCase {
  constructor(private readonly extras: ExtraRepository) {}

  async execute(command: UpdateExtraCommand): Promise<AdminExtraDto> {
    const currentExtra = await this.extras.findById(command.extraId);

    if (!currentExtra) {
      throw applicationError("EXTRA_NOT_FOUND", "Extra was not found.");
    }

    const current = currentExtra.toSnapshot();
    const updated = Extra.create({
      defaultNoticeMinutes:
        command.defaultNoticeMinutes ?? current.defaultNoticeMinutes,
      id: current.id,
      name: command.name ?? current.name,
      price: command.price ? moneyFromMinor(command.price) : Money.create(current.price),
      primaryMediaAssetId:
        command.primaryMediaAssetId === undefined
          ? current.primaryMediaAssetId
          : command.primaryMediaAssetId,
      status: command.status ?? current.status,
    });

    await this.extras.save(updated);

    return extraToAdminDto(updated);
  }
}
