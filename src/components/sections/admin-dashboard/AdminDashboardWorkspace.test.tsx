import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import type { AdminNavItem } from "@/components/layout/AdminNavigation";

import type { AdminDashboardActions } from "./AdminDashboardTypes";
import { AdminDashboardWorkspace } from "./AdminDashboardWorkspace";

describe("AdminDashboardWorkspace", () => {
  it("sends a broadcast push test and shows the result", async () => {
    const user = userEvent.setup();
    const sendBroadcastPushTest = vi.fn(async () => ({
      data: {
        failed: 0,
        sent: 2,
        total: 2,
      },
      ok: true as const,
    }));
    const actions: AdminDashboardActions = {
      sendBroadcastPushTest,
    };

    render(
      <AdminDashboardWorkspace
        actions={actions}
        navItems={navItems}
        state={{ activePushSubscriptions: 2 }}
      />,
    );

    await user.click(
      screen.getByRole("button", {
        name: /send test to all/i,
      }),
    );

    expect(sendBroadcastPushTest).toHaveBeenCalledTimes(1);
    expect(
      await screen.findByText("Enviadas: 2. Fallidas: 0. Total: 2."),
    ).toBeInTheDocument();
  });
});

const navItems: AdminNavItem[] = [
  {
    href: "/admin",
    id: "dashboard",
    label: "Dashboard",
  },
  {
    href: "/admin/device-notifications",
    id: "device-notifications",
    label: "Device notifications",
  },
];
