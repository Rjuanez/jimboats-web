import { AdminBookingsWorkspace } from "@/components/sections/admin-bookings/AdminBookingsWorkspace";
import type { AdminBookingActions } from "@/components/sections/admin-bookings/AdminBookingTypes";
import {
  cancelAdminBookingAction,
  createAdminBookingAction,
  issueAdminBookingAccessLinkAction,
  updateAdminBookingAction,
} from "@/interface/next/actions/adminBookingActions";
import { getAdminBookingsPage } from "@/interface/next/presenters/adminBookingsPresenter";

export const dynamic = "force-dynamic";

const actions = {
  cancelBooking: cancelAdminBookingAction,
  createBooking: createAdminBookingAction,
  issueAccessLink: issueAdminBookingAccessLinkAction,
  updateBooking: updateAdminBookingAction,
} satisfies AdminBookingActions;

export default async function AdminBookingsPage() {
  const pageData = await getAdminBookingsPage();

  return (
    <AdminBookingsWorkspace
      actions={actions}
      initialState={pageData.state}
      navItems={pageData.navItems}
      view="list"
    />
  );
}
