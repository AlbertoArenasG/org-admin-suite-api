# Technical Design

## Scope

- `authorization.catalog.ts`
- query/presenter de `GET /v1/roles/modules`
- controller de `roles`
- docs de integración frontend

## Contracts

- actual:
  - `GET /v1/roles/modules`
  - `GET /v1/roles/operations`
- aprobado:
  - `GET /v1/roles/modules` con `operations[]` por módulo
  - `GET /v1/roles/operations` eliminado

### Shape objetivo de respuesta por módulo

```ts
type PermissionModuleViewDto = {
  code: string;
  nameKey: string;
  status: string;
  isSystem: boolean;
  operations: Array<{
    code: string;
    nameKey: string;
    status: string;
    isSystem: boolean;
  }>;
};
```

## State Changes

- no aplica slice backend
- sí aplica ajuste de DTO/view model del catálogo de módulos
- sí aplica retiro del query/presenter/endpoint de operaciones separadas si hoy existen como wiring independiente

## UI Behavior

- no aplica directamente
- el objetivo es habilitar un editor frontend guiado por verdad real

## Validation

- cada módulo expuesto debe reflejar exactamente las operaciones de `authorization.catalog.ts`
- módulos parciales como `FILES`, `SERVICE_PACKAGES`, `SERVICE_ENTRY_SURVEYS` y `USER_REGISTRATION_INVITATIONS` deben conservar su cardinalidad real
- el orden de `operations[]` debe ser estable y coherente con el catálogo backend

## Open Questions

- ninguna para este slice
