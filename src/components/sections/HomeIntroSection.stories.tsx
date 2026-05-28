import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { HomeIntroSection } from "./HomeIntroSection";

const meta = {
  title: "Sections/HomeIntroSection",
  component: HomeIntroSection,
  parameters: {
    layout: "fullscreen",
  },
} satisfies Meta<typeof HomeIntroSection>;

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
