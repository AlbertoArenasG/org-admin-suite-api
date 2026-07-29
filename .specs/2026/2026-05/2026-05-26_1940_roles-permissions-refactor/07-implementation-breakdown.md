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
- [x] Implementar runner base de seeds para Mongoose
- [x] Implementar contexto compartido de ejecución para seeds
- [x] Registrar script `db:seed` en `package.json`
- [x] Crear `role.entity.ts`
- [x] Crear modelos de catálogo para `permission module` y `permission operation`
- [x] Crear enums/constantes de `SystemRole`, `RoleScope` y `RoleStatus`
- [x] Crear puertos de lectura/escritura para roles
- [x] Crear puertos de lectura para módulos y operaciones
- [x] Crear schemas Mongoose de `roles`, `permission_modules` y `permission_operations`
- [x] Crear mappers Mongoose correspondientes
- [x] Crear repositorios Mongoose correspondientes
- [x] Registrar tokens e implementaciones en `mongoose-repositories.config.ts`
- [x] Registrar schemas nuevos en `schemas.config.ts`
- [x] Crear seeds idempotentes de módulos
- [x] Crear seeds idempotentes de operaciones
- [x] Crear seeds idempotentes de roles del sistema
- [x] Crear seed de `STAFF_LEGACY`

## Slice 2. Migración del modelo User

- [x] Redefinir entidad `User` para usar `systemRole + roleId`
- [x] Eliminar dependencia runtime a `UserRole`
- [x] Ajustar schema Mongoose de `user`
- [x] Ajustar mapper Mongoose de `user`
- [x] Ajustar repositorios de lectura/escritura de `user`
- [x] Agregar queries necesarias por `systemRole` y `roleId`
- [x] Ajustar DTOs de application relacionados con usuario
- [x] Ajustar presenters de usuario al nuevo modelo

## Slice 3. JWT, auth context y autenticación

- [x] Redefinir `AuthTokenPayloadDto`
- [x] Ajustar `AuthTokenMapper`
- [x] Ajustar `AuthTokenService`
- [x] Redefinir `AuthenticatedUserContextDto`
- [x] Ajustar `JwtAuthGuard`
- [x] Ajustar `@CurrentUser()`
- [x] Ajustar `types/express/index.d.ts`
- [x] Reducir `AuthenticatedUserContextDto` a shape mínimo sin `role` ni `isMaster`
- [x] Ajustar `MasterScopeGuard` o eliminarlo si queda absorbido por el nuevo modelo
- [x] Crear endpoint `me/permissions`
- [x] Crear presenter/DTO para respuesta de permisos efectivos
- [x] Separar endpoints self-service `users/me` del catálogo `USERS/*`

## Slice 4. Servicio de autorización centralizado

- [x] Crear `AuthorizationService`
- [x] Crear decorator de permisos requeridos
- [x] Crear guard de permisos
- [x] Modelar reglas estructurales de `MASTER_ADMIN`
- [x] Modelar reglas estructurales de `ADMIN`
- [x] Resolver permisos efectivos desde `roleId`
- [x] Soportar validación de roles del sistema vs roles custom

## Slice 5. CRUD de roles

- [x] Crear DTO request para crear rol
- [x] Crear DTO request para actualizar rol
- [x] Crear DTO request para listar roles
- [x] Crear DTO request para activar/desactivar rol
- [x] Crear presenters de roles
- [x] Crear commands/queries CQRS para roles
- [x] Crear handlers CQRS de roles
- [x] Crear use cases de roles
- [x] Crear controllers HTTP de roles
- [x] Bloquear mutaciones de roles del sistema e inmutables en el CRUD ordinario
- [x] Bloquear eliminación de roles con usuarios vinculados
- [x] Crear endpoints de catálogo de módulos y operaciones
- [x] Migrar catálogo de permisos desde Mongo a código
- [x] Definir catálogo en código con `code` en mayúsculas y `nameKey` para i18n
- [x] Reemplazar queries de `modules` y `operations` por lectura desde código
- [x] Marcar como obsoleta la infraestructura Mongo de `permission_modules` y `permission_operations`

## Slice 6. Migración de usuarios e invitaciones

- [x] Ajustar create user
- [x] Ajustar create master user
- [x] Ajustar update user
- [x] Ajustar update my profile
- [x] Ajustar delete user
- [x] Reemplazar `GetUserRoles` por consulta de roles asignables
- [x] Ajustar create user registration invitation
- [x] Ajustar create master user registration invitation
- [x] Ajustar complete invitation
- [x] Cerrar contrato HTTP de entrada de usuarios e invitaciones a `system_role + role_id`
- [x] Ajustar queries de usuario que hoy mezclaban filtros por `role` y `system_role`
- [x] Ajustar queries de usuario que hoy dependen de `isMaster` o `role`

## Slice 7. Migración de controllers a autorización centralizada

- [x] Migrar `user.controller`
- [x] Migrar `customer.controller`
- [x] Migrar `provider.controller`
- [x] Migrar `service-entry.controller`
- [x] Revisar `file.controller`
- [x] Revisar `service-package.controller`
- [x] Revisar `master-admin/*`
- [x] Eliminar `ensureAuthorized()` donde exista
- [x] Reemplazar checks hardcodeados por decorators/guards

## Slice 8. Migración de datos

- [x] Diseñar script o rutina de migración de usuarios legacy
- [x] Diseñar modo `--dry-run` para la migración de usuarios
- [x] Diseñar modo `--apply` para la migración real
- [x] Definir comando de ejecución del script de migración
- [x] Definir formato de reporte de `dry-run` y `apply`
- [x] Definir queries de verificación previa y posterior
- [x] Mapear `MASTER_ADMIN` actual a nuevo modelo
- [x] Mapear `ADMIN` actual a nuevo modelo
- [x] Mapear `STAFF` actual a `USER + STAFF_LEGACY`
- [x] Validar que no existan `CUSTOMER` ni `MASTER_STAFF` reales antes de ejecutar migración
- [x] Verificar existencia previa de `MASTER_ADMIN_DEFAULT`, `ADMIN_DEFAULT` y `STAFF_LEGACY`
- [x] Ejecutar validaciones posteriores de integridad sobre `system_role` y `role_id`
- [x] Verificar integridad de `roleId` en todos los usuarios
- [x] Definir que `role_id` canónico será igual a `code`
- [x] Implementar migración de `roles.role_id -> roles.code`
- [x] Implementar migración de referencias `users.role_id` hacia `code`
- [x] Agregar compatibilidad temporal de lectura por `role_id | code`
- [x] Ejecutar `dry-run` y `apply` de la migración `role_id == code`

## Slice 9. Limpieza final

- [ ] Eliminar enums legacy de roles que queden obsoletos
- [x] Eliminar policies legacy que ya no apliquen
- [x] Eliminar código muerto de autorización previa
- [ ] Revisar i18n de enums/roles/estados
- [x] Revisar documentación interna alineada al modelo final

## Bloqueadores De Cierre Del Spec

Este spec no se puede cerrar mientras siga existiendo compatibilidad legacy efectiva en runtime o en contratos públicos internos relacionados con autorización y usuarios.

- [ ] Eliminar `UserRole` legacy del dominio y cualquier helper de compatibilidad derivado desde `systemRole`
- [ ] Eliminar persistencia/lectura derivada del campo legacy `role` en usuarios donde ya no sea estrictamente necesaria para migración
- [ ] Eliminar `role` y `role_name` legacy de responses de invitaciones y alinear su presenter al contrato final
- [ ] Revisar DTOs, mappers y repositorios que todavía cargan `role` como campo de transición
- [ ] Limpiar referencias residuales a `MASTER_STAFF`, `CUSTOMER` y `STAFF` que solo sobreviven por herencia del modelo anterior
- [ ] Revisar i18n final de enums, roles y estados para retirar nombres legacy ya sin uso

### Inventario Exacto Del Legacy Restante

#### Dominio de usuario

- [x] `src/internal/domain/entities/user.entity.ts`
  - eliminar enum `UserRole`
  - eliminar `resolveSystemRoleFromLegacyRole(...)`
  - eliminar `resolveCompatibilityLegacyRole(...)`

#### Persistencia de usuarios

- [x] `src/internal/infra/persistence/mongoose/schemas/user/user.schema.ts`
  - retirar campo `role`
  - dejar schema alineado solo a `system_role + role_id`
- [x] `src/internal/infra/persistence/mongoose/mappers/user/mongoose-user.mapper.ts`
  - dejar de leer fallback desde `userDocument.role`
  - dejar de persistir `role` derivado
- [ ] `src/internal/infra/persistence/mongoose/repositories/user/*`
  - revisar filtros, sorts y mapeos que todavía mencionan `role`

#### Invitaciones de usuario

- [ ] `src/internal/domain/ports/repositories/user-registration-invitation/user-registration-invitation.types.ts`
  - retirar `role` del record persistido
- [ ] `src/internal/application/dto/user-registration-invitation/*.ts`
  - retirar `role` de DTOs de salida si ya no es parte del contrato final
- [ ] `src/internal/application/mappers/user-registration-invitation/user-registration-invitation.mapper.ts`
  - eliminar propagación de `role` legacy
- [ ] `src/internal/infra/persistence/mongoose/schemas/user-registration-invitation/user-registration-invitation.schema.ts`
  - evaluar retiro del campo `role`
- [ ] `src/internal/infra/persistence/mongoose/mappers/user-registration-invitation/mongoose-user-registration-invitation.mapper.ts`
  - eliminar fallback desde `document.role`
  - eliminar `resolveLegacyInvitationRoleId(...)`
  - dejar persistencia y lectura nativas solo con `system_role + role_id`
- [ ] `src/internal/infra/api/presenters/user-registration-invitation/user-registration-invitation.presenter.ts`
  - retirar `role`
  - retirar `role_name` legacy basado en enum

#### Autorización y compatibilidad temporal

- [ ] `src/internal/application/services/authz/authorization.service.ts`
  - retirar fallback `allowLegacyUserRoleFallback` si ya no queda runtime legacy que lo necesite
- [ ] `src/internal/application/use-cases/user-registration-invitation/*`
  - revisar creación y consumo de invitaciones para dejar de derivar `role` legacy

#### Migraciones y scripts

- [ ] `src/internal/infra/persistence/mongoose/migrations/migrate-users-to-system-role-and-role-id.ts`
  - conservar solo como artefacto histórico si sigue aportando valor operativo
  - si se mantiene, dejar explícito que es script histórico post-ejecución y no dependencia runtime
- [ ] `src/internal/infra/persistence/mongoose/migrations/migrate-role-ids-to-code.ts`
  - misma revisión documental/operativa

#### i18n y documentación residual

- [ ] `src/internal/infra/i18n/locales/*/enums.json`
  - retirar `MASTER_STAFF`, `CUSTOMER`, `STAFF` si ya no tienen uso real
- [ ] `docs/frontend/roles-permissions-refactor-handoff.md`
  - retirar notas de compatibilidad temporal una vez eliminado el legacy real
- [ ] `docs/authorization/authorization-rules.md`
  - alinear el documento al estado final sin fallback legacy

## Pendientes Tras Integración Frontend

Tras las pruebas de integración frontend/backend y antes de cerrar el spec:

- [ ] Ejecutar una ronda final de QA manual con `MASTER_ADMIN`, `ADMIN` y `USER`
- [ ] Validar al menos `GET /v1/auth/me/permissions`, `GET /v1/roles`, `GET /v1/users/me`, CRUD de roles custom y creación/edición de usuarios con `system_role + role_id`
- [ ] Revisar si durante la integración frontend aparecieron ajustes de contrato backend pendientes
- [ ] Actualizar `docs/frontend/roles-permissions-refactor-handoff.md` con cualquier cambio real de integración detectado en pruebas
- [ ] Eliminar enums legacy de roles que ya no tengan uso real en runtime
- [ ] Revisar referencias residuales al modelo legacy `role` en DTOs, compatibilidad temporal y documentación
- [ ] Evaluar si ya se puede retirar más compatibilidad temporal de persistencia o de contratos internos
- [ ] Revisar i18n final de catálogos, nombres de permisos, roles y estados
- [ ] Cerrar el spec únicamente después de eliminar el legacy restante y dejar alineados task list, progress y breakdown al estado final

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
