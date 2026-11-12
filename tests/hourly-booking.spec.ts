import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";

test.skip(
  process.env.HOURLY_BOOKING_E2E !== "1",
  "Run against the isolated hourly database and payment simulator.",
);

async function selectDate(page: Page, localDate: string) {
  const label = new Intl.DateTimeFormat("es", {
    dateStyle: "full",
    timeZone: "UTC",
  }).format(new Date(`${localDate}T12:00:00Z`));
  const monthLabel = new Intl.DateTimeFormat("es", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${localDate}T12:00:00Z`));
  const calendar = page.locator("#public-booking-date-selection");
  const nextMonth = calendar.getByRole("button", { name: "Mes siguiente" });
  const visibleMonth = calendar.getByText(/^\p{L}+ de \d{4}$/u);
  for (let attempt = 0; attempt < 6; attempt++) {
    // Month navigation replaces the calendar while availability loads.
    // Wait for its return before deciding whether another month is needed.
    await expect(nextMonth).toBeVisible();
    await expect(calendar.getByRole("status")).toBeHidden();
    const previousMonth = await visibleMonth.innerText();
    if (previousMonth === monthLabel) break;
    await expect(nextMonth).toBeEnabled();
    await nextMonth.click();
    await expect(visibleMonth).toBeVisible();
    await expect(visibleMonth).not.toHaveText(previousMonth);
  }
  await expect(visibleMonth).toHaveText(monthLabel);
  const day = calendar.getByRole("button", { name: label, exact: true });
  await expect(day).toBeEnabled();
  await day.click();
}

for (const paymentChoice of ["DEPOSIT", "FULL"] as const) {
  test(`hourly ${paymentChoice} checkout persists, blocks overlaps, confirms and cancels through the operational panel`, async ({
    page,
    context,
  }) => {
    test.setTimeout(120_000);
    const date = new Date();
    date.setDate(date.getDate() + 40 + (Date.now() % 100));
    const localDate = date.toISOString().slice(0, 10);
    await page.goto("/es/book?experience=daytrip&hours=3");
    await selectDate(page, localDate);
    const slot = page
      .locator("#public-booking-time-selection button:not([disabled])")
      .first();
    const slotLabel = await slot.innerText();
    await slot.click();
    await page.getByRole("button", { name: "Continuar a extras" }).click();
    await page
      .getByRole("button", { name: "Saltar extras y continuar" })
      .click();
    await page
      .getByLabel("Nombre completo", { exact: true })
      .fill("Hourly integration test");
    await page
      .getByLabel("Email", { exact: true })
      .fill("hourly-test@example.com");
    if (paymentChoice === "FULL")
      await page.getByRole("radio", { name: /Pagar todo ahora/ }).click();
    if (paymentChoice === "FULL") {
      for (const width of [360, 768, 1280]) {
        await page.setViewportSize({ width, height: 900 });
        await page
          .getByRole("radio", { name: /Pagar todo ahora/ })
          .scrollIntoViewIfNeeded();
        expect(
          await page.evaluate(
            () => document.documentElement.scrollWidth <= innerWidth,
          ),
        ).toBe(true);
        await page.screenshot({
          path: `.local-preview/payment-choice-${width}.png`,
        });
      }
      expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
    }
    await page
      .getByRole("button", {
        name: paymentChoice === "FULL" ? "Pago seguro €300" : "Pago seguro €50",
        exact: true,
      })
      .click();
    await expect(page.getByText(/Pendiente de pago/)).toBeVisible();
    const other = await context.newPage();
    await other.goto("/es/book?experience=daytrip&hours=3");
    await selectDate(other, localDate);
    await expect(
      other.locator("#public-booking-time-selection").getByRole("button", {
        name: new RegExp(`^${slotLabel}( unavailable)?$`),
      }),
    ).toBeDisabled();
    await other.goto("/es/book?experience=romantic&hours=3");
    await selectDate(other, localDate);
    await expect(
      other.locator("#public-booking-time-selection").getByRole("button", {
        name: new RegExp(`^${slotLabel}( unavailable)?$`),
      }),
    ).toBeDisabled();
    await page.getByRole("button", { name: "Simular pago correcto" }).click();
    const confirmation = page.getByRole("heading", {
      name: "Reserva de prueba confirmada",
    });
    await expect(confirmation).toBeVisible();
    const reference = (
      await confirmation.locator("..").locator("p").first().innerText()
    ).trim();
    expect(reference).toMatch(/^JB/);
    await other.goto("/admin/notifications/logs");
    await expect
      .poll(
        async () => {
          await other.reload();
          return other.locator("body").innerText();
        },
        { timeout: 30000 },
      )
      .toContain(reference);
    await other.goto("/admin/bookings");
    await other
      .locator("article")
      .filter({ hasText: reference })
      .getByRole("link", { name: "Ver reserva" })
      .first()
      .click();
    await expect(
      other.getByLabel("Nombre completo", { exact: true }),
    ).toHaveValue("Hourly integration test");
    await expect(
      other.getByText("Pagado online", { exact: true }).locator(".."),
    ).toContainText(paymentChoice === "FULL" ? "300" : "50");
    other.once("dialog", (dialog) => dialog.accept());
    await other
      .getByRole("button", { name: "Cancelar reserva", exact: true })
      .click();
    await expect(
      other.getByText("Cancelada", { exact: true }).first(),
    ).toBeVisible();
    await other.reload();
    await expect(
      other.getByRole("button", { name: "Cancelar reserva", exact: true }),
    ).toBeDisabled();
    await page.goto("/es/book?experience=daytrip&hours=3");
    await selectDate(page, localDate);
    await expect(
      page.locator("#public-booking-time-selection").getByRole("button", {
        name: new RegExp(`^${slotLabel}( unavailable)?$`),
      }),
    ).toBeEnabled();
  });
}
