import { Image as ImageIcon } from "lucide-react";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { DynamicMediaImage } from "./DynamicMediaImage";

const meta = {
  title: "UI/Dynamic Media Image",
  component: DynamicMediaImage,
  parameters: {
    layout: "centered",
  },
  args: {
    alt: "Barcelona charter at sunset",
    className: "h-72 w-[420px] overflow-hidden rounded-lg",
    sizes: "420px",
    src: "/images/generated/landing/experience-sunset-toast-720.webp",
    variants: [
      {
        publicUrl: "/images/generated/landing/experience-sunset-toast-480.webp",
        width: 480,
      },
      {
        publicUrl: "/images/generated/landing/experience-sunset-toast-720.webp",
        width: 720,
      },
    ],
  },
} satisfies Meta<typeof DynamicMediaImage>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Ready: Story = {};

export const Missing: Story = {
  args: {
    fallback: (
      <div className="text-center">
        <ImageIcon className="mx-auto size-8" aria-hidden="true" />
        <p className="mt-3 text-sm font-semibold">Media is processing.</p>
      </div>
    ),
    src: "",
    variants: [],
  },
};
