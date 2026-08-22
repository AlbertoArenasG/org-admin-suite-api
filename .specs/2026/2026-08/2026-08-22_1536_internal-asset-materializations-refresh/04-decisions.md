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

- Finalizar contratos concretos de cursor, consulta operacional y actualización técnica de materializaciones.

## Decision 13. Reusable Internal Job Lock Structure

Se creará el puerto genérico `IInternalJobLockRepository`. No se añadirá una entidad de negocio para el lock: coordina ejecución técnica y no pertenece al dominio de activos.

Su contrato conceptual será:

```ts
acquire({ jobName, executionId, leaseDurationMs }): Promise<{
  acquired: boolean;
  lockedUntil?: Date;
}>;

release({ jobName, executionId }): Promise<void>;
```

La persistencia Mongo vivirá en una colección `internal_job_locks` con:

- `job_name`, único
- `execution_id`
- `locked_until`

La adquisición será atómica cuando no exista lock o el lease haya vencido. La liberación exigirá coincidencia de `jobName` y `executionId`.

El mecanismo será reutilizable para jobs futuros. Cada job tendrá un `jobName` estable; locks de jobs distintos no se bloquearán mutuamente.

## Decision 14. Operational Record Cursor Query

El read repository incorporará la consulta:

```ts
type InternalAssetMaintenanceOperationalCursor = {
  createdAt: Date;
  recordId: string;
};

type FindOperationalInternalAssetMaintenanceRecordsParams = {
  after?: InternalAssetMaintenanceOperationalCursor;
  limit: number;
  expirationStatusPolicyId?: string;
  expirationNotificationPolicyId?: string;
};

findOperational(
  params: FindOperationalInternalAssetMaintenanceRecordsParams,
): Promise<{ data: InternalAssetMaintenanceRecord[] }>;
```

La persistencia aplicará siempre:

```ts
status: { $in: [PENDING, IN_PROGRESS] }
```

Cuando exista cursor, continuará estrictamente después de:

```ts
{
  $or: [
    { createdAt: { $gt: cursor.createdAt } },
    {
      createdAt: cursor.createdAt,
      internal_asset_maintenance_record_id: { $gt: cursor.recordId },
    },
  ],
}
```

La consulta ordenará por `createdAt ASC` e `internal_asset_maintenance_record_id ASC`. Recibirá el límite interno del proceso, que para este job será `100`. El caso de uso derivará `nextCursor` a partir del último record devuelto.

El schema agregará el índice compuesto:

```ts
{ status: 1, createdAt: 1, internal_asset_maintenance_record_id: 1 }
```

Los filtros opcionales por policy permiten reutilizar la misma consulta en las actualizaciones de ambas policies.

## Decision 15. Technical Record Update Path

El write repository incorporará una ruta separada de la actualización ordinaria para cambios técnicos derivados:

```ts
type UpdateInternalAssetMaintenanceRecordSystemManagedFieldsInput = {
  recordId: string;
  expirationStatusPolicyId?: string | null;
  expirationNotificationPolicyId?: string | null;
  expirationStatusMaterialization?: InternalAssetExpirationStatusMaterializationProps | null;
  expirationNotificationMaterialization?: InternalAssetExpirationNotificationMaterializationProps | null;
};

updateSystemManagedFields(
  input: UpdateInternalAssetMaintenanceRecordSystemManagedFieldsInput,
): Promise<{ updated: boolean }>;
```

Reglas del contrato:

- `undefined` no modifica la materialización correspondiente.
- `null` limpia explícitamente esa materialización.
- el input debe incluir al menos un campo administrado técnicamente.
- `undefined` no modifica el campo; `null` lo limpia explícitamente.
- solo admite las dos asociaciones a policy y las dos materializaciones; no admite campos editables del record.
- el job compuesto enviará ambas materializaciones para persistirlas en una sola escritura atómica por record.
- cada refresher individual podrá actualizar exclusivamente su respectivo campo.
- eliminar una policy enviará su asociación como `null` y, para records operativos, incluirá su materialización correspondiente en esa misma escritura.

La implementación Mongoose hará `$set` únicamente sobre campos administrados por procesos técnicos y usará `timestamps: false`. No invocará `record.updateDetails`, ni modificará `updatedBy`, `updatedAt` u otros datos de negocio editables del record.

No se añadirá control optimista basado en `updatedAt` en esta versión. La actualización técnica filtrará por `recordId`, conforme al patrón actual de persistencia. Las ediciones ordinarias del record continuarán reconstruyendo sus materializaciones.

## Decision 16. Refresh HTTP DTOs And Presenter

El request HTTP aceptará exclusivamente un cursor opcional y string:

```ts
class RefreshInternalAssetMaterializationsRequestDto {
  cursor?: string;
}
```

El caso de uso recibirá el cursor opaco y validará al decodificar su representación Base64URL:

```ts
{ createdAt: string; recordId: string }
```

Un cursor malformado o con shape inválido producirá `InvalidValueException` y respuesta `400`.

El resultado de aplicación será:

```ts
type RefreshInternalAssetMaterializationsResultDto = {
  processedRecords: number;
  materializations: {
    expirationStatus: { refreshedRecords: number };
    expirationNotification: { refreshedRecords: number };
  };
  durationMs: number;
  nextCursor: string | null;
};
```

La respuesta HTTP mantendrá la convención `snake_case` de la API. Se creará un presenter específico, `InternalAssetMaintenanceRecordMaterializationsRefreshPresenter`, que expondrá:

```ts
{
  processed_records: number;
  materializations: {
    expiration_status: { refreshed_records: number };
    expiration_notification: { refreshed_records: number };
  };
  duration_ms: number;
  next_cursor: string | null;
}
```

No habrá un `InternalJobPresenter` genérico. Los futuros jobs que tengan contratos de respuesta propios deberán usar presenters específicos de su recurso o proceso.

## Decision 17. Internal Jobs HTTP Boundary

La autenticación de la nueva frontera se implementará mediante `InternalJobsAuthGuard` en `infra/api/guards`.

- reutilizará `extractBearerToken` para validar el header Bearer
- obtendrá `INTERNAL_JOBS_TOKEN` mediante `EnvService`
- comparará el token en tiempo constante
- token faltante o malformado reutilizará las excepciones actuales de autenticación
- token distinto usará `AuthenticationException.tokenInvalid()`
- cualquier fallo de token responderá `401`

La contención por lock se expresará mediante una nueva `InternalJobException` con código `LOCK_ACTIVE` y `lockedUntil`. `GlobalExceptionMapper` la traducirá a `409 Conflict` y expondrá la disponibilidad en el wrapper estándar:

```ts
error_details: {
  // campos estándar existentes
  locked_until: string;
}
```

El controller específico será:

```text
src/internal/infra/api/controllers/internal-jobs/
  internal-asset-maintenance-record-materializations.controller.ts
```

Y expondrá:

```http
POST /v1/internal-jobs/internal-asset-maintenance-records/refresh-materializations
```

Estará protegido únicamente con `InternalJobsAuthGuard`. No utilizará JWT, contexto de usuario, roles ni permisos.

El command CQRS y su handler vivirán bajo el grupo `internal-jobs` y delegarán al caso de uso de refresh.

## Decision 18. Materialization Refresh Composition

Los refreshers individuales calcularán exclusivamente su materialización y no escribirán en persistencia por separado:

- `InternalAssetStatusMaterializationRefresher` calcula `expirationStatusMaterialization`.
- `InternalAssetNotificationMaterializationRefresher` calcula `expirationNotificationMaterialization`.

La escritura técnica de un lote será responsabilidad de `InternalAssetMaintenanceRecordTechnicalMaterializationsRefresher`:

1. recibe records y las materializaciones que deben refrescarse
2. resuelve las policies requeridas una sola vez por lote
3. invoca los refreshers individuales correspondientes
4. ejecuta una única llamada técnica a `updateMaterializations` por record

Usos aprobados:

- job técnico: refresca ambas materializaciones
- actualización de policy de estatus: procesa todos los records operativos asociados en lotes internos y refresca únicamente estatus
- actualización de policy de notificaciones: mismo criterio, solo notificaciones
- creación y edición de record: reutiliza ambos refreshers para calcular, pero persiste mediante el write ordinario y conserva auditoría de backoffice
- eliminación de policy: desvincula la referencia de todos los records asociados mediante la ruta técnica y rematerializa únicamente los records operativos

Los refreshers no persisten individualmente porque el job requiere que las dos materializaciones resultantes se escriban de forma atómica por record.

## Decision 19. Policy Cascades Do Not Alter Record Audit

Los cambios derivados de editar o eliminar una policy no representan una edición intencional del record de control de activos.

Por tanto:

- actualizar una policy refrescará materializaciones mediante la ruta técnica, sin modificar `updatedBy` ni `updatedAt`
- eliminar una policy limpiará su referencia en todos los records asociados no eliminados mediante la ruta técnica, sin modificar `updatedBy` ni `updatedAt`
- después de esa limpieza, solo los records operativos recalcularán la materialización afectada

La auditoría del record cambiará únicamente cuando un usuario lo cree, lo edite o lo elimine directamente desde su propio flujo de backoffice.

Esta decisión corrige el comportamiento actual, donde los use cases de edición y eliminación de policies invocan `record.updateDetails(...)` y el write ordinario para cada record afectado.
