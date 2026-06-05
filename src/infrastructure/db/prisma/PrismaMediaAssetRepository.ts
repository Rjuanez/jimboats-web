import type { MediaAssetRepository } from "@/modules/media-library/application/ports/MediaAssetRepository";
import type { MediaAsset } from "@/modules/media-library/domain/MediaAsset";

import {
  mediaAssetFromPrismaRecord,
  mediaAssetToPrismaWriteModel,
} from "./PrismaMediaLibraryMappers";
import type {
  PrismaMediaAltTextRecord,
  PrismaMediaAssetRecord,
  PrismaMediaAssetVariantRecord,
  PrismaMediaAssetWriteModel,
} from "./PrismaMediaLibraryMappers";

type MediaAssetFindArgs = {
  include?: unknown;
  orderBy?: unknown;
  where?: unknown;
};

type MediaAssetUpsertArgs = {
  create: PrismaMediaAssetWriteModel["asset"] & { id: string };
  update: PrismaMediaAssetWriteModel["asset"];
  where: { id: string };
};

type DeleteByAssetArgs = {
  where: { mediaAssetId: string };
};

type CreateVariantsArgs = {
  data: Array<
    PrismaMediaAssetWriteModel["variants"][number] & { mediaAssetId: string }
  >;
};

type CreateAltTextsArgs = {
  data: Array<
    PrismaMediaAssetWriteModel["altTexts"][number] & { mediaAssetId: string }
  >;
};

type MediaAssetDelegate = {
  findMany(args: MediaAssetFindArgs): Promise<PrismaMediaAssetRecord[]>;
  findUnique(args: MediaAssetFindArgs): Promise<PrismaMediaAssetRecord | null>;
  upsert(args: MediaAssetUpsertArgs): Promise<unknown>;
};

type MediaVariantDelegate = {
  createMany(args: CreateVariantsArgs): Promise<unknown>;
  deleteMany(args: DeleteByAssetArgs): Promise<unknown>;
};

type MediaAltTextDelegate = {
  createMany(args: CreateAltTextsArgs): Promise<unknown>;
  deleteMany(args: DeleteByAssetArgs): Promise<unknown>;
};

export type PrismaMediaAssetRepositoryTransaction = {
  mediaAltText: MediaAltTextDelegate;
  mediaAsset: MediaAssetDelegate;
  mediaAssetVariant: MediaVariantDelegate;
};

export type PrismaMediaAssetRepositoryClient =
  PrismaMediaAssetRepositoryTransaction & {
    $transaction?<T>(
      operation: (
        transaction: PrismaMediaAssetRepositoryTransaction,
      ) => Promise<T>,
    ): Promise<T>;
  };

const mediaAssetInclude = {
  altTexts: {
    orderBy: {
      locale: "asc",
    },
  },
  variants: {
    orderBy: {
      variantKey: "asc",
    },
  },
};

export class PrismaMediaAssetRepository implements MediaAssetRepository {
  constructor(private readonly prisma: PrismaMediaAssetRepositoryClient) {}

  async list() {
    const records = await this.prisma.mediaAsset.findMany({
      include: mediaAssetInclude,
      orderBy: {
        updatedAt: "desc",
      },
    });

    return records.map(mediaAssetFromPrismaRecord);
  }

  async findById(id: string) {
    const record = await this.prisma.mediaAsset.findUnique({
      include: mediaAssetInclude,
      where: {
        id,
      },
    });

    return record ? mediaAssetFromPrismaRecord(record) : null;
  }

  async save(asset: MediaAsset) {
    const writeModel = mediaAssetToPrismaWriteModel(asset);

    await runMediaAssetOperation(this.prisma, async (transaction) => {
      await transaction.mediaAsset.upsert({
        create: {
          id: writeModel.id,
          ...writeModel.asset,
        },
        update: writeModel.asset,
        where: {
          id: writeModel.id,
        },
      });

      await transaction.mediaAssetVariant.deleteMany({
        where: {
          mediaAssetId: writeModel.id,
        },
      });

      await transaction.mediaAltText.deleteMany({
        where: {
          mediaAssetId: writeModel.id,
        },
      });

      if (writeModel.variants.length > 0) {
        await transaction.mediaAssetVariant.createMany({
          data: writeModel.variants.map((variant) => ({
            mediaAssetId: writeModel.id,
            ...variant,
          })),
        });
      }

      if (writeModel.altTexts.length > 0) {
        await transaction.mediaAltText.createMany({
          data: writeModel.altTexts.map((altText) => ({
            mediaAssetId: writeModel.id,
            ...altText,
          })),
        });
      }
    });
  }
}

async function runMediaAssetOperation<T>(
  client: PrismaMediaAssetRepositoryClient,
  operation: (transaction: PrismaMediaAssetRepositoryTransaction) => Promise<T>,
) {
  if (client.$transaction) {
    return client.$transaction(operation);
  }

  return operation(client);
}

export type {
  PrismaMediaAltTextRecord,
  PrismaMediaAssetRecord,
  PrismaMediaAssetVariantRecord,
};
