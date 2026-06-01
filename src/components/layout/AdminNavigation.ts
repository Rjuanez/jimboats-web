export type AdminNavItemId =
  | "bookings"
  | "calendar"
  | "content"
  | "dashboard"
  | "experiences"
  | "extras"
  | "localization"
  | "media"
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
  { href: "/admin/experiences", id: "experiences", label: "Experiences" },
  { href: "/admin/extras", id: "extras", label: "Extras" },
  { href: "/admin/media", id: "media", label: "Media" },
  { href: "/admin/content", id: "content", label: "Content" },
  { href: "/admin/localization", id: "localization", label: "Localization" },
  { href: "/admin/settings", id: "settings", label: "Settings" },
];
