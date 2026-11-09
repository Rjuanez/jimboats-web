import { expect, test } from "@playwright/test";

test.skip(
  process.env.HOURLY_BOOKING_E2E !== "1",
  "Requires isolated PostgreSQL and local payment simulator.",
);

test("all four solar schedules persist and return whole-hour departures for their maximum duration", async ({
  page,
  request,
}) => {
  await page.goto("/admin/availability");
  const modes = page.getByLabel("Tipo de salidas");
  await expect(modes).toHaveCount(4);
  for (const mode of await modes.all())
    await expect(mode).toHaveValue("HOURLY_SOLAR");
  for (const [id, hours] of [
    ["daytrip", 6],
    ["sunrise", 6],
    ["ex-sunset", 6],
    ["romantic", 4],
  ] as const) {
    const response = await request.get(
      `/api/public-booking/availability?locale=es&experienceId=${id}&hours=${hours}`,
    );
    expect(response.status()).toBe(200);
    const { availability } = await response.json();
    const rows = Object.values(availability.timeSlotsByDate) as Array<
      Array<{ startTime: string; endTime: string; available: boolean }>
    >;
    const slots = rows.flat().filter((slot) => slot.available);
    expect(slots.length).toBeGreaterThan(0);
    for (const slot of slots) {
      expect(slot.startTime).toMatch(/^\d{2}:00$/);
      expect(
        Number(slot.endTime.slice(0, 2)) - Number(slot.startTime.slice(0, 2)),
      ).toBe(hours);
      if (id === "romantic") expect(slot.endTime <= "21:30").toBe(true);
      if (id === "daytrip" || id === "romantic")
        expect(slot.startTime >= "09:00").toBe(true);
    }
  }
});
