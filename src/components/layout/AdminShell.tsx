import {
  Anchor,
  CalendarDays,
  ClipboardList,
  FileText,
  Gauge,
  Image as ImageIcon,
  Languages,
  Settings,
  Sparkles,
  Tags,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";

import { cn } from "@/design/variants";

import type { AdminNavItem } from "./AdminNavigation";

type AdminShellProps = {
  activeItemId: AdminNavItem["id"];
  children: ReactNode;
  navItems: AdminNavItem[];
};

const navIcons = {
  bookings: ClipboardList,
  calendar: CalendarDays,
  content: FileText,
  dashboard: Gauge,
  experiences: Anchor,
  extras: Tags,
  localization: Languages,
  media: ImageIcon,
  settings: Settings,
} satisfies Record<AdminNavItem["id"], LucideIcon>;

export function AdminShell({
  activeItemId,
  children,
  navItems,
}: AdminShellProps) {
  return (
    <div className="min-h-screen bg-slate-100 text-slate-950">
      <div className="flex min-h-screen">
        <aside
          aria-label="Admin sidebar"
          className="hidden w-64 shrink-0 border-r border-slate-200 bg-white lg:flex lg:flex-col"
        >
          <AdminBrand />
          <nav aria-label="Admin navigation" className="flex-1 px-3 py-4">
            <AdminNavList activeItemId={activeItemId} navItems={navItems} />
          </nav>
          <div className="border-t border-slate-200 px-4 py-4">
            <p className="text-sm font-semibold text-slate-950">Admin User</p>
            <p className="mt-1 text-xs text-slate-500">Admin and staff</p>
          </div>
        </aside>

        <div className="min-w-0 flex-1">
          <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/95 backdrop-blur lg:hidden">
            <div className="px-4 py-3">
              <AdminBrand compact />
            </div>
            <nav
              aria-label="Admin navigation"
              className="overflow-x-auto border-t border-slate-200 px-3 py-2"
            >
              <div className="flex min-w-max gap-2">
                <AdminNavList
                  activeItemId={activeItemId}
                  compact
                  navItems={navItems}
                />
              </div>
            </nav>
          </header>

          <main className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}

function AdminBrand({ compact = false }: { compact?: boolean }) {
  return (
    <Link
      className={cn(
        "flex items-center gap-3 text-slate-950",
        compact ? "min-h-10" : "border-b border-slate-200 px-4 py-5",
      )}
      href="/admin/experiences"
    >
      <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-md bg-slate-950 text-white">
        <Sparkles className="size-5" aria-hidden="true" />
      </span>
      <span className="min-w-0">
        <span className="block text-base font-bold leading-none">
          JimBoats OS
        </span>
        <span className="mt-1 block text-xs font-medium text-slate-500">
          Charter operations
        </span>
      </span>
    </Link>
  );
}

function AdminNavList({
  activeItemId,
  compact = false,
  navItems,
}: {
  activeItemId: AdminNavItem["id"];
  compact?: boolean;
  navItems: AdminNavItem[];
}) {
  return (
    <>
      {navItems.map((item) => {
        const Icon = navIcons[item.id];
        const isActive = item.id === activeItemId;

        return (
          <Link
            aria-current={isActive ? "page" : undefined}
            className={cn(
              "flex items-center gap-3 rounded-md text-sm font-semibold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-700",
              compact ? "min-h-9 px-3" : "mb-1 min-h-10 px-3 last:mb-0",
              isActive
                ? "bg-slate-950 text-white"
                : "text-slate-600 hover:bg-slate-100 hover:text-slate-950",
            )}
            href={item.href}
            key={item.id}
          >
            <Icon className="size-4 shrink-0" aria-hidden="true" />
            <span>{item.label}</span>
          </Link>
        );
      })}
    </>
  );
}
