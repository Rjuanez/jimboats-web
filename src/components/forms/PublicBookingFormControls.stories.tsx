import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import {
  PublicCheckboxField,
  PublicTextField,
} from "./PublicBookingFormControls";

function PublicBookingFormControlsPreview() {
  return (
    <div className="max-w-xl space-y-4 bg-white p-6">
      <PublicTextField
        description="Used for the booking pass and receipt."
        label="Email address"
        name="email"
        placeholder="john@example.com"
        type="email"
      />
      <PublicCheckboxField
        defaultChecked
        description="The booking pass will be sent to the email above."
        label="Email me the booking pass"
        name="ticketEmail"
      />
    </div>
  );
}

const meta = {
  title: "Forms/PublicBookingFormControls",
  component: PublicBookingFormControlsPreview,
} satisfies Meta<typeof PublicBookingFormControlsPreview>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
