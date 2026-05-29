import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { homeLandingContent } from "@/interface/next/presenters/homeLandingPresenter";

import { HomeLandingPage } from "./HomeLandingPage";

const meta = {
  title: "Sections/HomeLandingPage",
  component: HomeLandingPage,
  args: {
    content: homeLandingContent,
  },
  parameters: {
    layout: "fullscreen",
  },
} satisfies Meta<typeof HomeLandingPage>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Mobile: Story = {
  parameters: {
    viewport: {
      defaultViewport: "mobile1",
    },
  },
};
