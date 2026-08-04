# Technical Design

## Scope

- `authorization.catalog.ts`
- query/presenter de `GET /v1/roles/modules`
- docs de integración frontend

## Contracts

- actual:
  - `GET /v1/roles/modules`
  - `GET /v1/roles/operations`
- recomendado:
  - `GET /v1/roles/modules` con `operations[]` por módulo

## State Changes

- no aplica slice backend
- sí aplica ajuste de DTO/view model del catálogo de módulos

## UI Behavior

- no aplica directamente
- el objetivo es habilitar un editor frontend guiado por verdad real

## Validation

- cada módulo expuesto debe reflejar exactamente las operaciones de `authorization.catalog.ts`
- módulos parciales como `FILES`, `SERVICE_PACKAGES`, `SERVICE_ENTRY_SURVEYS` y `USER_REGISTRATION_INVITATIONS` deben conservar su cardinalidad real

## Open Questions

- si `GET /v1/roles/operations` queda como endpoint complementario o pasa a ser redundante
