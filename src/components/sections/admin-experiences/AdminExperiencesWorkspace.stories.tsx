import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { getAdminExperiencesPreviewPage } from "@/interface/next/presenters/adminExperiencesPresenter";

import { AdminExperiencesWorkspace } from "./AdminExperiencesWorkspace";
import type { AdminExperienceActions } from "./AdminExperienceTypes";

const pageData = getAdminExperiencesPreviewPage();
const actions: AdminExperienceActions = {
  archiveExperience: async () => ({
    data: {
      state: pageData.state,
    },
    ok: true,
  }),
  createExperience: async () => ({
    data: {
      experienceId: "new-experience",
      state: pageData.state,
    },
    ok: true,
  }),
  duplicateExperience: async () => ({
    data: {
      experienceId: "sunset-experience-copy",
      state: pageData.state,
    },
    ok: true,
  }),
  saveExperience: async () => ({
    data: {
      state: pageData.state,
    },
    ok: true,
  }),
};

const meta = {
  title: "Sections/AdminExperiencesWorkspace",
  component: AdminExperiencesWorkspace,
  parameters: {
    layout: "fullscreen",
  },
} satisfies Meta<typeof AdminExperiencesWorkspace>;

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

export const Overview: Story = {
  args: {
    actions,
    experienceId: "sunset-experience",
    initialState: pageData.state,
    navItems: pageData.navItems,
    view: "overview",
  },
};

export const Content: Story = {
  args: {
    actions,
    experienceId: "sunset-experience",
    initialState: pageData.state,
    navItems: pageData.navItems,
    view: "content",
  },
};
