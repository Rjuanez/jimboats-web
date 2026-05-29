# stack.md

Este documento define el stack tecnico oficial y como se levanta, verifica y
despliega la web de JimBoats.

El objetivo es poder desarrollar localmente de forma simple, compilar en CI y
desplegar en el VPS de Google sin depender de Vercel.

## Stack oficial

- Runtime: Node.js 24 LTS.
- Package manager: pnpm.
- Framework: Next.js App Router.
- Lenguaje: TypeScript strict.
- UI: Tailwind CSS v4, shadcn/ui, Radix UI y lucide-react.
- Validacion: Zod.
- Base de datos: PostgreSQL self-hosted.
- ORM: Prisma.
- Migraciones: Prisma Migrate.
- Tests unitarios/componentes: Vitest y Testing Library.
- Tests end-to-end: Playwright.
- Workbench UI local: Storybook.
- Visual regression: Playwright screenshots.
- Accesibilidad automatica: axe con Playwright.
- Procesamiento de imagenes: sharp cuando se implemente media dinamica.
- Contenedores: Docker y Docker Compose.
- Reverse proxy y HTTPS: Caddy.
- CI/CD: GitHub Actions.
- Registry de imagenes: GitHub Container Registry.
- Produccion: VPS de Google.

## Decisiones de datos

- PostgreSQL es la base de datos oficial.
- Prisma es el ORM oficial.
- Prisma vive solo en infraestructura.
- `prisma/schema.prisma` es el esquema tecnico de persistencia.
- `prisma/migrations` es el historial versionado de cambios de esquema.
- Los cambios de base de datos se hacen con migraciones, no con cambios manuales permanentes.
- En desarrollo se usa `prisma migrate dev`.
- En produccion se usa `prisma migrate deploy`.
- No se usa `prisma db push` para evolucionar el esquema del proyecto.
- No se ejecutan migraciones al arrancar la aplicacion Next.js.
- Las migraciones se ejecutan como paso operacional separado antes de reiniciar o publicar la app.

## Decisiones de internacionalizacion, SEO y GEO

- No se usa SaaS de traduccion, CMS externo ni servicio externo de i18n por defecto.
- Los textos fijos de la interfaz se resuelven con diccionarios locales versionados en el repositorio.
- El contenido editable desde backpanel se guarda en PostgreSQL con traducciones por idioma.
- Las entidades SEO-relevantes usan tablas de traduccion explicitas antes que JSON generico como fuente principal.
- Las rutas publicas indexables usan prefijo de locale como `/es`, `/en` y `/fr` cuando esos idiomas esten habilitados.
- Cada locale publicable debe poder tener slug, metadata SEO, Open Graph, canonical, `hreflang`, sitemap y structured data propios.
- El idioma base editorial es espanol salvo decision posterior.
- Ingles debe considerarse idioma prioritario para publico turistico cuando se empiece a publicar contenido multiidioma.
- Frances queda preparado como locale habilitable si el contenido y la operacion lo justifican.
- No se publica contenido indexable con fallback silencioso desde otro idioma.
- La traduccion automatica self-hosted queda como opcion futura para crear borradores revisables, no como fuente de publicacion automatica.
- La optimizacion GEO cubre motores generativos y busqueda local/geografica mediante contenido claro, datos estructurados, FAQs, servicios, ubicacion y entidad.

## Aislamiento arquitectonico

- Ninguna pagina importa Prisma.
- Ningun componente importa Prisma.
- Ninguna Server Action importa Prisma Client directamente.
- Ningun caso de uso importa Prisma Client.
- Ninguna entidad o value object importa tipos generados por Prisma.
- Los casos de uso dependen de puertos.
- Los adapters Prisma implementan puertos.
- `container.ts` compone casos de uso con adapters Prisma.
- Si en el futuro se cambia PostgreSQL, Prisma o el proveedor de infraestructura, dominio y aplicacion no deben cambiar.

## Decisiones de media

- No se usan servicios externos de imagenes por defecto.
- Las imagenes estaticas de la web pueden vivir en el repositorio.
- Las imagenes dinamicas o subidas viven en filesystem local del VPS.
- PostgreSQL guarda metadata de imagenes, no binarios.
- Caddy sirve las variantes publicas directamente desde `/media/*`.
- Los originales se guardan fuera de la ruta publica.
- Las variantes publicas se guardan con nombres hasheados.
- Las variantes publicas se cachean con `Cache-Control: public, max-age=31536000, immutable`.
- Si una imagen cambia, se crea un nuevo archivo con nuevo hash.
- La app no debe depender de S3, Cloudinary, Supabase Storage, Google Cloud Storage u otro servicio externo sin decision explicita.

Estructura esperada en el VPS:

```txt
/var/lib/jimboats/media/
  originals/
  public/
    boats/
    pages/
    gallery/
```

Ejemplo de archivo publico:

```txt
/media/boats/sunset-tour-a1b2c3-640.webp
/media/boats/sunset-tour-a1b2c3-1280.webp
/media/boats/sunset-tour-a1b2c3-1920.webp
```

## Generacion de variantes dinamicas

La decision inicial para media dinamica es usar una cola local con PostgreSQL y
un worker Docker.

Flujo obligatorio para subidas dinamicas:

```txt
UploadMedia:
  validar archivo
  guardar original privado
  crear metadata en estado PROCESSING
  insertar job en media_processing_jobs
  devolver DTO con estado PROCESSING

MediaWorker:
  tomar job pendiente
  generar variantes con sharp
  guardar variantes publicas
  actualizar metadata a READY
  marcar FAILED si no puede procesar
```

Ventajas:

- Evita meter CPU pesada en la peticion de subida.
- Permite reintentos simples.
- Permite reprocesar formatos o tamanos.
- Hace que la app web y el procesamiento de imagenes escalen por separado.
- Mantiene la infraestructura humilde: PostgreSQL y un proceso Node, sin Redis ni servicios externos.

Reglas:

- `media-worker` es servicio esperado desde el inicio.
- La cola vive en PostgreSQL.
- No se introduce Redis, BullMQ ni broker externo sin decision explicita.
- La subida no marca una imagen como `READY`.
- Solo el worker marca una imagen dinamica como `READY` tras escribir variantes.
- Si el worker falla, marca el job o la imagen como `FAILED` y conserva el original privado.
- El procesamiento sincrono en la peticion de subida solo se permite como excepcion documentada.

## Media editorial estatica

Las imagenes editoriales estaticas del repo se procesan con:

```txt
pnpm media:prepare
```

Reglas:

- En el repo se guardan solo imagenes fuente completas.
- Las fuentes completas son la unica fuente de verdad.
- Las variantes generadas son artefactos reproducibles.
- `pnpm media:prepare` toma imagenes fuente locales, genera variantes optimizadas y escribe el output esperado.
- `pnpm media:prepare` sobrescribe las variantes generadas siempre que haga falta.
- `pnpm media:prepare` no necesita comprobar hashes para decidir si reprocesar.
- Las variantes generadas no se editan a mano.
- Si una fuente cambia, se ejecuta `pnpm media:prepare` y se regeneran las salidas.
- CI debe ejecutar `pnpm media:prepare` antes del build cuando las imagenes editoriales formen parte de la app.

No se recomienda:

- Generar variantes en la primera visita publica.
- Servir media dinamica desde Next route handlers.
- Guardar imagenes en PostgreSQL.
- Escribir subidas dinamicas dentro de `public/`.

## Desarrollo local

Cuando exista la app, los comandos esperados son:

```bash
pnpm install
pnpm db:up
pnpm db:migrate
pnpm dev
```

Convenciones esperadas:

- `pnpm db:up` levanta PostgreSQL local con Docker Compose.
- `pnpm db:down` para servicios locales sin borrar volumenes.
- `pnpm db:reset` reinicia la base local y aplica migraciones.
- `pnpm db:migrate` ejecuta migraciones de desarrollo.
- `pnpm dev` arranca Next.js en modo desarrollo.

Estos comandos deben definirse en `package.json` cuando se cree la app.

## Produccion en VPS

La produccion corre en el VPS de Google con Docker Compose.

Servicios esperados:

- `app`: contenedor de Next.js standalone.
- `db`: contenedor PostgreSQL con volumen persistente.
- `caddy`: reverse proxy publico con HTTPS.
- `media-worker`: worker de procesamiento de imagenes dinamicas.

Reglas:

- El VPS no compila Next.js.
- El VPS descarga imagenes ya compiladas desde GitHub Container Registry.
- PostgreSQL usa volumen persistente.
- Caddy es el unico servicio expuesto publicamente por HTTP/HTTPS.
- Caddy gestiona certificados HTTPS automaticamente.
- Los puertos publicos requeridos en el VPS son 80 y 443.
- La app solo se comunica con PostgreSQL por red interna de Docker.
- Caddy sirve `/media/*` desde el volumen persistente de media.
- El volumen de media no pertenece al contenedor de app.
- Los secretos viven en variables de entorno fuera del repositorio.
- No se commitean `.env`, passwords, tokens ni dumps reales.
- La produccion inicial usa IP efimera para reducir coste.
- La VM no se apaga durante operacion normal.
- Los despliegues normales no paran ni recrean la VM; solo actualizan contenedores.
- Si la VM se para, suspende, recrea o cambia de red, se asume posible cambio de IP.
- Si cambia la IP, se actualiza el DNS antes de esperar que HTTPS vuelva a emitir o renovar.
- Si el downtime por cambio de IP deja de ser aceptable, se migra a IP estatica.

## CI/CD

GitHub Actions debe encargarse de:

- Instalar dependencias con pnpm.
- Ejecutar lint si existe.
- Ejecutar typecheck si existe.
- Ejecutar tests.
- Ejecutar build de Next.js.
- Construir imagen Docker.
- Publicar imagen Docker en GitHub Container Registry.

El despliegue debe encargarse de:

- Conectarse al VPS.
- Subir los archivos de infraestructura versionados.
- Descargar la imagen nueva.
- Ejecutar migraciones Prisma como paso separado.
- Reiniciar servicios con Docker Compose.
- Verificar que la app responde.
- Verificar que Caddy sirve `/media/*` cuando exista media publica.

## Build de Next.js

La app debe usar build standalone para produccion self-hosted.

Reglas:

- La imagen Docker contiene el artefacto compilado.
- La imagen Docker no contiene dependencias de desarrollo innecesarias.
- La app se sirve con Node.js desde el output standalone.
- La configuracion de Next.js debe ser compatible con self-hosting.
- Si una funcionalidad de Next.js requiere infraestructura adicional, se documenta antes de usarla.

## Variables de entorno

Cuando exista app, debe existir `.env.example` con todas las variables requeridas.

Reglas:

- `.env.example` no contiene secretos reales.
- `DATABASE_URL` apunta a PostgreSQL.
- `APP_DOMAIN` contiene el dominio publico sin protocolo.
- `CADDY_EMAIL` contiene el email usado por Caddy para certificados.
- `IMAGE_REPOSITORY` contiene la imagen GHCR sin tag.
- `IMAGE_TAG` contiene el tag de despliegue.
- `APP_IMAGE` contiene la imagen completa usada por Docker Compose cuando se valida localmente.
- `MEDIA_ROOT` apunta a la raiz persistente de media dentro del contenedor que procesa imagenes.
- `MEDIA_PUBLIC_BASE_URL` define la base publica para URLs de media.
- Las variables publicas del navegador usan prefijo `NEXT_PUBLIC_`.
- Las variables privadas no usan `NEXT_PUBLIC_`.
- La lectura de variables se concentra en infraestructura o composicion.
- La app debe fallar pronto si falta una variable obligatoria.

## Backups

Antes de considerar produccion estable, debe existir estrategia de backups.

Minimo esperado:

- Backup periodico con `pg_dump`.
- Backup periodico del volumen de media.
- Retencion definida.
- Ubicacion fuera del volumen principal de PostgreSQL.
- Procedimiento documentado de restauracion.
- Prueba manual de restauracion antes de confiar en los backups.

## Comandos objetivo

Cuando el proyecto Next.js exista, estos comandos deben estar disponibles o
documentarse si no aplican:

```bash
pnpm dev
pnpm build
pnpm start
pnpm test
pnpm test:ui
pnpm test:visual
pnpm test:responsive
pnpm test:a11y
pnpm lint
pnpm typecheck
pnpm storybook
pnpm build-storybook
pnpm db:up
pnpm db:down
pnpm db:migrate
pnpm db:deploy
pnpm db:reset
pnpm media:prepare
```

## Reglas de coste

- Se prioriza usar el VPS de Google ya disponible.
- No se adopta Vercel como despliegue principal sin decision explicita.
- No se adopta Supabase, Neon, PlanetScale, Railway, Render u otro proveedor gestionado sin decision explicita.
- Las decisiones de infraestructura deben declarar coste esperado antes de implementarse.
- La decision inicial es usar IP efimera en el VPS porque el downtime por cambio de IP es aceptable.
- La IP efimera no se considera estable si la VM se para, suspende, recrea o cambia de red.
- No se introduce Cloudflare Tunnel, IP estatica o proveedor externo para evitar este riesgo sin decision explicita.
