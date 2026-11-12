import type { PrismaClient } from "@prisma/client";
import type {
  AdsConsent,
  AdsConsentStore,
} from "@/modules/ads/application/ports/AdsConsentStore";

export class PrismaAdsConsentStore implements AdsConsentStore {
  constructor(
    private readonly prisma: Pick<PrismaClient, "adsMeasurementConsent">,
  ) {}
  async create(consent: AdsConsent): Promise<void> {
    await this.prisma.adsMeasurementConsent.create({ data: consent });
  }
  find(id: string): Promise<AdsConsent | null> {
    return this.prisma.adsMeasurementConsent.findUnique({ where: { id } });
  }
  async revoke(id: string, now: Date): Promise<void> {
    await this.prisma.adsMeasurementConsent.updateMany({
      where: { id, revokedAt: null },
      data: { revokedAt: now, oppref: null },
    });
  }
  async purgeExpired(now: Date): Promise<void> {
    await this.prisma.adsMeasurementConsent.deleteMany({
      where: { expiresAt: { lte: now } },
    });
  }
}
