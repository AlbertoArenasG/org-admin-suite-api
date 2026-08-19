# Plan

## Objective

Definir e implementar una capa backend mínima para capacidades auxiliares reutilizables, separada del catálogo funcional ordinario, que permita:

- gobernar endpoints auxiliares sensibles o reutilizables
- derivar automáticamente esas capacidades desde módulos consumidores
- evitar que frontend tenga que conocer dependencias técnicas
- dejar uniforme el approach en todo el backoffice protegido de negocio

## Planned Sequence

1. Cerrar el modelo conceptual de capacidades auxiliares y su frontera respecto al catálogo funcional principal.
2. Definir la clasificación inicial de endpoints auxiliares:
   - auxiliares locales absorbidos por `module + operation`
   - capabilities auxiliares reutilizables gobernadas por la nueva capa
3. Definir dónde y cómo se derivan esas capacidades al crear o editar roles.
4. Definir la representación persistida en el modelo `Role`.
5. Diseñar el guard y decorator auxiliares sin romper `PermissionsGuard`.
6. Inventariar los endpoints auxiliares reutilizables actuales del backoffice y clasificarlos bajo el nuevo approach.
7. Implementar el approach de forma uniforme sobre los auxiliares actuales del backoffice, usando `internal_asset_maintenance_records` como primer consumidor visible pero no como único alcance.
8. Dejar documentación viva en `docs/` para frontend e integraciones futuras.

## Out Of Scope

- rediseñar por completo el catálogo principal de `module + operation`
- reabrir el refactor general de autorización ya cerrado
- convertir frontend en fuente de verdad de dependencias
- exponer todavía al usuario final del editor el detalle completo de capacidades derivadas
- limitar esta iniciativa a un parche local exclusivo de `internal_asset_maintenance_records`
