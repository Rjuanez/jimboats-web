import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { adminNavItems } from "@/components/layout/AdminNavigation";

import type { AdminDashboardActions } from "./AdminDashboardTypes";
import { AdminDashboardWorkspace } from "./AdminDashboardWorkspace";

const actions: AdminDashboardActions = {
  async sendBroadcastPushTest() {
    return {
      data: {
        failed: 0,
        sent: 2,
        total: 2,
      },
      ok: true,
    };
  },
};

const meta = {
  args: {
    actions,
    navItems: adminNavItems,
    state: {
      activePushSubscriptions: 2,
    },
  },
  component: AdminDashboardWorkspace,
  title: "Admin/Dashboard Workspace",
} satisfies Meta<typeof AdminDashboardWorkspace>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
