import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import {
  CheckboxField,
  FieldGrid,
  NumberField,
  SelectField,
  TextAreaField,
  TextField,
} from "./AdminFormControls";

function AdminFormControlsPreview() {
  return (
    <form className="max-w-3xl space-y-4">
      <FieldGrid>
        <TextField label="Internal name" value="Sunset Experience" readOnly />
        <NumberField label="Base price" value={290} readOnly />
      </FieldGrid>
      <SelectField label="Status" onChange={() => undefined} value="draft">
        <option value="draft">Draft</option>
      </SelectField>
      <TextAreaField
        label="Description"
        readOnly
        value="Editable admin content should wrap without breaking mobile layouts."
      />
      <CheckboxField checked label="Published" onChange={() => undefined} />
    </form>
  );
}

const meta = {
  title: "Forms/AdminFormControls",
  component: AdminFormControlsPreview,
  decorators: [
    (Story) => (
      <div className="min-h-screen bg-slate-50 p-4">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof AdminFormControlsPreview>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
