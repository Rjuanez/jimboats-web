import { expect, test } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test.use({ actionTimeout: 15000 });

test.skip(
  process.env.HOURLY_BOOKING_E2E !== "1",
  "Requires isolated local PostgreSQL.",
);
test.describe.configure({ mode: "serial", timeout: 90000 });

test("schedule settings persist, affect public duration availability and remain accessible", async ({
  page,
  request,
}) => {
  await page.goto("/admin/availability");
  const form = page.getByRole("form").first();
  const mode = await form.getByLabel("Tipo de salidas").inputValue();
  // The local seed starts in flexible mode. Preserve existing settings after exercising them.
  const fields = [
    "Primera salida",
    "Hora límite de regreso",
    "Intervalo entre salidas (minutos)",
    "Margen antes y después (minutos)",
  ];
  await form.getByLabel("Tipo de salidas").selectOption("ANY_AVAILABLE");
  const original = await Promise.all(
    fields.map((label) => form.getByLabel(label).inputValue()),
  );
  async function save() {
    await form
      .getByRole("button", { name: "Guardar horarios", exact: true })
      .click();
    await expect(form.getByRole("status")).toContainText("Horarios guardados");
  }
  try {
    for (const [index, value] of ["10:00", "18:00", "60", "15"].entries())
      await form.getByLabel(fields[index]).fill(value);
    await save();
    await page.reload();
    await expect(form.getByLabel("Hora límite de regreso")).toHaveValue(
      "18:00",
    );
    const response = await request.get(
      "/api/public-booking/availability?locale=es&experienceId=daytrip&hours=3",
    );
    expect(response.status()).toBe(200);
    const { availability } = await response.json();
    const slots = Object.values(availability.timeSlotsByDate).find((items) =>
      (items as Array<{ available: boolean }>).some((item) => item.available),
    ) as Array<{ startTime: string; endTime: string }>;
    expect(slots.length).toBeGreaterThan(0);
    expect(slots[0]).toMatchObject({ startTime: "10:00", endTime: "13:00" });
    expect(slots.every((slot) => slot.endTime <= "18:00")).toBe(true);
    expect(
      slots.every(
        (slot) =>
          Number(slot.endTime.slice(0, 2)) -
            Number(slot.startTime.slice(0, 2)) ===
          3,
      ),
    ).toBe(true);
    for (const width of [360, 768, 1280]) {
      await page.setViewportSize({ width, height: 1000 });
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= window.innerWidth,
        ),
      ).toBe(true);
    }
    expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
    await form.getByLabel("Tipo de salidas").selectOption("MANUAL_APPROVAL");
    await save();
    const paused = await (
      await request.get(
        "/api/public-booking/availability?locale=es&experienceId=daytrip&hours=3",
      )
    ).json();
    expect(
      Object.values(paused.availability.timeSlotsByDate).some((items) =>
        (items as Array<{ available: boolean }>).some((item) => item.available),
      ),
    ).toBe(false);
  } finally {
    await form.getByLabel("Tipo de salidas").selectOption("ANY_AVAILABLE");
    for (const [index, value] of original.entries())
      await form.getByLabel(fields[index]).fill(value);
    await form.getByLabel("Tipo de salidas").selectOption(mode);
    await save();
  }
});

test("coupon creation persists and operational notification templates are real", async ({
  page,
}) => {
  const code = `LOCAL${Date.now()}`;
  await page.goto("/admin/coupons/new");
  await page.getByLabel("Código", { exact: true }).fill(code);
  await page
    .getByLabel("Nombre interno", { exact: true })
    .fill("Prueba local persistente");
  await page
    .getByRole("combobox", { name: "Estado", exact: true })
    .selectOption("ACTIVE");
  await page.getByRole("button", { name: "Crear cupón", exact: true }).click();
  await expect(page).toHaveURL(/\/admin\/coupons\/coupon-/, { timeout: 15000 });
  await page.reload();
  await expect(page.getByLabel("Código", { exact: true })).toHaveValue(code);
  await page.goto("/es/book?experience=daytrip&hours=3");
  await page
    .locator(
      '#public-booking-date-selection button[aria-pressed="false"]:not([disabled])',
    )
    .first()
    .click();
  await page
    .locator("#public-booking-time-selection button:not([disabled])")
    .first()
    .click();
  await page.getByRole("button", { name: "Continuar a extras" }).click();
  await page.getByRole("button", { name: "Saltar extras y continuar" }).click();
  await page
    .getByLabel("Nombre completo", { exact: true })
    .fill("Local coupon test");
  await page
    .getByLabel("Email", { exact: true })
    .fill("coupon-test@example.com");
  await page.getByRole("textbox", { name: "Cupón", exact: true }).fill(code);
  await page.getByRole("button", { name: "Aplicar", exact: true }).click();
  await expect(
    page.getByRole("status").filter({ hasText: `${code} aplicado` }),
  ).toBeVisible();
  await expect(
    page
      .getByText(/^€270(?:[.,]00?)?$/)
      .filter({ visible: true })
      .first(),
  ).toBeVisible();
  await page.goto("/admin/notifications/rules");
  await expect(page.locator("body")).toContainText("local-BookingCreated");
});
