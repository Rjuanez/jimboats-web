import { describe, expect, it } from "vitest";

import { ApplicationError } from "@/shared/application/ApplicationError";
import { Money } from "@/shared/domain/Money";

import { ArchiveExtraUseCase } from "./ArchiveExtraUseCase";
import { CreateExtraUseCase } from "./CreateExtraUseCase";
import { GetAdminExtrasWorkspaceUseCase } from "./GetAdminExtrasWorkspaceUseCase";
import { UpdateExtraUseCase } from "./UpdateExtraUseCase";
import type { ExtraRepository } from "./ports/ExtraRepository";
import { Extra } from "../domain/Extra";

describe("Admin extra use cases", () => {
  it("lists extras for the admin workspace", async () => {
    const repository = new InMemoryExtraRepository([
      createExtra({ primaryMediaAssetId: "asset-champagne" }),
    ]);

    const result = await new GetAdminExtrasWorkspaceUseCase(
      repository,
    ).execute();

    expect(result.extras).toMatchObject([
      {
        id: "premium-champagne",
        primaryMediaAssetId: "asset-champagne",
      },
    ]);
  });

  it("creates a draft extra and stores it through the repository port", async () => {
    const repository = new InMemoryExtraRepository();

    const result = await new CreateExtraUseCase(repository).execute({
      defaultNoticeMinutes: 24 * 60,
      id: "mediterranean-snacks",
      name: "Mediterranean snacks",
      price: moneyDto(6_500),
      primaryMediaAssetId: "asset-snacks",
    });

    expect(result).toMatchObject({
      id: "mediterranean-snacks",
      primaryMediaAssetId: "asset-snacks",
      status: "DRAFT",
    });
    await expect(repository.findById("mediterranean-snacks")).resolves.not.toBeNull();
  });

  it("does not create a duplicate extra", async () => {
    const repository = new InMemoryExtraRepository([createExtra()]);

    await expect(
      new CreateExtraUseCase(repository).execute({
        defaultNoticeMinutes: 0,
        id: "premium-champagne",
        name: "Premium champagne",
        price: moneyDto(9_000),
      }),
    ).rejects.toMatchObject({
      code: "EXTRA_ALREADY_EXISTS",
    } satisfies Partial<ApplicationError>);
  });

  it("updates operational fields and media reference", async () => {
    const repository = new InMemoryExtraRepository([createExtra()]);

    const result = await new UpdateExtraUseCase(repository).execute({
      defaultNoticeMinutes: 48 * 60,
      extraId: "premium-champagne",
      name: "Premium cava",
      price: moneyDto(10_000),
      primaryMediaAssetId: "asset-cava",
      status: "ACTIVE",
    });

    expect(result).toMatchObject({
      defaultNoticeMinutes: 48 * 60,
      name: "Premium cava",
      price: moneyDto(10_000),
      primaryMediaAssetId: "asset-cava",
      status: "ACTIVE",
    });
  });

  it("archives an extra without deleting it", async () => {
    const repository = new InMemoryExtraRepository([createExtra()]);

    const result = await new ArchiveExtraUseCase(repository).execute({
      extraId: "premium-champagne",
    });

    expect(result.status).toBe("ARCHIVED");
    await expect(repository.findById("premium-champagne")).resolves.not.toBeNull();
  });
});

class InMemoryExtraRepository implements ExtraRepository {
  private readonly records = new Map<string, Extra>();

  constructor(extras: Extra[] = []) {
    for (const extra of extras) {
      this.records.set(extra.id, extra);
    }
  }

  async findById(id: string) {
    return this.records.get(id) ?? null;
  }

  async findManyByIds(ids: string[]) {
    const uniqueIds = [...new Set(ids)];

    return uniqueIds.flatMap((id) => {
      const extra = this.records.get(id);

      return extra ? [extra] : [];
    });
  }

  async list() {
    return [...this.records.values()];
  }

  async save(extra: Extra) {
    this.records.set(extra.id, extra);
  }
}

function createExtra(patch: Partial<Parameters<typeof Extra.create>[0]> = {}) {
  return Extra.create({
    defaultNoticeMinutes: 0,
    id: "premium-champagne",
    name: "Premium champagne",
    price: Money.create(moneyDto(9_000)),
    status: "ACTIVE",
    ...patch,
  });
}

function moneyDto(amountMinor: number) {
  return {
    amountMinor,
    currency: "EUR" as const,
  };
}
