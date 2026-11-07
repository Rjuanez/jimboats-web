import { adminEs } from "@/i18n/admin/es";
export type AdminNavItemId =
  | "availability"
  | "bookings"
  | "calendar"
  | "cancellation-policies"
  | "content"
  | "coupons"
  | "dashboard"
  | "device-notifications"
  | "experiences"
  | "extras"
  | "localization"
  | "media"
  | "notifications"
  | "settings";

export type AdminNavItem = {
  href: string;
  id: AdminNavItemId;
  label: string;
};

export const adminNavItems: AdminNavItem[] = [
  { href: "/admin", id: "dashboard", label: adminEs["Dashboard"] },
  { href: "/admin/bookings", id: "bookings", label: adminEs["Bookings"] },
  { href: "/admin/availability", id: "availability", label: "Horarios" },
  { href: "/admin/calendar", id: "calendar", label: adminEs["Calendar"] },
  { href: "/admin/coupons", id: "coupons", label: adminEs["Coupons"] },
  {
    href: "/admin/notifications/rules",
    id: "notifications",
    label: adminEs["Notifications"],
  },
  {
    href: "/admin/device-notifications",
    id: "device-notifications",
    label: adminEs["Devices"],
  },
];
