import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { adminNavItems } from "./AdminNavigation";

import { AdminShell } from "./AdminShell";

const meta = {
  title: "Layout/AdminShell",
  component: AdminShell,
  parameters: {
    layout: "fullscreen",
  },
} satisfies Meta<typeof AdminShell>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    activeItemId: "experiences",
    navItems: adminNavItems,
    children: (
      <div className="rounded-lg border border-slate-200 bg-white p-5">
        Admin content
      </div>
    ),
  },
};
