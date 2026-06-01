# Persistencia

## Proposito

Esta carpeta define el diseno de persistencia planificado para JimBoats.

Estos documentos describen tablas, relaciones, restricciones e indices que
deberian existir en PostgreSQL cuando implementemos los adapters Prisma. No son
el modelo de dominio y no sustituyen a los documentos de `docs/modules`.

La regla principal es que PostgreSQL y Prisma guardan estado tecnico. Las reglas
de negocio siguen viviendo en dominio y aplicacion.

## Mapa De Esquemas

- [Convenciones](conventions.md)
- [Experience Catalog](experience-catalog.schema.md)
- [Localization SEO](localization-seo.schema.md)
- [Media](media.schema.md)
- [Booking Calendar](booking-calendar.schema.md)
- [Payments And Cancellations](payments-cancellations.schema.md)
- [Notifications And Backpanel](notifications-backpanel.schema.md)
- [Contact](contact.schema.md)

## Orden Recomendado

1. Experience Catalog, Localization SEO y Media.
2. Booking Calendar.
3. Payments And Cancellations.
4. Notifications And Backpanel.
5. Contact.

Este orden permite conectar primero el backpanel configurable, despues la
disponibilidad real y finalmente los flujos operativos.

## Reglas

- Todo importe se guarda en unidades menores enteras.
- Todo contenido publicable por idioma usa filas explicitas por locale.
- No se guarda media binaria en PostgreSQL.
- Los slugs publicos son unicos por locale y alcance de ruta.
- Las reservas guardan snapshots de precio y datos comerciales.
- Los cambios operativos sensibles deben quedar auditados.
- Las migraciones Prisma se crearan despues de aprobar este diseno.
