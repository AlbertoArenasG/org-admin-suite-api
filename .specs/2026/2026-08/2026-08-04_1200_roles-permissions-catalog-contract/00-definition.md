# Definition

## Purpose

Esta iniciativa existe para alinear el contrato backend del catálogo de autorización con el uso real que hace frontend del editor de permisos de roles.

Regla de trabajo:

- no arrancar implementacion estructural mientras existan decisiones criticas en estado `pending`
- tu tomas la decision final
- aqui solo se registran contexto, opciones, recomendacion e impacto

## Overall Status

- Initiative: `roles-permissions-catalog-contract`
- Definition status: `in_progress`
- Implementation ready: `no`

---

## Decision 01. Shape del catálogo de módulos para edición de permisos

### Context

Backend ya tiene la verdad en `authorization.catalog.ts`, donde cada módulo declara sus operaciones válidas. Sin embargo, el contrato HTTP actual expone módulos y operaciones por separado, lo que permitió que frontend armara una matriz cuadrada inválida.

### Options

1. Mantener `GET /v1/roles/modules` y `GET /v1/roles/operations` tal como están
2. Enriquecer `GET /v1/roles/modules` con las operaciones válidas de cada módulo
3. Reemplazar ambos endpoints por uno solo de catálogo compuesto

### Recommendation

Opcion 2.

Preserva compatibilidad conceptual con el diseño actual, pero hace explícita la verdad que frontend necesita para renderizar correctamente.

### Implications

- el catálogo por módulo se vuelve autosuficiente
- frontend deja de reconstruir relaciones implícitas
- `GET /v1/roles/operations` puede mantenerse para trazabilidad o simplificarse después

### Decision Final

Pendiente.

### Status

pending
