import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { Button } from "./Button";
import { Surface } from "./Surface";

const meta = {
  title: "UI/Surface",
  component: Surface,
  args: {
    children: (
      <p className="text-sm leading-6 text-slate-600">
        A quiet admin surface for forms, tables and status summaries.
      </p>
    ),
    description: "Reusable admin page section.",
    title: "Surface title",
  },
  decorators: [
    (Story) => (
      <div className="min-h-screen bg-slate-50 p-4">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Surface>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithAction: Story = {
  args: {
    action: (
      <Button size="sm" variant="secondary">
        Manage
      </Button>
    ),
  },
};
