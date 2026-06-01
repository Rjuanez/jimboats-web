import type { Extra } from "../../domain/Extra";

export type ExtraRepository = {
  findManyByIds(ids: string[]): Promise<Extra[]>;
  list(): Promise<Extra[]>;
};
