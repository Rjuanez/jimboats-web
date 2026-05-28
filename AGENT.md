# AGENT.md

Este repositorio contiene la web de JimBoats.

Antes de hacer cualquier cambio, el agente debe leer completos:

- `architecture.md`
- `implementation.md`
- `stack.md`
- `testing.md`
- `ui-ux.md`
- `workflow.md`

Si una instruccion de este archivo entra en conflicto con `architecture.md` o
`implementation.md` o `stack.md` o `testing.md` o `ui-ux.md` o `workflow.md`, se debe parar y pedir aclaracion antes de cambiar codigo.

## Principios obligatorios

- Siempre que algo se pueda simplificar sin perder comportamiento, se simplifica.
- No se introduce una abstraccion si no elimina complejidad real, duplicacion real o dependencia real.
- No se implementa infraestructura futura. Cada dependencia externa debe tener un uso actual.
- La arquitectura debe hacer facil cambiar frameworks, base de datos, email, pagos o calendario.
- Next.js es una capa de interfaz, no el centro de la arquitectura.
- La logica de negocio vive fuera de `app/`, componentes React, Server Actions y route handlers.
- PostgreSQL y Prisma son tecnologia de infraestructura, no modelo de dominio.
- Las paginas de Next.js componen componentes reutilizables; no contienen HTML/CSS suelto.
- La UI se construye desde componentes, tokens y variantes compartidas.
- Los componentes UI deben ser aislables, testeables y verificables con tooling local.
- Toda interfaz debe funcionar perfectamente en mobile, tablet y desktop.
- El diseno responsive es obligatorio; si mobile falla, el desarrollo no esta terminado.
- Los cambios deben ser pequenos, verificables y alineados con los archivos de normas.
- Ninguna implementacion empieza sin mostrar antes archivos afectados, pseudocodigo y explicacion del cambio.
- Ninguna implementacion empieza sin confirmacion explicita del usuario.
- Si una decision no esta cubierta por las normas, se debe escoger la opcion mas simple y dejarla documentada.
- Si la opcion simple tiene riesgo arquitectonico, se debe pedir confirmacion antes de implementarla.

## Flujo de trabajo obligatorio

- Leer `architecture.md` antes de decidir donde va cada pieza.
- Leer `implementation.md` antes de escribir codigo.
- Leer `stack.md` antes de tocar dependencias, base de datos, runtime, CI/CD, Docker o despliegue.
- Leer `testing.md` antes de crear o modificar tests, componentes UI, estilos, flujos o verificaciones.
- Leer `ui-ux.md` antes de crear, modificar o convertir cualquier interfaz.
- Leer `workflow.md` antes de proponer o ejecutar cualquier implementacion.
- Revisar si ya existe una convencion local antes de crear una nueva.
- Antes de implementar, mostrar todos los archivos que se van a crear, modificar o eliminar.
- Antes de implementar, mostrar pseudocodigo por archivo y explicar la razon de cada cambio.
- Antes de implementar, indicar que verificaciones y tests se ejecutaran al final.
- Esperar confirmacion explicita del usuario antes de cambiar archivos.
- Si durante la implementacion cambia el alcance, parar y pedir nueva confirmacion con el nuevo alcance.
- Mantener el alcance del cambio limitado a la necesidad actual.
- No reescribir codigo no relacionado con la tarea.
- No borrar historial, contenido o decisiones sin permiso explicito.
- Antes de considerar terminado un desarrollo, ejecutar todos los tests disponibles.
- Un desarrollo no esta completado si no se han corrido todos los tests y todos han pasado.
- Si los tests no pueden ejecutarse, el desarrollo no se debe presentar como completado; se debe explicar el bloqueo.

## Definicion de terminado

Un cambio solo puede considerarse terminado cuando se cumple todo lo siguiente:

- La implementacion respeta `architecture.md`.
- La implementacion respeta `implementation.md`.
- La implementacion respeta `stack.md`.
- La implementacion respeta `testing.md`.
- La implementacion respeta `ui-ux.md`.
- La implementacion respeta `workflow.md`.
- No hay logica de negocio en la capa de interfaz.
- No hay HTML/CSS suelto en paginas que pueda vivir en componentes reutilizables.
- La UI funciona correctamente en mobile, tablet y desktop.
- No hay overflow horizontal, textos cortados, controles inaccesibles ni layouts rotos en mobile.
- Los componentes UI afectados tienen stories, tests o verificaciones visuales cuando aplica.
- Las verificaciones visuales, responsive y accesibilidad aplicables se han ejecutado.
- No hay dependencias externas nuevas sin adapter real.
- No hay abstracciones que puedan eliminarse sin perder claridad o comportamiento.
- Los tests relevantes existen o se ha justificado por que no aplican.
- Todos los tests del repositorio se han ejecutado correctamente.
- El resultado se puede explicar en terminos de comportamiento, no solo de codigo.
