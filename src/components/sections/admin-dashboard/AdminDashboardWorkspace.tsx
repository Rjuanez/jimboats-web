"use client";

import { Bell, Send } from "lucide-react";
import { useState, useTransition } from "react";

import { AdminShell } from "@/components/layout/AdminShell";
import type { AdminNavItem } from "@/components/layout/AdminNavigation";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Surface } from "@/components/ui/Surface";

import type {
  AdminDashboardActions,
  AdminDashboardState,
} from "./AdminDashboardTypes";

type AdminDashboardWorkspaceProps = {
  actions: AdminDashboardActions;
  navItems: AdminNavItem[];
  state: AdminDashboardState;
};

export function AdminDashboardWorkspace({
  actions,
  navItems,
  state,
}: AdminDashboardWorkspaceProps) {
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);

  function sendBroadcastTest() {
    startTransition(async () => {
      setMessage(null);

      const result = await actions.sendBroadcastPushTest();

      if (!result.ok) {
        setMessage(result.message);
        return;
      }

      setMessage(
        `Enviadas: ${result.data.sent}. Fallidas: ${result.data.failed}. Total: ${result.data.total}.`,
      );
    });
  }

  return (
    <AdminShell activeItemId="dashboard" navItems={navItems}>
      <div className="space-y-6">
        <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div className="min-w-0">
            <p className="text-sm font-semibold uppercase tracking-wide text-sky-700">
              JimBoats OS
            </p>
            <h1 className="mt-1 text-2xl font-bold text-slate-950">
              Dashboard
            </h1>
          </div>
        </header>

        <div className="grid gap-6 lg:grid-cols-2">
          <Surface
            action={
              <Badge
                tone={state.activePushSubscriptions > 0 ? "emerald" : "amber"}
              >
                {state.activePushSubscriptions} active
              </Badge>
            }
            title="Push notifications"
            description="Send a test notification to every connected device."
          >
            <div className="flex flex-col gap-4">
              <div className="flex items-start gap-3 rounded-md border border-slate-200 bg-slate-50 p-4">
                <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-md bg-slate-950 text-white">
                  <Bell className="size-5" aria-hidden="true" />
                </span>
                <div className="min-w-0">
                  <h2 className="text-sm font-bold text-slate-950">
                    Prueba JimBoats
                  </h2>
                  <p className="mt-1 text-sm leading-6 text-slate-600">
                    Notificacion de prueba enviada desde el dashboard.
                  </p>
                </div>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <Button
                  className="justify-center gap-2"
                  disabled={state.activePushSubscriptions === 0}
                  loading={isPending}
                  onClick={sendBroadcastTest}
                >
                  <Send className="size-4" aria-hidden="true" />
                  Send test to all
                </Button>
                <Button href="/admin/device-notifications" variant="secondary">
                  Manage devices
                </Button>
              </div>

              {message ? (
                <p
                  className="rounded-md border border-slate-200 bg-white px-3 py-2 text-sm leading-6 text-slate-700"
                  role="status"
                >
                  {message}
                </p>
              ) : null}
            </div>
          </Surface>
        </div>
      </div>
    </AdminShell>
  );
}
