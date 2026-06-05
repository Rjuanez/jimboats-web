import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { getPublicBookingMockPage } from "@/interface/next/presenters/publicBookingMockPresenter";

import { PublicBookingWorkspace } from "./PublicBookingWorkspace";
import type { PublicBookingActions } from "./PublicBookingTypes";

const actions = {
  startCheckout: async () => ({
    message: "Storybook preview does not open Stripe Checkout.",
    ok: false,
  }),
} satisfies PublicBookingActions;

const meta = {
  title: "Sections/PublicBookingWorkspace",
  component: PublicBookingWorkspace,
  args: {
    actions,
    content: getPublicBookingMockPage(),
    stripePublishableKey: "pk_test_storybook",
  },
  parameters: {
    layout: "fullscreen",
  },
} satisfies Meta<typeof PublicBookingWorkspace>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Mobile: Story = {
  parameters: {
    viewport: {
      defaultViewport: "mobile1",
    },
  },
};
