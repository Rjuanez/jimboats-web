# implementation.md

Este documento define las reglas de implementacion para la web de JimBoats.

Las reglas son verificables y deben aplicarse en cada cambio.

## Flujo de implementacion

- Antes de implementar, seguir la puerta previa definida en `workflow.md`.
- No modificar archivos hasta que el usuario confirme explicitamente el alcance propuesto.
- Antes de escribir codigo, identificar la capa afectada: `app`, `interface`, `application`, `domain` o `infrastructure`.
- Antes de crear un archivo nuevo, comprobar si existe una convencion local equivalente.
- Antes de tocar base de datos, ORM, Docker, CI/CD o despliegue, leer `stack.md`.
- Antes de tocar tests, componentes UI o estilos, leer `testing.md`.
- Antes de tocar UI, leer `ui-ux.md` e identificar si el cambio pertenece a `ui`, `layout`, `sections`, `forms` o `marketing`.
- Implementar primero la opcion mas simple que respete la arquitectura.
- Mantener cada cambio centrado en una sola necesidad de producto.
- No mezclar refactors amplios con funcionalidad nueva salvo que sea imprescindible.
- No introducir TODOs como sustituto de comportamiento necesario.
- No dejar codigo muerto, imports sin usar ni archivos generados sin motivo.

## Puerta previa obligatoria

Antes de implementar cualquier cambio, se debe mostrar al usuario:

- Objetivo del cambio.
- Lista completa de archivos afectados.
- Accion por archivo: crear, modificar, eliminar o mover.
- Pseudocodigo por cada archivo afectado.
- Explicacion breve de por que cada archivo debe cambiar.
- Impacto arquitectonico esperado.
- Impacto UI/UX esperado si aplica.
- Tests, lint, typecheck y build que se ejecutaran al final.
- `pnpm rules:check` como verificacion obligatoria de normas automatizables.

Reglas de esta puerta:

- Si un archivo no aparece en la propuesta, no se modifica.
- Si aparece la necesidad de tocar otro archivo durante la implementacion, se debe parar.
- Para continuar con un nuevo archivo o cambio no previsto, se debe mostrar alcance actualizado y pedir confirmacion.
- La confirmacion debe ser explicita; no se interpreta el silencio como permiso.
- El pseudocodigo debe explicar comportamiento, no solo repetir nombres de archivos.
- Para cambios de UI, el pseudocodigo debe mostrar la composicion de componentes.
- Para cambios de dominio o aplicacion, el pseudocodigo debe mostrar reglas, casos de uso y puertos afectados.

## Reglas de codigo

- Usar TypeScript estricto cuando el proyecto Next.js este creado.
- Preferir tipos explicitos en fronteras publicas: casos de uso, puertos, adapters, actions y route handlers.
- Evitar `any`; si es inevitable, aislarlo en infraestructura o validadores y justificarlo.
- Validar todo input externo antes de llamar a un caso de uso.
- No pasar objetos de formulario, `Request`, `Response`, `NextRequest` ni tipos de React a la capa de aplicacion.
- No usar objetos de base de datos como entidades de dominio.
- No mezclar DTOs de UI con entidades de dominio.
- No importar adapters concretos fuera de `container.ts` o archivos de composicion autorizados.
- No leer variables de entorno fuera de infraestructura o composicion.

## Reglas de base de datos y Prisma

- Todo cambio de esquema requiere una migracion Prisma versionada.
- El esquema tecnico vive en `prisma/schema.prisma`.
- Las migraciones viven en `prisma/migrations`.
- En desarrollo se usa `prisma migrate dev`.
- En produccion se usa `prisma migrate deploy`.
- No usar `prisma db push` para cambios persistentes del proyecto.
- No cambiar la base de datos manualmente sin capturar el cambio en migracion.
- No ejecutar migraciones desde el arranque normal de Next.js.
- No importar Prisma Client fuera de `src/infrastructure/db/prisma`.
- No exponer modelos Prisma hacia dominio, aplicacion, interfaz o UI.
- Los repositorios Prisma implementan puertos de aplicacion.
- Los repositorios Prisma traducen nombres, fechas, IDs y tipos de persistencia a modelos internos.
- Los tests de aplicacion usan fakes o in-memory ports, no Prisma real.
- Los tests de infraestructura pueden usar PostgreSQL real cuando prueben adapters.
- Cualquier dato semilla debe estar separado de migraciones estructurales salvo que sea dato de sistema obligatorio.

## Reglas de runtime, Docker y CI/CD

- El runtime oficial se define en `stack.md`.
- El package manager oficial es `pnpm`.
- GitHub Actions ejecuta tests, lint, typecheck y build antes de publicar imagen.
- La imagen Docker se compila en CI, no en el VPS.
- La imagen se publica en GitHub Container Registry.
- El VPS solo hace pull de imagen, aplica migraciones y reinicia servicios.
- Docker Compose define servicios de app, PostgreSQL y Caddy.
- PostgreSQL debe usar volumen persistente.
- Caddy debe ser el unico punto de entrada HTTP/HTTPS publico.
- Los secretos se configuran mediante variables de entorno fuera de Git.
- No commitear `.env`, claves, passwords, tokens ni dumps de produccion.

## Reglas de media e imagenes

- No guardar imagenes binarias en PostgreSQL.
- No servir imagenes dinamicas desde route handlers si Caddy puede servirlas como archivos estaticos.
- No guardar subidas dinamicas en `public/` del proyecto.
- No depender de S3, Cloudinary, Supabase Storage u otro servicio externo sin decision explicita.
- Las imagenes estaticas de la web pueden vivir en el repo.
- Las imagenes dinamicas viven en un volumen persistente del VPS.
- Los originales viven en una ruta privada no servida por Caddy.
- Las variantes publicas viven en una ruta servida por Caddy.
- Cada archivo publico debe tener nombre con hash de contenido.
- Las variantes publicas deben poder cachearse como inmutables.
- Guardar metadata con Prisma: ruta publica, alt, ancho, alto, formato, tamano, hash, estado y fecha.
- Generar al menos variantes WebP para anchos comunes cuando se implemente subida de imagenes.
- No marcar una imagen como `READY` hasta que existan las variantes requeridas.
- Si falla el procesamiento, conservar el original privado y marcar estado `FAILED` o equivalente.
- Las operaciones de borrado deben borrar metadata y archivos relacionados de forma controlada.
- Los tests de aplicacion usan puertos fake de storage y procesamiento.
- Los tests de infraestructura pueden usar filesystem temporal.

## Reglas de generacion de variantes

- La opcion inicial obligatoria para media dinamica, cuando se implemente subida dinamica, es una cola local con PostgreSQL y un worker Docker.
- La subida dinamica no genera variantes en la misma peticion.
- La subida dinamica guarda original privado, crea metadata en estado `PROCESSING` y encola job.
- El worker genera variantes, actualiza metadata a `READY` y registra errores recuperables.
- La UI debe poder mostrar placeholder o estado de procesamiento mientras el worker termina.
- El procesamiento sincrono durante la subida solo se permite como excepcion documentada.
- La opcion para imagenes editoriales estaticas es el script offline `pnpm media:prepare`.
- En el repo solo se guardan imagenes fuente completas para media editorial estatica.
- No se guardan como fuente de verdad variantes generadas manualmente.
- `pnpm media:prepare` debe reprocesar las fuentes y sobrescribir las variantes generadas.
- `pnpm media:prepare` no debe depender de comprobaciones de hash para decidir si salta trabajo.
- Las variantes generadas por `pnpm media:prepare` no deben editarse a mano.
- No se recomienda generar variantes bajo demanda en la primera visita porque complica cache, errores y latencia.
- No se recomienda usar Next Image Optimization para media dinamica como mecanismo principal.

## Reglas de UI y componentes

- Las paginas `page.tsx` deben componer componentes, no contener HTML estructural complejo.
- Si una pagina necesita una seccion, crear o reutilizar un componente en `components/sections`.
- Si una seccion necesita piezas repetibles, extraerlas a `components/marketing`, `components/forms` o `components/ui`.
- Los componentes base deben aceptar variantes por props en lugar de duplicar clases.
- No copiar bloques HTML externos directamente en una ruta.
- No crear CSS de pantalla suelto; usar componentes, tokens y variantes.
- No usar estilos inline salvo valores dinamicos que no puedan expresarse con tokens o clases.
- No duplicar clases largas de Tailwind si pueden representarse con un componente o variante.
- Todo componente interactivo debe cubrir estados `hover`, `focus-visible`, `disabled` y `loading` cuando aplique.
- Los componentes deben tener nombres de intencion: `BookingCta`, `ServiceCard`, `SiteHeader`; no nombres visuales genericos como `BlueBox`.
- Los componentes que reciben datos deben recibir DTOs o props serializables, no entidades de dominio.
- Implementar UI con criterio mobile-first.
- Evitar anchos fijos que rompan mobile.
- Evitar alturas fijas cuando el contenido pueda crecer.
- Usar grids, flex y contenedores con restricciones responsive.
- No permitir overflow horizontal salvo en componentes donde sea comportamiento explicito y usable.
- Los controles interactivos deben poder usarse comodamente en pantallas tactiles.
- Los formularios deben ser legibles y operables en mobile.
- Los modales, drawers, popovers y menus deben caber en viewport mobile.
- El texto debe envolver correctamente y no cortarse dentro de botones, cards o paneles.

## Reglas para convertir HTML externo

- Primero identificar secciones, patrones repetidos, tokens visuales y comportamiento interactivo.
- Despues crear componentes base necesarios en `components/ui`.
- Despues crear layout o secciones especificas en `components/layout` o `components/sections`.
- Despues montar la ruta con composicion limpia en `app`.
- El resultado no debe conservar CSS global pegado desde el HTML original.
- Las clases y estilos duplicados deben consolidarse antes de cerrar el cambio.
- Si el HTML original trae JavaScript imperativo, convertirlo a estado React o Server Actions segun corresponda.
- Si una interaccion es compleja, preferir Radix UI o un componente accesible existente antes que recrear comportamiento manual.

## Reglas para Server Actions y route handlers

- Una Server Action debe ser fina: validar, llamar caso de uso, mapear respuesta.
- Un route handler debe ser fino: validar, llamar caso de uso, mapear HTTP.
- Las Server Actions no contienen reglas de disponibilidad, precio, cancelacion o reserva.
- Las Server Actions no instancian repositorios, clientes externos ni casos de uso directamente.
- Las respuestas de interfaz deben ser DTOs serializables.
- Los errores esperados se traducen a respuestas controladas.
- Los errores inesperados no deben exponer detalles internos al usuario.

## Reglas de validacion

- Todo input de usuario se valida en la frontera de interfaz.
- La validacion de formato vive en `interface/next/validators`.
- Las invariantes de negocio viven en dominio.
- No duplicar una regla de negocio como validacion superficial si pertenece al dominio.
- Los parsers de entrada deben convertir strings externas en tipos internos seguros.

## Reglas de testing

- La estrategia de testing se define en `testing.md`.
- Las reglas de dominio deben tener tests unitarios.
- Los casos de uso deben tener tests con puertos fake o in-memory.
- Los adapters con dependencias externas deben tener tests de contrato o integracion cuando sea viable.
- Las Server Actions y route handlers deben tener tests cuando contengan mapeo, validacion o control de errores significativo.
- Los componentes UI reutilizables deben tener stories cuando se creen o cambien de forma significativa.
- Los cambios visuales deben tener verificacion visual con Playwright cuando exista baseline estable.
- Los cambios responsive deben tener checks de viewport cuando exista app o Storybook ejecutable.
- Los cambios de accesibilidad deben validarse con axe cuando afecten controles, formularios, navegacion o estructura semantica.
- No usar snapshots DOM como verificacion principal de CSS o layout.
- Los datos usados en stories y screenshots deben ser deterministas.
- Los bugs corregidos deben quedar cubiertos por un test que falle antes del arreglo.
- No se considera terminado un desarrollo sin ejecutar todos los tests disponibles.
- Si existe lint, typecheck o build, deben ejecutarse junto con los tests antes de cerrar el cambio.
- Si alguna verificacion falla, el cambio no esta completado.

## Reglas de SEO y contenido

- Las paginas publicas deben definir metadata relevante cuando se creen.
- Las paginas de servicios deben tener URLs estables y descriptivas.
- El contenido estatico puede vivir en archivos locales mientras no haga falta CMS.
- El contenido local no debe mezclarse con reglas de negocio de reservas.
- Los datos estructurados deben generarse desde datos claros y testeables cuando afecten SEO local o servicios.

## Reglas de internacionalizacion, SEO y GEO

- Todo `locale` recibido desde ruta, formulario, action o route handler se valida en la frontera de interfaz antes de llamar a aplicacion.
- Los casos de uso que entregan contenido publico devuelven DTOs localizados para el locale solicitado.
- Los componentes no consultan diccionarios dinamicos, base de datos ni reglas de fallback.
- Los textos fijos de UI se resuelven desde diccionarios locales versionados.
- El contenido editable desde backpanel se resuelve desde PostgreSQL mediante modelos traducibles.
- Las entidades SEO-relevantes deben separar datos comunes de datos traducibles con tablas explicitas `*_translations`.
- Las traducciones publicables deben incluir, cuando aplique, `locale`, `slug`, `title`, `seoTitle`, `seoDescription`, `h1`, contenido principal, metadata Open Graph, canonical/indexing y campos necesarios para structured data.
- Cada traduccion debe tener estado editorial propio, como `DRAFT`, `NEEDS_REVIEW`, `READY_FOR_SEO` o `PUBLISHED`, si la entidad se publica por idioma.
- No se considera publicada una traduccion indexable si faltan slug, metadata minima, H1 o contenido principal suficiente.
- No se usa fallback silencioso para contenido indexable; si falta traduccion publicada, se devuelve no publicado, redirect o respuesta controlada segun el caso de uso.
- Los slugs traducidos se validan por locale y tipo de contenido para evitar colisiones.
- Los presenters o route metadata generan `hreflang`, canonical y alternates desde DTOs o resultados de aplicacion, no desde constantes dispersas.
- El structured data se genera desde datos normalizados y traducidos, no desde HTML renderizado.
- La optimizacion GEO incluye contenido especifico, FAQs reales, datos de entidad, ubicacion, servicios y politicas cuando apliquen.
- No se introduce SaaS de traduccion, CMS externo ni API externa para i18n sin decision explicita.
- Si se usa traduccion automatica self-hosted en el futuro, solo puede crear borradores revisables y no publicar contenido sin revision.

## Reglas de reservas

- La disponibilidad se calcula en dominio o aplicacion, nunca en componentes React.
- Crear una reserva debe pasar por un caso de uso.
- Cancelar una reserva debe pasar por un caso de uso.
- Confirmar una reserva debe pasar por un caso de uso.
- Enviar emails, sincronizar calendario o cobrar pagos debe hacerse mediante puertos.
- Una reserva no se confirma si falla una regla de negocio obligatoria.
- Las operaciones que requieren consistencia entre varias escrituras deben usar una estrategia explicita de transaccion o unidad de trabajo.

## Reglas de finalizacion

- Ejecutar todos los tests del repositorio.
- Ejecutar `pnpm rules:check`.
- Ejecutar typecheck si existe.
- Ejecutar lint si existe.
- Ejecutar build si existe y el cambio puede afectar compilacion o rutas.
- Revisar que no se hayan creado abstracciones innecesarias.
- Revisar que no haya logica de negocio en `app` o `interface`.
- Revisar que las paginas no contengan HTML/CSS suelto que deba estar en componentes.
- Revisar que los componentes nuevos sean reutilizables, concretos y con props claras.
- Revisar que toda UI afectada funcione en mobile, tablet y desktop.
- Revisar que no exista overflow horizontal ni texto cortado en mobile.
- Ejecutar verificaciones responsive con Playwright cuando exista app ejecutable y el cambio afecte UI.
- Ejecutar verificaciones visuales y accesibilidad definidas en `testing.md` cuando el cambio afecte UI.
- Resumir el cambio indicando verificaciones ejecutadas.
- Si no se pudo ejecutar una verificacion, explicar el motivo y no marcar el trabajo como terminado.
