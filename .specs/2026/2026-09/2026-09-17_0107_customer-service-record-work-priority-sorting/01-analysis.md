# Analysis

## Current State

Los dos listados paginan en backend y hoy solo aceptan ordenamientos directos
por campo. El administrativo usa
`MongooseCustomerServiceRecordReadRepositoryImpl`; el acceso de cliente usa
`MongooseCustomerServiceRecordClientAccessReadRepositoryImpl`.

Ambos repositorios aplican `find(...).sort(...).skip(...).limit(...)`. Ese
modelo no puede expresar la prioridad requerida sin calcular primero una clave
derivada; ordenar una página en frontend produciría páginas incoherentes.

## Relevant Data

- `operational_status`: `PENDING`, `IN_PROGRESS`, `COMPLETED`, `CANCELLED`.
- `customer_delivery.estimated_delivery_at`: fecha de entrega estimada o
  `null`.
- `customer_delivery.status_materialization.source`: `SYSTEM` o `POLICY`.
- `customer_delivery.status_materialization.code`: códigos de sistema como
  `OVERDUE` y `ON_TIME`; los códigos de `POLICY` no son comparables entre
  registros.
- `createdAt`: desempate estable final.

## Constraints And Risks

- El perfil debe coexistir con filtros y fronteras de visibilidad actuales.
- El conteo debe seguir usando el filtro base; la prioridad no altera qué
  registros son visibles.
- La consulta de prioridad requerirá agregación o una estrategia equivalente
  que preserve `total`, `skip` y `limit`.
- `null` asciende antes que una fecha en MongoDB, pero la clave de prioridad
  separa primero los registros abiertos sin fecha. No se debe añadir una regla
  especial por subgrupo.
- `POLICY` se evalúa por `source`, nunca por `code`, `label` ni configuración
  de la política.
- Un abierto con entrega estimada y materialización ausente o no reconocible
  ocupa un nivel fijo después de `POLICY`; la consulta no lo recalcula como
  `OVERDUE` ni `ON_TIME`.
- Para esta clasificación, `POLICY` reconoce cualquier código; `SYSTEM` solo
  reconoce `OVERDUE` y `ON_TIME`. Una materialización nula, incompleta o con
  otro origen o código de sistema pertenece al nivel fijo de dato incompleto.
- Los repositorios Mongoose no tienen carpeta ni precedente de helpers de
  consulta. Ambos listados ya extienden
  `MongooseCustomerServiceRecordBaseRepository`, por lo que el ordenamiento
  compartido pertenece a un método protegido de esa clase existente.

## Dependency

El frontend adoptará el query parameter solo tras cerrar y validar este
contrato. La posible adopción no forma parte de esta spec backend.
