import type { ExperienceRepository } from "@/modules/experience-catalog/application/ports/ExperienceRepository";

import type { AdminCouponsWorkspaceDto } from "./AdminCouponDtos";
import type { AdminCouponRepository } from "./ports/AdminCouponRepository";

export class GetAdminCouponsWorkspaceUseCase {
  constructor(
    private readonly coupons: AdminCouponRepository,
    private readonly experiences: ExperienceRepository,
  ) {}

  async execute(): Promise<AdminCouponsWorkspaceDto> {
    const [coupons, experiences] = await Promise.all([
      this.coupons.list(),
      this.experiences.list(),
    ]);

    return {
      coupons,
      experiences: experiences.map((experience) => {
        const snapshot = experience.toSnapshot();

        return {
          id: snapshot.id,
          name: snapshot.internalName,
          status: snapshot.status,
        };
      }),
    };
  }
}
