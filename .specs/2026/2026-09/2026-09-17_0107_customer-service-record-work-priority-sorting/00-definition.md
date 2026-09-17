# Customer Service Record Work Priority Sorting

## Status

- Initiative: `customer-service-record-work-priority-sorting`
- Date: `2026-09-17`
- Definition status: completed
- Implementation ready: yes
- Implementation status: completed
- Validation status: completed
- Spec status: completed

## Objective

Incorporar un perfil semántico de ordenamiento para que los listados
administrativo y de acceso de cliente presenten los registros de servicio como
una bandeja de trabajo. El perfil delega al backend la prioridad compuesta y
preserva la paginación correcta.

El contrato propuesto es:

```text
sort_strategy=work_priority
```

No sustituye `sort[]`: `sort_strategy` representa una estrategia de negocio; `sort[]`
sigue representando ordenamientos explícitos de campos.

## Initial Scope

- `GET /v1/customer-service-records`.
- `GET /v1/customer-service-records-client-access`.
- Validación del query parameter `sort_strategy` con el valor `work_priority`.
- Construcción de la prioridad y sus desempates en persistencia antes de
  paginar.
- Validación manual acordada para ambas superficies.
- Handoff de contrato para frontend y actualización de Postman.

## Confirmed Decisions

- La prioridad se calcula exclusivamente con el compromiso de Cliente:
  `customer_delivery.status_materialization`,
  `customer_delivery.estimated_delivery_at`, `operational_status` y
  `createdAt`. No considera las materializaciones ni fechas del proveedor.
- El perfil es semántico, no una lista expuesta de campos ni de códigos de
  política. El frontend solicita `sort_strategy=work_priority`; el backend compone la
  consulta.
- El primer criterio es una prioridad calculada ascendente:
  1. registros abiertos con materialización de sistema `OVERDUE`;
  2. registros abiertos sin entrega estimada, materializados como
     `SYSTEM/PENDING_ESTIMATED_DATE`;
  3. registros abiertos con materialización de origen `POLICY`;
  4. registros abiertos con materialización ausente o no reconocible;
  5. registros abiertos con materialización de sistema `ON_TIME`;
  6. registros `COMPLETED`;
  7. registros `CANCELLED`.
- Un registro abierto es `PENDING` o `IN_PROGRESS`. Los estatus terminales no
  suben de prioridad aunque no tengan entrega estimada.
- El segundo criterio general es
  `customer_delivery.estimated_delivery_at ASC`; el tercero es `createdAt ASC`.
  No se deriva severidad desde el código, label o regla concreta de una
  materialización `POLICY`.
- Este comportamiento se aplica antes de `skip` y `limit`; nunca se ordena en
  frontend después de recibir una página.
- La secuencia compartida de ordenamiento vive como método protegido en
  `MongooseCustomerServiceRecordBaseRepository`, que ya comparten ambos
  repositorios de lectura; no se crean archivos auxiliares ni carpetas nuevas
  bajo `repositories`.
- El perfil usa una agregación local en cada repositorio: conserva su filtro,
  añade y ordena por una clave temporal, pagina y elimina esa clave antes de
  enviar el resultado al mapper existente. El conteo conserva
  `countDocuments(filter)` en paralelo.

## Resolved Decisions

### Decision 01. Convivencia entre `sort_strategy` y `sort[]`

`sort[]` tiene precedencia cuando ambos parámetros llegan en una request. El
ordenamiento explícito por campo representa una instrucción directa de quien
consume el endpoint; `sort_strategy=work_priority` actúa como estrategia de bandeja solo
cuando no hay `sort[]`.

No se crea un error `400` ni copies asociados. Frontend puede eliminar
`sort_strategy` al activar una orden manual, pero el backend conserva este fallback
para que requests con ambos parámetros sean deterministas.

Status: approved

### Decision 02. Abiertos con materialización de seguimiento ausente

El refresher vigente genera `SYSTEM/PENDING_ESTIMATED_DATE` cuando la entrega
estimada de Cliente es nula, por lo que ese caso pertenece al segundo nivel de
prioridad. Un registro abierto con entrega estimada y
`customer_delivery.status_materialization` ausente o no reconocible en datos
históricos ocupa el cuarto nivel: después de `POLICY` y antes de `ON_TIME`.

La consulta no deriva ni persiste un estatus de sistema a partir de la fecha.
Solo identifica el estado materializado como ausente o no reconocible para
aplicar este nivel fijo de ordenamiento.

Es no reconocible una materialización nula, sin `source` o `code`, con un
`source` distinto de `POLICY` o `SYSTEM`, o con `source=SYSTEM` y un `code`
distinto de `OVERDUE` u `ON_TIME`. Cualquier `source=POLICY` es reconocible
sin evaluar su código o label. La prioridad de entrega estimada nula conserva
precedencia sobre esta clasificación.

Status: approved

## Out Of Scope

- Cambiar el orden por defecto de consumidores que no envíen `sort_strategy`.
- Exponer un selector visual, columna adicional o nuevos filtros en frontend.
- Ordenar por materializaciones, políticas, eventos o fechas de proveedor.
- Clasificar individualmente códigos o labels de políticas.
- Modificar esquemas, materializaciones persistidas, permisos o visibilidad.
- Implementar frontend antes de que el contrato backend esté validado.
