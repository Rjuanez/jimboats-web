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

type AdminBookingDetailPageProps = {
  params: Promise<{
    bookingId: string;
  }>;
};

export default async function AdminBookingDetailPage({
  params,
}: AdminBookingDetailPageProps) {
  const [{ bookingId }, pageData] = await Promise.all([
    params,
    getAdminBookingsPage(),
  ]);

  return (
    <AdminBookingsWorkspace
      actions={actions}
      bookingId={bookingId}
      initialState={pageData.state}
      navItems={pageData.navItems}
      view="detail"
    />
  );
}
