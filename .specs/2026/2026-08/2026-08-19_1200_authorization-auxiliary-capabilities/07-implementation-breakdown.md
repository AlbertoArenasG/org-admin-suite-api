# Implementation Breakdown

## Slice 1. Definition Closure

- Estado: completed
- Objetivo:
  - cerrar el modelo conceptual y la primera frontera de esta nueva capa auxiliar

## Slice 2. Technical Design Closure

- Estado: completed
- Objetivo:
  - aterrizar el diseño mínimo para persistencia, derivación y enforcement HTTP

## Slice 3. Core Role Model And Auxiliary Authz Layer

- Estado: completed
- Objetivo:
  - introducir la nueva capa en dominio, persistencia y servicios de autorización auxiliares

- Archivos principales:
  - `src/internal/domain/entities/role.entity.ts`
  - `src/internal/infra/persistence/mongoose/schemas/role/role.schema.ts`
  - `src/internal/infra/persistence/mongoose/mappers/role/mongoose-role.mapper.ts`
  - `src/internal/application/services/authz/auxiliary-capabilities/auxiliary-capabilities.types.ts`
  - `src/internal/application/services/authz/auxiliary-capabilities/auxiliary-capabilities.catalog.ts`
  - `src/internal/application/services/authz/auxiliary-capabilities/auxiliary-capabilities-derivation.catalog.ts`
  - `src/internal/application/services/authz/auxiliary-capabilities/auxiliary-capabilities.service.ts`

- Entregables:
  - `Role` soporta `auxiliaryCapabilities[]`
  - schema y mapper persisten el nuevo campo
  - existe catálogo maestro inicial
  - existe mapa inicial de derivación
  - existe validación de integridad al arranque

## Slice 4. Role Mutation Integration

- Estado: completed
- Objetivo:
  - integrar derivación automática en creación y actualización de roles

- Archivos principales:
  - `src/internal/application/use-cases/role/create-role.use-case.ts`
  - `src/internal/application/use-cases/role/update-role.use-case.ts`

- Entregables:
  - `create-role` deriva y persiste `auxiliaryCapabilities[]`
  - `update-role` recalcula desde cero y reemplaza completo `auxiliaryCapabilities[]`
  - no hay merge incremental

## Slice 4.a. System Roles Seeder Update

- Estado: pending
- Objetivo:
  - sincronizar también `auxiliaryCapabilities[]` en roles del sistema ya existentes en base de datos

- Archivos principales:
  - `src/internal/infra/persistence/mongoose/seeds/roles/system-roles.seed.ts`
  - `src/internal/infra/persistence/mongoose/seeds/roles/index.ts`
  - opcionalmente documentación relacionada con seeds si requiere ajuste

- Alcance explícito:
  - `MASTER_ADMIN_DEFAULT`
  - `ADMIN_DEFAULT`

- Fuera de foco para esta spec:
  - actualizar `STAFF_LEGACY`
  - sincronizar roles custom existentes en base de datos
  - `legacy-staff-role.seed.ts` como pieza principal de actualización

- Aclaración operativa:
  - "fuera de foco" significa no borrar, no recrear, no mutar y no sincronizar esos roles

- Entregables:
  - el seed de roles del sistema recalcula también `auxiliaryCapabilities[]`
  - el seed sigue siendo idempotente
  - el seed ignora `STAFF_LEGACY`
  - el seed ignora cualquier rol custom ya existente
  - la sincronización de roles existentes ya no depende de recrear documentos manualmente

## Slice 5. HTTP Enforcement Layer

- Estado: pending
- Objetivo:
  - introducir decorator y guard específicos para `auxiliary capabilities`

- Archivos principales:
  - `src/common/decorators/auxiliary-capabilities.decorator.ts`
  - `src/internal/infra/api/guards/auxiliary-capabilities.guard.ts`
  - módulo DI donde deban registrarse estas piezas

- Entregables:
  - existe metadata específica para `auxiliary capabilities`
  - existe guard separado de `PermissionsGuard`
  - el guard resuelve actor, rol efectivo y capabilities derivadas persistidas

## Slice 6. Endpoint Migration

- Estado: pending
- Objetivo:
  - migrar los endpoints reutilizables iniciales al nuevo enforcement

- Endpoints a migrar:
  - `GET /v1/contacts/search`
  - `GET /v1/communication-channels`
  - `GET /v1/expiration-status-policies/options`
  - `GET /v1/expiration-notification-policies/options`

- Endpoints que deben permanecer bajo `module + operation`:
  - `GET /v1/roles/modules`
  - `GET /v1/users/roles`
  - `GET /v1/expiration-status-policies/catalog`
  - `GET /v1/expiration-notification-policies/catalog`

- Entregables:
  - los endpoints reutilizables iniciales ya no dependen de permisos administrativos completos del módulo proveedor
  - los auxiliares locales permanecen con su frontera funcional vigente

## Slice 7. Validation And Documentation

- Estado: pending
- Objetivo:
  - validar flujo end-to-end y dejar continuidad documentada

- Entregables:
  - pruebas/manual validation de create/update role con derivación
  - validación de acceso correcto a endpoints migrados
  - ejecución real de `npm run db:seed`
  - verificación en base de datos de que `MASTER_ADMIN_DEFAULT` y `ADMIN_DEFAULT` quedaron actualizados correctamente
  - actualización de docs técnicas necesarias
  - handoff en `docs/frontend` aclarando que frontend no consume esta capa por ahora
