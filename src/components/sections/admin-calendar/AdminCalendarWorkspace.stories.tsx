import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { getAdminCalendarPreviewPage } from "@/interface/next/presenters/adminCalendarPresenter";

import type { AdminCalendarActions } from "./AdminCalendarTypes";
import { AdminCalendarWorkspace } from "./AdminCalendarWorkspace";

const pageData = getAdminCalendarPreviewPage();
const actions = {
  createManualBlock: async () => ({
    data: {
      state: pageData.state,
    },
    ok: true,
  }),
  releaseManualBlock: async () => ({
    data: {
      state: pageData.state,
    },
    ok: true,
  }),
} satisfies AdminCalendarActions;

const meta = {
  title: "Sections/Admin Calendar Workspace",
  component: AdminCalendarWorkspace,
  parameters: {
    layout: "fullscreen",
  },
} satisfies Meta<typeof AdminCalendarWorkspace>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    actions,
    pageData,
  },
};

export const Empty: Story = {
  args: {
    actions,
    pageData: {
      ...pageData,
      state: {
        ...pageData.state,
        blocks: [],
        summary: {
          activeBlocks: 0,
          bookingBlocks: 0,
          manualBlocks: 0,
          releasedBlocks: 0,
        },
      },
    },
  },
};
