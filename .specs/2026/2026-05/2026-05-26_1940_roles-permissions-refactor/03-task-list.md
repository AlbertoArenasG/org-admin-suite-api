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

- [x] Crear entidad de dominio `Role`
  Status: done

- [x] Crear contratos de dominio para lectura y escritura de roles
  Status: done

- [x] Crear schema Mongoose para roles
  Status: done

- [x] Crear repositorios Mongoose de roles
  Status: done

- [x] Crear DTOs y mappers de roles
  Status: done

## Phase 3. Authentication And Actor Context

- [x] Redefinir el payload JWT para el nuevo modelo
  Status: done

- [x] Ajustar `AuthenticatedUserContextDto`
  Status: done

- [x] Ajustar `JwtAuthGuard` al nuevo actor context
  Status: done

- [x] Ajustar `@CurrentUser()` y el tipado de Express al nuevo `authContext`
  Status: done

- [x] Crear endpoint para consultar permisos efectivos y metadatos del rol actual del usuario autenticado
  Status: done

## Phase 4. Centralized Authorization

- [x] Crear `AuthorizationService`
  Status: done

- [x] Crear decorador para permisos requeridos por endpoint
  Status: done

- [x] Crear guard de permisos
  Status: done

- [x] Definir regla estructural especial para `MASTER_ADMIN`
  Status: done

- [x] Reemplazar `ensureAuthorized()` por el modelo centralizado de permisos y reglas estructurales
  Status: done

## Phase 5. User Management Migration

- [x] Ajustar flujo de creacion de usuario para usar `roleId`
  Status: done

- [x] Ajustar flujo de actualizacion de usuario para usar `roleId`
  Status: done

- [x] Ajustar flujo de borrado de usuario para nueva autorizacion
  Status: done

- [x] Ajustar invitaciones de usuario al nuevo modelo
  Status: done

- [x] Reemplazar `GetUserRoles` por consulta de roles asignables
  Status: done

## Phase 6. Endpoint Migration

- [x] Migrar `customer.controller` a permisos centralizados
  Status: done

- [x] Migrar `provider.controller` a permisos centralizados
  Status: done

- [x] Migrar `service-entry.controller` a permisos centralizados
  Status: done

- [x] Revisar endpoints `master-admin` para nueva regla estructural
  Status: done

- [x] Alinear endpoints nuevos y migrados al estandar de `docs/api-pipeline.md`
  Status: done

## Phase 7. Role Management Feature

- [x] Crear endpoint para listar roles
  Status: done

- [x] Crear endpoint para crear roles
  Status: done

- [x] Crear endpoint para actualizar roles
  Status: done

- [x] Crear endpoint para consultar detalle de rol
  Status: done

- [x] Crear endpoint para activar o desactivar roles
  Status: done

## Phase 8. Data Migration And Cleanup

- [x] Definir mapping de roles legacy al nuevo modelo
  Status: done

- [x] Diseñar migracion de usuarios existentes
  Status: done

- [x] Eliminar autorizacion hardcodeada residual
  Status: done

- [ ] Eliminar policies y enums legacy ya obsoletos
  Status: pending
