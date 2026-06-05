import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { getAdminMediaPreviewPage } from "@/interface/next/presenters/adminMediaPresenter";

import type { AdminMediaActions } from "./AdminMediaTypes";
import { AdminMediaWorkspace } from "./AdminMediaWorkspace";

const pageData = getAdminMediaPreviewPage();
const actions = {
  requestReprocess: async () => ({
    data: {
      state: pageData,
    },
    ok: true,
  }),
  updateMetadata: async () => ({
    data: {
      state: pageData,
    },
    ok: true,
  }),
  uploadAsset: async () => ({
    data: {
      assetId: "uploaded-asset",
      state: pageData,
    },
    ok: true,
  }),
} satisfies AdminMediaActions;

const meta = {
  title: "Sections/Admin Media Workspace",
  component: AdminMediaWorkspace,
  parameters: {
    layout: "fullscreen",
  },
} satisfies Meta<typeof AdminMediaWorkspace>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Library: Story = {
  args: {
    actions,
    pageData,
    view: "library",
  },
};

export const Detail: Story = {
  args: {
    actions,
    assetId: "sunset-experience-hero",
    pageData,
    view: "detail",
  },
};

export const Processing: Story = {
  args: {
    actions,
    assetId: "morning-breeze-cover",
    pageData,
    view: "detail",
  },
};
