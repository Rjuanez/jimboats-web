# Preparación de publicación — 5 noviembre 2026

## Caché comercial y fechas del sitemap — 12 noviembre 2026

Las páginas de inicio y la ruta comercial `/{locale}/{slug}` usan ISR con
`revalidate = 3600`. La ruta compartida también incluye privacidad y condiciones.
El sitemap se revalida con el mismo intervalo. `expireTime = 3600` limita la
ventana adicional `stale-while-revalidate` anunciada por Next.js: para estas
rutas HTML se espera `Cache-Control: s-maxage=3600`. El sitemap conserva la
cabecera nativa de metadata de Next.js `public, max-age=0, must-revalidate`:
se revalida cada hora dentro de la app y las cachés externas deben validarlo.
Esta opción es global para ISR;
no modifica la caché inmutable de `/_next/static/*` ni la de `/media/*` en Caddy.
ISR regenera al recibir visitas, no mediante un cron exacto; la primera visita
tras vencer el intervalo puede recibir el resultado anterior mientras regenera.
Por tanto, una hora no es una garantía absoluta de frescura del contenido.

El marketing usa tarifas versionadas en `src/content/booking/hourlyPrices.ts`.
Para publicarlas hay que compilar y desplegar una nueva imagen, que reemplaza
la caché de páginas de la app (no hay volumen persistente de caché Next.js en
el Compose actual). La invalidación del catálogo del antiguo panel no actualiza
estos archivos. Caddy solo hace reverse proxy para HTML, sin caché de respuestas
configurada. Si se incorpora una CDN, habrá que purgar también sus páginas al
publicar tarifas. Una política nueva no revoca copias almacenadas previamente
por terceros bajo la cabecera antigua.

`src/content/marketing/lastModified.ts` registra la última modificación
significativa de cada página e idioma. Las fechas iniciales se justifican con:

- `9f2e4ca`, 2026-11-09: explicación de precios y retirada del aviso incorrecto
  de simulación de reservas/pagos en todas las páginas comerciales.
- `d299b07`, 2026-11-12: aclaraciones de precio e inclusiones en las experiencias.

Al modificar contenido, tarifas, inclusiones, metadata o datos estructurados
significativos, actualizar las entradas afectadas con la fecha real del cambio.
Un cambio común de tarifas puede afectar inicio, precios y varias experiencias;
revisar todas las páginas que lo muestran y cada traducción. No actualizar fechas
por un build, un despliegue sin cambios editoriales o una modificación técnica.
No calcularlas con `new Date()`, mtimes ni la fecha del último commit global.

Verificar las cabeceras contra una compilación local de producción, no `next dev`:

```sh
pnpm build
cp -R public .next/standalone/
cp -R .next/static .next/standalone/.next/
SEO_CACHE_E2E=1 PLAYWRIGHT_PORT=3112 PLAYWRIGHT_BASE_URL=http://127.0.0.1:3112 PLAYWRIGHT_REUSE_EXISTING_SERVER=0 PLAYWRIGHT_WEB_SERVER_COMMAND="HOSTNAME=127.0.0.1 PORT=3112 node .next/standalone/server.js" pnpm exec playwright test tests/seo-cache.spec.ts --workers=1
```

La prueba comprueba GET repetidos de las 45 páginas, las 105 URL del sitemap con
fechas y alternates, las rutas compartidas de políticas y un recurso versionado.
Tras un despliegue autorizado, repetir GET de inicio, precios, experiencias y
`/sitemap.xml` en el dominio público; contrastar sus cabeceras y contenido con
la nueva versión. Estas medidas no garantizan resolver un «Cache miss» de una
herramienta externa ni forzar que un buscador vuelva a rastrear la web.

### Verificación de este cambio (local, 12 noviembre 2026)

Entorno: Node 24.13.1, pnpm 10.34.1, Next 16.2.6 y Chromium de Playwright 1.60.0.
Dependencias instaladas con lockfile congelado; Prisma Client y media estática
regenerados. La base `jimboats_hourly_preview` ya tenía todas las migraciones;
no se aplicó ninguna. Se retiraron tipos generados obsoletos de `.next/dev/types`
que aún referenciaban las rutas raíz anteriores. Se conservó el cambio local
previo de `next-env.d.ts` y el archivo `public/.Rhistory`.

| Verificación | Resultado final |
| --- | --- |
| `rules:check`, lint, typecheck y `git diff --check` | Correctos |
| Vitest (`test` y `test:ui` ejecutan la misma suite) | 118 archivos, 662 pruebas correctas |
| Build Next.js y Storybook | Correctos; aviso no bloqueante sobre tamaño de bundles Storybook |
| Suite Playwright general, 2 workers | 164 correctas, sin fallos ni omisiones; incluye visuales, responsive, axe, widgets externos y 4 contratos de caché/sitemap |
| Pruebas operativas, PostgreSQL local, pagos simulados, 1 worker | 5 correctas, sin fallos ni omisiones |
| Repetición de ambos recorridos de pago, 3 veces cada uno | 6 ejecuciones adicionales correctas |

Resultado consolidado por caso: **169 de 169 pruebas de navegador correctas**.
Los casos operativos se ejecutaron en `127.0.0.1:3102` con PostgreSQL aislado;
los otros 164 en `127.0.0.1:3112` con fixtures, excluyendo solo los cinco casos
operativos ya ejecutados en su entorno. Se habilitaron `SEO_CACHE_E2E=1` y
`MARKETING_EMBEDS_E2E=1`. Las comparaciones finales se ejecutaron sin actualizar
snapshots. No se aumentaron timeouts ni tolerancias, ni se desactivaron reglas axe.

La primera validación obtuvo 150/169 casos correctos. Tras la aprobación del
alcance de corrección, se resolvieron los 19 fallos:

- Sitemap: el test comprueba 105 URL y la presencia de privacidad y contratación
  en los cinco idiomas, usando sus rutas traducidas.
- Inclusiones: se actualizaron las tres expectativas responsive al texto vigente
  de bebida y aperitivo, conservando las comprobaciones de precios y duración.
- Accesibilidad: `BookingPrivacyNotice` usa una `section` con nombre accesible en
  lugar de un `aside` anidado. Se conservan contenido, enlaces y estilos. Con
  aprobación adicional, la prueba unitaria consulta el rol `region` y mantiene
  la comprobación del enlace de privacidad. Axe pasa en ambos recorridos.
- Calendario: `selectDate` espera a que el calendario regrese tras cargar cada
  mes, verifica el cambio de mes y comprueba que la fecha esté habilitada. Los
  recorridos conservan pago, persistencia, solapamientos y cancelación, y pasan
  tres repeticiones adicionales cada uno.
- Referencias visuales: se actualizaron exactamente 11 PNG revisados (cuatro
  del blog, seis SEO y la portada desktop). Reflejan la retirada del aviso local,
  enlaces legales y precios/textos vigentes; las dos portadas SEO incorporan
  diferencias mínimas y reproducibles de renderizado. Las 11 nuevas referencias
  coinciden píxel a píxel con las capturas revisadas antes de aprobar el cambio.
  No se modificaron las demás referencias ni el contenido comercial para
  satisfacer las capturas.

El alcance de corrección comprende 17 archivos: `BookingPrivacyNotice.tsx`,
`PublicBookingWorkspace.test.tsx`, `tests/blog.spec.ts`,
`tests/experience-booking.spec.ts`, `tests/hourly-booking.spec.ts`, los 11 PNG
y este documento. No se añadieron dependencias, migraciones ni reglas de negocio.
La semántica se corrigió en el componente compartido; las páginas siguen siendo
composición. Las verificaciones cubren 360, 768 y 1280 px. El grafo y el diff se
revisaron; sus avisos de cobertura indirecta quedan cubiertos por los tests
unitarios, XML/HTTP y recorridos de reserva ejecutados.

Los logs y resultados JSON finales están en `.local-preview/failure-fixes/`.
La evidencia inicial permanece en `.local-preview/cache-validation/`,
`test-results-cache-full/` y `test-results-cache-operational/`.
La web operativa local queda levantada en `http://127.0.0.1:3102/es`, con pagos
simulados y notificaciones locales. **No se ha desplegado ni publicado ningún
cambio.**

Archivos de este cambio: `next.config.ts`, `src/app/[locale]/page.tsx`,
`src/app/[locale]/[slug]/page.tsx`, `src/app/sitemap.ts`,
`src/content/marketing/lastModified.ts`, `src/content/marketing/marketing.test.ts`,
`src/interface/next/presenters/marketingSeoPresenter.ts`, `tests/seo-cache.spec.ts`
y este documento. Se respetan las capas existentes; no hay nuevas dependencias,
reglas de negocio en rutas, cambios de esquema ni modificaciones visuales.

## Estado y mecanismo

La nueva web vive en `web-seo`; no se ha desplegado. La imagen Docker activa
`JIMBOATS_INDEXING=1` durante la compilación. Las compilaciones locales sin ese
valor y cualquier modo preview/simulación siguen con `noindex` y robots cerrado.
La metadata de marketing se genera durante el build: cambiar solo la variable
al arrancar no basta. Compilar una imagen nueva para cambiar el modo.

Conservar el mismo PostgreSQL, volumen de media, dominio y secretos existentes.
No ejecutar `db:reset`, semillas locales ni `db push` en producción. Los workers
de notificaciones, expiración y sincronización siguen siendo operativos.
Stripe, su webhook `/api/stripe/webhook`, los cupones y las notificaciones usan
los adapters existentes. Los precios por horas son los confirmados en
`src/content/booking/hourlyPrices.ts`; la señal se lee del registro de experiencia.
La consulta pública del 5 de noviembre mostró 100 EUR para las cuatro experiencias.
La simulación de 50 EUR permanece exclusivamente en la base local aislada.

FR/DE/NL tienen el flujo inicial traducido; el retorno de pago y las comunicaciones
transaccionales siguen usando inglés, como establece `bookingTransactionLocale`.

## Inventario de URL y decisión

Fuentes: rutas del repositorio original, navegación pública actual y Search Console
(7 agosto–5 noviembre 2026, dimensión página). No hay sitemap registrado y el
endpoint actual `/sitemap.xml` devuelve 404.

| URL anterior | Tratamiento |
| --- | --- |
| `/` | Selección por Accept-Language: es/en/fr/de/nl; catalán → español; fallback inglés |
| `https://www.jimboatscharter.com/*` | Caddy: 301 a HTTPS sin www, preservando ruta y query |
| `/es`, `/en`, `/ca` | ES/EN se conservan; `/ca` hace 308 a `/es` |
| `/en#experiences`, `#extras`, `#how-it-works` | Se conservan los ids |
| `/en#gallery` | Anclaje conservado en la sección del barco |
| `/{es,en}/book?experience=…` | Se conservan los cuatro IDs reales; `/ca/book` hace 308 a `/es/book`, con query |
| `/{locale}/book` sin experiencia | Lleva al selector de experiencias de la landing |
| `/{locale}/book/success` y `/bookings/{reference}` | Rutas transaccionales conservadas, noindex |
| `/es/experiencias` y equivalentes de los cinco idiomas | 308 directo al inicio `#experiences` |
| `/admin/*` | Operaciones conservadas; antiguos editores redirigen a reservas |
| URL desconocida sin equivalente | 404 real, sin redirección indiscriminada a portada |

Los fragmentos `#…` no llegan al servidor: se preservan como ids HTML.
Search Console encontró 5 clics en la raíz sin www y 3 con www; `/ca` tiene
26 impresiones en aquella ventana. Conservar su acceso mediante redirección 308
al español, según la decisión posterior del usuario. La muestra de Search Console
no demuestra que no existan más enlaces externos sin impresiones.

## Comprobaciones en el lanzamiento

1. Imagen compilada con indexación activa, sin flags de preview ni archivos `.local-preview`.
2. Backup de PostgreSQL/media antes de migraciones; conservar imagen anterior para rollback.
3. Revisar migraciones pendientes; desplegar mediante la pipeline existente, sin recrear VM.
4. Comprobar dominio y www, robots, sitemap, canonical, hreflang y JSON-LD publicados.
5. Revisar disponibilidad real de las cuatro experiencias y las 21 tarifas; mantener
   los horarios y márgenes configurados en producción.
6. Verificar clave pública Stripe live, webhook y workers con su configuración vigente.
   No se ha hecho ningún cobro real en esta preparación.
7. Enviar el nuevo sitemap a Search Console tras publicar, inspeccionar páginas
   principales y observar errores, tráfico y conversiones. No pedir cambio de dominio.
8. Al publicar por primera vez las guías, registrar su fecha real en `publishedAt`
   en cada traducción. El presenter la emitirá como `datePublished` y `article:published_time`.
   No usar automáticamente la fecha de compilación ni cambiarla en actualizaciones;
   `updatedAt` corresponde a modificaciones editoriales reales.
9. Privacidad integrada localmente el 7 de noviembre tras aprobar el titular los
   plazos y su incorporación a la web. Antes de desplegar, aplicar la conservación
   a base de datos, correo, calendario, analítica, registros y copias; confirmar
   proveedores efectivos, región del VPS y garantías de transferencias. Resolver
   el consentimiento de medición antes de activar analítica no esencial: esta
   integración no introduce un panel de consentimiento ni modifica Statsig.
   Las condiciones de contratación están integradas localmente en cinco idiomas.
   La confirmación por correo adjunta una copia de las condiciones guardadas
   al reservar. Antes del lanzamiento, revisar jurídicamente la retención de
   importes y comprobar que las reglas activas envían el correo de confirmación
   con su adjunto. Revisar también la entrega para reservas que eligen solo
   WhatsApp. Véase `docs/legal-drafts-2026-11-05.md`.

Referencia de migración: https://developers.google.com/search/docs/crawling-indexing/site-move-with-url-changes

## Verificación local realizada

- Reglas del repositorio, ESLint, TypeScript y `git diff --check`: correctos.
- 489 pruebas unitarias, compilación Next y compilación Storybook: correctas.
- Navegador: 133 pruebas pasaron inicialmente; las 11 diferencias restantes
  correspondían a las cuatro capturas del blog, el nuevo número de guías/sitemap
  y el anclaje heredado `#gallery`. Tras revisar las capturas y actualizar esas
  expectativas, las 33 pruebas del conjunto afectado pasan.
- Tres pruebas operativas contra PostgreSQL local: reserva por horas, bloqueo de
  solapamientos, confirmación, notificación, cancelación, disponibilidad y cupones.
- Compilación con indexación de producción comprobada en servidor local separado:
  marketing indexable, reservas noindex y redirecciones heredadas correctas.
  La vista que queda abierta en el puerto 3102 continúa en modo local noindex.
- Las carpetas de migraciones de `web` y `web-seo` son idénticas. Esto no sustituye
  comprobar el estado de migraciones aplicado en la base de producción.
- La regla de Caddy para www está preparada; su validación en el proxy desplegado
  y la comprobación real de Stripe/webhook quedan para el lanzamiento. No se ha
  desplegado, alterado la base de producción ni efectuado un cobro real.

La sexta guía, sobre despedidas de soltera, se genera en los cinco idiomas con
firma única de Víctor, cinco fotos facilitadas y precios del catálogo compartido.
Las 90 URL del sitemap incluyen sus cinco traducciones. La investigación está
en `docs/research/hen-party-keywords-2026-11-05.md`.

## Reservas e identificación de la sociedad — 2026-11-05

- El paseo privado normal debe terminar antes de la puesta de sol. Se filtran
  los horarios públicos y se valida otra vez al crear la reserva en el servidor.
  `suncalc@2.1.2`, encapsulado en un adapter, calcula la referencia en Barcelona
  sin consultar una API. Las salidas de amanecer y atardecer siguen siendo
  manuales, configurables desde `/admin/availability`; no se cambian sus valores.
- Los horarios muestran salida → regreso, en hora de Barcelona. El margen
  entre reservas, los bloqueos compartidos del barco y la disponibilidad vigente
  continúan aplicándose a todas las duraciones.
- El último paso permite señal o pago completo. El servidor calcula el importe
  después de extras y cupón. La reserva, el registro del cupón, Stripe y el panel
  conservan el importe pagado y el saldo pendiente. «Pagado online» sustituye a
  la etiqueta que siempre lo llamaba señal. No requiere migración de base de datos.
- Se añaden Jimboats Charter SL, NIF B25930850 y domicilio Carrer de Provençals,
  5, Sant Martí, 08019 Barcelona. El footer enlaza a `/[locale]/legal` en cinco
  idiomas; la página distingue domicilio fiscal y embarque en Port Olímpic.
  La identidad también aparece en llms.txt y LocalBusiness (`legalName`, `taxID`).
  El sitemap pasa de 90 a 95 URL. Esta página identifica a la sociedad; no
  sustituye una revisión integral de las condiciones legales y de privacidad.

Verificación de esta ampliación: 499 pruebas unitarias, reglas, lint, TypeScript,
build Next y Storybook correctos. Cuatro recorridos operativos contra PostgreSQL
local comprueban señal/pago completo, persistencia, bloqueo de solapamientos,
confirmación, cancelación, horarios, cupones y notificaciones en el registro local.
Los pagos son simulados y no se envían mensajes externos. La vista local sigue
en noindex; no se ha publicado ni se ha modificado la base de producción.

En navegador, el conjunto completo obtuvo 128 pruebas correctas y 5 omitidas
por sus condiciones de entorno. Se corrigieron las 16 restantes (expectativas
de sitemap/etiquetas y capturas afectadas por el footer legal y «Pagado online»).
La repetición de los seis archivos afectados, con una nueva prueba de enlaces
de idioma de la página legal, terminó con 56 pruebas correctas. Las cuatro
pruebas operativas omitidas en el servidor de fixtures se ejecutaron por separado
contra la base local y pasaron. Evidencia en `.local-preview/booking-*.log` y
capturas `payment-choice-{360,768,1280}.png`; se revisaron los cambios visuales
antes de aceptar las nuevas referencias.
