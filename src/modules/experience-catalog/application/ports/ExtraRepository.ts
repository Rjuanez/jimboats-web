import type { Extra } from "../../domain/Extra";

export type ExtraRepository = {
  findById(id: string): Promise<Extra | null>;
  findManyByIds(ids: string[]): Promise<Extra[]>;
  list(): Promise<Extra[]>;
  save(extra: Extra): Promise<void>;
};
