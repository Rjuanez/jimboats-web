# workflow.md

Este documento define como se trabaja en este repositorio.

La regla principal es simple: antes de implementar, el usuario debe ver el
alcance completo y confirmarlo.

## Lectura obligatoria

Antes de proponer o ejecutar cualquier implementacion, leer:

- `AGENT.md`
- `architecture.md`
- `implementation.md`
- `stack.md`
- `testing.md`
- `ui-ux.md`
- `workflow.md`

## Flujo obligatorio

Cada desarrollo sigue este orden:

1. Leer las normas obligatorias.
2. Inspeccionar solo los archivos necesarios para entender la tarea.
3. Preparar una propuesta de implementacion.
4. Mostrar todos los archivos afectados.
5. Mostrar pseudocodigo por archivo.
6. Explicar por que cambia cada archivo.
7. Indicar verificaciones finales: tests, lint, typecheck y build.
8. Esperar confirmacion explicita del usuario.
9. Implementar solo el alcance confirmado.
10. Si cambia el alcance, parar y pedir nueva confirmacion.
11. Ejecutar todas las verificaciones disponibles.
12. Reportar resultado, archivos tocados y verificaciones ejecutadas.

## Formato de propuesta previa

Antes de implementar, usar este formato:

```txt
Objetivo:
- Que se quiere conseguir.

Archivos afectados:
- crear/modificar/eliminar: ruta
  Motivo: por que este archivo debe cambiar.
  Pseudocodigo:
    - paso 1
    - paso 2
    - resultado esperado

Impacto arquitectonico:
- Capas afectadas.
- Dependencias nuevas o confirmacion de que no hay.
- Riesgos o excepciones.

Impacto de datos:
- Cambios de esquema o confirmacion de que no hay.
- Migraciones necesarias o confirmacion de que no aplican.
- Datos semilla, backups o transacciones afectadas.

Impacto media/storage:
- Imagenes, variantes, rutas publicas o cache afectadas.
- Cambios de filesystem, volumenes o metadata.
- Cambios en cola PostgreSQL o `media-worker`.
- Uso de `pnpm media:prepare` si aplica.
- Confirmacion de que no se procesara media dinamica de forma sincrona salvo excepcion aprobada.

Impacto runtime/deploy:
- Cambios en Docker, CI/CD, variables de entorno o VPS.
- Comandos de arranque afectados.
- Riesgos operativos.

Impacto UI/UX:
- Componentes afectados.
- Estados responsive o interactivos.
- Viewports mobile, tablet y desktop afectados.
- Riesgo de overflow, texto cortado o controles inaccesibles.
- Plan de verificacion responsive.
- Stories afectadas o nuevas.
- Screenshots visuales afectados.
- Checks de accesibilidad afectados.
- Politica de actualizacion de snapshots si aplica.
- Confirmacion de que no habra HTML/CSS suelto.

Verificaciones finales:
- test
- test:ui
- test:visual
- test:responsive
- test:a11y
- lint
- typecheck
- build
```

Si una seccion no aplica, se debe marcar como `No aplica` y explicar por que.

## Reglas de confirmacion

- No se modifica ningun archivo antes de recibir confirmacion explicita.
- La confirmacion debe referirse al alcance propuesto.
- Si el usuario cambia el objetivo, se prepara una nueva propuesta.
- Si el usuario confirma parcialmente, solo se implementa la parte confirmada.
- Si aparece un archivo nuevo durante la implementacion, se para y se pide permiso.
- Si aparece una dependencia nueva durante la implementacion, se para y se pide permiso.
- Si aparece una decision arquitectonica no prevista, se para y se pide permiso.
- Si aparece una migracion, variable de entorno o cambio de despliegue no previsto, se para y se pide permiso.
- Si aparece una nueva ruta de media, volumen, worker o estrategia de procesamiento no prevista, se para y se pide permiso.

## Reglas de alcance

- El alcance confirmado es el contrato de trabajo.
- No se hacen refactors no relacionados.
- No se arreglan problemas encontrados de paso sin proponerlos antes.
- No se instalan dependencias no incluidas en la propuesta.
- No se cambian configuraciones no incluidas en la propuesta.
- No se crean migraciones no incluidas en la propuesta.
- No se cambian Docker, CI/CD, runtime o despliegue fuera del alcance confirmado.
- No se cambian rutas de media, cache, variantes o volumenes fuera del alcance confirmado.
- No se modifica git state, commits, ramas o remotos sin confirmacion explicita.

## Pseudocodigo esperado

El pseudocodigo debe ser concreto y verificable.

Para UI:

```txt
page.tsx:
  render:
    SiteHeader
    HomeHero(props)
    ServicesSection(services)
    BookingCta
    SiteFooter
```

Para componentes:

```txt
ServiceCard:
  props: title, description, image, href
  render:
    article accesible
    imagen con alt
    titulo
    descripcion
    link o boton
```

Para casos de uso:

```txt
CreateReservation:
  validar comando de entrada
  consultar disponibilidad por puerto
  aplicar politica de reserva
  guardar reserva por repositorio
  enviar confirmacion por puerto de email
  devolver DTO de resultado
```

Para adapters:

```txt
ReservationRepositoryAdapter:
  recibir contrato de aplicacion
  traducir a modelo externo
  ejecutar operacion externa
  traducir resultado a modelo interno
  no aplicar reglas de negocio
```

Para media:

```txt
UploadMedia:
  validar archivo y metadata
  guardar original privado
  crear metadata PROCESSING
  encolar job en media_processing_jobs
  devolver DTO con estado PROCESSING

MediaWorker:
  tomar job pendiente
  generar variantes
  escribir variantes publicas
  actualizar metadata READY o FAILED
```

Para media editorial estatica:

```txt
pnpm media:prepare:
  leer imagenes fuente completas del repo
  generar variantes optimizadas
  sobrescribir salidas generadas
  no saltar trabajo por hash
```

## Cambio de alcance durante implementacion

Si durante la implementacion surge algo no previsto:

1. Parar cambios.
2. Explicar que se encontro.
3. Mostrar archivos nuevos o cambios nuevos necesarios.
4. Mostrar pseudocodigo actualizado.
5. Pedir confirmacion.
6. Continuar solo si el usuario confirma.

## Checklist de despliegue VPS

Antes de ejecutar un despliegue:

- Confirmar que la VM no se va a parar, suspender ni recrear.
- Confirmar que el DNS apunta a la IP efimera actual del VPS.
- Confirmar que los puertos 80 y 443 estan abiertos hacia Caddy.
- Confirmar que `/srv/jimboats/web/.env.production` existe en el VPS.
- Confirmar que no hay secretos reales en el repositorio.
- Ejecutar la pipeline de GitHub Actions desde `main` o `workflow_dispatch`.

Durante el despliegue:

- Subir solo archivos de infraestructura versionados.
- Descargar la imagen ya compilada desde GHCR.
- Ejecutar `prisma migrate deploy` como paso separado.
- Reiniciar contenedores con Docker Compose.
- No apagar la VM como parte del despliegue.

Despues del despliegue:

- Verificar `https://$APP_DOMAIN/`.
- Verificar `docker compose ps` en el VPS si hay fallo.
- Revisar logs de `caddy`, `app` y `media-worker` si HTTPS, app o media fallan.
- Si cambia la IP efimera, actualizar DNS y esperar propagacion antes de diagnosticar HTTPS.

## Cierre de trabajo

El cierre debe incluir:

- Resumen breve del cambio.
- Archivos creados, modificados o eliminados.
- Verificaciones ejecutadas.
- Resultado de cada verificacion.
- Bloqueos si alguna verificacion no pudo ejecutarse.

Un trabajo no se presenta como terminado si las verificaciones disponibles no se
han ejecutado o si alguna falla.
