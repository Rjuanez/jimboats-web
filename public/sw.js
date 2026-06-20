self.addEventListener("push", (event) => {
  let payload = {};

  if (event.data) {
    try {
      payload = event.data.json();
    } catch {
      payload = {
        body: event.data.text(),
      };
    }
  }

  const title =
    typeof payload.title === "string" && payload.title.trim()
      ? payload.title
      : "JimBoats";
  const body =
    typeof payload.body === "string" && payload.body.trim()
      ? payload.body
      : "Nueva actualización operativa.";
  const url =
    typeof payload.url === "string" && payload.url.trim()
      ? payload.url
      : "/admin/bookings";

  event.waitUntil(
    self.registration.showNotification(title, {
      badge: "/icon-192.png",
      body,
      data: { url },
      icon: "/icon-192.png",
      tag:
        typeof payload.tag === "string" && payload.tag.trim()
          ? payload.tag
          : undefined,
    }),
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  const targetUrl = new URL(
    event.notification.data?.url || "/admin/bookings",
    self.location.origin,
  ).href;

  event.waitUntil(
    self.clients
      .matchAll({
        includeUncontrolled: true,
        type: "window",
      })
      .then((clientList) => {
        for (const client of clientList) {
          if (client.url === targetUrl && "focus" in client) {
            return client.focus();
          }
        }

        return self.clients.openWindow(targetUrl);
      }),
  );
});
