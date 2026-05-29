import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { homeLandingContent } from "@/interface/next/presenters/homeLandingPresenter";

import { UpgradeCard } from "./UpgradeCard";

const [upgrade] = homeLandingContent.extras.items;

const meta = {
  title: "Marketing/UpgradeCard",
  component: UpgradeCard,
  args: upgrade,
  decorators: [
    (Story) => (
      <div className="max-w-md bg-background p-6 md:max-w-none">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof UpgradeCard>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const LongText: Story = {
  args: {
    ...upgrade,
    description:
      "A quiet, guided paddle session with calm water time before returning to the boat.",
  },
};
