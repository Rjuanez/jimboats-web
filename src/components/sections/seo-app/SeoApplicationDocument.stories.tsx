import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { seoApplicationHome, seoApplicationPrivacy } from "@/i18n/seo-app/es";

import { SeoApplicationDocument } from "./SeoApplicationDocument";

const meta = {
  title: "Sections/SEO Application",
  component: SeoApplicationDocument,
  parameters: { layout: "fullscreen" },
} satisfies Meta<typeof SeoApplicationDocument>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Introduction: Story = { args: { content: seoApplicationHome } };
export const Privacy: Story = { args: { content: seoApplicationPrivacy } };
