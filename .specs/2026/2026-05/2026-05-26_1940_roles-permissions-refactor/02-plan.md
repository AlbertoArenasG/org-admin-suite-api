# Plan

## Objective

Migrar de roles fijos acoplados al usuario a un modelo con:

- `systemRole` para privilegios estructurales
- roles personalizados configurables
- permisos CRUD por modulo
- autorizacion centralizada

## Target Design

### User

- reemplazar `role` por:
  - `systemRole`
  - `roleId`

### Role

- nueva entidad persistida con:
  - `id`
  - `name`
  - `code`
  - `scope`
  - `isSystem`
  - `isImmutable`
  - `isDefault`
  - `status`
  - `permissions`
  - `createdAt`
  - `updatedAt`
  - `createdBy`
  - `updatedBy`

### Permission

- estructura basada en:
  - `module`
  - `operation`

### Authorization

- nuevo servicio central para validacion de permisos
- nuevos decorators y guards por permiso requerido
- eliminacion gradual de `ensureAuthorized()` en controllers

## Phases

### Phase 1. Authorization Model

- definir catalogo de modulos
- definir catalogo controlado de operaciones
- definir shape de permisos
- definir entidad `Role`
- definir nuevo modelo objetivo de `User`

### Phase 2. Persistence And Contracts

- crear puertos de dominio para roles
- crear schemas y repositorios Mongoose
- definir DTOs y mappers de roles

### Phase 3. Authentication And Actor Context

- redefinir payload del JWT
- redefinir contexto autenticado
- ajustar autenticacion y guards base
- evolucionar el patron existente de `authContext`, `@CurrentUser()` y tipado de Express
- agregar endpoint para consultar permisos efectivos y metadatos del rol actual del usuario autenticado

### Phase 4. Centralized Authorization

- crear `AuthorizationService`
- crear decorators de permisos
- crear guard de permisos
- conservar control estructural para `MASTER_ADMIN`
- eliminar `ensureAuthorized()` como deuda tecnica durante la migracion al modelo centralizado

### Phase 5. User Management Migration

- ajustar create user
- ajustar update user
- ajustar delete user
- ajustar invitaciones y roles asignables

### Phase 6. Endpoint Migration

- reemplazar autorizacion hardcodeada en controllers
- mover reglas al guard central
- validar endpoints master
- alinear los endpoints nuevos y migrados al estandar documentado en `docs/api-pipeline.md`

### Phase 7. Role Management Feature

- crear endpoints CRUD de roles
- exponer modulos y operaciones disponibles
- permitir asignacion de permisos

### Phase 8. Data Migration And Cleanup

- definir estrategia de migracion de usuarios legacy
- mapear roles antiguos a combinaciones nuevas
- remover enums y policies viejas cuando ya no se usen

## Sequencing Notes

- no mover controllers a permisos nuevos antes de tener listo el actor context nuevo
- no borrar el modelo viejo hasta completar migracion de usuarios e invitaciones
- priorizar compatibilidad interna hasta terminar las fases 3 a 6

## Exit Criteria

- los permisos de negocio ya no dependen de enums hardcodeados
- los controllers no contienen listas locales de roles permitidos
- el usuario tiene `systemRole` y `roleId`
- existen roles personalizados persistidos y asignables
- los catalogos `modules` y `operations` viven en Mongo y se siembran por scripts idempotentes
