import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { getAdminExtrasPreviewPage } from "@/interface/next/presenters/adminExtrasPresenter";

import { AdminExtrasWorkspace } from "./AdminExtrasWorkspace";
import type { AdminExtraActions } from "./AdminExtraTypes";

const pageData = getAdminExtrasPreviewPage();

const actions: AdminExtraActions = {
  archiveExtra: async () => ({
    data: {
      state: pageData.state,
    },
    ok: true,
  }),
  createExtra: async () => ({
    data: {
      extraId: "new-extra",
      state: pageData.state,
    },
    ok: true,
  }),
  saveExtra: async () => ({
    data: {
      state: pageData.state,
    },
    ok: true,
  }),
};

const meta = {
  title: "Sections/Admin Extras Workspace",
  component: AdminExtrasWorkspace,
  parameters: {
    layout: "fullscreen",
  },
} satisfies Meta<typeof AdminExtrasWorkspace>;

export default meta;

type Story = StoryObj<typeof meta>;

export const List: Story = {
  args: {
    actions,
    initialState: pageData.state,
    navItems: pageData.navItems,
    view: "list",
  },
};

export const Detail: Story = {
  args: {
    actions,
    extraId: "premium-champagne",
    initialState: pageData.state,
    navItems: pageData.navItems,
    view: "detail",
  },
};

export const Create: Story = {
  args: {
    actions,
    initialState: pageData.state,
    navItems: pageData.navItems,
    view: "create",
  },
};
