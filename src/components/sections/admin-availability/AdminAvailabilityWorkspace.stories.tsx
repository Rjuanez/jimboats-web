import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { AdminAvailabilityWorkspace } from "./AdminAvailabilityWorkspace";
const meta = {
  title: "Admin/Availability",
  component: AdminAvailabilityWorkspace,
  args: {
    experiences: [
      {
        experienceId: "daytrip",
        name: "Paseo privado en barco",
        mode: "ANY_AVAILABLE",
        bufferMinutes: 15,
        minimumAdvanceMinutes: 60,
        maximumAdvanceMonths: 6,
        allowsManualScheduling: true,
        startTime: "10:00",
        endTime: "20:00",
        granularityMinutes: 30,
        slots: [],
      },
    ],
    save: async () => ({ ok: true as const }),
  },
} satisfies Meta<typeof AdminAvailabilityWorkspace>;
export default meta;
type Story = StoryObj<typeof AdminAvailabilityWorkspace>;
export const Default: Story = {};
export const Error: Story = {
  args: {
    save: async () => ({
      ok: false as const,
      message: "Las franjas activas no pueden solaparse.",
    }),
  },
};
export const Empty: Story = { args: { experiences: [] } };

export const HourlySolar: Story = {
  args: {
    experiences: [
      {
        ...meta.args.experiences[0],
        mode: "HOURLY_SOLAR",
        hourlyScheduleDescription:
          "Salidas en punto desde las 09:00, de 1 a 6 horas. Regreso antes de la puesta de sol de cada fecha.",
      },
    ],
  },
};
