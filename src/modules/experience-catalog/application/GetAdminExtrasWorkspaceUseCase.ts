import type { AdminExtrasWorkspaceDto } from "./AdminExtraDtos";
import { extraToAdminDto } from "./ExperienceApplicationMappers";
import type { ExtraRepository } from "./ports/ExtraRepository";

export class GetAdminExtrasWorkspaceUseCase {
  constructor(private readonly extras: ExtraRepository) {}

  async execute(): Promise<AdminExtrasWorkspaceDto> {
    const extras = await this.extras.list();

    return {
      extras: extras.map(extraToAdminDto),
    };
  }
}
