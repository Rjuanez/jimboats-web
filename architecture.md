# architecture.md

Este documento define las reglas de arquitectura para la web de JimBoats.

La arquitectura debe ser Clean Architecture ligera aplicada a Next.js. El
objetivo es mantener las reglas de negocio separadas del framework, permitir
crecer por modulos y evitar complejidad antes de necesitarla.

## Estructura base

La estructura esperada es:

```txt
src/
  app/
  components/
    ui/
    layout/
    sections/
    forms/
    marketing/
  design/
  modules/
    <module>/
      domain/
      application/
        ports/
  infrastructure/
    <adapter-kind>/
    db/
      prisma/
    storage/
      local/
    media/
  interface/
    next/
      actions/
      presenters/
      validators/
  shared/
    domain/
    application/
  container.ts
```

## Capas

- `src/app` contiene rutas, layouts, paginas, route handlers y composicion visual de Next.js.
- `src/components/ui` contiene componentes base reutilizables: botones, inputs, badges, cards, dialogs y controles.
- `src/components/layout` contiene estructura compartida: header, footer, containers, page shells y navegacion.
- `src/components/sections` contiene secciones completas de pagina: hero, servicios, FAQs, CTA y bloques editoriales.
- `src/components/forms` contiene formularios reutilizables conectados a validadores y actions.
- `src/components/marketing` contiene piezas visuales reutilizables de contenido: cards, listas, testimonios y banners.
- `src/design` contiene tokens, variantes y helpers visuales compartidos.
- `src/interface/next` contiene la adaptacion entre Next.js y los casos de uso.
- `src/modules/<module>/domain` contiene entidades, value objects, politicas y reglas puras.
- `src/modules/<module>/application` contiene casos de uso y contratos de puertos.
- `src/infrastructure` contiene adapters concretos para base de datos, email, pagos, calendario, storage o APIs externas.
- `src/infrastructure/db/prisma` contiene el adapter de persistencia basado en Prisma.
- `src/infrastructure/storage/local` contiene el adapter de filesystem local para media.
- `src/infrastructure/media` contiene procesamiento tecnico de imagenes cuando exista.
- `src/shared/domain` contiene conceptos de dominio compartidos que no pertenecen a un modulo concreto.
- `src/shared/application` contiene puertos o utilidades de aplicacion compartidas.
- `src/container.ts` es el punto de composicion de dependencias.

## Reglas verificables de dependencias

- `domain` no importa desde `application`, `infrastructure`, `interface`, `app` ni `container.ts`.
- `application` no importa desde `infrastructure`, `interface`, `app` ni `container.ts`.
- `infrastructure` puede importar contratos de `application` y tipos de `domain` necesarios para implementar puertos.
- `interface/next` no importa entidades de dominio directamente.
- `app` no importa entidades, value objects, repositorios ni adapters directamente.
- `app` llama a Server Actions, presenters, route handlers o contratos expuestos desde la interfaz.
- `app` importa componentes de `components`, no implementa estructuras visuales complejas inline.
- `components` no importa desde `modules`, `infrastructure` ni `container.ts`.
- Los componentes que necesiten datos de negocio reciben DTOs o props ya preparados por la interfaz.
- Solo `container.ts` instancia casos de uso y adapters concretos.
- Solo adapters dentro de `infrastructure/db/prisma` pueden importar Prisma Client.
- Solo adapters dentro de `infrastructure/storage/local` pueden escribir o borrar archivos de media.
- Solo infraestructura puede procesar imagenes con librerias como `sharp`.
- Un modulo no importa internos de otro modulo.
- La comunicacion entre modulos se hace mediante casos de uso expuestos, workflows o eventos cuando exista una razon real.

## Reglas para Next.js

- Las paginas y layouts son responsables de renderizar, no de decidir reglas de negocio.
- Las paginas deben ser composicion de componentes; si una pagina crece, se extraen secciones.
- Las Server Actions validan input, llaman a casos de uso y devuelven DTOs de interfaz.
- Los route handlers validan input, llaman a casos de uso y devuelven respuestas HTTP.
- Los componentes React no calculan disponibilidad, precios, politicas de cancelacion ni reglas de reserva.
- La metadata SEO se define cerca de la pagina, pero los datos persistentes se obtienen mediante casos de uso o contenido estatico.
- Las rutas estaticas de marketing pueden usar contenido local si no hay necesidad de CMS.
- Las rutas dinamicas de reservas deben pasar siempre por casos de uso.

## Reglas de UI reutilizable

- La UI se organiza siguiendo `ui-ux.md`.
- Toda pieza visual repetible vive como componente reutilizable.
- Todo componente reutilizable tiene una API por props explicita.
- Los estilos repetidos se convierten en variantes, tokens o componentes.
- Los estilos globales solo se usan para reset, tokens globales y configuracion base.
- El HTML recibido desde prototipos externos se convierte a componentes antes de integrarse en rutas.
- Las paginas no contienen CSS de pantalla, estilos inline ni bloques grandes de Tailwind sin extraccion.

## Reglas de dominio

- El dominio no usa `Date.now()`, `Math.random()`, `crypto.randomUUID()`, variables de entorno ni llamadas de red.
- El dominio recibe tiempo, IDs, configuracion y datos externos como parametros.
- Las reglas de negocio deben poder probarse sin Next.js, base de datos ni red.
- Las entidades no deben devolver estructuras pensadas para React o HTTP.
- Los value objects validan invariantes locales.
- Las politicas de negocio deben tener nombres explicitos y tests dedicados cuando afecten reservas, disponibilidad, precio o cancelaciones.

## Reglas de aplicacion

- Cada caso de uso representa una intencion de negocio concreta.
- Un caso de uso depende de puertos, no de adapters.
- Los puertos viven en `application/ports`.
- Los casos de uso devuelven DTOs de aplicacion o resultados explicitos.
- Un caso de uso no devuelve entidades crudas a la interfaz si eso acopla la UI al dominio.
- Un caso de uso puede coordinar varios puertos si la operacion sigue siendo simple.
- Si una operacion cruza varios modulos y crece, se mueve a un workflow explicito.

## Reglas de infraestructura

- Cada dependencia externa debe estar encapsulada en un adapter.
- No se instala una dependencia externa hasta implementar el adapter que la usa.
- Los adapters no deciden reglas de negocio.
- Los adapters traducen entre modelos externos y modelos internos.
- Las variables de entorno se leen en infraestructura o composicion, nunca en dominio.
- La configuracion de infraestructura debe fallar pronto si falta una variable obligatoria.

## Reglas de persistencia

- La base de datos oficial es PostgreSQL self-hosted en el VPS.
- El ORM oficial es Prisma.
- Prisma es detalle de infraestructura y solo se usa dentro de `src/infrastructure/db/prisma`.
- `prisma/schema.prisma` define el esquema tecnico de persistencia.
- `prisma/migrations` contiene el historial versionado de migraciones.
- El dominio no importa tipos generados por Prisma.
- La aplicacion no importa Prisma Client.
- Las Server Actions, route handlers, componentes y paginas no importan Prisma Client.
- Los casos de uso dependen de puertos de repositorio, no de Prisma.
- Los adapters Prisma traducen entre modelos de persistencia y modelos internos.
- Las decisiones de transaccion viven en aplicacion o en un puerto explicito de unidad de trabajo cuando haga falta.
- Las migraciones de produccion se ejecutan como paso separado del arranque de la app.
- No se ejecutan migraciones implicitamente al iniciar el servidor Next.js.
- Los cambios manuales en base de datos deben capturarse en una migracion versionada antes de considerarse aceptados.

## Reglas de media e imagenes

- No se usan servicios externos de imagenes por defecto.
- Las imagenes dinamicas o subidas se guardan en filesystem local del VPS.
- Caddy sirve las imagenes publicas directamente desde `/media/*`.
- Next.js no debe servir imagenes dinamicas mediante route handlers salvo excepcion documentada.
- PostgreSQL guarda metadata de imagenes, no binarios.
- La metadata minima incluye ruta publica, alt, ancho, alto, formato, tamano, hash y estado.
- Los originales se guardan en una zona no publica.
- Las variantes publicas se guardan en una zona servida por Caddy.
- Los nombres de archivos publicos deben incluir hash de contenido.
- Las URLs publicas de variantes deben ser inmutables.
- Si una imagen cambia, se genera un archivo nuevo con nuevo hash.
- Las variantes se generan antes de marcar la imagen como lista.
- La generacion de variantes para media dinamica se hace mediante cola local y worker desde el inicio.
- La cola local usa PostgreSQL mediante una tabla de jobs como `media_processing_jobs`.
- El worker corre como proceso Docker separado.
- La subida dinamica guarda el original privado, crea metadata en estado `PROCESSING` y encola el job.
- El worker procesa la imagen, escribe variantes publicas y marca la metadata como `READY` o `FAILED`.
- El procesamiento sincrono durante la subida no es el camino por defecto.
- El procesamiento sincrono solo puede usarse como excepcion documentada para scripts internos o tareas puntuales.
- Las imagenes editoriales estaticas del repo se procesan con `pnpm media:prepare`.
- El repo guarda solo imagenes fuente completas para media editorial estatica.
- Las variantes generadas por `pnpm media:prepare` son artefactos reproducibles, no fuente de verdad.
- `pnpm media:prepare` reprocesa las fuentes y sobrescribe las variantes generadas sin comprobar hashes para saltar trabajo.
- El dominio y los casos de uso dependen de puertos como `MediaStorage` o `ImageProcessor`, no del filesystem ni de `sharp`.

## Reglas de despliegue

- La app se despliega en el VPS mediante Docker Compose.
- Next.js se ejecuta self-hosted con build standalone.
- GitHub Actions compila, verifica y publica la imagen Docker.
- El VPS descarga imagenes ya compiladas; no compila Next.js en produccion.
- Caddy actua como reverse proxy y gestiona HTTPS.
- PostgreSQL corre como servicio persistente con volumen dedicado.
- El volumen de media debe ser persistente y separado del contenedor de app.
- Caddy debe aplicar cache agresiva a variantes con nombre hasheado.
- Los backups de PostgreSQL deben estar definidos antes de considerar produccion estable.
- Los backups de media deben estar definidos antes de considerar produccion estable.
- Las variables de entorno se configuran fuera de Git.
- `.env.example` debe documentar toda variable requerida cuando exista app.

## Reglas de simplicidad

- Se prefiere una funcion o clase pequena antes que un framework interno.
- Se prefiere llamada directa antes que eventos si no hay necesidad de asincronia, reintentos o desacoplamiento real.
- Se prefiere un caso de uso simple antes que un workflow si solo hay una intencion y pocos pasos.
- Se prefiere un adapter concreto antes que una fabrica generica si solo existe una implementacion.
- Se evita crear capas para posibilidades futuras.
- Se documenta cualquier excepcion arquitectonica junto al motivo.
