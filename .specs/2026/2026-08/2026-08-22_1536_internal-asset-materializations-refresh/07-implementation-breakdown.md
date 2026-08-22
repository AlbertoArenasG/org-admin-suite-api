# Implementation Breakdown

## Slice 1. Shared Technical Foundations

Objetivo: habilitar la frontera reutilizable de jobs internos sin conectar aún el refresh.

- agregar `INTERNAL_JOBS_TOKEN` al contrato de environment
- agregar `InternalJobsAuthGuard`
- agregar `InternalJobException`, mapeo `409` y mensajes i18n
- agregar schema, puerto y repositorio Mongoose de `internal_job_locks`
- registrar exports y providers globales

Verificación:

- build exitoso
- token ausente, malformado o inválido produce `401`
- lock activo se representa como `409` con `locked_until`

## Slice 2. Technical Record Persistence

Objetivo: separar mutaciones técnicas de auditoría de backoffice.

- agregar `findOperational` al read repository y Mongoose
- agregar índice compuesto de records
- agregar `updateSystemManagedFields` al write repository y Mongoose
- garantizar `$set` limitado y `timestamps: false`

Verificación:

- consulta operacional pagina correctamente con cursor estable
- actualización técnica no modifica `updatedAt` ni `updatedBy`
- `null` limpia y `undefined` conserva campos técnicos

## Slice 3. Refresh Services And Policy Trigger Refactor

Objetivo: reutilizar reglas de materialización con responsabilidades aisladas.

- crear refreshers de estatus, notificaciones y lote técnico compuesto
- adaptar create/update/delete directos de records para reutilizar cálculo sin cambiar su auditoría ordinaria
- adaptar actualización de ambas policies para recorrer solo records operativos, en lotes, con write técnico y solo la materialización afectada
- adaptar eliminación de ambas policies para limpiar asociaciones sin auditoría de records y rematerializar únicamente los operativos

Verificación:

- editar una policy no altera auditoría de records
- eliminar una policy no altera auditoría de records y limpia asociaciones
- editar directamente un record conserva auditoría y rematerializa según policies vigentes

## Slice 4. Internal Asset Refresh Job Endpoint

Objetivo: exponer el job manual protegido y reanudable.

- agregar DTOs de aplicación y HTTP
- implementar cursor opaco Base64URL
- agregar use case, command, handler, controller y presenter específicos
- integrar lock, lote fijo de 100, `nextCursor`, métricas y logs

Verificación:

- primera llamada procesa un lote y retorna `next_cursor`
- llamadas sucesivas terminan con `next_cursor: null`
- lock activo retorna `409`
- cursor inválido retorna `400`
- falla a mitad de lote permite reintentar desde el cursor confirmado

## Slice 5. Runbook And Manual Validation

Objetivo: dejar el proceso operable y cerrar la spec.

- crear `docs/runbooks/internal-jobs.md`
- ejecutar validación manual definida en la spec
- verificar Mongo, auditoría, logs y comportamiento de policies
- actualizar `05-progress.md`, `03-task-list.md`, `00-definition.md` e índice de specs para cierre formal

No se agregarán pruebas automatizadas en esta versión por decisión aprobada.

