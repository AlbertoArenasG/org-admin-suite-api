# Technical Design

## API Contract

Los endpoints afectados aceptarán opcionalmente:

```text
GET /v1/customer-service-records?sorting=work_priority
GET /v1/customer-service-records-client-access?sorting=work_priority
```

`sorting` es un enum público con un único valor inicial. Requests sin este
parámetro conservan sus ordenamientos actuales. Un valor desconocido responde
con el envelope estándar de validación `400`.

Cuando `sort[]` contiene uno o más ordenamientos válidos, prevalece sobre
`sorting`; el perfil no se ejecuta. Esto preserva el significado de una orden
manual explícita sin crear una variante de error.

## Priority Algorithm

La consulta usa una clave interna de ordenamiento `workPriority` con una
expresión de agregación. La clave no se expone, no se persiste y no deriva un
nuevo estatus: clasifica únicamente los valores materializados para ordenar.
Las condiciones se evalúan en este orden:

| Prioridad | Condición |
| --- | --- |
| `1` | `operational_status` abierto y materialización de Cliente `SYSTEM/OVERDUE` |
| `2` | `operational_status` abierto y `customer_delivery.estimated_delivery_at` nulo |
| `3` | `operational_status` abierto y materialización de Cliente con `source=POLICY` |
| `4` | `operational_status` abierto, entrega estimada presente y materialización de Cliente ausente o no reconocible |
| `5` | `operational_status` abierto y materialización de Cliente `SYSTEM/ON_TIME` |
| `6` | `operational_status=COMPLETED` |
| `7` | `operational_status=CANCELLED` |

Los abiertos son exclusivamente `PENDING` e `IN_PROGRESS`. El nivel `4` no
recalcula `OVERDUE` u `ON_TIME` desde la fecha, ni intenta inferir `POLICY`;
solo representa un dato materializado ausente o no reconocible. Es no
reconocible una materialización nula o incompleta, con `source` distinto de
`POLICY` o `SYSTEM`, o con `source=SYSTEM` y `code` distinto de `OVERDUE` u
`ON_TIME`. Cualquier `source=POLICY` es reconocido sin evaluar código o label.
El nivel `2` por fecha estimada nula tiene precedencia sobre esta regla.

El `sort` final es:

```text
workPriority ASC
customer_delivery.estimated_delivery_at ASC
createdAt ASC
_id ASC
```

`_id` solo garantiza orden estable cuando los tres criterios anteriores
empatan; no cambia la decisión funcional de usar `createdAt` como último
criterio de negocio.

## Query Shape

Para `sorting=work_priority` sin `sort[]`, cada repositorio conserva su filtro
actual y usa una agregación con este orden:

```text
$match: filtro actual y frontera de visibilidad
$addFields: work_priority temporal
$sort: work_priority, fecha estimada, createdAt, _id
$skip y $limit
$project: excluir work_priority
```

El total se obtiene con `countDocuments(filter)` en paralelo. El método
protegido `buildWorkPriorityPipeline()` de
`MongooseCustomerServiceRecordBaseRepository` devuelve únicamente las etapas
compartidas de `$addFields` y `$sort`; cada read repository agrega su `$match`,
paginación y proyección. La clave temporal no se persiste ni llega a la
respuesta. Los resultados crudos de `aggregate()` se entregan al mapper actual
mediante el cast local ya usado en
`MongooseServiceEntrySurveyReadRepositoryImpl`; no se modifica el mapper ni el
schema.

## Acceptance Criteria And Behavior Matrix

| Flow | Input | Observable result | Evidence |
| --- | --- | --- | --- |
| Administrative work queue | `sorting=work_priority` con registros de todas las categorías | orden exacto de la tabla de prioridad y fechas ascendente dentro de cada prioridad | compilación y validación manual de la persona usuaria |
| Client work queue | mismo perfil, actor autorizado y frontera aplicable | misma prioridad sin exponer ni alterar datos no visibles | compilación y validación manual de la persona usuaria |
| Missing delivery date | abierto sin fecha junto con `POLICY` u `ON_TIME` | aparece después de `OVERDUE` y antes de `POLICY` | validación manual |
| Policy materialization | reglas/códigos POLICY distintos | todos comparten prioridad; código y label no cambian su posición relativa salvo fecha/creación | validación manual |
| Missing materialization | abierto con fecha y materialización ausente o no reconocible | aparece después de `POLICY` y antes de `ON_TIME`, sin recalcular estatus | validación manual |
| Terminal records | `COMPLETED` y `CANCELLED`, aun sin fecha | aparecen al final en ese orden | validación manual |
| Pagination | resultados distribuidos entre dos páginas | no se repiten ni omiten registros por ordenar después de paginar | validación manual |
| Invalid profile | `sorting=unknown` | `400` estándar | validación manual |
| Legacy consumer | sin `sorting` | orden y contrato actuales sin cambio | validación manual |

## Contract And Impact Between Repositories

| Consumer | Previous contract | New contract | Compatibility | Responsible validation |
| --- | --- | --- | --- | --- |
| `org-admin-suite-frontend` admin table | `sort[]` directo u orden actual | puede solicitar `sorting=work_priority` | opcional y aditivo; la adopción borra o evita `sort[]` según decisión pendiente | frontend owner |
| `org-admin-suite-frontend` client table | orden actual o un `sort[]` directo | puede solicitar `sorting=work_priority` | opcional y aditivo; misma regla de coexistencia | frontend owner |

Al cerrar el contrato se creará o actualizará
`docs/frontend/customer-service-record-work-priority-sorting-handoff.md` y se
actualizará `docs/icsacv-api.postman_collection.json`.

## Registro de Artefactos

| Artefacto | Tipo | Ubicación | Responsabilidad y dependencias | Estado |
| --- | --- | --- | --- | --- |
| `GetCustomerServiceRecordsRequestDto` | HTTP request DTO | `src/internal/infra/api/dto/customer-service-record/customer-service-record.request.dto.ts` | Valida y transforma `sorting`; conserva `sort[]` para que tenga precedencia cuando llegue. | modify |
| `GetCustomerServiceRecordClientAccessListRequestDto` | HTTP request DTO | `src/internal/infra/api/dto/customer-service-record-client-access/customer-service-record-client-access.request.dto.ts` | Valida y transforma el mismo perfil para acceso de cliente, con la misma precedencia de `sort[]`. | modify |
| `GetCustomerServiceRecordListDto` | application DTO | `src/internal/application/dto/customer-service-record/customer-service-record.dto.ts` | Transporta el perfil de ordenamiento al caso de uso. | modify |
| `GetCustomerServiceRecordClientAccessListDto` | application DTO | `src/internal/application/dto/customer-service-record-client-access/customer-service-record-client-access.dto.ts` | Transporta el perfil de ordenamiento al caso de uso dedicado. | modify |
| `GetCustomerServiceRecordsQuery` y `GetCustomerServiceRecordsHandler` | CQRS query adapter y handler | `src/internal/infra/cqrs/queries/customer-service-record/customer-service-record.queries.ts` | Reutilizan el DTO administrativo ampliado y lo delegan sin lógica de ordenamiento adicional. | reuse |
| `GetCustomerServiceRecordClientAccessListQuery` y `GetCustomerServiceRecordClientAccessListHandler` | CQRS query adapter y handler | `src/internal/infra/cqrs/queries/customer-service-record-client-access/customer-service-record-client-access.queries.ts` | Reutilizan el DTO de acceso de cliente ampliado y conservan la delegación delgada al caso de uso. | reuse |
| `ICustomerServiceRecordReadRepository` | read port | `src/internal/domain/ports/repositories/customer-service-record/customer-service-record-read.repository.ts` | Acepta el perfil al consultar el listado administrativo. | modify |
| `ICustomerServiceRecordClientAccessReadRepository` | read port | `src/internal/domain/ports/repositories/customer-service-record-client-access/customer-service-record-client-access-read.repository.ts` | Acepta el perfil en el listado con frontera de cliente. | modify |
| `MongooseCustomerServiceRecordBaseRepository` | Mongoose base repository | `src/internal/infra/persistence/mongoose/repositories/customer-service-record/mongoose-customer-service-record-base.repository.ts` | Expone `buildWorkPriorityPipeline()`, método protegido que devuelve las etapas compartidas de `$addFields` y `$sort` usando datos persistidos. | modify |
| `MongooseCustomerServiceRecordReadRepositoryImpl` | Mongoose repository | `src/internal/infra/persistence/mongoose/repositories/customer-service-record/mongoose-customer-service-record-read.repository.ts` | Conserva filtro y conteo; usa `aggregate()` con el pipeline protegido, pagina antes de mapear y excluye la clave temporal. | modify |
| `MongooseCustomerServiceRecordClientAccessReadRepositoryImpl` | Mongoose repository | `src/internal/infra/persistence/mongoose/repositories/customer-service-record-client-access/mongoose-customer-service-record-client-access-read.repository.ts` | Conserva la frontera de visibilidad y conteo; usa el pipeline protegido, pagina antes de mapear y excluye la clave temporal. | modify |
| list use cases | application use cases | `src/internal/application/use-cases/customer-service-record/get-customer-service-records.use-case.ts`; `src/internal/application/use-cases/customer-service-record-client-access/get-customer-service-record-client-access-list.use-case.ts` | Reenvían el DTO ampliado; no introducen política duplicada. | reuse |
| controllers and presenters | HTTP composition | `src/internal/infra/api/controllers/customer-service-record/`; `src/internal/infra/api/controllers/customer-service-record-client-access/` | Conservan rutas, autorización y respuesta pública. | reuse |
| `GlobalCqrsModule` | Nest composition | `src/modules/global-cqrs.module.ts` | Conserva los handlers de listado ya registrados; no requiere un provider nuevo. | reuse |
| `MongooseCustomerServiceRecordMapper` | Mongoose mapper | `src/internal/infra/persistence/mongoose/mappers/customer-service-record/mongoose-customer-service-record.mapper.ts` | Reutiliza el shape almacenado recibido desde `aggregate()`; no cambia. | reuse |
| customer service record schema/entity | persistence/domain model | `src/internal/infra/persistence/mongoose/schemas/customer-service-record/`; `src/internal/domain/entities/customer-service-record.entity.ts` | Los campos requeridos ya existen; no cambian. | reuse |
| schema migration, backfill, seed, permission or index | data/authorization operation | N/A | No aplica: el perfil ordena valores ya materializados y no persiste datos. Un índice solo se evaluará con `explain` y datos representativos si el perfil demuestra necesidad. | not_applicable |
| validación | verification | N/A | La política vigente no incorpora suites automatizadas por defecto. La evidencia será compilación, revisión estática y validación manual de la persona usuaria. | modify |

## Validation Strategy

| Risk | Scenario | Level | Evidence | Responsible |
| --- | --- | --- | --- | --- |
| Prioridad incorrecta | combinación de todos los grupos, fechas y terminales | manual | orden exacto confirmado por la persona usuaria | persona usuaria |
| Fuga de visibilidad | perfil en acceso de cliente | manual | solo registros permitidos y ordenados | persona usuaria |
| Precedencia de contrato | `sorting` combinado con `sort[]` | manual | se ejecuta exclusivamente `sort[]` | persona usuaria |
| Paginación incoherente | prioridad distribuida en más de una página | manual | páginas sin repeticiones ni omisiones | persona usuaria |
| Rendimiento | colección representativa | revisión operativa manual | `explain` si se detecta regresión | persona usuaria, solo si es necesaria |
