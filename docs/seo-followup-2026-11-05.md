# Correcciones y verificación SEO — 5 noviembre 2026

Ámbito: copia `web-seo`, rama `main`. Cambios locales; no se ha desplegado, hecho
commit ni modificado servicios externos. La copia contiene otros cambios previos
del proyecto, que no se han revertido.

## Resultado por punto solicitado

| Punto | Estado y resultado |
| --- | --- |
| 3 | Retirada la portada catalana. `/ca` → `/es` mediante 308. Sus rutas de reserva, retorno y acceso a reserva redirigen al equivalente español conservando query. Las URL desconocidas mantienen 404. |
| 4 | Eliminada de `llms.txt` la afirmación de que la decoración romántica es un extra. Los incluidos proceden del mismo catálogo que la web. |
| 5 | Producción carga Statsig y su SDK llega a Ready; inicialización 200 y endpoint de eventos 202. El conector del chat está seleccionado en `qlinapp`; no se ha podido identificar con certeza el proyecto receptor de la clave pública desplegada. |
| 6 | Privacidad y condiciones integradas localmente en cinco idiomas, con enlaces desde el pie y el pago. La reserva usa la política de cancelación v2 y muestra los tres medios de pago a bordo. Los pendientes de lanzamiento figuran en `production-launch.md`. |
| 7 | Corregidos 67 títulos. Las 95 URL tienen títulos únicos, de hasta 65 caracteres y con JimBoats una sola vez. Los encabezados visibles no se han reescrito. |
| 8 | Actualizado el 6 de noviembre: aplicadas localmente las 46 metadescripciones aprobadas, separadas del contenido visible. Incluyen 25 de portada/experiencias, 5 de precios, 10 de patrones, 5 legales y la de sobre nosotros en alemán. Precios y duraciones salen del catálogo; la identidad legal, de los datos de la empresa. Sin desplegar. |
| 9 | LocalBusiness usa Moll de Xaloc, Pantalan 5, Barcelona 08005. El domicilio fiscal sigue separado. |
| 10 | Marketing, editor del blog y empresa de los patrones comparten `https://jimboatscharter.com/#business`. Se admite `publishedAt` real para `datePublished` y Open Graph; no se inventa una fecha de lanzamiento. |
| 11 | La raíz negocia ES/EN/FR/DE/NL según Accept-Language; CA deriva a ES. Se respetan prioridades y se descartan pesos inválidos o cero. |
| 12 | Lighthouse ejecutado sobre compilación optimizada local; resultados y límites abajo. |
| 13 | Propuestas concretas de duración, niños, acceso, equipaje, baño, comida y autoría, con textos y hechos pendientes de confirmar. |
| 14 | Procedimiento para revisar la ficha existente, unificar datos, solicitar reseñas y obtener menciones de colaboradores, sin ejecutar acciones externas. |

Documentos para revisar:

- [Condiciones y privacidad](legal-drafts-2026-11-05.md).
- [Descripciones, títulos, propuestas de contenido, Perfil de Empresa y visibilidad IA](seo-proposals-2026-11-05.md).
- [Comprobaciones de lanzamiento](production-launch.md).

## A qué está conectada la medición

La portada de producción consultada en `https://jimboatscharter.com/en` recibe
configuración pública con Statsig habilitado. Se observaron solicitudes a
`featureassets.org` y `prodregistryv2.org`, con respuestas 200 y 202 respectivamente.
No se detectó GA4/GTM en esa visita. Esto confirma la conexión del SDK y la
aceptación de su envío, no una atribución de ingresos ni la recepción de cada
evento de reserva en el panel correcto.

La configuración del código está en
`src/interface/next/config/publicStatsigConfig.ts`: requiere
`NEXT_PUBLIC_STATSIG_CLIENT_KEY` y `NEXT_PUBLIC_STATSIG_ANALYTICS_ENABLED=true`.
La home heredada y el flujo de reserva incorporan `PublicClientAnalyticsBoundary`.
Las nuevas páginas de marketing no lo incorporan todavía. La revisión de este
punto no ha activado seguimiento nuevo.

El [proyecto accesible por el conector](https://console.statsig.com/2vwLY6qLQf0W7PXAvyLOae)
se llama `qlinapp`. Para cerrar la identificación falta cotejar la clave pública
desplegada con las claves del proyecto Statsig correspondiente. No se han
publicado claves en este informe. Search Console y Ads están conectados para
SEO e investigación de demanda, pero no sustituyen la medición de la web.

## Rendimiento local reproducible

Lighthouse 13.6.0, Chrome 156, Next 16.2.6 optimizado con webpack, servidor local
en 127.0.0.1:3104. Modo de datos de prueba y noindex conservado. Móvil: simulación
de red y CPU de Lighthouse, viewport 412×823, ralentización CPU ×4. Tres ejecuciones
secuenciales por página móvil, servidor ya calentado y almacenamiento del navegador
restablecido por Lighthouse. Escritorio: preset desktop, una muestra.

| Página | Muestras | Rendimiento | LCP mediano | CLS mediano | TBT mediano |
| --- | --- | --- | --- | --- | --- |
| `/es`, móvil | 3 | 100 / 100 / 100 | 1,055 s | 0 | 16 ms |
| Atardecer ES, móvil | 3 | 94 / 90 / 94; mediana 94 | 3,156 s | 0 | 17 ms |
| `/es`, escritorio | 1 | 100 | 0,285 s | 0 | 0 ms |

Accesibilidad y buenas prácticas: 100/100 en las siete muestras. No se ha
calculado una nota Lighthouse SEO sobre una preview deliberadamente bloqueada.
Los resultados no son Core Web Vitals de usuarios reales: no miden INP de campo,
latencia del alojamiento/CDN ni todas las páginas. Repetir tras desplegar y revisar
los datos de campo cuando exista muestra suficiente.

Mejora propuesta a partir de evidencia: la imagen principal de atardecer es el
elemento LCP. Lighthouse detecta falta de `fetchpriority="high"` y unos 97 KiB
potencialmente evitables en su entrega. Revisar variantes y selección de imagen
móvil preservando la composición, priorizar solo la imagen principal y volver a
medir. También señala unos 53 KiB de JavaScript no utilizado en esa visita y CSS
que bloquea la primera representación. Estas son oportunidades de rendimiento;
no se han cambiado imágenes, layout o bundles en esta corrección SEO.

Informes HTML y JSON:
`.local-preview/seo-followup-2026-11-05/{home-mobile-1,home-mobile-2,home-mobile-3,sunset-mobile-1,sunset-mobile-2,sunset-mobile-3,home-desktop}.report.{html,json}`.

## Comprobaciones del cambio

- Reglas del repositorio, ESLint, TypeScript, `git diff --check`: correctos.
- Vitest: 100 archivos y 516 pruebas correctas. Tras el último ajuste de títulos
  y la aserción de entidad de los patrones: 30 pruebas relevantes correctas.
- Compilación Next optimizada y compilación Storybook correctas. Se utilizó Node
  26.8.1 disponible en este entorno; la matriz de producción debe mantener su
  versión establecida por el proyecto.
- Crawl final: 95/95 URL con HTTP 200, un H1, canonical propio de producción,
  títulos únicos y marca única. Las metadescripciones no han cambiado.
- Playwright completo: **134 correctas, 5 omitidas por condiciones del entorno,
  13 fallidas en comparación de capturas**. Las pruebas de navegación, idiomas,
  redirecciones, metadatos, accesibilidad y responsive pasaron.
- Las cinco omitidas dependen de mapa externo o del modo operativo con PostgreSQL;
  no se han ejercitado pagos reales ni enviado mensajes.

### Pendiente: referencias visuales

No se han reemplazado las capturas para convertir fallos en éxitos. Hay diferencias
en cuatro capturas de blog, seis de marketing y tres del panel: calendario de
escritorio, detalle de reserva de escritorio y reservas de móvil. En las muestras
inspeccionadas aparecen cambios de textos de navegación/dirección y alturas.
El origen de todas las diferencias no queda resuelto en esta intervención.

Revisarlas frente al diseño esperado y al estado previo antes de aprobar nuevas
referencias. Por ello **la batería completa no está verde** y este informe no
declara la publicación lista. Evidencia en `test-results/` y en el log guardado
en `.local-preview/seo-followup-2026-11-05/playwright.log`.

## Cómo interpretar la puntuación IA

El 78/100 anterior era una rúbrica interna de preparación, no una medición de
visibilidad de los buscadores. Las correcciones eliminan contradicciones y mejoran
la identidad del negocio; no demuestran un aumento de citas. Las prioridades y
el protocolo de medición están en el documento de propuestas. La siguiente
evaluación debe separar preparación técnica, citas observadas y reservas, en vez
de sumar puntos arbitrarios por añadir archivos o marcado.
