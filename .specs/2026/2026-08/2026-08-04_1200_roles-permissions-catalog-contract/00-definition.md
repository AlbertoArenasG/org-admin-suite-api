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

Se aprueba enriquecer `GET /v1/roles/modules` con las operaciones válidas de cada módulo.

La fuente de verdad seguirá siendo `authorization.catalog.ts`.

El contrato HTTP debe exponer esa relación de forma directa para evitar que frontend reconstruya o infiera combinaciones válidas fuera del backend.

### Status

approved

---

## Decision 02. Futuro de `GET /v1/roles/operations`

### Context

Una vez que `GET /v1/roles/modules` exponga las operaciones válidas por módulo, `GET /v1/roles/operations` se vuelve redundante para el caso real de integración con frontend.

Además, el catálogo de operaciones ya vive en código backend y no en una fuente externa o persistente.

### Options

1. Mantener `GET /v1/roles/operations` como endpoint complementario
2. Marcarlo como deprecated y retirarlo después
3. Eliminarlo dentro de esta misma iniciativa

### Recommendation

Opcion 3.

No hay necesidad de sostener un endpoint redundante si backend y frontend se desplegarán juntos al completar esta iniciativa.

### Implications

- el contrato de catálogo para frontend se simplifica
- backend concentra la integración del editor en un solo endpoint
- la documentación de handoff debe actualizarse para reflejar la eliminación

### Decision Final

Se aprueba eliminar `GET /v1/roles/operations`.

`GET /v1/roles/modules` quedará como el único contrato necesario para que frontend construya el editor de permisos.

### Status

approved

---

## Decision 03. Shape exacto del catálogo enriquecido de módulos

### Context

Con `GET /v1/roles/operations` fuera del diseño objetivo, `GET /v1/roles/modules` debe exponer un shape suficientemente completo para que frontend construya el editor sin inferencias adicionales.

### Options

1. Adjuntar solo códigos de operación por módulo
2. Adjuntar `operations[]` con metadata descriptiva completa
3. Adjuntar operaciones mínimas y delegar localización o nombres a frontend

### Recommendation

Opcion 2.

Esto deja un contrato claro, autosuficiente y consistente con el shape que ya existía en el endpoint separado.

### Implications

- el presenter de módulos debe incluir `operations[]`
- frontend podrá renderizar directamente nombres, keys y códigos por módulo
- el endpoint de módulos se convierte en el único contrato necesario para el editor

### Decision Final

Se aprueba que cada módulo de `GET /v1/roles/modules` incluya `operations[]` con metadata descriptiva completa.

Shape aprobado por módulo:

```json
{
  "module_id": "USERS",
  "module_code": "USERS",
  "module_name": "Usuarios",
  "module_name_key": "AUTHORIZATION.MODULE.USERS",
  "status_id": "ACTIVE",
  "is_system": true,
  "operations": [
    {
      "operation_id": "CREATE",
      "operation_code": "CREATE",
      "operation_name": "Crear",
      "operation_name_key": "AUTHORIZATION.OPERATION.CREATE",
      "status_id": "ACTIVE",
      "is_system": true
    }
  ]
}
```

### Status

approved
