import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Pencil } from "lucide-react";

import { IconButton } from "./IconButton";

const meta = {
  title: "UI/IconButton",
  component: IconButton,
  args: {
    icon: <Pencil aria-hidden className="size-4" />,
    label: "Edit item",
  },
} satisfies Meta<typeof IconButton>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Dark: Story = {
  args: {
    tone: "dark",
  },
};

export const Disabled: Story = {
  args: {
    disabled: true,
  },
};
