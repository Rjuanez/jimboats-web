# Remaining Work Handoff

Este documento resume el estado actual del proyecto y lo que queda por hacer
para poder retomar el trabajo en otro chat con contexto suficiente.

## Contexto del proyecto

El producto activo esta en:

`/Users/ruben/Documents/Proyectos/Proyectos_en_curso/JimBoats/web`

Antes de tocar codigo hay que leer y respetar:

- `web/AGENTS.md`
- `web/AGENT.md`
- `web/architecture.md`
- `web/implementation.md`
- `web/stack.md`
- `web/testing.md`
- `web/ui-ux.md`
- `web/workflow.md`

El proyecto sigue una arquitectura por capas:

- Dominio y casos de uso en `src/modules`.
- Infraestructura en `src/infrastructure`.
- Adaptadores Next/actions/routes en `src/interface/next` y `src/app`.
- UI reutilizable en `src/components`.
- Persistencia con Prisma y PostgreSQL.
- Entorno local con Docker Compose.

La forma de trabajo acordada para slices nuevos es:

1. Dominio y tests de dominio.
2. Casos de uso y tests de caso de uso.
3. Infraestructura.
4. Interfaz.
5. Verificacion con pruebas y navegador real cuando aplique.

## Estado actual

Hay un backpanel funcional con los slices principales:

- Experiences.
- Extras.
- Media.
- Calendar.
- Bookings.
- Notifications.

Media ya tiene flujo de subida, seleccion desde experiencias y extras, y worker
para procesar variantes.

La parte publica ya no es solo estatica:

- La landing carga experiencias desde base de datos.
- El flujo publico de reserva carga experiencias, slots y extras desde base de
  datos.
- Al seleccionar una experiencia desde la landing, debe llegar seleccionada al
  flujo de reserva.
- El calendario del flujo publico permite moverse por fechas futuras.
- El deposito es fijo de `100 EUR`.
- El resto se paga a bordo en efectivo.

Stripe esta integrado como Embedded Checkout:

- El boton de pago crea una reserva en estado `PENDING_PAYMENT`.
- El slot queda bloqueado mientras el pago esta pendiente.
- Se crea una Stripe Checkout Session embebida.
- El pago se muestra dentro de la propia pantalla de reserva.
- El webhook confirma el resultado real del pago.

Archivos relevantes de Stripe:

- `src/app/api/stripe/webhook/route.ts`
- `src/app/en/book/success/page.tsx`
- `src/components/sections/public-booking/PublicBookingReturnSection.tsx`
- `src/modules/booking/application/GetPublicBookingCheckoutReturnUseCase.ts`

La URL de retorno de Stripe usa:

`/en/book/success?session_id={CHECKOUT_SESSION_ID}`

## Variables y entorno local

Las credenciales se configuran en el `.env` del proyecto `web`.

Variables relevantes:

- `STRIPE_SECRET_KEY`
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `STRIPE_FIXED_DEPOSIT_AMOUNT_CENTS`
- `STRIPE_DEPOSIT_CURRENCY`
- `RESEND_API_KEY`
- `PRELUDE_API_KEY`

Para escuchar webhooks de Stripe en local:

```bash
stripe listen --forward-to http://127.0.0.1:3000/api/stripe/webhook
```

El valor `whsec_...` que imprime la CLI debe copiarse en `STRIPE_WEBHOOK_SECRET`.
Si se cambia el `.env`, hay que recrear la app para que Docker lo lea:

```bash
docker compose up -d --force-recreate app
```

## Problema actual a resolver

Despues de pagar, la pagina de resumen puede mostrar algo parecido a:

`Payment is being confirmed`

Esto puede pasar aunque el pago haya ido bien, porque Stripe redirige al
`return_url` antes de que el webhook haya terminado de confirmar la reserva en
la base de datos. La pantalla de retorno se renderiza una vez en servidor y no
vuelve a consultar el estado.

La solucion recomendada es que la pantalla de retorno espere la confirmacion:

1. Cargar el estado inicial por `session_id`.
2. Si la reserva ya esta confirmada, mostrar confirmacion.
3. Si esta en `PENDING_PAYMENT`, renderizar un componente cliente que haga
   polling cada 1-2 segundos durante 20-30 segundos.
4. Si el webhook confirma el pago durante ese intervalo, cambiar la UI a
   reserva confirmada.
5. Si el pago falla, expira o se cancela, mostrar estado no completado.
6. Si sigue pendiente tras el timeout, mostrar "confirmacion en curso" con
   opcion de refrescar o contactar.

Archivos probables a tocar:

- `src/interface/next/actions/publicBookingActions.ts`, o una route handler
  especifica para consultar el estado por `providerSessionId`.
- `src/components/sections/public-booking/PublicBookingReturnSection.tsx`.
- Nuevo componente cliente, por ejemplo
  `src/components/sections/public-booking/PublicBookingReturnPoller.tsx`.
- `src/app/en/book/success/page.tsx`.
- Tests del caso de uso y de la accion/ruta.

## Tareas pendientes principales

1. Cerrar Stripe por completo.

   Verificar pago real en modo test, webhook, estado de booking confirmado,
   payment record correcto, audit/outbox y casos de fallo, expiracion o
   cancelacion.

2. Probar y cerrar notificaciones reales.

   Resend y Prelude ya estan planteados. Falta validar envio real, logs,
   consentimientos por booking, plantillas y preview/traducciones desde
   backpanel.

3. Completar la pantalla final publica.

   Debe mostrar el resumen de reserva, estado de pago, deposito pagado, restante
   a pagar a bordo, datos del cliente, experiencia, slot, extras y canales de
   envio elegidos.

4. Revisar el flujo publico completo con datos reales.

   Hay que probar landing -> seleccion de experiencia -> booking -> extras ->
   datos del cliente -> Stripe -> retorno. Especialmente en mobile Safari.

5. Cerrar traducciones.

   Idiomas iniciales: ingles, espanol y catalan. El contenido editable desde
   backpanel debe poder traducirse. La UI publica debe priorizar SEO/GEO.

6. Cerrar SEO/GEO.

   Revisar slugs, metadata, canonical, hreflang, sitemap, schema.org, paginas
   publicas configurables y contenido enriquecido para experiencias.

7. QA y preparacion de produccion.

   Ejecutar verificaciones, revisar responsive, accesibilidad, visual tests,
   build de produccion, variables de entorno, backups, migraciones y webhook
   publico HTTPS en el VPS.

## Verificaciones habituales

Para cambios de documentacion:

```bash
pnpm rules:check
```

Para cambios de codigo:

```bash
pnpm lint
pnpm typecheck
pnpm test
```

Para cambios de UI publica o backpanel, ademas:

```bash
pnpm test:responsive
pnpm test:visual
pnpm build
```

Cuando haya cambios visuales relevantes, comprobar tambien en navegador real.

## Siguiente paso recomendado

El siguiente paso mas logico es arreglar la pantalla de retorno de Stripe para
que espere la confirmacion del webhook antes de dar el flujo por cerrado. Esto
reduce confusion en el cliente y deja el checkout listo para pruebas reales de
notificaciones y booking pass.
