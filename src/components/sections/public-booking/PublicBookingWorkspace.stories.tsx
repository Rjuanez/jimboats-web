import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { getPublicBookingMockPage } from "@/interface/next/presenters/publicBookingMockPresenter";

import { PublicBookingWorkspace } from "./PublicBookingWorkspace";
import type { PublicBookingActions } from "./PublicBookingTypes";

const actions = {
  previewCoupon: async () => ({
    message: "Storybook preview does not validate coupons.",
    ok: false,
  }),
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

export const SelectedExperienceByHours: Story = {
  args: {
    initialExperienceId: "sunset-cruise",
    content: {
      ...getPublicBookingMockPage("es"),
      hourly: {
        hours: 2,
        title: "Elige duración y fecha",
        durationLabel: "Duración",
        rates: [
          { hours: 2, price: 199, depositAmount: 50 },
          { hours: 3, price: 279, depositAmount: 50 },
        ],
      },
      experiences: [
        {
          ...getPublicBookingMockPage("es").experiences[0],
          price: 199,
          depositAmount: 50,
          durationLabel: "2 h",
        },
      ],
    },
  },
};
