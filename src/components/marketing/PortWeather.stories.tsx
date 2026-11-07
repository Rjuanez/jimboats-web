import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { WeatherCard } from "./PortWeather";
import { weatherCopy } from "@/content/marketing/weather";
import { presentWeather } from "@/interface/next/presenters/weatherView";

const forecast = {
  time: "2026-11-02T12:00:00Z",
  temperatureC: 19,
  windKmh: 11,
  humidityPercent: 68,
  condition: "partlyCloudy" as const,
  night: false,
};
const meta = {
  title: "Marketing/Port weather",
  component: WeatherCard,
  decorators: [
    (Story) => (
      <div className="max-w-sm p-4">
        <Story />
      </div>
    ),
  ],
  args: {
    copy: weatherCopy.es,
    state: { status: "ready", weather: presentWeather(forecast, "es") },
  },
} satisfies Meta<typeof WeatherCard>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Spanish: Story = {};
export const English: Story = {
  args: {
    copy: weatherCopy.en,
    state: { status: "ready", weather: presentWeather(forecast, "en") },
  },
};
export const German: Story = {
  args: {
    copy: weatherCopy.de,
    state: { status: "ready", weather: presentWeather(forecast, "de") },
  },
};
export const Loading: Story = { args: { state: { status: "loading" } } };
export const Unavailable: Story = {
  args: { state: { status: "unavailable" } },
};
