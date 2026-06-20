import { AdminBookingsWorkspace } from "@/components/sections/admin-bookings/AdminBookingsWorkspace";
import type { AdminBookingActions } from "@/components/sections/admin-bookings/AdminBookingTypes";
import {
  cancelAdminBookingAction,
  createAdminBookingAction,
  issueAdminBookingAccessLinkAction,
  markAdminBookingSeenAction,
  updateAdminBookingAction,
} from "@/interface/next/actions/adminBookingActions";
import { getAdminBookingsPage } from "@/interface/next/presenters/adminBookingsPresenter";
import { getContainer } from "@/container";

export const dynamic = "force-dynamic";

const actions = {
  cancelBooking: cancelAdminBookingAction,
  createBooking: createAdminBookingAction,
  issueAccessLink: issueAdminBookingAccessLinkAction,
  markSeen: markAdminBookingSeenAction,
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
  const { bookingId } = await params;

  if (process.env.JIMBOATS_ADMIN_PREVIEW_DATA !== "1") {
    await getContainer().adminBookings.markSeen({ bookingId });
  }

  const pageData = await getAdminBookingsPage();

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
