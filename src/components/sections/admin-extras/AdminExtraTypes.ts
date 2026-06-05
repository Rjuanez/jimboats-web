import type { AdminNavItem } from "@/components/layout/AdminNavigation";

export type AdminExtraStatus = "active" | "archived" | "draft";
export type AdminExtraMediaStatus =
  | "failed"
  | "missing"
  | "processing"
  | "ready";

export type AdminExtraMediaVariant = {
  publicUrl: string;
  width: number;
};

export type AdminExtraMedia = {
  assetId: string | null;
  filename: string;
  primaryImageUrl: string;
  status: AdminExtraMediaStatus;
  title: string;
  variants: AdminExtraMediaVariant[];
};

export type AdminExtraMediaAssetOption = {
  assetId: string;
  collection: "Experiences" | "Extras" | "Gallery" | "Pages";
  filename: string;
  primaryImageUrl: string;
  status: AdminExtraMediaStatus;
  title: string;
  variants: AdminExtraMediaVariant[];
};

export type AdminExtra = {
  defaultNoticeHours: number;
  id: string;
  media: AdminExtraMedia;
  name: string;
  price: number;
  status: AdminExtraStatus;
};

export type AdminExtraMutation = (
  updater: (extra: AdminExtra) => AdminExtra,
) => void;

export type AdminExtraCreateInput = {
  defaultNoticeHours: number;
  name: string;
  price: number;
};

export type AdminExtrasState = {
  extras: AdminExtra[];
  mediaAssets: AdminExtraMediaAssetOption[];
};

export type AdminExtrasPageData = {
  navItems: AdminNavItem[];
  state: AdminExtrasState;
};

export type AdminExtraView = "create" | "detail" | "list";

export type AdminExtraActionResult<TData = undefined> =
  | {
      data: TData;
      ok: true;
    }
  | {
      message: string;
      ok: false;
    };

export type AdminExtraActions = {
  archiveExtra: (input: {
    extraId: string;
  }) => Promise<AdminExtraActionResult<{ state: AdminExtrasState }>>;
  createExtra: (
    input: AdminExtraCreateInput,
  ) => Promise<
    AdminExtraActionResult<{ extraId: string; state: AdminExtrasState }>
  >;
  saveExtra: (
    input: AdminExtra,
  ) => Promise<AdminExtraActionResult<{ state: AdminExtrasState }>>;
};
