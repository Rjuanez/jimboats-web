import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { homeLandingContent } from "@/interface/next/presenters/homeLandingPresenter";

import { ExperienceCard } from "./ExperienceCard";

const [experience] = homeLandingContent.experiences;

const meta = {
  title: "Marketing/ExperienceCard",
  component: ExperienceCard,
  args: experience,
  parameters: {
    layout: "fullscreen",
  },
  decorators: [
    (Story) => (
      <div className="bg-background px-4 py-10 lg:px-12">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof ExperienceCard>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Reversed: Story = {
  args: homeLandingContent.experiences[1],
};
