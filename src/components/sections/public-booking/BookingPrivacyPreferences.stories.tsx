import { within, userEvent } from "storybook/test";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { BookingPrivacyPreferences } from "./BookingPrivacyPreferences";

const meta = {
  title: "Booking/Privacy preferences",
  component: BookingPrivacyPreferences,
  args: {
    locale: "es",
    privacyHref: "/es/privacidad",
    children: (
      <div className="min-h-screen bg-background p-8 text-text">
        JimBoats · Reserva
      </div>
    ),
  },
  parameters: { layout: "fullscreen" },
} satisfies Meta<typeof BookingPrivacyPreferences>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {};
export const English: Story = { args: { locale: "en" } };
export const LongText: Story = { args: { locale: "de" } };
export const SaveError: Story = {
  args: {
    measurement: {
      saveChoice: async () => ({ ok: false }),
      whatsappClick: async () => {},
    },
  },
  play: async ({ canvasElement }) => {
    await userEvent.click(
      within(canvasElement).getByRole("button", { name: "Aceptar" }),
    );
  },
};
