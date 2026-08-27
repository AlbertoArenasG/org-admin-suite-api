# Progress

## Current Phase

Completed.

## Completed

- Se creo la spec.
- Se separo conceptualmente pertenencia interna de relaciones con Clientes.
- Se aprobo `is_internal_staff` como fuente de verdad de clasificacion de contactos de Usuarios.
- Se aprobo que `company_names` de Contactos vinculados represente exclusivamente Clientes relacionados.
- Se aprobo que la propiedad aplique a todos los roles y fronteras, incluido `MASTER_ADMIN`.
- Se aprobo la migracion temporal que normaliza los datos existentes como internos y debe eliminarse despues de validarse.
- Se aprobo que las invitaciones `USER` requieran el valor y que `ADMIN` y `MASTER_ADMIN` se materialicen siempre como internos.
- Se aprobo que `PATCH /v1/users/:userId` conserve el valor de pertenencia interna cuando se omite.
- Se aprobo materializar `is_internal_staff` en `Contact` y bloquear toda edicion administrativa de contactos vinculados a Usuarios.
- Se aprobo centralizar la escritura de contactos vinculados en `SyncUserContactService`, con sincronizacion integral o limitada a `company_names` segun el evento.
- Se aprobaron los contratos protegidos, las excepciones obligatorias para `ADMIN` y `MASTER_ADMIN`, y la migracion temporal de Usuarios, Invitaciones y Contactos.
- Se aprobo el diseno de sincronizacion, persistencia y validacion contra el rol final.
- Se cerro formalmente el diseno tecnico, incluida la migracion temporal sin timestamps ni resolucion de relaciones.
- Se implemento `is_internal_staff` obligatorio en Usuario, Contacto e Invitacion, con validacion centralizada respecto al rol final.
- Se ajustaron los contratos protegidos y se excluyo la propiedad de las respuestas publicas de registro.
- Se centralizo la sincronizacion de contactos vinculados en `SyncUserContactService`; la sincronizacion por relacion o Cliente actualiza exclusivamente `company_names` sin auditoria tecnica.
- Se retiro la inferencia basada en `ICSACV` y los filtros de Contactos ahora usan la bandera materializada.
- Se actualizo el seed de contactos desde Usuarios y se agrego la migracion temporal con `dry-run`, `apply` e integridad.
- Se actualizaron los handoffs frontend, el catalogo de permisos y la coleccion Postman.
- Se ejecuto y valido manualmente la migracion temporal; el script y sus comandos fueron retirados del repositorio.
- Se validaron manualmente los flujos y contratos en Postman.
- Se cerro formalmente la spec.

## Next

- No hay tareas pendientes.
