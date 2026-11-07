import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { getBlogPage } from "@/interface/next/presenters/blogPresenter";
import { SeoBlogIndex } from "./SeoBlogIndex";
import { SeoBlogArticle } from "./SeoBlogArticle";
const meta = {
  title: "Marketing/Blog",
  component: SeoBlogIndex,
  parameters: { layout: "fullscreen" },
  args: { page: getBlogPage("es") },
} satisfies Meta<typeof SeoBlogIndex>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Index: Story = {};
export const Sunset: Story = {
  args: { page: getBlogPage("es", "sunset") },
  render: ({ page }) => <SeoBlogArticle page={page} />,
};
export const GermanLongText: Story = {
  ...Sunset,
  args: { page: getBlogPage("de", "romantic") },
};
export const FrenchSunrise: Story = {
  ...Sunset,
  args: { page: getBlogPage("fr", "sunrise") },
};
