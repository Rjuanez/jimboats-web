# Punto 13 y propuesta exacta de preparación para búsquedas con IA

Fecha: 5 de noviembre de 2026. Copia: `web-seo`, rama `main`.

## 1. Punto 13: cambios implementados localmente

### Comparación de duraciones

Ubicación: al inicio del contenido de `/es/precios`, antes de la tabla completa
de tarifas, y en sus equivalentes EN/FR/DE/NL. Título:

**¿Una, dos o cuatro horas? Elige tu paseo privado**

Introducción:

> Compara tres duraciones del paseo diurno por Barcelona. El precio es final para
> todo el barco, hasta seis pasajeros, con patrón, combustible y seguro incluidos.

| Duración | Incluye a bordo | Elígelo si buscas… | Precio por barco |
| --- | --- | --- | --- |
| 1 hora | Bebida | Una escapada breve para ver Barcelona desde el mar | 120 € |
| 2 horas | Bebidas y aperitivo | Más tiempo para navegar y compartir un aperitivo | 210 € |
| 4 horas | Bebidas y aperitivo | Una salida más larga para disfrutar del barco con calma | 390 € |

Cada fila enlaza a `/es/book?experience=daytrip&hours=1`, `hours=2` o `hours=4`.
Los precios y los incluidos de la web se preparan desde las mismas fuentes que
el resto del marketing, sin introducir otra tarifa. Esta tabla del documento
representa los importes vigentes al prepararlo. En móvil cada fila se muestra
como un bloque vertical legible, manteniendo la semántica de tabla.

Nota visible:

> La duración incluye la salida del puerto y el regreso. El recorrido y las
> posibles paradas dependen del estado del mar y del criterio del patrón. Una
> duración mayor no garantiza una parada de baño.

### Información previa al embarque

Ubicación: bloque «Antes de embarcar» en precios, contacto y las cuatro
experiencias, en los cinco idiomas. Sus respuestas están disponibles en el HTML
inicial. Las preguntas del marcado estructurado proceden de los mismos textos.

**¿Pueden venir bebés y niños?**

Sí. Admitimos bebés y niños de cualquier edad y disponemos de chalecos salvavidas
adecuados para ellos. El máximo es de seis pasajeros, incluidos los bebés y los niños.

**¿Cómo se accede al puerto y al barco?**

Se reutilizan las instrucciones existentes de acceso por Moll de Mestral.
El punto de encuentro sigue identificado en contacto y en las experiencias.
Se añade: «El acceso al puerto y el embarque en el barco son distintos.
Para viajar con movilidad reducida, debes poder embarcar y desplazarte por el
barco por tus propios medios. Puedes llevar una silla de ruedas como equipaje».

**¿Podemos llevar cochecitos, maletas y mascotas?**

Sí. Podéis traer cochecitos, maletas y mascotas a bordo.

**¿Podemos bañarnos durante la salida?**

Sí, cuando las condiciones del mar lo permitan y el patrón lo autorice.

**¿Podemos traer nuestra propia comida y bebida?**

Sí. Podéis traer vuestra propia comida y bebida a bordo.

**¿Hay opciones para diferentes necesidades alimentarias?**

Sí. Disponemos de opciones para diferentes necesidades alimentarias. Si tienes
alguna alergia o necesidad específica, contacta con JimBoats antes de reservar
para concretar las opciones para tu grupo.

El bloque permite consultar por WhatsApp y llegar a la comparación de precios.
Las respuestas existentes sobre baño, cancelación y comida se conservan.

### Condiciones confirmadas y evidencia adicional pendiente

El propietario ha confirmado bebés y niños de cualquier edad con chalecos
adecuados, cochecitos, maletas, mascotas, opciones alimentarias, comida y bebida
propias, y baño cuando las condiciones lo permitan. Se ha incorporado en los
cinco idiomas, sin prometer menús concretos ni ausencia de alérgenos.

El propietario ha aclarado que, en caso de movilidad reducida, el pasajero debe
poder embarcar y desplazarse por el barco por sus propios medios, y que se
admiten sillas de ruedas como equipaje. Esta condición se ha incorporado en los
cinco idiomas y en las respuestas compartidas con el marcado SEO. Las condiciones
prácticas solicitadas quedan confirmadas. Como ampliaciones posteriores quedan:

- Detalles del escalón, asistencia y almacenamiento que se quieran describir.
- Para los relatos de salidas: fecha, duración, recorrido real, condiciones del
  día y fotos autorizadas. No se han inventado testimonios ni experiencias.

## 2. Qué significaría alcanzar 100/100

La nota anterior de IA (78/100) era orientativa. Para hacer comprobable el
objetivo, propongo sustituirla por esta lista explícita de **20 comprobaciones,
de 5 puntos cada una**. Es una rúbrica propia de preparación y mantenimiento:
no es una nota de Google, ChatGPT o Perplexity, ni una predicción de citas.
No se debe comparar una nueva nota de esta lista con el antiguo 78 como si
ambas se hubieran calculado con el mismo instrumento.

Una comprobación recibe sus cinco puntos únicamente cuando existe evidencia
del criterio completo. Un cambio local aún no desplegado no satisface una
comprobación que exige evidencia pública. No se calcula una nota nueva en este
documento. La ficha del punto 14 y la medición real siguen pendientes.

### A. Acceso y funcionamiento — 25 puntos

| Nº | Mejora exacta | Cuándo la daría por cerrada |
| --- | --- | --- |
| 1 | Publicar la nueva web, consolidar www, retirar CA con 308 y usar canonical HTTPS de producción | Las URL principales y sus redirecciones responden correctamente en el dominio real; no quedan canonical a localhost |
| 2 | Publicar el sitemap y registrarlo en Search Console; inspeccionar portada, cuatro experiencias y precios | Sitemap leído, sin errores de URL; indexación y canonical seleccionado comprobados en las páginas prioritarias |
| 3 | Verificar robots, cabeceras y protección del alojamiento frente a rastreadores de búsqueda | El contenido público no recibe noindex accidental, bloqueo, desafío o respuesta vacía; reservas y administración mantienen sus restricciones |
| 4 | Priorizar la imagen principal de atardecer y ajustar su variante móvil; repetir medición de las páginas comerciales | Tres muestras móviles por página prioritaria, con objetivo de mediana LCP ≤2,5 s y CLS ≤0,1; datos de campo anotados por separado cuando estén disponibles |
| 5 | Resolver las diferencias visuales pendientes y comprobar navegación, enlaces, móvil y accesibilidad | Pruebas pertinentes sin fallos, capturas inspeccionadas y sin overflow en 360/768/1280; comprobar también el HTML sin ejecutar JavaScript |

Para el nº 3 conservaría el permiso general de rastreo público que ya prepara
el código y revisaría el servidor. No añadiría grupos de robots innecesarios.
Las decisiones sobre entrenamiento se revisan por separado de las de búsqueda.
Para el nº 4 usaría `fetchPriority` solo en la imagen principal prioritaria y
comprobaría el recorte antes de cambiar variantes; no recalcularía el resto de
imágenes sin evidencia de necesidad.

### B. Respuestas comerciales claras — 25 puntos

| Nº | Mejora exacta | Cuándo la daría por cerrada |
| --- | --- | --- |
| 6 | Dar a la portada una introducción que identifique explícitamente negocio, servicio, capacidad y puerto | Resumen visible, preciso y natural en los cinco idiomas |
| 7 | Reorganizar el resumen de cada experiencia con duración, precio total, capacidad, embarque e incluidos | Los cuatro servicios se entienden sin deducir si el precio es por persona; cifras coherentes con reserva, HTML, schema y llms.txt |
| 8 | Publicar la comparación de 1/2/4 horas del punto 13 | Precios procedentes del catálogo y tres enlaces que conservan la duración hasta la reserva |
| 9 | Completar las respuestas prácticas con las condiciones reales del equipo | Bebés, seguridad, movilidad, equipaje, baño y comida resueltos; sin promesas de accesibilidad, menú o baño no verificadas |
| 10 | Revisar el contenido y las 46 metadescripciones propuestas en ES/EN/FR/DE/NL | No hay traducciones incompletas, contradicciones o precios divergentes; cada texto corresponde a su página y su intención |

**Texto exacto propuesto para la introducción de la portada:**

> JimBoats Charter ofrece paseos privados en barco con patrón desde Port Olímpic,
> Barcelona, para grupos de hasta seis personas. Puedes elegir una salida de día,
> al amanecer, al atardecer o una experiencia romántica. El paseo diurno empieza
> en 120 € por una hora para todo el barco, con patrón, combustible y seguro incluidos.

El precio se interpolaría desde el catálogo. El bloque sustituiría la introducción
actual; no se añadiría otro párrafo repetido debajo. Mantendría el H1 y el CTA.

**Resumen propuesto para cada experiencia**, usando los datos existentes en una
presentación compacta y visible:

| Experiencia | Duración | Precio inicial total | Datos comunes y diferencia |
| --- | --- | --- | --- |
| Paseo diurno | 1–6 h | 120 € / 1 h | Hasta seis pasajeros, Port Olímpic, patrón, combustible y seguro |
| Atardecer | 2–6 h | 220 € / 2 h | Mismos datos comunes; bebidas y aperitivo incluidos |
| Amanecer | 2–6 h | 220 € / 2 h | Mismos datos comunes; bebidas y aperitivo incluidos |
| Romántico | 1–4 h | 250 € / 1 h | Mismos datos comunes; decoración de las fotografías incluida |

Las salidas de una hora incluyen bebida; desde dos horas, bebidas y aperitivo.
Conservaría la política de cancelación compartida y el enlace directo al contacto.
La mejor descripción no garantiza que un buscador use ese fragmento; su objetivo
es evitar ambigüedades a clientes y a sistemas que consulten la página.

### C. Identidad y evidencia propia — 20 puntos

| Nº | Mejora exacta | Cuándo la daría por cerrada |
| --- | --- | --- |
| 11 | Publicar el identificador común de empresa y las relaciones con los patrones | Misma entidad en servicios, blog y perfiles; dirección de embarque y domicilio fiscal diferenciados |
| 12 | Aprobar y publicar condiciones y privacidad, enlazándolas desde recogida de datos, footer y pago | Textos completos y revisados, sin marcadores pendientes y con enlaces válidos en los cinco idiomas |
| 13 | Publicar dos relatos de salidas reales y mejorar la evidencia de embarque | Fecha, duración, condiciones y fotografías propias comprobadas; fotos útiles del acceso y del barco, con permiso cuando proceda |
| 14 | Confirmar autoría, acreditaciones y fechas de las guías | Autor real enlazado, credenciales contrastadas, fecha de primera publicación y actualizaciones editoriales veraces |

**Relatos propuestos, pendientes de los hechos reales:** «Una salida de dos horas
desde Port Olímpic: decisiones del patrón y recorrido de ese día» y «Así preparamos
una salida romántica en LENA». Estructura: contexto real → qué se preparó → qué
se hizo → condiciones y límites → fotos → enlace a la experiencia. No presentaría
el recorrido de un día como itinerario garantizado de todas las reservas.

### D. Coherencia y reconocimiento externos — 20 puntos

El punto 14 queda pendiente de que el usuario revise su ficha. Nada de esta
sección se ha modificado en plataformas externas.

| Nº | Mejora exacta | Cuándo la daría por cerrada |
| --- | --- | --- |
| 15 | Revisar el Perfil de Empresa existente | Propiedad y verificación comprobadas; nombre, categoría, ubicación elegible, pin, teléfono, web y horarios coherentes |
| 16 | Conciliar las fichas de Instagram, GetYourGuide y Click&Boat con la web | No hay discrepancias en identidad, capacidad, incluidos o embarque; diferencias de producto o canal explicadas cuando existan |
| 17 | Preparar un proceso de reseñas y mantener sus fuentes en la web | Solicitud no selectiva, sin incentivos por valoración positiva; fuentes trazables y cifras revisadas con fecha |
| 18 | Conseguir tres menciones editoriales útiles de colaboradores independientes | Páginas públicas de colaboradores reales que describan la oferta de forma correcta y aporten valor al viajero |

Las tres menciones son un objetivo de trabajo propuesto, no un umbral conocido
de ningún algoritmo. Priorizaría colaboradores reales de alojamiento, conserjería
y actividades de Barcelona. No compraría paquetes de enlaces ni crearía perfiles
de relleno. El contacto externo se aprobaría con el destinatario y el texto preparados.

### E. Medir respuestas y negocio — 10 puntos

| Nº | Mejora exacta | Cuándo la daría por cerrada |
| --- | --- | --- |
| 19 | Crear y ejecutar una batería estable de 20 consultas, tres repeticiones por plataforma | Respuestas y fuentes guardadas, separando menciones, citas, recomendaciones y exactitud por idioma y plataforma |
| 20 | Identificar el proyecto Statsig correcto y completar la medición del recorrido comercial | Vista de experiencia, clic de reserva, inicio de pago y pago confirmado verificables; UTMs conservadas, sin datos personales en eventos y con controles de consentimiento que correspondan |

**Consultas iniciales propuestas para la batería**: cinco pares de consultas de
intención y cinco pares de consultas de marca, ES/EN. Las formulaciones se fijan
antes de medir para que la comparación posterior sea útil.

1. «Paseo privado en barco por Barcelona para seis personas».
2. «Private boat trip in Barcelona for six people».
3. «Barco privado al atardecer en Barcelona con patrón».
4. «Private sunset boat trip in Barcelona with a skipper».
5. «Paseo romántico en barco en Barcelona con decoración».
6. «Romantic boat trip in Barcelona with decorations».
7. «Paseo en barco con niños desde Port Olímpic».
8. «Boat trip with children from Port Olímpic Barcelona».
9. «Cuánto cuesta alquilar un barco con patrón dos horas en Barcelona».
10. «How much is a private two-hour boat trip in Barcelona?».
11. «Qué incluye el precio de JimBoats».
12. «What is included in a JimBoats boat trip?».
13. «Cuántas personas caben en el barco de JimBoats».
14. «How many guests can join a JimBoats trip?».
15. «Dónde se embarca con JimBoats en Barcelona».
16. «Where is the JimBoats boarding point in Barcelona?».
17. «Política de cancelación de JimBoats si hace mal tiempo».
18. «What happens if JimBoats cancels because of the weather?».
19. «Quiénes son los patrones de JimBoats».
20. «Who are the skippers at JimBoats?».

Medir también consultas no comerciales solo si ayudan a resolver errores reales.
No dar cinco puntos por una tasa de citas prometida: el criterio es disponer de
una medición válida. Una cita, una recomendación y una reserva son resultados
distintos. Una línea base con cero citas sigue siendo evidencia útil.

## 3. Orden propuesto después del punto 13

1. Revisión visual del punto 13 completada; condiciones prácticas confirmadas e incorporadas.
2. Aprobar las introducciones y resúmenes de experiencia y las metadescripciones.
3. Revisar textos legales y datos verificables de autores y salidas reales.
4. Corregir la imagen principal móvil y resolver la validación visual pendiente.
5. Desplegar y verificar indexación y rastreo reales.
6. Revisar la ficha del punto 14 y conciliar las plataformas externas.
7. Medir respuestas y conversiones; elegir el siguiente contenido por las lagunas
   observadas, no por sumar páginas ni repetir palabras clave.

No añadiría `llms-full.txt`, una página duplicada «para IA», marcado que no
corresponda al contenido, fechas artificiales ni artículos masivos para llenar
la lista. El `llms.txt` actual ya tiene el resumen y debe mantenerse coherente.

Google indica que sus funciones de IA utilizan los fundamentos de SEO existentes:
una página debe estar indexada y ser apta para mostrar fragmentos; no exige un
archivo o marcado especial. También aclara que cumplir los requisitos no garantiza
la inclusión. [Fuente oficial](https://developers.google.com/search/docs/appearance/ai-features).

## 4. Verificación del punto 13

- `rules:check`, ESLint, TypeScript y `git diff --check`: correctos.
- Vitest: 101 archivos, 518 pruebas correctas.
- Compilación optimizada de Next y compilación de Storybook: correctas.
- Nuevas comprobaciones en ES/EN/FR/DE/NL a 360/768/1280 px: sin overflow ni
  infracciones de axe en los bloques añadidos; los botones tienen al menos 44 px
  de alto y la reserva conserva la duración seleccionada.
- La última ejecución funcional acotada terminó con 13 pruebas correctas:
  cinco del punto 13 y ocho de meteorología que quedaban por ejecutar.
- La ejecución general se bloqueó al cerrar dos pruebas de capturas fallidas.
  Se interrumpieron solo sus procesos y se completó el tramo visual pendiente
  con un worker: dos pruebas correctas y nueve diferencias de capturas. Sumadas
  a las cuatro del blog ya observadas, siguen pendientes 13 comparaciones visuales.
  No se actualizaron las referencias globales. Las de experiencias incluyen
  ahora el bloque añadido por este punto 13; también persisten diferencias de
  portada, blog y panel ajenas a ese bloque.
- Las pruebas operativas condicionadas a PostgreSQL y la comprobación del mapa
  externo conservan las omisiones previstas por el entorno de fixtures.
- Las capturas de los componentes nuevos se inspeccionaron manualmente. Para
  capturarlos completos a 360 px de ancho se generó además una revisión con un
  viewport más alto, sin cambiar el ancho ni el contenido de los componentes.

Tras incorporar las respuestas del propietario, incluida la aclaración sobre movilidad:

- Vitest: siguen pasando los 101 archivos y las 518 pruebas.
- Las cinco pruebas de planificación pasan en ES/EN/FR/DE/NL: comprueban
  360/768/1280 px, accesibilidad de los bloques, enlaces y duración en reserva.
- Se revisaron las nuevas capturas de las respuestas ampliadas en móvil y escritorio.
- `rules:check`, ESLint, TypeScript, formato de los dos archivos de contenido,
  compilación de Storybook y compilación optimizada de Next con webpack: correctos.
- El intento inicial con Turbopack falló al descargar fuentes en el entorno sin
  red. La compilación con webpack y acceso a las fuentes terminó correctamente.
- Esta comprobación acotada no cierra las 13 diferencias visuales globales
  pendientes de la ejecución anterior ni modifica sus imágenes de referencia.
- La comprobación final de movilidad conserva los 518 tests unitarios y los
  cinco tests de navegador correctos; se revisaron las capturas móviles ES/DE.
  Evidencia de esta última ejecución: `.local-preview/point13-mobility-*.log`
  y `.local-preview/point13-mobility-results/`.

La aclaración sobre movilidad está incorporada. La revisión posterior del
apartado 5 resuelve las comparaciones visuales que quedaron pendientes en esta
ejecución. No se ha desplegado.

Evidencia local: `.local-preview/point13-duration-*.png`,
`.local-preview/point13-preparation-*.png`, `.local-preview/point13-test-results/`,
`.local-preview/point13-final-results/`, `.local-preview/point13-visual-results/`
y logs `.local-preview/point13-*.log`.

## 5. Revisión de las 13 diferencias visuales

Se compararon las referencias con las capturas recibidas y se repitió la suite
visual usando el Chromium de la versión instalada de Playwright, desde
`/tmp/jimboats-playwright-browsers` (headless shell 148.0.7778.96, revisión 1223).
Se usó la compilación optimizada ya verificada,
fixtures locales, clima simulado y un servidor temporal en `127.0.0.1:3104`.

### Resultado de la inspección

| Capturas revisadas | Causa comprobada | Tratamiento |
| --- | --- | --- |
| Calendario del panel, escritorio | Chrome del sistema dibujaba de forma diferente iconos y el tirador del textarea | Pasa con el Chromium de referencia; imagen de referencia conservada |
| Detalle de reserva, escritorio | Diferencias de renderizado en iconos y controles nativos | Pasa con el Chromium de referencia; imagen de referencia conservada |
| Listado de reservas, móvil | Diferencias pequeñas en iconos | Pasa con el Chromium de referencia; imagen de referencia conservada |
| Portada ES, 360 y 1280 px | Foto principal actual del LENA, contacto en navegación/CTA y dirección actualizada | Dos referencias renovadas tras revisar composición, imágenes, pie y controles |
| Paseo privado, 360 y 1280 px | Bloque «Antes de embarcar», navegación de contacto y dirección | Dos referencias renovadas; el nuevo bloque explica el aumento de altura |
| Amanecer, 360 y 1280 px | Mismos cambios prácticos y galería específica de siete fotos en lugar de cuatro genéricas | Dos referencias renovadas; fotos completas con proporciones propias, sin recortes accidentales |
| Índice del blog, 360 y 1280 px | Dirección del pie y enlace de contacto en el menú de escritorio | Dos referencias renovadas |
| Artículo de atardecer, 360 y 1280 px | Dirección del pie y enlace de contacto en el menú de escritorio | Dos referencias renovadas |

La repetición inicial produjo **5 pruebas visuales correctas y 10 referencias
públicas desfasadas**, frente a los 13 fallos del entorno anterior. En las cuatro
capturas del blog la comparación de píxeles confirmó que el contenido y sus fotos
coinciden: los cambios quedan en el menú y el pie. La dirección más larga añade
20 px a esas dos páginas móviles.

Se actualizaron únicamente las diez referencias públicas de
`tests/seo-visual.spec.ts-snapshots/` y `tests/blog.spec.ts-snapshots/`. Las tres
referencias del panel se verificaron idénticas byte a byte a las iniciales.
No se identificaron regresiones de maquetación en las comparaciones revisadas.
No se cambiaron componentes ni se ampliaron tolerancias para hacer pasar las pruebas.

### Validación

- Actualización acotada de referencias: 10 pruebas correctas.
- Vitest: 101 archivos y 518 pruebas correctas.
- `rules:check`: correcto.
- Batería completa de navegador, sin actualizar referencias: **152 pruebas
  correctas, 5 omitidas y 0 fallos**, en 2,4 minutos. Incluye las 15 pruebas
  visuales, navegación, reservas con fixtures, responsive y accesibilidad.
- Las cinco omisiones son las pruebas opt-in de PostgreSQL/simulador de pago
  y del mapa externo; no se añadieron omisiones ni se desactivaron pruebas.
- `git diff --check`: correcto.

**Revisión visual cerrada: las 13 diferencias están resueltas.** El bloqueo
visual del punto 13 queda resuelto. Esta revisión no cambia el estado del
despliegue, la ficha de Google, los textos legales ni las propuestas de IA.
El servidor temporal se detuvo al terminar las pruebas.

Evidencia: `.local-preview/visual-review-initial.log`,
`.local-preview/visual-review-update.log`, `.local-preview/visual-review-full.log`,
`.local-preview/visual-review-unit.log`, las carpetas de resultados correspondientes
y las comparaciones de inspección `.local-preview/visual-review-*-full.png`.
