# Decisiones

## Decision 01. Ownership y nombre de la capability

**Estado:** approved

Se aprueba `ROLES / READ_OPTIONS` como capability auxiliar. `ROLES` es dueño
del recurso; `USERS` y `USER_REGISTRATION_INVITATIONS` son módulos
consumidores y no deben formar parte del nombre.

## Decision 02. Contrato HTTP

**Estado:** approved

Se aprueba `GET /v1/roles/options`, no paginado, bajo el controlador del
módulo `ROLES`. Responderá el arreglo actual de opciones de rol con el envelope
de éxito estándar, sin `pagination`.

## Decision 03. Autorización y jerarquía

**Estado:** approved

La ruta usará `JwtAuthGuard` y `AuxiliaryCapabilitiesGuard` con
`@RequireAuxiliaryCapability('roles', 'READ_OPTIONS')`.

La capability se derivará para `USERS` y `USER_REGISTRATION_INVITATIONS`.
Después de aprobarse el acceso, el caso de uso aplicará la jerarquía de
`systemRole`; la capability no sustituye ni amplía las reglas estructurales.

## Decision 04. Compatibilidad temporal

**Estado:** approved

Se mantienen `GET /v1/users/roles` y `GET /v1/users/creation-roles` mientras
existan consumidores. Su retiro corresponde a una iniciativa posterior de
migración de frontend, después de adoptar el contrato backend aprobado.

## Decision 05. Reconciliación de capabilities persistidas

**Estado:** approved

Se reutiliza `system-roles.seed.ts`; no se crea migración ni reconciliador
adicional. Después de desplegar el cambio de catálogo o derivación, la persona
responsable ejecutará `npm run db:seed:roles`.

El seed recalcula las capabilities de `MASTER_ADMIN_DEFAULT`,
`ADMIN_DEFAULT` y todos los roles custom desde sus permisos directos. En roles
ya existentes solo actualiza `auxiliary_capabilities` cuando difiere y preserva
`updatedAt` y `updatedBy`.
