export type AdminNavItemId =
  | "bookings"
  | "calendar"
  | "cancellation-policies"
  | "content"
  | "coupons"
  | "dashboard"
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
  { href: "/admin", id: "dashboard", label: "Dashboard" },
  { href: "/admin/calendar", id: "calendar", label: "Calendar" },
  { href: "/admin/bookings", id: "bookings", label: "Bookings" },
  {
    href: "/admin/cancellation-policies",
    id: "cancellation-policies",
    label: "Cancellation policies",
  },
  { href: "/admin/experiences", id: "experiences", label: "Experiences" },
  { href: "/admin/extras", id: "extras", label: "Extras" },
  { href: "/admin/coupons", id: "coupons", label: "Coupons" },
  { href: "/admin/media", id: "media", label: "Media" },
  { href: "/admin/notifications/rules", id: "notifications", label: "Notifications" },
  { href: "/admin/content", id: "content", label: "Content" },
  { href: "/admin/localization", id: "localization", label: "Localization" },
  { href: "/admin/settings", id: "settings", label: "Settings" },
];
