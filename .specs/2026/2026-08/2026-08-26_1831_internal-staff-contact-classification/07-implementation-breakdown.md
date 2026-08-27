# Implementation Breakdown

## Slice 1. Domain And Persistence Contracts

- Agregar `isInternalStaff` a entidades, DTOs base, puertos, schemas y mappers de Usuario, Contacto e Invitacion.
- Incorporar la politica de dominio que valida la clasificacion contra el rol final.

## Slice 2. Invitation And User Flows

- Ajustar creacion y consumo de invitaciones de aplicacion y master.
- Ajustar actualizacion administrativa de Usuario y actualizacion de perfil cuando corresponda.
- Separar presenters protegidos de detalle y coleccion de las respuestas publicas.

## Slice 3. Contact Synchronization

- Centralizar los disparadores en `SyncUserContactService`.
- Reutilizar el resolver actual de Clientes para materializar exclusivamente `company_names` de Contactos vinculados.
- Ajustar relaciones Usuario-Cliente y cambios de Cliente para sincronizar solo empresas sin auditoria tecnica.
- Permitir clasificacion explicita exclusivamente en Contactos manuales.
- Ajustar el seed `contacts-from-users` a la nueva clasificacion y derivacion.

## Slice 4. Migration And Documentation

- Crear migracion temporal con `dry-run`, aplicacion y verificacion.
- Documentar el comando y escenarios de validacion manual.
- Actualizar los documentos de API relevantes.
- El usuario ejecuta y valida la migracion; despues se elimina la migracion temporal.
