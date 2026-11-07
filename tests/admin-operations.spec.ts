import { expect, test } from "@playwright/test";

test("admin opens reservations and exposes only operational navigation", async ({
  page,
}) => {
  await page.goto("/admin");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Inicio");
  const navigation = page
    .getByRole("navigation", { name: "Navegación del panel" })
    .filter({ visible: true });
  await expect(navigation.getByRole("link")).toHaveText([
    "Inicio",
    "Reservas",
    "Horarios",
    "Calendario",
    "Cupones",
    "Notificaciones",
    "Dispositivos",
  ]);
  await navigation
    .getByRole("link", { name: "Calendario", exact: true })
    .click();
  await expect(page).toHaveURL(/\/admin\/calendar$/);
});

test("retired editorial and setup routes leave the operational panel", async ({
  request,
}) => {
  for (const path of [
    "experiences",
    "experiences/sunset-experience/content",
    "extras",
    "media",
    "content",
    "localization",
    "settings",
    "cancellation-policies",
  ]) {
    const response = await request.get(`/admin/${path}`, { maxRedirects: 0 });
    expect(response.status()).toBe(307);
    expect(response.headers().location).toBe("/admin/bookings");
  }
});

test("reservation detail still presents its management actions", async ({
  page,
}) => {
  await page.goto("/admin/bookings/booking-preview-1");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("JB-");
  await expect(
    page.getByRole("button", { name: "Cancelar reserva", exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Guardar cambios", exact: true }),
  ).toBeVisible();
});

test("coupons and notification tools remain reachable without exposing content editors", async ({
  request,
}) => {
  for (const path of [
    "coupons",
    "coupons/new",
    "notifications/rules",
    "notifications/templates",
    "notifications/logs",
    "device-notifications",
  ]) {
    const response = await request.get(`/admin/${path}`);
    expect(response.status(), path).toBe(200);
    expect(new URL(response.url()).pathname).toBe(`/admin/${path}`);
  }
});

test("reservations appear once and cancellation can be dismissed without changes", async ({
  page,
}) => {
  await page.goto("/admin/bookings");
  await expect(
    page.getByRole("heading", { name: "JB-2026-0001", exact: true }),
  ).toHaveCount(1);
  await expect(
    page.getByRole("button", { name: "Marcar como vista", exact: true }),
  ).toBeVisible();
  await page.getByRole("link", { name: "Ver reserva", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "Cliente", exact: true }),
  ).toHaveCount(1);
  await expect(
    page.getByRole("heading", { name: "Notas internas", exact: true }),
  ).toHaveCount(1);
  let mutations = 0;
  page.on("request", (request) => {
    if (request.method() === "POST") mutations++;
  });
  page.once("dialog", async (dialog) => {
    expect(dialog.message()).toBe(
      "¿Cancelar la reserva JB-2026-0001? Se liberará su horario en el calendario.",
    );
    await dialog.dismiss();
  });
  await page
    .getByRole("button", { name: "Cancelar reserva", exact: true })
    .click();
  await expect(
    page.getByRole("button", { name: "Cancelar reserva", exact: true }),
  ).toBeEnabled();
  expect(mutations).toBe(0);
});

test("all retained operational pages use Spanish interface labels", async ({
  page,
}) => {
  for (const [path, heading] of [
    ["/admin", "Inicio"],
    ["/admin/bookings/new", "Crear reserva"],
    ["/admin/calendar", "Calendario del barco"],
    ["/admin/coupons", "Cupones"],
    ["/admin/coupons/new", "Nuevo cupón"],
    ["/admin/notifications/rules", "Notificaciones"],
    ["/admin/notifications/templates", "Notificaciones"],
    ["/admin/notifications/logs", "Notificaciones"],
    ["/admin/device-notifications", "Avisos de reservas"],
  ]) {
    await page.goto(path);
    await expect(page.locator("html")).toHaveAttribute("lang", "es");
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(heading);
    await expect(
      page
        .getByRole("navigation", { name: "Navegación del panel" })
        .filter({ visible: true })
        .getByRole("link"),
    ).toHaveText([
      "Inicio",
      "Reservas",
      "Horarios",
      "Calendario",
      "Cupones",
      "Notificaciones",
      "Dispositivos",
    ]);
  }
});
