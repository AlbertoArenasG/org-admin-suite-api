# Implementation Breakdown

## Slice 1. Module-By-Module Domain Review

### Objective

Revisar cada módulo existente para determinar si su semántica real es CRUD o de dominio específico.

### Microphases

- inspeccionar catálogo actual
- contrastar módulos con endpoints reales
- registrar clasificación preliminar por módulo

Done when:

- existe una clasificación explícita módulo por módulo

## Slice 2. Catalog Model Definition

### Objective

Definir el modelo final del catálogo backend y del vocabulario de operaciones.

### Microphases

- cerrar decisiones de `00-definition.md`
- proponer shape objetivo del catálogo
- aterrizar impacto en validación y seeds

Done when:

- la definición queda lista para implementar

## Slice 3. Backend Refactor

### Objective

Aplicar el modelo aprobado al catálogo, validaciones y documentación backend.

### Microphases

- ajustar catálogo y helpers
- actualizar docs permanentes
- dejar handoff para frontend

Done when:

- backend refleja el nuevo modelo conceptual de operaciones
