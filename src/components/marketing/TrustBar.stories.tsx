import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { homeLandingContent } from "@/interface/next/presenters/homeLandingPresenter";

import { TrustBar } from "./TrustBar";

const meta = {
  title: "Marketing/TrustBar",
  component: TrustBar,
  args: {
    items: homeLandingContent.trustItems,
  },
  parameters: {
    layout: "fullscreen",
  },
} satisfies Meta<typeof TrustBar>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Mobile: Story = {
  parameters: {
    viewport: {
      defaultViewport: "mobile1",
    },
  },
};
