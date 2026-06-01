import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { getAdminMediaPreviewPage } from "@/interface/next/presenters/adminMediaPresenter";

import { AdminMediaWorkspace } from "./AdminMediaWorkspace";

const pageData = getAdminMediaPreviewPage();

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
    pageData,
    view: "library",
  },
};

export const Detail: Story = {
  args: {
    assetId: "sunset-experience-hero",
    pageData,
    view: "detail",
  },
};

export const Processing: Story = {
  args: {
    assetId: "morning-breeze-cover",
    pageData,
    view: "detail",
  },
};
