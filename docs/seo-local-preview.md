# JimBoats: copia SEO local

Implementación local de la propuesta aprobada el 1 de noviembre de 2026.
El repositorio `web-seo` es una copia independiente de `web`, con su propio
directorio Git y sin remoto. No se ha desplegado ni publicado.

## Decisiones del usuario

- Marketing con contenido local, sin panel editorial ni lecturas de base de datos.
- Español, inglés, francés, alemán y neerlandés.
- Una ficha propia por experiencia: paseo privado de día, atardecer, amanecer y romántico.
- Las cuatro experiencias permiten seleccionar entre 1 y 6 horas.
- Los nuevos precios están por confirmar. Se muestra «Consultar precio» y no
  se calculan tarifas a partir de los antiguos paquetes de dos horas.
- La capacidad máxima sigue sin confirmar; el formulario solicita el tamaño
  del grupo, pero no promete que exista capacidad ni disponibilidad.
- Revisión posterior: recuperar el estilo premium anterior reutilizando sus
  componentes (portada completa, ondas, experiencias alternadas, galería,
  extras y cierre fotográfico), manteniendo las páginas SEO nuevas.
- El panel queda limitado a reservas y calendario. Los textos, traducciones,
  imágenes y configuración editorial se mantienen en archivos.

## Diseño anterior y panel simplificado

La portada y el cierre reutilizan las secciones de `HomeLandingPage.tsx`.
Las experiencias usan `ExperienceCard.tsx` con etiquetas localizadas y H3
bajo el H2 de la sección. Las fichas conservan su H1, canonical y selector
de 1–6 horas. `SeoPremiumSections.tsx` compone las secciones originales con
contenido local de `premium.ts`, en los cinco idiomas.

`/admin` abre `/admin/bookings`; la navegación incluye solo reservas y
calendario. Se conservan listado, ficha, creación manual, edición y cancelación
del sistema de reservas anterior. Las rutas de edición de experiencias,
contenido, traducciones, media, extras y configuración redirigen temporalmente
a reservas. Se conserva el código heredado y la estructura de datos, sin
borrar registros ni ejecutar migraciones. Ocultar esas rutas no sustituye a
la autenticación del panel ni a la validación de las acciones del servidor.

Esta copia local muestra datos de prueba del panel. Las operaciones reales
siguen necesitando su infraestructura y configuración. La consulta pública
por horas todavía no crea una reserva en ese panel: esa conexión requiere
cerrar tarifas y adaptar el motor de disponibilidad y precios.

## Arrancar y probar

Usar Node 24 y las dependencias del lockfile:

```sh
nvm use 24
pnpm install --frozen-lockfile
pnpm db:generate
pnpm media:prepare
pnpm dev:seo
```

La vista queda en `http://127.0.0.1:3100/es`. La base de datos y las credenciales
de producción no son necesarias. El script usa el modo de datos de prueba que
ya existía para el backpanel. Webpack evita el reinicio inestable observado
con el servidor Turbopack del entorno local.

La última revisión se ha verificado también con el build standalone. La
sesión entregada lo sirve en el puerto 3100; detenerla antes de ejecutar
`pnpm dev:seo` para seguir editando con recarga automática.

## Arquitectura de contenido

| Archivo / carpeta | Responsabilidad |
| --- | --- |
| `src/content/marketing/{es,en,fr,de,nl}.json` | Textos completos por idioma; títulos, descripciones, preguntas y etiquetas de interfaz. |
| `src/content/marketing/routes.ts` | Relación estable entre intención de página y slug traducido. |
| `src/content/marketing/catalog.ts` | Identificadores de las cuatro experiencias, datos de contacto, imágenes y opciones de duración. |
| `src/content/marketing/index.ts` | Preparar el contenido estático de cada página y sus enlaces equivalentes. |
| `src/app/[locale]/page.tsx` | Portada por idioma; conserva explícitamente la portada catalana heredada. |
| `src/app/[locale]/[slug]/page.tsx` | Las ocho páginas interiores por idioma mediante parámetros estáticos. Las rutas desconocidas dan 404. |
| `src/app/[locale]/layout.tsx` | Documento con el atributo HTML `lang` correcto, sin consultar cabeceras por petición. |
| `src/components/sections/seo/` | Componentes de portada, ficha, información, preguntas, contacto y selección por horas. |
| `src/interface/next/presenters/marketingSeoPresenter.ts` | Metadata, canonical, alternates, datos estructurados y sitemap. |
| `src/app/[locale]/book/page.tsx` | Vista local de consulta por horas, con experiencia y duración inicial desde la URL. |
| `src/interface/next/pages/LegacyBookingPage.tsx` | Flujo transaccional anterior conservado; no es el nuevo motor de reservas por horas. |
| `src/app/admin/` | Gestión heredada de reservas y operaciones, conservada en la copia. No alimenta el nuevo marketing. |

Hay 45 URLs comerciales: 9 intenciones × 5 idiomas. Inicio, privado, atardecer,
amanecer, romántico, precios, barco, contacto y sobre nosotros. No se crean URLs
adicionales para cada hora ni para sinónimos como barato/con patrón/privado.
La versión catalana se conserva como heredada; su migración no está decidida.

La composición es simple: contenido local → componentes React de servidor →
HTML. Solo el selector de horas y el formulario de consulta necesitan estado
de cliente. Cabecera, enlaces de idioma y FAQ funcionan como HTML nativo.
La base conserva Next.js y las capas de reservas existentes; no se introduce
un framework ni un CMS nuevo.

## Recorrido verificable

1. Abrir `/es` y entrar en una experiencia.
2. Elegir cualquier duración de 1 a 6 horas.
3. Continuar a `/es/book?experience=daytrip&hours=5`, por ejemplo.
4. La experiencia y las cinco horas aparecen seleccionadas.
5. Elegir fecha y número de personas.
6. Preparar un mensaje de consulta. La página muestra el texto y un enlace
   de WhatsApp que el usuario debe abrir y enviar por su cuenta.

Este recorrido no guarda reservas, no cobra pagos y no comprueba huecos reales.
La pantalla lo indica expresamente en los cinco idiomas. No equivale a haber
adaptado el motor transaccional anterior, que todavía opera con sus paquetes
y reglas existentes. La selección local tampoco cambia el backpanel original.

## SEO y confianza

- Un H1 por página; H2 y H3 para secciones y preguntas.
- Canonical absoluto y cinco equivalentes `hreflang` más `x-default` inglés.
- Sitemap con las 45 URLs propuestas.
- Identidad LocalBusiness, WebPage, Service para cada experiencia y breadcrumbs.
- Sin precios, disponibilidad, estrellas ni reseñas inventados en JSON-LD.
- Preguntas y respuestas en el HTML, dentro de `details` accesibles.
- Contacto, teléfono, WhatsApp, Google Maps y enlace a la previsión meteorológica.
- Las opiniones se enlazan a Google Maps; no existe sincronización de reseñas
  ni un widget de puntuación. La previsión es un enlace externo, no datos de
  tiempo actuales descargados por la página.
- `llms.txt` resume la oferta; no garantiza rastreo ni citas de asistentes.
- Las páginas comerciales tienen `noindex` y robots bloquea el rastreo: se
  trata de una copia local con tarifas sin confirmar. El sitemap muestra la
  arquitectura prevista, no implica autorización para indexarla o publicarla.

## Verificaciones

Se ejecutan reglas del repositorio, TypeScript, ESLint, Vitest, Storybook y
build de Next.js. Los tests de navegador incluyen las 45 URLs, selección de
horas, idioma equivalente, sitemap, 404, accesibilidad y anchuras 360/768/1280.
Se añaden capturas de portada y ficha en móvil/escritorio. La captura anterior
de la portada inglesa se actualiza intencionalmente por el rediseño.

Para comprobaciones funcionales se puede usar el Chrome instalado:

```sh
PLAYWRIGHT_CHANNEL=chrome PLAYWRIGHT_PORT=3100 \
PLAYWRIGHT_BASE_URL=http://127.0.0.1:3100 \
PLAYWRIGHT_REUSE_EXISTING_SERVER=1 pnpm exec playwright test --workers=2
```

Las comparaciones visuales deben usar el Chromium correspondiente a la versión
instalada de Playwright, sin `PLAYWRIGHT_CHANNEL=chrome`. Chrome del sistema
produce diferencias en iconos y controles nativos aunque el diseño sea idéntico.
No se deben renovar referencias ni aumentar tolerancias para compensarlas.

En la revisión del 5 de noviembre se reutilizó la caché local de referencia:

```sh
PLAYWRIGHT_BROWSERS_PATH=/tmp/jimboats-playwright-browsers \
PLAYWRIGHT_PORT=3100 PLAYWRIGHT_BASE_URL=http://127.0.0.1:3100 \
PLAYWRIGHT_REUSE_EXISTING_SERVER=1 pnpm exec playwright test --workers=1
```

Si esa caché temporal falta, se puede preparar con
`PLAYWRIGHT_BROWSERS_PATH=/tmp/jimboats-playwright-browsers pnpm exec playwright install chromium --only-shell`.
Las referencias actuales son de macOS; conservar el mismo sistema y navegador
al comparar. Los fixtures de tiempo y reservas se mantienen deterministas.

Los resultados de la sesión se documentan en `seo-local-validation.txt`.
La revisión de las 13 diferencias del 5 de noviembre está en
`seo-point13-and-ai-plan-2026-11-05.md`, apartado 5: 152 pruebas de navegador
correctas, cinco opt-in omitidas y ninguna comparación visual pendiente.

## Antes de convertirlo en una web operativa

Confirmar tarifas por experiencia/duración, capacidad, inclusiones y políticas.
Adaptar la disponibilidad y el cálculo de precio del motor de reservas al
nuevo modelo de horas, preservando las validaciones del servidor. Integrar el
checkout real y sus traducciones después de esa adaptación. Revisar textos
legales, identidad y punto de embarque, traducciones editoriales, tracking y la
decisión sobre catalán. Reconciliar el catálogo estático con las tarifas
operativas antes de habilitar indexación. El despliegue es una fase separada.

## Reservas por horas conectadas (2026-11-01)

La web admite reservas de 1–6 horas con tarifa explícita por experiencia y duración.
El servidor decide precio, anticipo, hora final, capacidad y disponibilidad; no acepta
un precio o una hora final del cliente. Si falta una tarifa, rechaza el checkout.

### Arranque local con persistencia

Desde `web-seo`, con Node 24 y Docker:

```sh
pnpm db:hourly:setup
pnpm dev:hourly
```

La primera orden inicia `docker-compose.hourly.yml`, aplica las 22 migraciones existentes
y siembra cuatro experiencias en `jimboats_hourly_preview`, puerto local 55439.
No ejecuta migraciones en producción ni borra reservas existentes. El volumen Docker
`jimboats-hourly-preview_hourly_preview_data` conserva los datos al reiniciar.
La segunda sirve la web en http://127.0.0.1:3100, con el panel conectado a esa base.
El modo antiguo `dev:seo` mantiene fixtures deterministas para las regresiones visuales.

### Flujo comprobable

1. `/es/book?experience=daytrip&hours=3`: elegir fecha, consultar disponibilidad,
   seleccionar salida y completar datos.
2. Continuar al pago crea `PENDING_PAYMENT` y un bloqueo temporal.
3. **Simular pago correcto** recorre el manejador de pago existente y confirma la reserva.
   No se conecta a Stripe, no usa tarjeta, no manda correos/WhatsApp y no se arrancan workers.
4. `/admin/bookings`: inspeccionar, editar datos/horarios y cancelar.
5. `/admin/calendar?from=YYYY-MM-DD&to=YYYY-MM-DD`: ver el bloqueo; al cancelar se libera.
6. Otra reserva que solape cualquier experiencia se rechaza. La exclusión PostgreSQL
   protege también solicitudes simultáneas; la disponibilidad por horas incluye los mismos
   márgenes protegidos de la base de datos (30 min antes y después en el seed).

### Tarifas y datos de prueba

Fuente: `src/infrastructure/booking/HourlyTariffs.ts`, importada únicamente en servidor.
Importes enteros en céntimos EUR, total por barco. Ejemplos autorizados para probar:

| Experiencia | 1h | 2h | 3h | 4h | 5h | 6h |
|---|---:|---:|---:|---:|---:|---:|
| Privado / amanecer | 99 | 179 | 249 | 319 | 389 | 449 |
| Atardecer | 119 | 199 | 279 | 349 | 419 | 479 |
| Romántico | 149 | 229 | 309 | 379 | 449 | 509 |

Anticipo simulado 50 €. Capacidad de ejemplo 8, salidas entre 06:00 y 23:00,
intervalos de 30 min, aviso mínimo 1 h y horizonte 6 meses. **Todos son datos de prueba**, no
condiciones comerciales aprobadas; especialmente amanecer/atardecer necesitan horarios
operativos reales. La web y el panel identifican claramente la simulación.
`approvedHourlyTariffs` permanece vacío. Fuera del modo local no se usan importes ficticios.
El simulador exige URL y DB de loopback, DB con nombre aislado, vista previa SEO y calendario
Google desactivado. Los eventos de pago simulados se firman internamente; el endpoint público
no acepta una confirmación simulada inventada por el navegador.

Las reservas guardan una instantánea del precio. Editar contacto, fecha u hora sin cambiar
duración conserva el importe acordado y el anticipo pagado; cambiar duración usa la tarifa
correspondiente y mantiene ese anticipo. Cancelar libera calendario; no emite un reembolso
monetario automático (se mantiene el comportamiento anterior).

### Antes de activar ventas reales

Rellenar las tarifas aprobadas y verificar aforo, horarios, márgenes, condiciones de cancelación
permitidas y el anticipo. Los IDs operativos deben ser `daytrip`, `ex-sunset`, `sunrise`, `romantic`
o debe adaptarse explícitamente el catálogo. No ejecutar el seed de prueba en la DB real.
Configurar las claves Stripe y el webhook existentes y hacer una prueba de Stripe en modo test.
La interfaz de reserva tiene ES/EN/FR/DE/NL; los recibos/retornos del motor heredado mantienen
ES/EN (FR/DE/NL van a EN), y en este formulario todavía no se solicita envío de notificaciones.
No hay autenticación nueva de administración en este cambio; se conserva el control existente.
La protección de acceso y la configuración de producción se verifican antes de cualquier despliegue.

### Verificación específica

```sh
HOURLY_BOOKING_E2E=1 PLAYWRIGHT_PORT=3100 PLAYWRIGHT_BASE_URL=http://127.0.0.1:3100 PLAYWRIGHT_REUSE_EXISTING_SERVER=1 pnpm exec playwright test tests/hourly-booking.spec.ts --workers=1
```

Este E2E crea una reserva de prueba, comprueba el bloqueo entre experiencias, simula el pago,
abre la reserva del panel, recarga para verificar persistencia, cancela y comprueba que vuelve
la disponibilidad. Se ejecuta solo con `HOURLY_BOOKING_E2E=1`; el resto de pruebas utiliza los fixtures.

## Ajustes de confianza y contacto — 2026-11-02

- WhatsApp flotante circular verde con icono reconocible y nombre accesible; mantiene el teléfono propio de JimBoats.
- Doce preguntas originales en ES/EN/FR/DE/NL, inspiradas en los temas de Nautiq (licencia, duración, precio, reserva, llegada, grupos, estación, equipaje, celebraciones y cambios). No se copian sus pólizas, capacidades, reembolsos ni reseñas. El contenido sigue siendo HTML estático con `details/summary`, sin plugin ni petición al abrir.
- Incluidos y franja bajo el hero usan iconos, fondo cálido, bordes suaves y los tokens existentes.
- La primera tarjeta anuncia 1 hora; las otras tres, 2 horas. Ejemplos: 99, 199, 179 y 229 EUR por barco. La ficha abre con la misma duración y muestra el importe al seleccionar 1–6 horas. Fuente única `src/content/booking/exampleHourlyPrices.ts`, compartida con el simulador. Siguen siendo importes provisionales visibles como tales; `approvedHourlyTariffs` sigue vacío y no se generan `Offer`, precios ni valoraciones en JSON-LD.
- Ubicación: Google Maps embebido por la dirección propia Moll de Xaloc 3, con enlace de indicaciones. No se reutiliza el punto de Nautiq. Se debe confirmar el punto exacto de encuentro con el operador.
- Tiempo: widget compacto de meteoblue para Barcelona, URL generada por su configurador público, con enlace de atribución. Muestra temperatura/condiciones/viento del área, no es una autorización de navegación ni una previsión marina. Los dos iframes cargan `lazy`, tienen título accesible y enlaces externos alternativos. Ninguna API key ni dependencia npm nueva. El proveedor mantiene el contenido interno del iframe en inglés.
- Reseñas: sección independiente preparada visualmente, con estado explícito pendiente. Se solicitó al propietario la URL verificada de Google Maps; sigue pendiente. El enlace actual es una búsqueda, no una ficha verificada. No se publican estrellas, autores, textos o cifras inventadas. No hay sincronización con Google Reviews todavía.

Archivos del ajuste: `src/components/sections/seo/{SeoTrustSections,SeoReviews,SeoIncluded,WhatsAppIcon,SeoExperienceGrid,SeoMarketingPage,SeoSiteChrome,HourlyExperienceSelector,SeoMarketingPage.stories}.tsx`; `src/content/marketing/{index,catalog,marketing.test}.ts` y los cinco JSON de idioma; `src/content/booking/exampleHourlyPrices.ts`; `src/infrastructure/booking/HourlyTariffs.ts`; tests `seo-marketing`, `seo-visual`, `visual` y cinco baselines públicas revisadas. Sin migraciones, despliegues ni cambios en `web/`.

Referencias revisadas: https://nautiqbarcelona.com/en/ y https://www.meteoblue.com/en/weather/widget/setupthree/barcelona_spain_3128760. No se copió código de la web competidora. En las capturas de regresión se enmascaran los iframes para que el tiempo y los mapas remotos no introduzcan diferencias aleatorias. Las capturas de las secciones en `.local-preview/location-*.png` y `.local-preview/faq-*.png` permiten revisar el resultado sin esas máscaras.

La prueba opcional `tests/seo-location.spec.ts` (`MARKETING_EMBEDS_E2E=1`) verifica ambos proveedores reales y guarda `.local-preview/location-live-{desktop,mobile}.png`. En pantallas pequeñas el iframe meteorológico se escala dentro de su marco para conservar la información completa. Validación completa y última comprobación pública registradas en `docs/seo-local-validation.txt`.

## Reseñas verificadas y carrusel — 2026-11-02

Actualiza el estado pendiente anterior: el propietario facilitó https://share.google/VCXHQNiEvhbq4R1nY. La ficha corresponde a Jimboats Charter (web y teléfono coincidentes); Google mostraba 5,0/5 y 35 opiniones. La vista pública limitada permitió verificar cinco extractos originales en español: Sandra Esteras Sánchez, Marc Asensio, Jan 22, Neus García-Donas y Víctor Espejo. No se deduce nacionalidad a partir del nombre. La petición de incorporar reseñas originales en otros idiomas queda pendiente de acceso al resto: Maps solicita iniciar sesión para ver más o buscar opiniones, y se pidió al usuario hacerlo en el navegador integrado.

El contenido vive en `src/content/marketing/reviews.ts`, con fuente, autores, idioma y fecha de consulta. Es una selección editorial estática, no una integración de actualización automática. La fecha se muestra en cada idioma. No se añade marcado AggregateRating/Review al negocio propio.

`SeoReviews` compone el resumen estático y `SeoReviewsCarousel`, que recibe datos serializables y únicamente controla desplazamiento visual. Todas las tarjetas se entregan en HTML. Scroll nativo, snap, flechas, teclado (izquierda/derecha/inicio/fin), sin autoplay, controles deshabilitados en los extremos y respeto de movimiento reducido. Una tarjeta con indicio de la siguiente en móvil, dos en tablet y tres en escritorio. Sin paquetes nuevos, cambios en dominio, base de datos, media, despliegue ni reservas.

Las tarjetas de experiencias ahora usan «Desde» y sus equivalentes EN/FR/DE/NL, manteniendo las duraciones destacadas 1/2/2/2 horas y las mismas tarifas de ejemplo. La advertencia de prueba permanece en el contexto de la reserva y pie de la vista local.

Stories ES/EN y pruebas de navegación del carrusel a 360/768/1280 px. Las cinco capturas públicas se actualizan intencionadamente por la sección de reseñas y el rótulo de precio. Capturas del carrusel en `.local-preview/reviews-{360,768,1280}.png`. La dirección de Maps dice Pantalan 5; el contenido de la web sigue en Moll de Xaloc 3: pendiente confirmar el punto exacto antes de publicarlo.

## Opiniones de varias plataformas — 2026-11-02

Con la sesión de Google iniciada se pudo leer el listado completo. Se amplía la selección a once extractos: ocho de Google Maps (los cinco existentes, Megan Bradley, Francessca Tremeer y Kateryna Ihnatovych) y tres de GetYourGuide (Stefanía, Shanon y Emma). Textos originales en ES/EN/FR; no se deduce nacionalidad por el nombre ni se presentan traducciones como opiniones originales.

GetYourGuide: https://www.getyourguide.com/barcelona-l45/barcelona-sail-along-the-coast-and-enjoy-the-skyline-t1353227/ . Proveedor visible: Jimboats Charter SL. Se usó «Mostrar original» para confirmar los textos; IDs de reseña 127434259, 127768088 y 124610205. Enlaces de referencia con fragmentos `reloadable-review-card-*` observados en el DOM. La ficha mostraba seis reseñas y 5/5; la web no combina esa puntuación con Google. Las nuevas reseñas de Google enlazan a la ficha verificada del negocio, no a un permalink individual que no esté disponible.

`customerReviews` separa explícitamente la puntuación Google del conjunto de extractos. Cada extracto tiene plataforma, URL, autor e idioma. La sección se titula genéricamente como opiniones de viajeros; cada tarjeta y CTA nombra su plataforma. Fuentes verificadas: Google Maps y GetYourGuide. Click&Boat pendiente del anuncio proporcionado por el propietario; no se añaden enlaces ni testimonios de un barco no identificado. Contenido editorial estático con fecha de consulta, sin API o actualización automática.

Archivos: `src/content/marketing/{reviews,index}.ts`, cinco JSON de idioma, `SeoReviews.tsx`, `SeoReviewsCarousel.tsx`, `SeoMarketingPage.stories.tsx`, `tests/seo-marketing.spec.ts`, cinco baselines públicas y esta documentación/registro de validación. Sin cambios en reservas, infraestructura, dependencias, media ni despliegue.

## Diseño Editorial y lectura por idioma — 2026-11-02

Sustituye el diseño anterior del carrusel por la variante Editorial aprobada: H2 centrado, valoración compacta de Google, dos tarjetas en tablet/escritorio y una con indicio de la siguiente en móvil. Las flechas y el intervalo visible se agrupan debajo. Autores y plataformas son texto/enlaces, sin encabezados añadidos por motivos visuales. Se conserva la fecha de consulta y no se mezclan puntuaciones de plataformas.

La URL Click&Boat facilitada por el propietario se verificó en su listado completo de siete reseñas:
https://www.clickandboat.com/es/activities/barcelona/atardecer-privado-en-barcelona-barco-tradicional-mediterraneo-33336 . Se añaden Asante, Adam y Alina, todos con cinco estrellas y texto original en inglés. Se enlaza a la ficha, sin inventar permalinks individuales. GetYourGuide facilitado por el propietario corresponde al mismo producto 1353227 ya verificado. La selección pasa a catorce opiniones, conservando las once anteriores y dando prioridad a las reseñas internacionales con mayor detalle. Orden inicial: Emma, Asante, Stefanía, Adam, Kateryna y Alina. No se infieren nacionalidades de los nombres.

Los cinco diccionarios contienen resúmenes editoriales en tercera persona, identificados expresamente como resúmenes. Se elaboran a partir del texto leído en cada plataforma y no se presentan como traducciones literales ni citas completas. «Ver extracto original» cambia únicamente esa tarjeta a una cita breve en su idioma original; «Ver resumen» restaura el texto localizado. El enlace de plataforma permite consultar la reseña completa. No se añaden servicios de traducción en vivo, scripts de las plataformas ni nuevas dependencias.

Los resúmenes y enlaces de todas las tarjetas se entregan en HTML, con `lang` correcto. La interacción usa estado local de React; sin autoplay y con navegación por flechas, teclado y scroll nativo. No cambian esquema, reservas, importes, media, runtime de producción ni el repositorio original `web/`. La selección sigue siendo editorial y estática, no una sincronización automática.

Archivos afectados: `SeoReviews.tsx`, `SeoReviewsCarousel.tsx`, `SeoMarketingPage.stories.tsx`; `src/content/marketing/{reviews,index,marketing.test}.ts` y los cinco JSON de idioma; `tests/seo-marketing.spec.ts`; cinco snapshots públicos (home ES móvil/escritorio, experiencia ES móvil/escritorio, home EN escritorio); esta nota y `docs/seo-local-validation.txt`. Las capturas se renuevan por el diseño aprobado y el nuevo contenido, conservando las máscaras de los iframes externos.

## Corrección solicitada: traducción directa — 2026-11-02

Este cambio sustituye los resúmenes editoriales anteriores. El propietario pidió expresamente conservar la voz y las afirmaciones reales de los clientes. La selección visible se reduce a ocho reseñas detalladas verificadas (Emma, Asante, Stefanía, Adam, Kateryna, Alina, Megan y Francessca), dando prioridad al contenido específico de las salidas. No se muestran las seis reseñas breves de menor detalle.

Cada tarjeta contiene un extracto literal breve y su traducción fiel en los cinco diccionarios. No se presentan resúmenes como traducciones. Se conservan la persona gramatical, las circunstancias narradas y el énfasis del original, sin introducir servicios o promesas. Las palabras de los clientes se muestran en `blockquote` con `cite` y `lang`. El rótulo indica «Extracto traducido» o «Extracto original»; el botón alterna entre ambos. Cuando coincide el idioma de la página con el original, se muestran directamente las palabras originales y no aparece un selector redundante. El enlace de plataforma lleva a la fuente completa. Los extractos no se presentan como reseñas completas.

Se mantiene el diseño Editorial aprobado, el H2 y las tres plataformas. Cambian `SeoReviews.tsx`, `SeoReviewsCarousel.tsx`, `src/content/marketing/{reviews,index,marketing.test}.ts`, los cinco JSON de idioma y `tests/seo-marketing.spec.ts`, además de las cinco capturas públicas y la documentación. Sin dependencias, esquema, reservas ni despliegue. Las stories existentes cubren tanto la lectura traducida ES/DE como la original EN.

## Total de plataformas y tres tarjetas — 2026-11-02

El encabezado suma los recuentos públicos verificados: Google 35, GetYourGuide 6 y Click&Boat 7, total 48 opiniones publicadas. No representa 48 viajeros distintos ni el número de citas seleccionadas (siguen siendo ocho). Cada plataforma tiene un enlace y muestra su propio recuento. La puntuación visible se calcula ponderando las puntuaciones publicadas por su recuento: actualmente las tres son 5/5. Se conserva la fecha de consulta; no es un feed automático ni se añade AggregateRating al JSON-LD.

Fuente única de los recuentos y puntuaciones en `reviews.ts`, suma y formato localizados en `index.ts`, etiquetas en ES/EN/FR/DE/NL. `SeoReviews.tsx` conserva el H2 y presenta total, desglose y enlaces. `SeoReviewsCarousel.tsx` muestra una tarjeta en móvil, dos desde 768 px y tres desde 1024 px; ancho máximo 1152 px y padding interior moderado para preservar lectura. Las tarjetas conservan sus enlaces de plataforma, texto original y traducción directa.

Enlaces comprobados en navegador: GetYourGuide conserva el fragmento `reloadable-review-card-124610205` tras redirigir al idioma local y sitúa la reseña de Emma en el viewport; se mantienen las anclas de reseñas observadas. Click&Boat contiene `review-comment-4` dentro de un diálogo oculto: navegar a ese fragmento no abre la reseña (altura 0), por lo que no se presenta como enlace individual y se mantiene la ficha. Google Maps ofrece «Compartir reseña» para las tres opiniones seleccionadas, pero el navegador de automatización no devolvió la URL copiada; se mantiene el enlace público de la ficha, sin inventar identificadores ni enlaces individuales.

Validación específica: suma 48 frente a ocho extractos, enlaces de cada recuento, tres/dos/una tarjetas completas según viewport, teclado y traducción. Cinco baselines públicas actualizadas intencionadamente por el nuevo encabezado y la distribución. Archivos: los dos componentes de reseñas, `src/content/marketing/{reviews,index,marketing.test}.ts`, cinco JSON de idioma, `tests/seo-marketing.spec.ts`, snapshots públicos y documentación. Sin nuevas dependencias, migraciones, cambios operativos ni despliegue.

La primera fila combina ahora Emma (GetYourGuide), Asante (Click&Boat) y Megan (Google Maps), sin modificar sus citas. En móvil los nombres de plataforma y sus recuentos se mantienen juntos, con la puntuación y el total envolviendo de forma natural.

## Fotos y contenido público de producción en local — 2026-11-02

Decisión del propietario: cerrar primero la landing; después las páginas de detalle, después revisar el flujo de reservas (el diseño actual no está aprobado) y finalmente el resto de arquitectura SEO. Mantener las cuatro experiencias, importar fotos y contenido compatible e incorporar los extras reales de producción: eFoil, paddle surf y fotógrafo.

Se ha consultado directamente la landing pública ES/EN de producción. El índice del buscador devolvía una versión antigua con una quinta experiencia y otros precios: no se ha utilizado esa versión para la importación. `src/content/marketing/production.json` conserva una captura fechada del texto público, URLs, alt y dimensiones de imágenes de las dos páginas. No es una conexión activa, ni un dump de clientes/reservas, ni una fuente de tarifas horarias. El contenido SEO trabajado y las tarifas simuladas siguen vigentes en esta prueba; los importes publicados por paquetes no se extrapolan a 1–6 horas.

Doce fotos públicas se copian a `media/static/landing/sources/production/`: cuatro experiencias, tres extras y cinco de la selección visible de la galería. Son las variantes públicas más grandes disponibles, no los originales privados de cámara ni toda la biblioteca del backpanel. La galería queda fija en esta copia; los procesos de rotación de producción no afectan al resultado local. Hero, bloque de historia y CTA ya utilizaban fuentes editoriales locales.

El manifiesto incorpora las nuevas fuentes y sus dimensiones reales; el preparador existente `pnpm media:prepare` genera WebP locales antes del build, sin peticiones a producción en runtime ni worker editorial permanente. Se conservan las fuentes de prototipo utilizadas por los fixtures y el flujo de reservas que se revisará más adelante. Las variantes de imágenes pequeñas no anuncian tamaños inexistentes; el DTO obtiene su tamaño máximo y relación de aspecto del manifiesto. Alts de galería revisados visualmente y traducidos a ES/EN/FR/DE/NL.

Archivos afectados: `media/static/landing/manifest.json`, doce fuentes en `sources/production/`, `src/content/marketing/{production.json,catalog.ts,premium.ts,index.ts,marketing.test.ts}`, `SeoPremiumSections.tsx`, las cinco baselines públicas y documentación/registro de validación. Sin cambios de diseño del checkout, base de datos, credenciales, procesos remotos o despliegue.

El alcance estático corresponde al contenido público. Los procesos de reservas (caducidad de bloqueos, notificaciones y sincronización de calendario) requieren un análisis separado para decidir cuáles conservar, sustituir o ejecutar bajo demanda; no se han apagado ni eliminado en producción.

## Duraciones mínimas, seis plazas y Port Olímpic — 2026-11-02

El propietario confirma 1–6 horas para el paseo de día y 2–6 horas para amanecer, atardecer y romántico. Las cuatro experiencias admiten hasta seis personas. `hourlyDurationOptions` prepara los valores del catálogo y filtra las tarifas del simulador; el motor de reservas rechaza una hora en las tres experiencias sin esa tarifa. Los selectores reciben opciones preparadas, corrigen enlaces antiguos con una duración no disponible y ajustan la selección al cambiar de experiencia. Las tarjetas muestran una etiqueta de seis plazas sobre la foto. La tabla de precios muestra el rango de cada experiencia.

Se actualiza únicamente la capacidad de las cuatro experiencias en la base local aislada mediante el seed existente; no se eliminan reservas ni se toca producción. Los importes siguen siendo ejemplos pendientes de aprobación. El nuevo flujo de reservas aún queda pendiente de revisión de producto: este cambio solo alinea sus restricciones con la oferta anunciada.

Los extras muestran descripciones breves en lugar de «Por confirmar». Tras aclaración del propietario, se retira el botón «Hablar por WhatsApp» junto al título de las FAQ; los consejos prácticos sobre ropa se mantienen. FAQs de duración y capacidad actualizadas en los cinco idiomas. El botón flotante general de WhatsApp sigue disponible.

Referencia visual observada: https://nautiqbarcelona.com/en/#contact . La nueva composición coloca título, dirección y tiempo en una columna; el mapa ocupa dos tercios en escritorio y 660px de alto. En móvil se apilan y el mapa mantiene 420px. Colores, tipografía, radios y sombras del sistema JimBoats; hover sutil y reducción de movimiento respetada. Enlace de dirección con foco visible y apertura en Google Maps. El widget meteoblue mantiene la integración existente, con la opción oficial «No background: Dark text» (`layout=bright`) obtenida del configurador https://www.meteoblue.com/en/weather/widget/setupthree/barcelona_spain_3128760 . No se introduce API, clave, dependencia ni worker.

Archivos: contenido de marketing (`catalog.ts`, `index.ts`, `premium.ts`, cinco diccionarios y tests), `exampleHourlyPrices.ts`, `HourlyTariffs.ts` y test, `ExperienceCard.tsx` y story, `SeoExperienceGrid.tsx`, `HourlyExperienceSelector.tsx`, `HourlyBookingPreview.tsx` y story, `SeoMarketingPage.tsx`, `SeoPremiumSections.tsx`, `SeoTrustSections.tsx`, seed local, tests de marketing/reservas, capturas públicas y documentación. La prueba cubre que 1h no aparece en las otras experiencias, el ajuste de enlaces antiguos/cambio de selección, el máximo seis y la ausencia del botón FAQ.

### Tiempo integrado y localizado (2026-11-02)

Se sustituye el iframe de meteoblue por `PortWeather` / `WeatherCard`, con los
colores, tipografía y radios de la landing. Temperatura, condición, viento en km/h,
humedad y hora de previsión (Europe/Madrid) se presentan en ES/EN/FR/DE/NL.
El mapa mantiene su composición anterior. Se conserva la jerarquía h2 de sección
→ h3 del tiempo. Loading y error tienen copy localizado, sin cifras ficticias.

La consulta usa MET Norway Locationforecast para coordenadas fijas de Port Olímpic
(41.387, 2.201). Fuente/licencia visible: MET Norway, CC BY 4.0.
Documentación: https://api.met.no/doc/TermsOfService y https://api.met.no/doc/License.
No se reutilizan datos del widget de meteoblue. No hay cuentas, API keys, paquetes,
migraciones, trabajadores ni tareas periódicas nuevas.

La landing sigue precompilada; el navegador consulta `/api/weather?locale=…` después
de montar la tarjeta. El endpoint usa el servidor existente. Una exportación futura
sin ningún servidor necesitará conservar este endpoint en el backend de reservas.
El adapter encapsula HTTP, valida la respuesta, combina peticiones simultáneas y
conserva la previsión en memoria por proceso, al menos 30 minutos y hasta Expires.
Envía User-Agent identificable y Last-Modified en revalidaciones; respeta Retry-After.
No se mandan al proveedor IPs ni ubicaciones de visitantes. Los datos son previsiones,
no mediciones de una estación ni una recomendación automática de seguridad náutica.
No se crea un caso de uso de paso: esta lectura externa no añade reglas de negocio.

Pruebas: adapter (validación, antigüedad, conversión, códigos, caché, concurrencia y
rate limit); tarjeta en cinco idiomas a 360/768/1280, accesibilidad y error; stories
ready ES/EN/DE, loading y unavailable. Las capturas usan datos deterministas;
la prueba opt-in de ubicación consulta datos reales y comprueba el mapa.

### Tablas de precios en lugar de galería (2026-11-02)

La landing sustituye la galería por `SeoPricingTables`: experiencias (enlaces a
sus detalles, capacidad, rango de horas y precio inicial) y extras. Mantiene
los precios compartidos de la prueba local: 99 €/1 h para daytrip, y desde
2 h para atardecer, amanecer y romántica. No se modifican las tarifas aprobadas.
Los extras se capturan como contenido estático: el flujo público de producción
consultado el 2 de noviembre ofrece Paddle Surf +20 € en las cuatro experiencias;
seleccionarlo incrementa el total una sola vez en 20 €. eFoil y fotógrafo están
anunciados en la portada, pero no aparecen contratables en esos flujos: figuran
como «Consultar precio», sin inventar importes ni unidades por hora/persona.
Fuente: https://jimboatscharter.com/es/book?experience=daytrip (también sunrise,
romantic y ex-sunset). La consulta no crea reservas ni llega al pago.

Tablas HTML con cabeceras y scope, un solo DOM para todas las anchuras. Desde
768 px se presentan en columnas; en móvil cada fila se reorganiza en bloques
con etiquetas visibles, sin scroll horizontal. H2 de sección y H3 por tabla.
Copy explícito en ES/EN/FR/DE/NL, stories de español y alemán y pruebas en
360/768/1280 con axe. No cambian backend, paquetes, schema, workers o despliegue.

### Reclamo de precio e inclusiones (2026-11-02)

Portada: hasta 6 personas y precio final desde 1 hora, usando el importe de la
fuente compartida de tarifas locales para evitar una cifra distinta en la tabla.
Indicadores: barcos 100 % privados, patrón, Google Maps 5★ y 35 reseñas (cantidad
procedente de la fuente editorial de reseñas), Port Olímpic. El indicador de
opiniones usa estrella, manteniendo el icono de tiempo para los otros usos.

Precios, FAQ de inclusiones y bloque de detalles indican patrón, combustible y
seguro incluidos, sin licencia. FAQ de duraciones e información bajo la tabla
aclaran horas extra según experiencia/disponibilidad, con límite actual de 6 h.
Copy explícito en los cinco idiomas y reflejado en FAQPage y metadata preparados.
Las tarifas de experiencia siguen siendo ejemplos en esta prueba local.

### Indicador de Google y animación de WhatsApp (2026-11-02)

El indicador de reseñas mantiene la misma estética de los demás: estrella de
contorno en círculo, texto normal y rating localizado con decimal. En móvil
se conserva la cuadrícula 2×2; en escritorio la columna de reseñas dispone de
más espacio. Los elementos pueden envolver su texto sin recorte ni overflow.

WhatsApp reproduce el efecto observado en la referencia pública de NautiQ:
halo de 2 segundos, escala 1 → 1.4 y opacidad .5 → 0; hover de escala 1.1,
fondo verde oscuro y sombra verde. CSS Module local, sin JS ni dependencias.
Con prefers-reduced-motion se desactiva el halo y el escalado. Se mantienen
el enlace, nombre accesible, foco y tamaño táctil. Snapshots congelan animaciones.

### Indicadores sin saltos forzados y revisión del panel (2026-11-02)

La franja compacta usa flex-wrap: cada indicador mantiene su ancho natural y
salta completo a otra fila cuando falta espacio. Sin cortes manuales en rating,
Google Maps o recuento. Conserva los iconos y estilos existentes. Solo envuelve
texto si un indicador por sí mismo excede el ancho disponible.

Para revisar el panel mientras Docker no está operativo se puede servir la build
en 3102 con JIMBOATS_ADMIN_PREVIEW_DATA=1 y sin JIMBOATS_LOCAL_BOOKINGS. Usa fixtures
históricas para revisar navegación/listado/detalle/calendario, no reservas reales.
Las acciones de escritura requieren la base de datos; no simular su persistencia.
El panel actual muestra solo Bookings y Calendar. La edición de contenido sigue
fuera del panel. Esta revisión no cambia checkout ni arquitectura SEO.

### Corrección de alcance: conservar toda la operativa (2026-11-02)

El propietario aclara que solo se elimina la edición del contenido de la web.
Se recuperan Dashboard, Bookings, Calendar, Coupons, Notifications y Devices.
Notificaciones conserva reglas, plantillas de comunicaciones y registro de envíos;
Devices conserva alta y pruebas de push. Las plantillas operativas no son el CMS
público y siguen editables. Cupones conserva creación, estado, lotes y canjes.
Los redireccionamientos ya no bloquean cupones/notificaciones/dispositivos.

Los editores públicos de experiencias/extras/media/contenido/traducciones siguen
retirados. No se envían notificaciones de prueba al recuperar la navegación.
Los procesos de notificaciones, sincronización de calendario y vencimiento de
bloqueos siguen siendo operativos necesarios, distintos a trabajos editoriales.

Políticas: pendiente concretar con el propietario las condiciones definitivas o
ratificar las actuales. Se propone mantener una única definición versionada en
archivos, reutilizada por página pública, FAQ y checkout. Cada reserva conserva
la copia de condiciones aceptadas, como ya contempla el modelo actual. En esta
revisión no se cambia la fuente de políticas ni sus plazos, importes o versiones
históricas: siguen usando el repositorio existente. El editor de políticas sigue
oculto. Una FAQ por sí sola no sustituye la versión de condiciones de la reserva.

### Cancelación gratuita confirmada por el propietario (2026-11-02)

La revisión autenticada en Safari confirmó «No policies yet» en producción.
El tramo 0–24 h sin devolución era un borrador sin guardar, no una condición activa.
El propietario confirma únicamente cancelaciones gratuitas hasta 48 horas antes.
`src/content/booking/cancellationPolicy.ts` guarda esta regla y sus cinco textos;
la FAQ nueva y el aviso junto al consentimiento de la reserva comparten esa fuente.

Falta definir cancelaciones tardías, no presentación y cancelación por mal tiempo.
No se infieren porcentajes ni pérdidas de señal. La definición está marcada como
incompleta; aún no sustituye el repositorio de políticas ni los snapshots de las
reservas. No se crean reglas de reembolso automáticas, cambios en producción o
modificaciones de reservas históricas. Continuar con los casos faltantes cuando
el propietario los confirme, manteniendo la versión aceptada por cada reserva.

### Política estática confirmada: cancelación y malas condiciones (2026-11-02)

El propietario completa las condiciones: gratuita hasta 48 h; con menos antelación
no se admite cancelación y el cliente contacta por WhatsApp; si JimBoats cancela
por malas condiciones se devuelve lo abonado y el capitán contacta al cliente.
No se añade pérdida automática de señal, penalización por no presentación ni
alternativa obligatoria de cambio de fecha. No se automatizan transferencias.

La definición común `content/booking/cancellationPolicy.ts` contiene el texto de
ES/EN/FR/DE/NL y CA para compatibilidad con reservas existentes. FAQ de cancelación
y FAQ de condiciones meteorológicas son distintas y comparten esa definición.
El checkout público y la prueba horaria muestran el resumen completo.

`StaticCancellationPolicyRepository` reemplaza la lectura de políticas de DB para
reservas nuevas públicas y manuales. Genera el snapshot v1 por el contrato actual;
el histórico sigue leyendo su snapshot persistido, incluso al editar la reserva.
48 h exactas se incluyen en el tramo gratuito. El tramo inferior queda como gestión
manual por WhatsApp, sin inferir retención de señal. La devolución por condiciones
figura en el resumen y la decide/gestiona el equipo, no un umbral horario.

El editor retirado no puede modificar esta definición: las escrituras al adapter
fallan con CANCELLATION_POLICY_READ_ONLY. Listar políticas sigue siendo compatible
con casos de uso existentes. No hay migración: versionId es un identificador sin FK
y la reserva ya persiste condiciones en su campo JSON independiente.


## Panel operativo en español y reservas simplificadas — 2026-11-03

Solicitud: eliminar la información repetida en reservas y traducir todo el panel operativo, manteniendo cancelaciones, cupones y notificaciones.

- Una fila por reserva. La acción de marcar como vista permanece en esa fila; los contadores se mantienen.
- El detalle conserva el formulario único de reserva/cliente/notas, pagos, revisión, historial, enlace de acceso y acciones de WhatsApp/cancelación. Se retiran las tarjetas de solo lectura que repetían horario, cliente y notas. Si el WhatsApp del cliente difiere del teléfono se conserva visible.
- Navegación, formularios, estados, avisos, confirmaciones, errores, fechas e importes del panel en español. `lang=es` en el documento del panel.
- Textos versionados en `src/i18n/admin/es.ts`. Los códigos de estado, IDs, reglas de negocio, preferencias de idioma del cliente, mensajes guardados y cuerpos de las plantillas conservan sus valores.
- Traducción de errores en la frontera de interfaz. Los errores inesperados no exponen detalles internos.
- Se conservan calendario, cupones, notificaciones de cliente, plantillas operativas, historial de envíos y dispositivos push. No se restauran los editores del contenido público.
- Sin dependencias ni migraciones nuevas, sin cambios de producción, envíos, cobros ni devoluciones reales. Revisión con datos de demostración; la persistencia real sigue fuera de esta validación.

Pseudocódigo de los cambios:

- Diccionario: textos y formatos españoles compartidos; mapas de estados/eventos solo para presentación.
- Listado: cabecera y contadores → una lista → fila con estado, cliente, importe y acciones.
- Detalle: cabecera/acciones → formulario único + pagos/revisión/historial.
- Presentadores/acciones: mantener DTOs y códigos operativos → localizar etiquetas y errores en la interfaz.
- Resto de pantallas: consumir el diccionario sin modificar la operación subyacente.
- Pruebas: comprobar ausencia de duplicados, confirmación de cancelación descartada sin POST, acciones con fakes, navegación española, accesibilidad y ajuste a 360/768/1280px.

Archivos fuente y pruebas afectados en esta revisión:

- `src/app/admin/layout.tsx`
- `src/components/layout/AdminNavigation.ts`
- `src/components/layout/AdminShell.tsx`
- `src/components/sections/admin-bookings/AdminBookingAuditTimeline.tsx`
- `src/components/sections/admin-bookings/AdminBookingCreateSection.tsx`
- `src/components/sections/admin-bookings/AdminBookingDetailSection.tsx`
- `src/components/sections/admin-bookings/AdminBookingEditForm.tsx`
- `src/components/sections/admin-bookings/AdminBookingsListSection.tsx`
- `src/components/sections/admin-bookings/AdminBookingsWorkspace.test.tsx`
- `src/components/sections/admin-bookings/AdminBookingsWorkspace.tsx`
- `src/components/sections/admin-calendar/AdminCalendarWorkspace.test.tsx`
- `src/components/sections/admin-calendar/AdminCalendarWorkspace.tsx`
- `src/components/sections/admin-coupons/AdminCouponsWorkspace.test.tsx`
- `src/components/sections/admin-coupons/AdminCouponsWorkspace.tsx`
- `src/components/sections/admin-dashboard/AdminDashboardWorkspace.test.tsx`
- `src/components/sections/admin-dashboard/AdminDashboardWorkspace.tsx`
- `src/components/sections/admin-notifications/AdminNotificationLogsSection.tsx`
- `src/components/sections/admin-notifications/AdminNotificationRulesSection.tsx`
- `src/components/sections/admin-notifications/AdminNotificationTemplateDetailSection.tsx`
- `src/components/sections/admin-notifications/AdminNotificationTemplatesSection.tsx`
- `src/components/sections/admin-notifications/AdminNotificationsWorkspace.test.tsx`
- `src/components/sections/admin-notifications/AdminNotificationsWorkspace.tsx`
- `src/components/sections/admin-push-notifications/AdminPushNotificationsWorkspace.test.tsx`
- `src/components/sections/admin-push-notifications/AdminPushNotificationsWorkspace.tsx`
- `src/i18n/admin/es.ts`
- `src/interface/next/actions/adminBookingActions.ts`
- `src/interface/next/actions/adminCalendarActions.ts`
- `src/interface/next/actions/adminCouponActions.ts`
- `src/interface/next/actions/adminNotificationActions.ts`
- `src/interface/next/actions/pushNotificationActions.ts`
- `src/interface/next/presenters/adminBookingsPresenter.ts`
- `src/interface/next/presenters/adminCalendarPresenter.ts`
- `src/interface/next/presenters/adminCouponsPresenter.ts`
- `src/interface/next/presenters/adminErrorPresenter.test.ts`
- `src/interface/next/presenters/adminErrorPresenter.ts`
- `src/interface/next/presenters/adminNotificationsPresenter.ts`
- `tests/a11y.spec.ts`
- `tests/admin-operations.spec.ts`
- `tests/responsive.spec.ts`

También se actualizan intencionadamente cuatro capturas de `tests/visual.spec.ts-snapshots/`: reservas desktop/mobile, detalle de reserva desktop y calendario desktop. Las capturas públicas no forman parte del cambio visual aprobado.

Verificación: consultar el bloque `Panel operativo en español — 2026-11-03` de `docs/seo-local-validation.txt` y los logs `.local-preview/admin-es-*`.

## Fichas de experiencia y recuperación de la reserva — 2026-11-03

Aplicado en `web-seo`, sin modificar ni publicar `web`:

- Las cuatro experiencias comparten una ficha con el estilo de JimBoats: portada fotográfica, H1 con precio y duración, contenido propio, incluidos, itinerario orientativo, público, galería, reseñas atribuidas, nueve FAQ y otras experiencias. Precio y duración proceden del mismo catálogo que la landing.
- Hay un único H1 por ficha y H2/H3 por secciones/preguntas/tarjetas. Se conserva cada URL existente y se añade una página padre de experiencias por idioma (50 URLs de marketing en total). Breadcrumb HTML y JSON-LD: inicio → experiencias → ficha. Metadatos, imagen Open Graph y alternativas de idioma corresponden a la experiencia.
- JSON-LD de Service, WebPage, BreadcrumbList y FAQPage, coherente con el contenido visible. No se publican Offers, disponibilidad ni valoraciones agregadas inventadas. Sigue activo `noindex` para esta prueba con tarifas provisionales. Esto no garantiza puntuaciones, posiciones ni citas de asistentes.
- ES/EN/FR/DE/NL. Las reseñas de amanecer y romántica se identifican como opiniones generales del barco/equipo; no hay testimonios específicos verificados en la selección actual. No se inventan ni amplían sus textos.
- Se recupera `PublicBookingWorkspace`: duración/fecha/hora → extras → datos, cupón y pago → confirmación. La experiencia llega fijada desde la ficha. Cambiar las horas reinicia la selección dependiente y consulta disponibilidad para esa duración. Se conservan el calendario, resumen lateral y resumen inferior del diseño original. Entrar a `/book` sin experiencia redirige al catálogo.
- La interfaz de reserva usa cinco idiomas, pero los recibos y la página de retorno de Stripe conservan el soporte transaccional existente ES/EN/CA; FR/DE/NL usan EN para esa parte. El panel operativo sigue en español.
- En modo visual (`JIMBOATS_SEO_PREVIEW=1` sin `JIMBOATS_LOCAL_BOOKINGS=1`) las fechas están marcadas como demostración y las acciones de cupón/pago no crean reservas. La prueba disponible en 3102 no tiene base de datos conectada. El modo de simulación con base aislada conserva sus acciones de pago local y cancelación del checkout. La prueba opt-in de persistencia se ha adaptado al nuevo recorrido, pero no se ha ejecutado en esta sesión.
- En modo conectado, las tarifas y extras reservables llegan del backend; no se habilitan duraciones sin tarifa. Se reutilizan el recálculo de precios, validación de disponibilidad, cupones, consentimientos, pagos y notificaciones existentes.

Componentes principales: `SeoExperiencePage`, `HourlyPublicBookingWorkspace`, `PublicBookingWorkspace`. Contenido editorial: `src/content/marketing/experienceDetails.json`. Adaptación a reservas: `hourlyPublicBookingPresenter`. No se añaden dependencias.

Capturas nuevas intencionadas: las dos de ficha de experiencia en `tests/seo-visual.spec.ts-snapshots/`. Se mantienen las capturas de la landing y el panel. Evidencia y limitaciones en `docs/seo-local-validation.txt` y `.local-preview/experience-*`.

## Ajuste de fichas tras revisión — 2026-11-03

Este bloque sustituye la decisión anterior de crear páginas padre de experiencias. «Experiencias» vuelve a `/{locale}#experiences` desde la cabecera, las migas y las entradas de reserva sin selección. Los cinco hubs se retiran del catálogo/sitemap (45 URLs de marketing; 40 fichas/páginas no home) y redirigen al ancla del inicio.

Las cuatro fichas y sus cinco idiomas quedan ordenadas así: portada → franja de incluidos → descripción → itinerario → público → opiniones → FAQ → galería → otras experiencias. Hay líneas de separación y variantes compactas de opiniones y FAQ. La tarjeta de precio permanece en la misma columna lateral hasta finalizar el contenido; en móvil continúa el CTA inferior. Se retira el bloque de mapa/tiempo de las fichas, manteniéndolo en la landing. Los itinerarios son redacción original adaptada a JimBoats, no copia literal de NautiQ.

Corrección final solicitada por el usuario: las fichas de amanecer y atardecer muestran únicamente la hora del fenómeno solar de hoy en Barcelona, no una salida calculada 30/90 minutos antes. `PortSunTime` consulta el endpoint meteorológico existente con `view=sun`. El adapter existente usa MET Norway Sunrise 3.0 para las coordenadas del puerto, valida fecha y respuesta, comparte y cachea la consulta diaria y no conserva horas del día anterior si falla la nueva consulta. El presenter convierte a Europe/Madrid (incluido horario de verano). Se muestra fuente MET Norway y estado de indisponibilidad traducido; no se fabrican horas. No cambia la disponibilidad del calendario ni el flujo de compra.

Archivos principales: `src/content/marketing/{routes.ts,index.ts,experienceDetails.json}`, `src/components/sections/seo/{SeoExperiencePage,SeoMarketingPage,SeoReviews,SeoReviewsCarousel,SeoTrustSections}.tsx`, `next.config.ts`, `src/app/[locale]/book/page.tsx`. Hora solar: nuevo `src/components/marketing/PortSunTime.tsx`; ampliación de `WeatherProvider`, `MetNorwayWeatherProvider`, `weatherView`, `weatherPresenter` y `src/app/api/weather/route.ts`. Se añaden pruebas de cache/fecha/DST y UI, y stories de las variantes compactas. No hay dependencias, migraciones, workers ni cambios en producción.

Se actualizan intencionadamente solo las capturas de ficha a 360 y 1280 px. Las capturas de landing y panel se conservan. Validación: bloque «Ajuste de fichas y horas solares» de `docs/seo-local-validation.txt` y logs `.local-preview/detail-refinement-*`.

## Tarjeta de reserva, incluidos y calendario solar mensual — 2026-11-03

Aplicado a las cuatro fichas y los cinco idiomas, según las nuevas indicaciones del propietario:

- Tarjeta de precio con sello verde «Mejor precio online», precio vigente sin comparaciones tachadas inventadas, resumen verde de incluidos, datos con iconos, CTA amarillo JimBoats «Reservar ahora» y enlace secundario «Reservar por WhatsApp». El enlace abre el número habitual, sin enviar mensajes automáticamente.
- El párrafo largo de cancelaciones bajo los botones se sustituye por una frase breve: si JimBoats cancela por mal tiempo, devuelve el importe abonado. Las condiciones completas permanecen en las FAQ y en el flujo de reserva. No se añade una promesa nueva de cambio de fecha.
- Inclusiones confirmadas: 1 hora incluye bebida y no snacks; todas las experiencias desde 2 horas incluyen bebidas y snacks. La franja de etiquetas, el resumen de la tarifa destacada y las FAQ de precio/amanecer usan el nuevo contenido. La pregunta de desayuno aclara que snacks no implica desayuno completo.
- Amanecer y atardecer tienen una tabla estática con 12 meses, encabezado H2, filas semánticas y horas verificadas en MET Norway para el día 15 de cada mes de 2026 en Port Olímpic. Se indica el año, la referencia de mitad de mes, la zona Europe/Madrid y los cambios de hora de marzo/octubre. No son horas de salida del barco ni se modifica el calendario de reservas. Sigue visible la línea con la hora solar de hoy.

Archivos: nuevos `SeoExperienceBookingCard.tsx`, `SeoSolarCalendar.tsx` y `src/content/marketing/solarCalendar.json`; cambios en `SeoExperiencePage.tsx`, `experienceDetails.ts/json`, stories y pruebas de marketing/fichas/visuales. Los nuevos bloques son componentes de servidor; no añaden dependencias, llamadas de red al renderizar tablas, workers ni reglas de reserva en React. Contenido estático traducido y FAQ JSON-LD comparten la misma fuente.

Capturas intencionadas: actualización de ficha de día a 360/1280 y nuevas referencias de amanecer a 360/1280 para cubrir la tabla. Landing y panel conservan sus referencias visuales. Evidencia: `.local-preview/conversion-*` y `docs/seo-local-validation.txt`.

## Itinerarios más directos — 2026-11-03

Se elimina el aviso con borde amarillo bajo «Así será la salida» y su texto `routeNote` en los cinco idiomas. Cada una de las cuatro experiencias queda en cuatro pasos breves: embarque, navegación por el litoral, momento principal con los incluidos que corresponden y regreso. La redacción es propia, tomando como referencia la claridad del itinerario de NautiQ. No se añaden rutas, paradas o servicios nuevos.

Archivos funcionales: `src/components/sections/seo/SeoExperiencePage.tsx` y `src/content/marketing/experienceDetails.json`. Las cuatro capturas de fichas se actualizan por la retirada del aviso y la menor longitud de la lista. Sin cambios en reserva, tarifas, políticas o navegación. Evidencia: `.local-preview/itinerary-*`.

## Mensajes de WhatsApp según la página — 2026-11-03

Todos los enlaces públicos de WhatsApp se preparan desde `getMarketingPage`. En las fichas, el texto contiene únicamente el nombre localizado de la experiencia y una pregunta de disponibilidad; no incluye duración ni precio, según la aclaración del propietario. En inicio y páginas informativas se usa una consulta genérica para elegir experiencia y fecha. Se conserva el mismo número y se codifica el parámetro `text` con URLSearchParams. Tanto la tarjeta como el icono flotante usan ese enlace; abrir WhatsApp no envía el mensaje.

Cambios: `src/content/marketing/index.ts`, textos en `experienceDetails.json` y verificaciones en `marketing.test.ts`/`experience-booking.spec.ts`. Los mensajes del panel administrativo no cambian. Logs `.local-preview/whatsapp-*`.

## Operaciones locales y horarios (2026-11-03)

- `/admin/availability`: configuración exclusivamente operativa, en español. Reutiliza `UpdateExperienceAvailabilityUseCase`, sin guardar contenido, media ni traducciones.
- Modos existentes: franja flexible, salidas fijas con límite de regreso y solo reservas manuales. Antelación, horizonte de reserva y margen protegido antes/después. Los márgenes de dos reservas se suman; los bloques ya creados conservan su margen original.
- No hay cálculo automático de salidas a partir del sol: las tablas solares públicas son informativas.
- `pnpm db:hourly:setup`: inicia PostgreSQL aislado en loopback 55439, aplica migraciones e inserta semillas idempotentes. Conserva reservas, cupones y ajustes existentes.
- `pnpm dev:hourly`: web en `http://127.0.0.1:3102`, panel conectado a PostgreSQL, proceso local de notificaciones y proceso de expiración de retenciones. Ctrl+C detiene los procesos; no borra la base.
- `pnpm start:hourly`: lo mismo usando `.next/standalone/server.js` ya compilado, copiando automáticamente `public` y `.next/static` al standalone.
- Base: `jimboats_hourly_preview` en el volumen Docker `hourly_preview_data`. No se importa información personal de producción.
- Tarifas provisionales autorizadas; pago local simulado mediante el caso de uso real de confirmación. No constituye una prueba de integración con Stripe.
- Notificaciones persistentes con proveedor `CONSOLE_EMAIL`: se procesa la cola y se consulta el resultado en `/admin/notifications/logs`. No se entrega correo, WhatsApp ni push externo. Google Calendar permanece desactivado.
- Solo se inicia procesamiento operativo; no hacen falta los workers de media o rotación de galería para el contenido estático.
- `HOURLY_BOOKING_E2E=1 pnpm test:local` ejecuta las pruebas de reservas y operaciones contra el entorno conectado. Las pruebas visuales históricas usan su modo de fixtures separado.

## Navegación y arquitectura vigente

El menú público usa anclas del inicio, conservando el idioma: `#experiences`, `#prices`, `#boat`, `#find-us`. Se ha retirado la fecha visible de consulta de reseñas; se mantiene la fecha de procedencia en los datos internos.

La arquitectura actual conserva 9 tipos de página en ES, EN, FR, DE y NL (45 URLs): inicio, paseo privado, atardecer, amanecer, romántico, precios, barco, contacto y sobre nosotros. No existe un índice `/experiencias` separado: redirige al inicio con ancla. Las cuatro páginas de apoyo siguen enlazadas desde el pie y necesitan la revisión editorial posterior acordada. La reserva recibe experiencia y duración por query, fuera del índice SEO. El panel no es indexable. El marketing tiene canonical, alternates hreflang, sitemap, llms.txt y datos estructurados LocalBusiness/WebPage/Service/FAQPage/BreadcrumbList según página. Sigue desactivada la indexación de esta copia local (`noindex`, robots disallow); no se publican ofertas estructuradas con tarifas provisionales.

### Pendiente antes de publicar

- Confirmar tarifas y horarios comerciales; los valores iniciales de la base local son de prueba y pueden ajustarse desde Horarios.
- Probar Stripe en su entorno de pruebas y los proveedores externos de notificaciones/Calendar cuando se conecten. El entorno actual prueba persistencia y lógica operativa, pero no entrega mensajes ni procesa pagos externos.
- Revisar editorialmente las páginas de apoyo y las traducciones, y precisar la intención/keyword principal de cada URL, especialmente inicio frente a paseo privado.
- Resolver la conservación o redirección de las rutas antiguas, incluido catalán, y habilitar la indexación solo en el despliegue aprobado.


## Blog estático y alineación de keywords — 2026-11-03

Se incorporan tres guías completas, con versión editorial en español, inglés, francés, alemán y neerlandés: dónde ver el atardecer, dónde ver el amanecer y planes románticos en Barcelona. Cada idioma tiene un índice `/[locale]/blog` y tres slugs localizados; el selector de idioma lleva a la misma guía. Son 20 nuevas URLs, sumadas a las 45 de marketing: 65 URLs en el sitemap. No hay CMS, consultas a base de datos ni traducción en tiempo de ejecución para el blog.

Contenido en `src/content/blog/{es,en,fr,de,nl}.json`; rutas y catálogo en `catalog.ts`; preparación de datos, metadata y JSON-LD en `src/interface/next/presenters/blogPresenter.ts`; componentes reutilizables en `src/components/sections/blog/`. Las rutas Next solo validan los parámetros y componen las vistas. Se reutilizan las fotos estáticas de producción, las tipografías, los colores y el shell existentes.

Cada artículo incluye un único H1, secciones H2, FAQ con H3, índice navegable, enlaces a fuentes primarias junto al contenido correspondiente, autor JimBoats, fecha de actualización y CTA hacia la experiencia relacionada. Los datos solares son referencias del 15 de enero/junio/septiembre de 2026, coherentes con el calendario solar ya verificado; no se presentan como horas de embarque ni como datos válidos para cualquier fecha. No se añaden promesas de servicios o suplementos incluidos.

Enlazado: el inicio incorpora las tres tarjetas; las fichas enlazan a sus guías; el pie incluye Blog; los artículos enlazan a las experiencias, precios, contacto y otros artículos. Se conserva el menú principal con las cuatro anclas del inicio. Cada ruta tiene canonical, cinco hreflang y x-default, metadatos sociales, identidad BlogPosting/CollectionPage y migas BreadcrumbList. Las guías se añaden también a llms.txt. Se mantiene noindex en local; no se publican ofertas estructuradas con tarifas provisionales.

La investigación de Ads se usa para separar intenciones, no para crear una URL por variante: inicio aborda paseo/alquiler con patrón; la ficha privada refuerza la reserva por horas; precios compara tarifas; las guías atienden la investigación de lugares, horarios y planes. Se ajustan los títulos SEO de inicio y los textos de privado/precios en los cinco idiomas, manteniendo los H1 y el diseño comercial de las fichas. La comparación de precios aclara que privado empieza en una hora y las otras tres experiencias en dos.

Esto no acredita dificultad SEO, posición ni tráfico futuro: la competencia de Google Ads es publicitaria. Quedan para la revisión previa a publicación las páginas de apoyo, las tarifas definitivas, redirecciones antiguas y la habilitación de indexación. No se añade la landing de cumpleaños ni más guías en esta entrega. El panel operativo y la base local se conservan; no se modifica producción ni `web/`.
