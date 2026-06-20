import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { getAdminBookingsPreviewPage } from "@/interface/next/presenters/adminBookingsPresenter";

import { AdminBookingsWorkspace } from "./AdminBookingsWorkspace";
import type { AdminBookingActions } from "./AdminBookingTypes";

const pageData = getAdminBookingsPreviewPage();

const actions = {
  cancelBooking: async () => ({
    data: {
      bookingId: "booking-preview-1",
      state: pageData.state,
    },
    ok: true as const,
  }),
  createBooking: async () => ({
    data: {
      bookingId: "booking-preview-created",
      state: pageData.state,
    },
    ok: true as const,
  }),
  issueAccessLink: async () => ({
    data: {
      expiresAt: "2027-06-05T12:00:00.000Z",
      url: "https://jimboats.example.com/en/bookings/JB-2026-0001?token=preview",
    },
    ok: true as const,
  }),
  markSeen: async () => ({
    data: {
      bookingId: "booking-preview-1",
      state: pageData.state,
    },
    ok: true as const,
  }),
  updateBooking: async () => ({
    data: {
      bookingId: "booking-preview-1",
      state: pageData.state,
    },
    ok: true as const,
  }),
} satisfies AdminBookingActions;

const meta = {
  component: AdminBookingsWorkspace,
  parameters: {
    layout: "fullscreen",
  },
  title: "Admin/Bookings/Workspace",
} satisfies Meta<typeof AdminBookingsWorkspace>;

export default meta;

type Story = StoryObj<typeof meta>;

export const List: Story = {
  args: {
    actions,
    initialState: pageData.state,
    navItems: pageData.navItems,
    view: "list",
  },
};

export const Create: Story = {
  args: {
    actions,
    initialState: pageData.state,
    navItems: pageData.navItems,
    view: "create",
  },
};

export const Detail: Story = {
  args: {
    actions,
    bookingId: "booking-preview-1",
    initialState: pageData.state,
    navItems: pageData.navItems,
    view: "detail",
  },
};
