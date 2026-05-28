import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { PageShell } from "./PageShell";

const meta = {
  title: "Layout/PageShell",
  component: PageShell,
  parameters: {
    layout: "fullscreen",
  },
} satisfies Meta<typeof PageShell>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: (
      <section className="py-20">
        <div className="mx-auto max-w-3xl px-4 text-center">
          <h1 className="text-3xl font-semibold">JimBoats</h1>
          <p className="mt-4 text-slate-600">
            Layout shell with reusable header, main content and footer.
          </p>
        </div>
      </section>
    ),
  },
};
