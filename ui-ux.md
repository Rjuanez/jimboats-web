# ui-ux.md

Este documento define las tecnologias, reglas y criterios de UI/UX para la web
de JimBoats.

La UI debe ser simple, reusable, accesible y facil de mantener. Las paginas no
son lugares para pegar HTML y CSS: son composiciones de componentes.

## Stack UI aprobado

- Usar Next.js App Router con TypeScript strict.
- Usar Tailwind CSS v4 como sistema de estilos principal.
- Usar shadcn/ui como base de componentes propios cuando aporte velocidad y consistencia.
- Usar Radix UI para primitivas interactivas accesibles: dialog, select, popover, accordion, tabs y similares.
- Usar lucide-react para iconos.
- Usar Zod para validar formularios y entradas externas.
- Usar Vitest y Testing Library para tests unitarios o de componentes.
- Usar Playwright para flujos criticos, capturas responsive y pruebas end-to-end.
- Usar Storybook local para aislar, revisar y probar componentes visuales reutilizables.
- No introducir una segunda libreria de UI sin decision explicita.
- No introducir una libreria de animaciones, formularios o estado global sin una necesidad concreta.

## Estructura de componentes

La estructura esperada para UI es:

```txt
src/
  components/
    ui/
    layout/
    sections/
    forms/
    marketing/
  design/
    tokens.ts
    variants.ts
```

- `components/ui` contiene piezas base reutilizables y poco acopladas.
- `components/layout` contiene estructura comun de pagina.
- `components/sections` contiene bloques completos de pagina.
- `components/forms` contiene formularios y campos compuestos.
- `components/marketing` contiene componentes de contenido comercial o editorial.
- `design/tokens.ts` contiene valores semanticos compartidos cuando Tailwind no baste.
- `design/variants.ts` contiene variantes compartidas cuando una API visual se repite.

## Regla principal

- Una ruta de Next.js no construye UI compleja; compone componentes.
- `page.tsx` debe leerse como una declaracion de secciones.
- Si un `page.tsx` contiene varios `section`, `article`, `form` o bloques de clases largas, debe extraerse.
- Si una pieza visual aparece dos veces, debe ser componente.
- Si una combinacion de clases se repite, debe ser variante, componente o helper.
- Si una UI viene de un HTML externo, se descompone antes de integrarse.

## Componentes base

- Los componentes base deben ser pequenos, accesibles y de proposito claro.
- Los componentes base no conocen JimBoats, reservas ni contenido de negocio.
- Los componentes base aceptan props de variante: `variant`, `size`, `tone`, `align` cuando tenga sentido.
- Las variantes permitidas deben estar tipadas.
- Los componentes base no deben recibir clases arbitrarias como mecanismo principal de personalizacion.
- `className` puede existir para casos puntuales, pero no debe sustituir una API clara.
- Los componentes base deben cubrir estados visuales: default, hover, focus-visible, disabled y loading cuando aplique.
- Los componentes base deben tener stories cuando se creen o cambien de forma significativa.
- Las stories deben cubrir estados relevantes: default, loading, disabled, error, long text y mobile cuando aplique.
- Los estados visuales deben poder renderizarse mediante props o datos deterministas.
- Un componente no se considera testeable si solo puede verse dentro de una pagina completa.

## Componentes de layout

- `SiteHeader` gestiona navegacion principal.
- `SiteFooter` gestiona pie de pagina.
- `Container` gestiona ancho maximo y padding horizontal.
- `PageShell` o equivalente gestiona estructura repetida de pagina si aparece.
- El layout no contiene reglas de negocio ni llamadas a casos de uso.
- El layout no contiene contenido largo que pertenezca a secciones.

## Componentes de seccion

- Cada seccion debe representar una unidad visible de pagina: hero, servicios, FAQ, CTA, galeria, contacto.
- Una seccion recibe datos por props o desde contenido estatico local preparado.
- Una seccion no debe importar adapters, casos de uso ni entidades de dominio.
- Una seccion puede componer componentes de `ui`, `layout`, `forms` y `marketing`.
- Una seccion no debe duplicar estructura si ya existe otra seccion equivalente.
- Las secciones visualmente complejas deben tener story o pagina de prueba aislada cuando sea util para verificar responsive.

## Formularios

- Los formularios viven en `components/forms`.
- La validacion de formato se define con Zod en la frontera de interfaz.
- Los formularios no ejecutan reglas de negocio.
- Los formularios llaman a Server Actions o callbacks tipados.
- Los campos reutilizables se extraen cuando se repiten.
- Los errores deben ser visibles y asociados al campo correspondiente.
- Los estados `submitting`, `success` y `error` deben estar representados cuando aplique.

## Estilos

- Tailwind se usa dentro de componentes, no como pegamento disperso en paginas.
- `globals.css` solo contiene Tailwind, reset minimo, tokens globales y estilos base.
- No se permite CSS global para una pantalla concreta.
- No se permite CSS copiado desde HTML externo sin convertirlo al sistema de componentes.
- No se permiten estilos inline salvo valores dinamicos inevitables.
- Los colores deben usarse como tokens semanticos cuando se repiten.
- Los espaciados, radios y sombras repetidos deben consolidarse.
- No usar paletas de un solo tono para toda la interfaz.
- No usar texto gigante dentro de cards, paneles compactos o controles.

## UX

- La primera pantalla debe mostrar claramente que es JimBoats y que accion principal puede hacer el usuario.
- Las paginas publicas deben priorizar claridad, confianza y conversion.
- Las reservas deben reducir decisiones innecesarias.
- Cada CTA debe tener una accion clara.
- Los formularios deben pedir solo los datos necesarios para la accion actual.
- Los errores deben explicar como continuar.
- No usar texto dentro de la app para explicar atajos, arquitectura o detalles tecnicos.
- El contenido debe ser especifico de JimBoats, no generico.

## Accesibilidad

- Los elementos interactivos deben ser accesibles por teclado.
- Todo foco interactivo debe tener estilo `focus-visible`.
- Los controles deben tener nombre accesible.
- Las imagenes informativas deben tener `alt` util.
- Las imagenes decorativas deben tener `alt=""`.
- Los modales, selects, tabs, accordions y popovers deben usar primitivas accesibles.
- No usar `div` o `span` clicables cuando existe un elemento semantico.
- Mantener contraste suficiente en textos, botones y estados.

## Responsive

- Mobile es una experiencia principal, no una version secundaria.
- Toda pantalla debe funcionar en mobile, tablet y desktop.
- Toda pantalla debe funcionar correctamente desde 360px de ancho.
- Ninguna pantalla debe tener overflow horizontal accidental.
- Ningun texto debe quedar cortado en mobile.
- Ningun boton, enlace, input o control debe quedar fuera del viewport.
- El texto no debe salirse de botones, cards ni contenedores.
- El texto debe envolver correctamente antes de salirse del contenedor.
- Los botones deben poder usarse comodamente con tactil.
- Los formularios deben poder completarse en mobile sin zoom ni desplazamientos confusos.
- La navegacion principal debe ser usable en mobile.
- Los menus, dialogs, drawers, popovers, selects y tabs deben caber en viewport mobile.
- Los grids deben definir columnas responsivas estables.
- Las imagenes deben tener dimensiones, ratio o contenedor estable.
- Los componentes no deben cambiar el layout al hacer hover, loading o mostrar errores.
- El primer viewport debe dejar clara la accion principal sin ocultar informacion esencial.
- Los estados loading, error, empty y success tambien deben funcionar en mobile.
- Si una tabla o listado no cabe en mobile, debe redisenarse como cards, lista o scroll explicito usable.
- No se acepta una UI como terminada si mobile rompe aunque desktop funcione.

## Imagenes

- Toda imagen informativa debe tener `alt` especifico.
- Toda imagen decorativa debe usar `alt=""`.
- Toda imagen debe renderizar con ancho, alto o ratio estable.
- Las imagenes no deben provocar layout shift.
- Las imagenes estaticas del repo pueden usar `next/image`.
- Las imagenes dinamicas servidas desde `/media/*` deben usar un componente reutilizable.
- El componente reusable debe recibir variantes, `alt`, dimensiones y `sizes`.
- Para imagenes dinamicas se prefiere `picture`/`srcset` generado desde metadata.
- La imagen principal del primer viewport puede cargarse con prioridad.
- Las imagenes fuera del primer viewport deben cargar lazy.
- No usar imagenes enormes como fondo si una variante optimizada resuelve el caso.
- No repetir URLs de imagen hardcodeadas por la app; usar DTOs o contenido preparado.
- Si una imagen aun esta en procesamiento, la UI debe mostrar placeholder estable.
- Si una imagen dinamica esta en estado `PROCESSING`, la UI no debe reservar espacio incorrecto ni romper el layout.
- Si una imagen dinamica esta en estado `FAILED`, la UI debe mostrar fallback accesible o no renderizar la pieza si no es esencial.
- Los componentes de imagen dinamica deben aceptar estado de media: `PROCESSING`, `READY` o `FAILED`.

## Conversion de HTML externo

Cuando se reciba un archivo HTML como referencia:

- No pegar el HTML directamente en `page.tsx`.
- Identificar secciones visibles.
- Identificar componentes repetidos.
- Identificar tokens visuales: color, tipografia, spacing, radios, sombras.
- Crear componentes base antes de montar la pagina si hacen falta.
- Crear secciones con nombres de negocio o intencion.
- Convertir estilos globales a Tailwind, tokens o variantes.
- Convertir JavaScript imperativo a React, Server Actions o componentes interactivos.
- Eliminar codigo muerto del prototipo original.
- Probar la pagina en mobile y desktop antes de cerrar el cambio cuando exista app ejecutable.

## Checklist verificable

Antes de cerrar un cambio de UI, comprobar:

- `page.tsx` solo compone componentes.
- No hay HTML estructural complejo pegado en rutas.
- No hay CSS global de pantalla concreta.
- No hay clases largas duplicadas.
- Los componentes nuevos tienen props explicitas.
- Los nombres describen intencion, no solo apariencia.
- Los estados interactivos estan cubiertos.
- Los formularios tienen validacion y errores visibles.
- La UI funciona en mobile y desktop.
- La UI funciona desde 360px de ancho.
- No hay overflow horizontal accidental.
- No hay textos cortados ni controles inaccesibles en mobile.
- Las stories o verificaciones visuales aplicables existen para componentes afectados.
- Las verificaciones del repositorio se han ejecutado y pasan.
