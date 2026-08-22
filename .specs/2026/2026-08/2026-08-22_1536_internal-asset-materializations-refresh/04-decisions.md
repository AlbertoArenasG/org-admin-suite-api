# Decisions

## Decision 01. Execution Strategy

La primera versión expondrá un endpoint técnico invocable manualmente. El endpoint delegará a un caso de uso reutilizable; no incluirá cron interno ni infraestructura externa.

## Decision 02. Technical Authentication Boundary

Se crea la frontera `internal-jobs`, separada de `public`, `master-admin` y el backoffice JWT. Se protegerá con `INTERNAL_JOBS_TOKEN` como Bearer token técnico, sin usuarios humanos ni permisos de roles.

## Decision 03. Refresh Eligibility

Los recálculos masivos por tiempo o actualización de policy solo procesarán records `PENDING` e `IN_PROGRESS`. Un record terminal que vuelva a estado operativo se rematerializa durante su edición normal. La eliminación de policy sigue desvinculando la referencia de todos los records asociados no eliminados.

## Decision 04. Operational Queries

Los recálculos masivos consultarán records operativos desde persistencia. Habrá una consulta operacional compartida con filtros opcionales por ambas policies y cursor. La eliminación de policy conservará una consulta sin filtro operativo para limpiar referencias.

## Decision 05. Shared Refresh Orchestration

Policies y jobs técnicos reutilizarán una orquestación de lote común para resolver policies, aplicar ambas materializaciones y persistir resultados. CRUD no conocerá cursors, locks ni scheduling.

## Decision 06. Independent Refreshers

La lógica profunda se divide en `InternalAssetStatusMaterializationRefresher` e `InternalAssetNotificationMaterializationRefresher`. El job compuesto los invoca juntos en V1.

## Decision 07. Batch And Cursor

Cada llamada procesa un lote fijo de 100 records. El cursor opaco encapsula `{ createdAt, recordId }`, donde `recordId` es el ID de dominio. La consulta ordena por ambos campos ascendente; no usa `_id` ni `updatedAt`.

## Decision 08. Lock And Progress

Un lock Mongo persistente y atómico coordina instancias con `jobName`, `executionId` y `lockedUntil`. El lease dura cinco minutos, se libera en `finally` y responde `409` si está vigente. El progreso entre lotes es stateless: el invocador conserva `nextCursor`.

## Decision 09. Technical Audit

El refresh técnico actualiza únicamente materializaciones mediante una actualización parcial con `timestamps: false`. No modifica `updatedBy` ni `updatedAt`; cada `lastMaterializedAt` conserva la auditoría técnica.

## Decision 10. Endpoint Contract

`POST /v1/internal-jobs/internal-asset-maintenance-records/refresh-materializations` recibe opcionalmente `{ cursor }` y devuelve métricas, duración y `nextCursor`. Los errores de cursor son `400`, token inválido `401` y lock activo `409`.

## Decision 11. Failure And Observability

El lote es fail-fast: no avanza cursor tras un error; los cambios previos permanecen y se reintenta desde el último cursor confirmado. Usará `Logger` de Nest con eventos de inicio, finalización, error y lock. No habrá pruebas automatizadas en V1.

## Decision 12. Runbook

El runbook se agregará en `docs/runbooks/internal-jobs.md`; documentará autenticación, cursor, recuperación, rotación de token y verificación operativa.

## Pending Technical Structure

- Aprobar la forma exacta del puerto, persistencia y modelo del lock antes de implementar.
