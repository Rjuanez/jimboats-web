# Horarios por horas y sol

## Comportamiento aprobado

Modo optativo `HOURLY_SOLAR` para las cuatro experiencias conocidas. Hora local Europe/Madrid, incluidos los cambios de hora.

- Diurno: 1–6 horas, salidas en punto desde 09:00, regreso estrictamente anterior a la puesta de sol.
- Amanecer: 2–6 horas, salida en punto inmediatamente anterior al amanecer. Ampliar duración retrasa el regreso.
- Atardecer: 2–6 horas, regreso a la hora en punto inmediatamente posterior a la puesta de sol. Ampliar duración adelanta la salida. En verano el regreso puede ser a las 22:00.
- Romántico: 1–4 horas, desde 09:00, regreso máximo 21:30. Al salir en punto y durar horas completas, el último regreso es 21:00.

Disponibilidad y checkout resuelven las mismas salidas. Se mantienen los precios, márgenes, antelación, reservas, retenciones y bloqueos compartidos de un único barco. PostgreSQL conserva la exclusión de rangos protegidos para impedir dobles reservas concurrentes.

Las reservas existentes no se migran. Al editar solo sus datos, conservan su franja y precio acordados. Cambiar fecha u horas aplica las reglas nuevas.

## Revisión local con persistencia

Usar Node 24. `pnpm db:hourly:setup` aplica migraciones y activa el modo únicamente en `jimboats_hourly_preview`, sin borrar reservas. `pnpm build` y `pnpm start:hourly` levantan la versión operativa en http://127.0.0.1:3102, con pagos simulados, correos locales y Google Calendar desactivado.

El puerto 3100 (`dev:seo`) es una vista visual sin ocupación real. El puerto 3102 sí guarda reservas y aplica los bloqueos del PostgreSQL local.

Pruebas operativas: `HOURLY_BOOKING_E2E=1 PLAYWRIGHT_CHANNEL=chrome PLAYWRIGHT_BASE_URL=http://127.0.0.1:3102 PLAYWRIGHT_REUSE_EXISTING_SERVER=1 pnpm exec playwright test tests/hourly-schedule.spec.ts tests/hourly-booking.spec.ts tests/local-operations.spec.ts --workers=1`.

## Publicación y activación pendientes de autorización

1. Publicar la rama y revisar/mergear el cambio. Desplegar la imagen mediante el flujo habitual; la migración añade un valor de enum, sin activar experiencias ni tocar reservas.
2. Antes de activar, guardar la configuración completa anterior de las cuatro experiencias (modo, franjas, límites, intervalos, márgenes y antelación). Activar este modo sustituye las antiguas franjas fijas en la configuración del catálogo.
3. En `/admin/availability`, seleccionar **Calendario por horas y sol** y guardar en cada una de las cuatro experiencias. Mantener márgenes y antelación actuales. No ejecutar la semilla de desarrollo contra producción.
4. Comprobar en la web pública 6 horas para diurno/amanecer/atardecer y 4 horas para romántico; revisar que una reserva existente siga bloqueando su intervalo.

## Vuelta atrás

Restaurar desde el panel el modo y las franjas guardados antes de activar. No basta con seleccionar salidas fijas: hay que restaurar sus horas. Hacerlo antes de volver a una imagen anterior que no conozca el nuevo enum. La migración puede permanecer aplicada; no borrar reservas ni intentar eliminar el valor del enum en caliente.
