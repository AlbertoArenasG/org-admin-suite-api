# Implementation Breakdown

## Objetivo

Desglosar la implementación del refactor en subtareas concretas, sin convertir `03-task-list.md` en una lista demasiado ruidosa.

Este documento baja el trabajo por slices técnicos y tareas ejecutables.

## Relación con otros documentos

- `03-task-list.md`
  Lista macro por fases.
- `06-technical-design.md`
  Diseño técnico del refactor.
- `07-implementation-breakdown.md`
  Subtareas concretas para ejecutar cada slice.

## Slice 1. Roles y catálogos base

- [x] Definir estructura de carpetas para `seeds` y `migrations`
- [x] Definir runner base de seeds para Mongoose
- [x] Definir convención de contexto compartido para seeds y migrations
- [x] Definir scripts `package.json` para `db:seed` y migración de usuarios
- [x] Crear `role.entity.ts`
- [ ] Crear modelos de catálogo para `permission module` y `permission operation`
- [x] Crear enums/constantes de `SystemRole`, `RoleScope` y `RoleStatus`
- [x] Crear puertos de lectura/escritura para roles
- [x] Crear puertos de lectura para módulos y operaciones
- [x] Crear schemas Mongoose de `roles`, `permission_modules` y `permission_operations`
- [x] Crear mappers Mongoose correspondientes
- [x] Crear repositorios Mongoose correspondientes
- [x] Registrar tokens e implementaciones en `mongoose-repositories.config.ts`
- [x] Registrar schemas nuevos en `schemas.config.ts`
- [ ] Crear seeds idempotentes de módulos
- [ ] Crear seeds idempotentes de operaciones
- [ ] Crear seeds idempotentes de roles del sistema
- [ ] Crear seed de `STAFF_LEGACY`

## Slice 2. Migración del modelo User

- [ ] Redefinir entidad `User` para usar `systemRole + roleId`
- [ ] Eliminar dependencia runtime a `UserRole`
- [ ] Ajustar schema Mongoose de `user`
- [ ] Ajustar mapper Mongoose de `user`
- [ ] Ajustar repositorios de lectura/escritura de `user`
- [ ] Agregar queries necesarias por `systemRole` y `roleId`
- [ ] Ajustar DTOs de application relacionados con usuario
- [ ] Ajustar presenters de usuario al nuevo modelo

## Slice 3. JWT, auth context y autenticación

- [ ] Redefinir `AuthTokenPayloadDto`
- [ ] Ajustar `AuthTokenMapper`
- [ ] Ajustar `AuthTokenService`
- [ ] Redefinir `AuthenticatedUserContextDto`
- [ ] Ajustar `JwtAuthGuard`
- [ ] Ajustar `@CurrentUser()`
- [ ] Ajustar `types/express/index.d.ts`
- [ ] Ajustar `MasterScopeGuard` o eliminarlo si queda absorbido por el nuevo modelo
- [ ] Crear endpoint `me/permissions`
- [ ] Crear presenter/DTO para respuesta de permisos efectivos

## Slice 4. Servicio de autorización centralizado

- [ ] Crear `AuthorizationService`
- [ ] Crear decorator de permisos requeridos
- [ ] Crear guard de permisos
- [ ] Modelar reglas estructurales de `MASTER_ADMIN`
- [ ] Modelar reglas estructurales de `ADMIN`
- [ ] Resolver permisos efectivos desde `roleId`
- [ ] Soportar validación de roles del sistema vs roles custom

## Slice 5. CRUD de roles

- [ ] Crear DTO request para crear rol
- [ ] Crear DTO request para actualizar rol
- [ ] Crear DTO request para listar roles
- [ ] Crear DTO request para activar/desactivar rol
- [ ] Crear presenters de roles
- [ ] Crear commands/queries CQRS para roles
- [ ] Crear handlers CQRS de roles
- [ ] Crear use cases de roles
- [ ] Crear controllers HTTP de roles
- [ ] Crear endpoints de catálogo de módulos y operaciones

## Slice 6. Migración de usuarios e invitaciones

- [ ] Ajustar create user
- [ ] Ajustar create master user
- [ ] Ajustar update user
- [ ] Ajustar update my profile
- [ ] Ajustar delete user
- [ ] Reemplazar `GetUserRoles` por consulta de roles asignables
- [ ] Ajustar create user registration invitation
- [ ] Ajustar create master user registration invitation
- [ ] Ajustar complete invitation
- [ ] Ajustar queries de usuario que hoy dependen de `isMaster` o `role`

## Slice 7. Migración de controllers a autorización centralizada

- [ ] Migrar `user.controller`
- [ ] Migrar `customer.controller`
- [ ] Migrar `provider.controller`
- [ ] Migrar `service-entry.controller`
- [ ] Revisar `file.controller`
- [ ] Revisar `service-package.controller`
- [ ] Revisar `master-admin/*`
- [ ] Eliminar `ensureAuthorized()` donde exista
- [ ] Reemplazar checks hardcodeados por decorators/guards

## Slice 8. Migración de datos

- [ ] Diseñar script o rutina de migración de usuarios legacy
- [ ] Diseñar modo `--dry-run` para la migración de usuarios
- [ ] Diseñar modo `--apply` para la migración real
- [ ] Definir comando de ejecución del script de migración
- [ ] Definir formato de reporte de `dry-run` y `apply`
- [ ] Definir queries de verificación previa y posterior
- [ ] Mapear `MASTER_ADMIN` actual a nuevo modelo
- [ ] Mapear `ADMIN` actual a nuevo modelo
- [ ] Mapear `STAFF` actual a `USER + STAFF_LEGACY`
- [ ] Validar que no existan `CUSTOMER` ni `MASTER_STAFF` reales antes de ejecutar migración
- [ ] Verificar existencia previa de `MASTER_ADMIN_DEFAULT`, `ADMIN_DEFAULT` y `STAFF_LEGACY`
- [ ] Ejecutar validaciones posteriores de integridad sobre `system_role` y `role_id`
- [ ] Verificar integridad de `roleId` en todos los usuarios

## Slice 9. Limpieza final

- [ ] Eliminar enums legacy de roles que queden obsoletos
- [ ] Eliminar policies legacy que ya no apliquen
- [ ] Eliminar código muerto de autorización previa
- [ ] Revisar i18n de enums/roles/estados
- [ ] Revisar documentación interna alineada al modelo final

## Orden sugerido de ejecución

1. Slice 1
2. Slice 2
3. Slice 3
4. Slice 4
5. Slice 5
6. Slice 6
7. Slice 7
8. Slice 8
9. Slice 9

## Regla de uso

- Este documento se puede ir refinando mientras avancemos.
- `03-task-list.md` conserva la vista macro.
- Aquí vive el detalle operativo por slice.
