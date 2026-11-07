import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { getMarketingPage } from "@/content/marketing";
import { HourlyBookingPreview } from "./HourlyBookingPreview";
const meta = {
  title: "Marketing/Hourly booking",
  component: HourlyBookingPreview,
  parameters: { layout: "fullscreen" },
  args: {
    page: getMarketingPage("es"),
    simulation: true,
    actions: {
      quote: async () => ({
        ok: true as const,
        value: {
          totalMinor: 17900,
          depositMinor: 5000,
          remainingMinor: 12900,
          capacity: 6,
          slots: [{ startTime: "10:00", endTime: "12:00", slotKey: null }],
        },
      }),
      create: async () => ({
        ok: true as const,
        value: {
          bookingId: "story",
          reference: "LOCAL-STORY",
          holdExpiresAt: "2027-01-01T00:00:00Z",
          paymentProviderSessionId: "story",
          checkoutClientSecret: "story",
        },
      }),
      simulate: async () => ({
        ok: true as const,
        value: {
          action: "PROCESSED" as const,
          bookingId: "story",
          eventType: "checkout.session.completed",
        },
      }),
      abandon: async () => ({
        ok: true as const,
        value: { action: "EXITED" as const, bookingId: "story" },
      }),
    },
  },
} satisfies Meta<typeof HourlyBookingPreview>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Interactive: Story = {};
export const German: Story = { args: { page: getMarketingPage("de") } };
export const MissingTariff: Story = {
  args: {
    actions: {
      ...meta.args.actions,
      quote: async () => ({
        ok: false as const,
        code: "BOOKING_RATE_UNAVAILABLE",
      }),
    },
  },
};
