# Preparación de publicación — 5 noviembre 2026

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
