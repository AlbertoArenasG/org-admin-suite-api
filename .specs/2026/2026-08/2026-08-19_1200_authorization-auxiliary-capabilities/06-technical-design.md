# Technical Design

## Current State

La autorización ordinaria vigente se apoya en:

- catálogo funcional en código
- permisos por `module + operation`
- `PermissionsGuard`
- roles con `permissions[]`

## Approved Design Direction

La iniciativa agrega una segunda capa mínima para:

- capacidades auxiliares reutilizables
- endpoints de soporte reutilizables entre varios módulos consumidores

sin sustituir ni romper la capa actual.

## Approved Boundary

- capa 1:
  - permisos funcionales ordinarios
  - evaluados por `PermissionsGuard`
  - también cubren auxiliares locales absorbidos por la frontera funcional del módulo
- capa 2:
  - capacidades auxiliares reutilizables
  - evaluadas por un guard separado

## Approved Persistence Shape

El modelo aprobado es:

- `permissions[]`
- `auxiliaryCapabilities[]`

con derivación backend durante mutaciones del rol.

## Approved Initial Catalog

- `CONTACTS + SEARCH`
- `COMMUNICATION_CHANNELS + READ_OPTIONS`
- `EXPIRATION_STATUS_POLICIES + READ_OPTIONS`
- `EXPIRATION_NOTIFICATION_POLICIES + READ_OPTIONS`

## Approved Initial Derivation Map

- `RECIPIENT_GROUPS` deriva:
  - `CONTACTS + SEARCH`
  - `COMMUNICATION_CHANNELS + READ_OPTIONS`
- `INTERNAL_ASSET_MAINTENANCE_RECORDS` deriva:
  - `EXPIRATION_STATUS_POLICIES + READ_OPTIONS`
  - `EXPIRATION_NOTIFICATION_POLICIES + READ_OPTIONS`

## Structural Notes

- la derivación vive exclusivamente en backend
- `auxiliaryCapabilities[]` se recalcula desde cero en `create-role` y `update-role`
- la integridad entre catálogo maestro y mapa de derivación debe validarse al arrancar la app
- `auxiliaryCapabilities` no se expondrá por ahora en responses ordinarios de roles
- frontend no consume esta capa para gating fino de controles

## Rollout Expectation

Aunque `internal_asset_maintenance_records` es el primer consumidor visible que fuerza esta iniciativa, el diseño e implementación final no deben dejar un enfoque mixto dentro del backoffice.

La expectativa de esta spec es:

- inventariar los auxiliares reutilizables actuales
- aplicarles un tratamiento uniforme bajo el nuevo approach
- dejar documentado en `docs/frontend` cualquier ajuste que frontend deba reflejar después
