# Technical Design

## Objective

Aterrizar una implementación mínima y uniforme de `auxiliary capabilities` en backend, reutilizando los patrones actuales de:

- `Role`
- `PermissionsGuard`
- decorators HTTP
- catálogo de autorización en `authz`

sin mezclar esta nueva capa con `permissions[]`.

## Existing Integration Points

Piezas actuales ya confirmadas en código:

- entidad:
  - `src/internal/domain/entities/role.entity.ts`
- schema mongoose:
  - `src/internal/infra/persistence/mongoose/schemas/role/role.schema.ts`
- mapper de aplicación:
  - `src/internal/application/mappers/role/role.mapper.ts`
- mapper mongoose:
  - `src/internal/infra/persistence/mongoose/mappers/role/mongoose-role.mapper.ts`
- casos de uso:
  - `src/internal/application/use-cases/role/create-role.use-case.ts`
  - `src/internal/application/use-cases/role/update-role.use-case.ts`
- autorización funcional vigente:
  - `src/internal/application/services/authz/authorization.service.ts`
  - `src/internal/infra/api/guards/permissions.guard.ts`
  - `src/common/decorators/permissions.decorator.ts`

## Approved Target Structure

### Authz

```text
src/internal/application/services/authz/
  authorization.catalog.ts
  authorization-operations.catalog.ts
  authorization.service.ts
  auxiliary-capabilities/
    auxiliary-capabilities.catalog.ts
    auxiliary-capabilities-derivation.catalog.ts
    auxiliary-capabilities.types.ts
    auxiliary-capabilities.service.ts
```

### HTTP enforcement

```text
src/common/decorators/
  permissions.decorator.ts
  auxiliary-capabilities.decorator.ts

src/internal/infra/api/guards/
  permissions.guard.ts
  auxiliary-capabilities.guard.ts
```

## Domain And Persistence Shape

### Role entity

Se agregará un nuevo value shape en dominio:

```ts
interface RoleAuxiliaryCapabilityProps {
  module: string;
  capability: string;
}
```

`RoleProps` crecerá con:

```ts
auxiliaryCapabilities?: RoleAuxiliaryCapabilityProps[];
```

La entidad `Role` deberá:

- normalizar unicidad del par `module + capability`
- exponer getter `auxiliaryCapabilities`
- exponer método de reemplazo completo
- conservar intacta la lógica actual de `permissions`

Patrón esperado:

- `replacePermissions(...)`
- `replaceAuxiliaryCapabilities(...)`

### Role schema

`RoleDocument` crecerá con:

```ts
auxiliary_capabilities: Array<{
  module: string;
  capability: string;
}>
```

Reglas:

- `default: []`
- sin exposición especial adicional en schema
- mismo documento `roles`

### Mappers

#### MongooseRoleMapper

Debe mapear ambos sentidos:

- `document.auxiliary_capabilities -> role.auxiliaryCapabilities`
- `role.auxiliaryCapabilities -> auxiliary_capabilities`

#### RoleMapper

Por decisión aprobada, no expondrá `auxiliaryCapabilities` en `RoleViewDto` por ahora.

Entonces:

- la entidad y persistencia sí conocerán el campo
- los DTO/presenters ordinarios seguirán sin mostrarlo

## Auxiliary Catalog Layer

### `auxiliary-capabilities.types.ts`

Debe declarar, al menos:

- `AuxiliaryCapability`
- `AuxiliaryCapabilityCatalogEntry`
- `AuxiliaryCapabilityDerivationRule`

Shapes base:

```ts
type AuxiliaryCapability = {
  module: string;
  capability: string;
};

type AuxiliaryCapabilityCatalogEntry = {
  module: string;
  capability: string;
  description: string;
};

type AuxiliaryCapabilityDerivationRule = {
  consumerModule: string;
  auxiliaryCapabilities: AuxiliaryCapability[];
};
```

### `auxiliary-capabilities.catalog.ts`

Debe exportar el catálogo maestro inicial exacto:

- `CONTACTS + SEARCH`
- `COMMUNICATION_CHANNELS + READ_OPTIONS`
- `EXPIRATION_STATUS_POLICIES + READ_OPTIONS`
- `EXPIRATION_NOTIFICATION_POLICIES + READ_OPTIONS`

### `auxiliary-capabilities-derivation.catalog.ts`

Debe exportar el mapa inicial exacto:

- `RECIPIENT_GROUPS`
  - `CONTACTS + SEARCH`
  - `COMMUNICATION_CHANNELS + READ_OPTIONS`
- `INTERNAL_ASSET_MAINTENANCE_RECORDS`
  - `EXPIRATION_STATUS_POLICIES + READ_OPTIONS`
  - `EXPIRATION_NOTIFICATION_POLICIES + READ_OPTIONS`

## AuxiliaryCapabilitiesService

Responsabilidades esperadas:

1. normalizar capabilities
2. deduplicar por `module + capability`
3. derivar capabilities desde una lista de `permissions`
4. validar integridad entre catálogo y mapa
5. resolver si un actor tiene o no una auxiliary capability

API conceptual mínima:

```ts
validateConfiguration(): void;
deriveFromPermissions(
  permissions: Array<{ module: string; operation: string }>,
): AuxiliaryCapability[];
hasCapability(
  capabilities: AuxiliaryCapability[],
  module: string,
  capability: string,
): boolean;
```

Regla de derivación:

- si existe al menos un permiso directo cuyo `module` coincide con `consumerModule`
- se derivan todas las capabilities configuradas para ese módulo consumidor

## Validation At Startup

La validación aprobada debe ejecutarse al arrancar la app.

Debe garantizar:

1. toda capability del mapa exista en el catálogo
2. no existan duplicados inválidos en catálogo
3. no existan duplicados inválidos en reglas derivadas ya normalizadas

No hace falta revalidar esa integridad en cada `create-role` o `update-role`.

La implementación concreta puede resolverse:

- dentro del constructor/init del `AuxiliaryCapabilitiesService`, o
- mediante un hook de inicialización del provider

Lo importante es que falle temprano.

## Role Mutation Flow

### `CreateRoleUseCase`

Flujo esperado:

1. normalizar `permissions`
2. derivar `auxiliaryCapabilities` desde esas `permissions`
3. construir `Role` con ambos arreglos
4. persistir

### `UpdateRoleUseCase`

Flujo esperado:

1. cargar role
2. si `permissions` viene en input:
   - normalizar `permissions`
   - recalcular desde cero `auxiliaryCapabilities`
   - reemplazar ambos arreglos en la entidad
3. persistir

Regla aprobada:

- no habrá merge incremental
- no habrá preservación manual de `auxiliaryCapabilities`

## System Roles Seeder Impact

Existe un seed idempotente de roles del sistema en:

- `src/internal/infra/persistence/mongoose/seeds/roles/system-roles.seed.ts`

Y hoy:

- recalcula `permissions` de `MASTER_ADMIN_DEFAULT`
- recalcula `permissions` de `ADMIN_DEFAULT`

También existe:

- `src/internal/infra/persistence/mongoose/seeds/roles/legacy-staff-role.seed.ts`

Pero para esta iniciativa no debe ser parte del trabajo de actualización.

Impacto técnico esperado:

1. `system-roles.seed.ts` deberá incorporar también el recálculo de `auxiliaryCapabilities`
2. ese recálculo debe aplicarse al menos a:
   - `MASTER_ADMIN_DEFAULT`
   - `ADMIN_DEFAULT`
3. el seed de esta iniciativa no deberá actualizar `STAFF_LEGACY`
4. tampoco deberá intentar sincronizar roles custom existentes en base de datos
5. el seed debe seguir siendo idempotente
6. la validación final de esta spec deberá incluir ejecución real de:
   - `npm run db:seed`
7. después de correr el seed, se deberá verificar que los roles del sistema en base de datos reflejen correctamente el nuevo campo derivado

En esta spec, "queda fuera" significa:

- no actualizar
- no borrar
- no recrear
- no mutar

aplicado a:

- `STAFF_LEGACY`
- cualquier rol custom ya existente en base de datos

## HTTP Enforcement

### Decorator

Nuevo decorator:

```ts
@RequireAuxiliaryCapability(module, capability)
```

Debe funcionar igual que el decorator actual de permisos:

- metadata simple
- sin mezclar semánticas con `@RequirePermission`

### Guard

Nuevo guard:

- `AuxiliaryCapabilitiesGuard`

Debe:

1. leer metadata del decorator
2. obtener `authContext`
3. resolver rol efectivo del actor
4. evaluar `auxiliaryCapabilities`
5. lanzar `AuthorizationException` si no aplica

## Authorization Service Integration

Hay dos rutas válidas de integración:

1. agregar métodos auxiliares a `AuthorizationService`
2. dejar la evaluación de auxiliary capabilities en `AuxiliaryCapabilitiesService` y usar `AuthorizationService` solo para permisos funcionales

Dirección recomendada para esta fase:

- mantener `AuthorizationService` responsable de permisos funcionales
- dejar la evaluación de `auxiliary capabilities` encapsulada en `AuxiliaryCapabilitiesService`

Razón:

- conserva separación limpia de responsabilidades
- evita ensuciar el servicio actual con una segunda semántica

## Initial Endpoint Migration

En esta primera implementación, los endpoints que deben migrar al nuevo guard/decorator son:

- `GET /v1/contacts/search`
- `GET /v1/communication-channels`
- `GET /v1/expiration-status-policies/options`
- `GET /v1/expiration-notification-policies/options`

Y los endpoints que explícitamente permanecen bajo `module + operation` son:

- `GET /v1/roles/modules`
- `GET /v1/users/roles`
- `GET /v1/expiration-status-policies/catalog`
- `GET /v1/expiration-notification-policies/catalog`

## Out Of Scope For This Slice

- exponer `auxiliaryCapabilities` en responses de roles
- rediseñar `AuthorizationService` completo
- refactorizar ubicación de piezas actuales de permisos
- diseñar casos excepcionales de derivación por operación específica
