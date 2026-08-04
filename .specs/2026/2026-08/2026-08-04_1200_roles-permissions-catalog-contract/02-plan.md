# Plan

## Objective

Hacer explícito en el contrato backend cuáles operaciones válidas pertenecen a cada módulo del catálogo de autorización.

## Target Design

- `GET /v1/roles/modules` devuelve módulos con sus operaciones válidas
- el contrato sigue derivando directamente de `authorization.catalog.ts`
- no se introducen listas paralelas ni mappers con conocimiento duplicado

## Phases

### Phase 1. Contract Definition

- cerrar decisión del shape final
- aterrizar presenter y dto de respuesta

### Phase 2. Backend Implementation

- ajustar query/result/presenter si aplica
- preservar validación central existente del `PATCH /v1/roles/:roleId`

### Phase 3. Validation And Handoff

- actualizar docs de integración frontend
- registrar impacto para el editor de permisos

## Sequencing Notes

- la fuente debe seguir siendo el catálogo central
- no conviene mover la lógica al controller

## Exit Criteria

- backend expone de forma directa operaciones válidas por módulo
- frontend ya no necesita inferir ni asumir cuadrículas CRUD uniformes
