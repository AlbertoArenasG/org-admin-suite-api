# Technical Design

## Scope

- `authorization.catalog.ts`
- helpers y validaciones de autorización asociados
- contratos HTTP derivados del catálogo
- documentación operativa del catálogo de permisos

## Design Goals

- representar operaciones reales del dominio por módulo
- evitar que CRUD uniforme siga siendo una restricción implícita del sistema
- conservar una fuente de verdad backend clara y auditables

## Anticipated Touchpoints

- shape interno del catálogo
- naming de operaciones
- validación de combinaciones `module + operation`
- seeds de roles del sistema
- contratos consumidos por frontend

## Open Questions

- si el vocabulario global base seguirá existiendo y con qué alcance
- qué módulos ya justifican operaciones no CRUD en esta primera iteración
- si la migración debe ser total o gradual por módulo
