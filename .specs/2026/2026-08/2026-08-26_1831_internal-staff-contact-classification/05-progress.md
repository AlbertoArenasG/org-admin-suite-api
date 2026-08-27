# Progress

## Current Phase

Implementation.

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

## Next

- Implementar el Slice 1: contratos de dominio y persistencia.
