# Task List

## Phase 1. Authorization Model

- [x] Definir la ubicación permanente del catálogo funcional de features y permisos
  Status: done

- [x] Definir el catalogo inicial de modulos del sistema
  Status: done

- [x] Definir el catalogo inicial de operaciones permitidas por modulo
  Status: done

- [x] Diseñar el shape final de `Role.permissions`
  Status: done

- [x] Diseñar el shape final de `User.systemRole` y `User.roleId`
  Status: done

- [x] Diseñar el shape final de la entidad `Role`
  Status: done

- [x] Aterrizar el catálogo funcional vivo en `docs/authorization/feature-permission-catalog.md`
  Status: done

- [x] Mapear el catálogo funcional contra los controllers reales del repo
  Status: done

## Phase 2. Persistence And Contracts

- [x] Definir estructura técnica para `seeds` y `migrations`
  Status: done

- [ ] Crear contratos de dominio para lectura y escritura de roles
  Status: pending

- [ ] Crear entidad de dominio `Role`
  Status: pending

- [ ] Crear schema Mongoose para roles
  Status: pending

- [ ] Crear repositorios Mongoose de roles
  Status: pending

- [ ] Crear DTOs y mappers de roles
  Status: pending

## Phase 3. Authentication And Actor Context

- [ ] Redefinir el payload JWT para el nuevo modelo
  Status: pending

- [ ] Ajustar `AuthenticatedUserContextDto`
  Status: pending

- [ ] Ajustar `JwtAuthGuard` al nuevo actor context
  Status: pending

- [ ] Ajustar `@CurrentUser()` y el tipado de Express al nuevo `authContext`
  Status: pending

- [ ] Crear endpoint para consultar permisos efectivos y metadatos del rol actual del usuario autenticado
  Status: pending

## Phase 4. Centralized Authorization

- [ ] Crear `AuthorizationService`
  Status: pending

- [ ] Crear decorador para permisos requeridos por endpoint
  Status: pending

- [ ] Crear guard de permisos
  Status: pending

- [ ] Definir regla estructural especial para `MASTER_ADMIN`
  Status: pending

- [ ] Reemplazar `ensureAuthorized()` por el modelo centralizado de permisos y reglas estructurales
  Status: pending

## Phase 5. User Management Migration

- [ ] Ajustar flujo de creacion de usuario para usar `roleId`
  Status: pending

- [ ] Ajustar flujo de actualizacion de usuario para usar `roleId`
  Status: pending

- [ ] Ajustar flujo de borrado de usuario para nueva autorizacion
  Status: pending

- [ ] Ajustar invitaciones de usuario al nuevo modelo
  Status: pending

- [ ] Reemplazar `GetUserRoles` por consulta de roles asignables
  Status: pending

## Phase 6. Endpoint Migration

- [ ] Migrar `customer.controller` a permisos centralizados
  Status: pending

- [ ] Migrar `provider.controller` a permisos centralizados
  Status: pending

- [ ] Migrar `service-entry.controller` a permisos centralizados
  Status: pending

- [ ] Revisar endpoints `master-admin` para nueva regla estructural
  Status: pending

- [ ] Alinear endpoints nuevos y migrados al estandar de `docs/api-pipeline.md`
  Status: pending

## Phase 7. Role Management Feature

- [ ] Crear endpoint para listar roles
  Status: pending

- [ ] Crear endpoint para crear roles
  Status: pending

- [ ] Crear endpoint para actualizar roles
  Status: pending

- [ ] Crear endpoint para consultar detalle de rol
  Status: pending

- [ ] Crear endpoint para activar o desactivar roles
  Status: pending

## Phase 8. Data Migration And Cleanup

- [ ] Definir mapping de roles legacy al nuevo modelo
  Status: pending

- [ ] Diseñar migracion de usuarios existentes
  Status: pending

- [ ] Eliminar autorizacion hardcodeada residual
  Status: pending

- [ ] Eliminar policies y enums legacy ya obsoletos
  Status: pending
