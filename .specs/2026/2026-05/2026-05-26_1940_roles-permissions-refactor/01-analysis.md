# Analysis

## Initiative

- Name: `roles-permissions-refactor`
- Started at: `2026-05-26 19:40:32`
- Status: `in_progress`

## Goal

Reestructurar el manejo de roles y permisos de usuarios para permitir:

- conservar solo los roles estructurales `MASTER_ADMIN`, `ADMIN` y `USER`
- crear roles personalizados
- asignar modulos a esos roles
- asignar permisos CRUD por modulo

## Current State

Hoy el sistema usa `role` como identidad y autorizacion al mismo tiempo.

Puntos principales:

- `User.role` es un enum fijo y esta embebido en el dominio.
- el JWT transporta `role` e `isMaster`
- la autorizacion vive repartida entre guards, policies y controllers
- varios controllers hardcodean listas de roles permitidos
- creacion y edicion de usuarios depende del enum actual
- el endpoint de roles disponibles tambien depende del enum actual

## Main Coupling Points

### Domain

- `src/internal/domain/entities/user.entity.ts`
- `src/internal/domain/policies/user-role.policy.ts`

### Authentication

- `src/internal/application/mappers/auth/auth-token.mapper.ts`
- `src/internal/application/dto/auth/token-payload.dto.ts`
- `src/internal/application/dto/auth/authenticated-actor.dto.ts`
- `src/internal/infra/api/guards/jwt-auth.guard.ts`

### HTTP Authorization

- `src/internal/infra/api/guards/master-scope.guard.ts`
- `src/internal/infra/api/controllers/customer/customer.controller.ts`
- `src/internal/infra/api/controllers/provider/provider.controller.ts`
- `src/internal/infra/api/controllers/service-entry/service-entry.controller.ts`
- `src/internal/infra/api/controllers/master-admin/user/master-admin-user.controller.ts`

### User Management

- `src/internal/infra/api/dto/user/create-user.request.dto.ts`
- `src/internal/infra/api/dto/user/update-user.request.dto.ts`
- `src/internal/application/use-cases/user/create-user-and-notify.use-case.ts`
- `src/internal/application/use-cases/user/update-user.use-case.ts`
- `src/internal/application/use-cases/user/delete-user.use-case.ts`
- `src/internal/application/use-cases/user/get-user-roles.use-case.ts`

## Problems In Current Design

1. El rol fijo no permite modelar permisos configurables por modulo y operacion.
2. La autorizacion esta duplicada en varias capas.
3. Cambiar permisos hoy obliga a tocar codigo.
4. El JWT esta acoplado a la semantica actual de roles.
5. La jerarquia actual por ranking de enums no escala a roles personalizados.

## Design Direction

Separar:

- rol estructural del sistema
- rol configurable de negocio
- permisos efectivos por modulo y operacion

Direccion propuesta:

- `systemRole`: `MASTER_ADMIN | ADMIN | USER`
- `roleId`: referencia obligatoria a un rol del sistema o custom, segun el `systemRole`
- `Role`: entidad configurable con permisos
- autorizacion centralizada en guard/servicio

## Risks

- romper autenticacion por cambios en JWT
- romper flujos de creacion/edicion de usuarios
- dejar reglas duplicadas si la migracion queda a medias
- migracion de datos de usuarios actuales y roles legacy

## Notes

- conviene mantener una frontera fuerte entre permisos de plataforma y permisos operativos
- no conviene seguir autorizando por nombre de rol en controllers
