# testing.md

Este documento define como se prueban codigo, componentes, estilos, responsive,
accesibilidad y cambios visuales en la web de JimBoats.

El objetivo es que los componentes UI sean faciles de inspeccionar y verificar
con herramientas locales, sin servicios externos.

## Stack de testing

- Unit/application tests: Vitest.
- Component tests: Vitest y Testing Library.
- UI workbench local: Storybook.
- E2E y flujos criticos: Playwright.
- Visual regression: Playwright screenshots con `toHaveScreenshot`.
- Responsive checks: Playwright con viewports definidos.
- Accessibility checks: `@axe-core/playwright`.
- No usar Chromatic, Percy u otro servicio externo sin decision explicita.

## Comandos objetivo

Cuando exista la app, estos comandos deben estar disponibles:

```bash
pnpm test
pnpm test:ui
pnpm test:visual
pnpm test:responsive
pnpm test:a11y
pnpm storybook
pnpm build-storybook
```

- `pnpm test` ejecuta tests unitarios y de aplicacion.
- `pnpm test:ui` ejecuta tests de componentes o Storybook test runner si existe.
- `pnpm test:visual` ejecuta comparaciones visuales de Playwright.
- `pnpm test:responsive` ejecuta checks de viewports y overflow.
- `pnpm test:a11y` ejecuta axe con Playwright.
- `pnpm storybook` levanta el workbench local.
- `pnpm build-storybook` comprueba que las stories compilan.

## Componentes testeables

- Todo componente UI reutilizable debe poder verse aislado.
- Todo componente UI reutilizable debe poder renderizarse con datos deterministas.
- Los estados importantes deben exponerse por props o datos controlados.
- No depender de datos reales, red, fecha actual, localStorage o viewport global para renderizar un estado visual.
- No esconder comportamiento visual en CSS global de pantalla.
- No usar snapshots DOM como prueba principal de layout o CSS.
- Preferir queries semanticas por rol, label o texto antes que `data-testid`.
- `data-testid` solo se usa cuando no haya una consulta semantica estable.

## Stories obligatorias

Crear o actualizar stories cuando:

- Se crea un componente UI reutilizable.
- Se cambia una variante visual.
- Se cambia responsive relevante.
- Se cambia estado loading, disabled, error, empty o success.
- Se corrige un bug visual.

Estados recomendados:

- `Default`
- `Loading`
- `Disabled`
- `Error`
- `Empty`
- `LongText`
- `Mobile`
- `WithMedia`

No todos los estados aplican a todos los componentes. Si no aplican, no se crean
por cumplir lista.

## Visual regression

- Los cambios visuales importantes deben tener screenshots de Playwright cuando el componente o pagina sea estable.
- Los snapshots visuales se commitean.
- Los snapshots solo se actualizan de forma intencional.
- Si cambia un snapshot, el resumen del trabajo debe decir por que.
- Los screenshots deben usar datos deterministas.
- Las animaciones, fechas, contenido remoto y estados aleatorios deben desactivarse o fijarse en tests visuales.
- Los tests visuales deben cubrir mobile y desktop cuando el layout cambia por viewport.

## Responsive checks

Viewports minimos:

- Mobile: 360px de ancho.
- Tablet: 768px de ancho.
- Desktop: 1280px de ancho.

Checks esperados:

- No hay overflow horizontal accidental.
- El contenido principal cabe en viewport.
- Los controles interactivos son visibles y usables.
- Los textos no se cortan.
- Los formularios se pueden completar.
- Menus, dialogs, drawers, popovers y selects caben en mobile.

Ejemplo de check de overflow:

```txt
scrollWidth <= innerWidth
```

## Accessibility checks

- Usar axe con Playwright para paginas, formularios, navegacion, dialogs y componentes interactivos.
- Los checks automaticos no sustituyen revision manual cuando el cambio sea delicado.
- Todo control debe tener nombre accesible.
- Los errores de formulario deben ser perceptibles y estar asociados al campo.
- El foco debe ser visible.
- Los dialogs y menus deben poder usarse con teclado.

## Testing Library

- Testear comportamiento observable, no implementacion interna.
- Preferir `getByRole`, `getByLabelText`, `getByText` y queries semanticas.
- No comprobar clases CSS como señal principal de comportamiento salvo que el contrato sea una variante visual concreta.
- No acoplar tests a estructura interna de `div`.

## Politica de snapshots

- Un snapshot nuevo debe revisarse antes de aceptarse.
- Un snapshot actualizado debe corresponder a un cambio visual aprobado.
- No actualizar snapshots para esconder una regresion.
- Si un snapshot falla por entorno, se estabiliza el entorno antes de relajar tolerancias.
- Las tolerancias deben ser pequenas y justificadas.

## Cierre de cambios UI

Un cambio UI no esta terminado si falta alguna verificacion aplicable:

- Story o prueba aislada del componente.
- Test unitario/componente si hay comportamiento.
- Screenshot visual si hay cambio visual estable.
- Check responsive si afecta layout.
- Check a11y si afecta controles, formularios, navegacion o estructura semantica.
- Build de Storybook si se tocaron stories o componentes visuales.

