import { applicationError } from "@/shared/application/ApplicationError";

import type { AdminExtraDto, CreateExtraCommand } from "./AdminExtraDtos";
import { extraToAdminDto, moneyFromMinor } from "./ExperienceApplicationMappers";
import type { ExtraRepository } from "./ports/ExtraRepository";
import { Extra } from "../domain/Extra";

export class CreateExtraUseCase {
  constructor(private readonly extras: ExtraRepository) {}

  async execute(command: CreateExtraCommand): Promise<AdminExtraDto> {
    const existingExtra = await this.extras.findById(command.id);

    if (existingExtra) {
      throw applicationError("EXTRA_ALREADY_EXISTS", "Extra already exists.");
    }

    const extra = Extra.create({
      defaultNoticeMinutes: command.defaultNoticeMinutes,
      id: command.id,
      name: command.name,
      price: moneyFromMinor(command.price),
      primaryMediaAssetId: command.primaryMediaAssetId ?? null,
      status: command.status ?? "DRAFT",
    });

    await this.extras.save(extra);

    return extraToAdminDto(extra);
  }
}
