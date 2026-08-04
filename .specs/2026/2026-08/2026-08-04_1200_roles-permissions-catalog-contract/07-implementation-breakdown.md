# Implementation Breakdown

## Slice 1. Modules Contract Enrichment

### Objective

Hacer que `GET /v1/roles/modules` exponga por módulo sus operaciones válidas derivadas directamente de `authorization.catalog.ts`.

### Files

- `src/internal/application/services/authz/authorization.catalog.ts`
- query/result dto relacionados con módulos de permisos
- presenters de roles

### Microphases

#### Slice 1.1. Read model

- ajustar DTO/view model del catálogo de módulos
- incluir `operations[]` por módulo

#### Slice 1.2. Presenter

- serializar operaciones con metadata descriptiva completa

Done when:

- `GET /v1/roles/modules` ya devuelve la relación completa módulo -> operaciones válidas

## Slice 2. Operations Endpoint Removal

### Objective

Retirar la superficie HTTP redundante de `GET /v1/roles/operations`.

### Files

- controller de roles
- query/cqrs asociados
- docs de integración

### Microphases

- eliminar endpoint
- retirar wiring que quede obsoleto
- actualizar handoff para frontend

Done when:

- el backend ya no expone `GET /v1/roles/operations`

## Slice 3. Validation And Handoff

### Objective

Dejar el contrato listo para que frontend consuma el catálogo real sin inferencias adicionales.

### Microphases

- verificar módulos parciales
- actualizar docs y progress

Done when:

- el contrato queda estable y autosuficiente para frontend
