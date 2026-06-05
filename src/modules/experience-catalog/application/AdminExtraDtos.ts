import type { ExtraSnapshot, ExtraStatus } from "../domain/Extra";
import type { MoneyDto } from "./AdminExperienceDtos";

export type AdminExtraDto = ExtraSnapshot;

export type AdminExtrasWorkspaceDto = {
  extras: AdminExtraDto[];
};

export type CreateExtraCommand = {
  defaultNoticeMinutes: number;
  id: string;
  name: string;
  price: MoneyDto;
  primaryMediaAssetId?: string | null;
  status?: Exclude<ExtraStatus, "ARCHIVED">;
};

export type UpdateExtraCommand = {
  defaultNoticeMinutes?: number;
  extraId: string;
  name?: string;
  price?: MoneyDto;
  primaryMediaAssetId?: string | null;
  status?: ExtraStatus;
};

export type ArchiveExtraCommand = {
  extraId: string;
};
