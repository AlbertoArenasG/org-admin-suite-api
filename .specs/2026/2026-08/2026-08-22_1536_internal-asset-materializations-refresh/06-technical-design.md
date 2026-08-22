# Technical Design

## Scope Boundary

Esta implementación agrega una frontera técnica reutilizable para jobs internos y el primer job de refresco de materializaciones de records de activos. No cambia contratos de frontend, autenticación JWT, roles ni permisos de backoffice.

El único endpoint nuevo pertenece a `internal-jobs` y se autentica mediante `INTERNAL_JOBS_TOKEN`.

## New And Changed Domain Contracts

### Internal Job Lock Port

Se agregará `IInternalJobLockRepository` bajo `src/internal/domain/ports/repositories/internal-job-lock/` y se exportará desde los barrels de repositories.

Contrato aprobado:

```ts
acquire({ jobName, executionId, leaseDurationMs }): Promise<{
  acquired: boolean;
  lockedUntil?: Date;
}>;

release({ jobName, executionId }): Promise<void>;
```

No se creará entidad de dominio para el lock. Es una abstracción de coordinación técnica reutilizable, no una entidad de negocio.

### Internal Job Exception

Se agregará `InternalJobException` en `src/internal/domain/exceptions/` y se exportará desde su barrel.

- código inicial: `INTERNAL_JOB.LOCK_ACTIVE`
- contiene `lockedUntil`
- `GlobalExceptionMapper` la traducirá a `409 Conflict`
- `GlobalExceptionFilter` incluirá `locked_until` en `error_details` para esa excepción

Se agregarán mensajes correspondientes en `es/errors.json` y `en/errors.json`.

### Internal Asset Record Repository Contracts

El read repository añadirá:

```ts
type InternalAssetMaintenanceOperationalCursor = {
  createdAt: Date;
  recordId: string;
};

findOperational({
  after?,
  limit,
  expirationStatusPolicyId?,
  expirationNotificationPolicyId?,
}): Promise<{ data: InternalAssetMaintenanceRecord[] }>;
```

La consulta incluye siempre `PENDING` e `IN_PROGRESS`, usa cursor estricto y orden estable por `createdAt ASC`, `internal_asset_maintenance_record_id ASC`.

El write repository sustituirá el contrato técnico inicialmente planteado solo para materializaciones por:

```ts
updateSystemManagedFields({
  recordId,
  expirationStatusPolicyId?,
  expirationNotificationPolicyId?,
  expirationStatusMaterialization?,
  expirationNotificationMaterialization?,
}): Promise<{ updated: boolean }>;
```

Solo estos cuatro campos pueden mutarse por esta ruta. `undefined` no cambia un campo y `null` lo limpia. Requiere al menos una mutación efectiva.

## Application Design

### DTOs

Se agregará el grupo `application/dto/internal-jobs/` con:

- input de refresh con `cursor?: string`
- resultado de refresh con métricas, duración y `nextCursor`

El cursor se recibe y devuelve opaco. El caso de uso será el único responsable de codificar y decodificar Base64URL del shape `{ createdAt, recordId }`, validándolo antes de consultar persistencia.

### Independent Materialization Refreshers

Bajo `application/services/internal-asset-maintenance/` se agregarán:

- `InternalAssetStatusMaterializationRefresher`
- `InternalAssetNotificationMaterializationRefresher`
- `InternalAssetMaintenanceRecordTechnicalMaterializationsRefresher`

Los dos refreshers específicos calcularán únicamente su respectiva materialización reutilizando las reglas existentes en `internal-asset-maintenance.utils.ts`.

El refresher técnico compuesto:

1. recibe un lote y las materializaciones que debe refrescar
2. resuelve las policies del lote una sola vez con `findPoliciesByIds`
3. invoca los refreshers específicos requeridos
4. ejecuta una sola llamada `updateSystemManagedFields` por record

El refresher compuesto expondrá una operación de lote para el job y una operación interna que itera lotes operativos para las actualizaciones de policy. El límite interno común será `100`.

### Use Cases And Existing Triggers

Se agregará `RefreshInternalAssetMaintenanceRecordMaterializationsUseCase` bajo `application/use-cases/internal-jobs/`.

Su secuencia será:

1. decodificar cursor opcional
2. generar `executionId`
3. adquirir lock para `internal_asset_materializations_refresh`
4. consultar un lote operacional de 100 records
5. refrescar ambas materializaciones mediante el refresher técnico compuesto
6. derivar `nextCursor` del último record procesado, o `null` si no hay más
7. registrar métricas de Nest Logger
8. liberar lock en `finally`

Los flujos existentes cambiarán así:

- crear/editar record: usan los refreshers para cálculo, pero conservan `record.updateDetails(...)` y write ordinario porque son cambios directos de backoffice
- actualizar policy de estatus: iteran records operativos asociados y refrescan solamente estatus mediante el write técnico
- actualizar policy de notificaciones: mismo flujo, solo notificaciones
- eliminar policy: recuperan todos los records asociados no eliminados; limpian la asociación mediante `updateSystemManagedFields`; para records operativos incluyen también la materialización afectada en la misma escritura técnica

No se actualizarán ambas materializaciones cuando cambie una sola policy. Cada trigger refresca únicamente la materialización afectada, salvo el job temporal que refresca ambas.

## Infrastructure Design

### Environment And Guard

`src/internal/infra/env/env.ts` incorporará `INTERNAL_JOBS_TOKEN` como variable requerida.

Se agregará `InternalJobsAuthGuard` en `src/internal/infra/api/guards/`:

- reutiliza `extractBearerToken`
- obtiene el secreto mediante `EnvService`
- compara con `timingSafeEqual`
- reutiliza `AuthenticationException` para `401`

### Lock Persistence

Se agregará:

```text
src/internal/infra/persistence/mongoose/schemas/internal-job-lock/
src/internal/infra/persistence/mongoose/repositories/internal-job-lock/
```

La colección `internal_job_locks` tendrá:

- `job_name`: único
- `execution_id`
- `locked_until`

La adquisición será atómica. Cuando el documento no exista o el lease esté vencido, lo adquiere con el nuevo `executionId`. Ante una carrera de inserción o lease, la implementación vuelve a leer/reintentar y solo devuelve lock activo si su `locked_until` continúa vigente. `release` elimina o libera únicamente el lock que coincida con `jobName` y `executionId`.

Schema y repositorio se registrarán en `schemas.config.ts`, `mongoose-repositories.config.ts` y sus barrels respectivos.

### Internal Asset Persistence

El schema de records agregará:

```ts
{ status: 1, createdAt: 1, internal_asset_maintenance_record_id: 1 }
```

La implementación Mongoose de `findOperational` aplicará filtros de policy opcionales, el predicado de cursor aprobado, orden y límite.

`updateSystemManagedFields` utilizará `$set` limitado a los campos autorizados y `{ timestamps: false }`. No utilizará el mapper completo ni el write ordinario.

### HTTP, CQRS And Presentation

Se agregará:

```text
src/internal/infra/api/controllers/internal-jobs/
src/internal/infra/api/dto/internal-jobs/
src/internal/infra/cqrs/commands/internal-jobs/
```

El controller expone:

```http
POST /v1/internal-jobs/internal-asset-maintenance-records/refresh-materializations
```

El request acepta `{ cursor?: string }`. El controller usa `InternalJobsAuthGuard`, envía el DTO al command y devuelve el wrapper estándar.

Se agregará `InternalAssetMaintenanceRecordMaterializationsRefreshPresenter` junto a los presenters del recurso. Su respuesta usa `snake_case` y expone:

- `processed_records`
- métricas de `expiration_status` y `expiration_notification`
- `duration_ms`
- `next_cursor`

El command handler se añadirá al registro de `GlobalCqrsModule`; controller, guard y presenter se exportarán o registrarán con los patrones existentes de la API.

## Logging And Runbook

El use case técnico usa `Logger` de Nest. Registra inicio, finalización, lock activo y error con `jobName`, `executionId`, duración, métricas y presencia de cursor. No registra el token ni el cursor completo.

Se agregará `docs/runbooks/internal-jobs.md` con la operación manual, continuación de cursor, recuperación ante `401`, `409` y errores de lote, rotación de token y verificación de Mongo/logs.

## Explicit Non-Goals

- cron interno
- scheduler o script externo
- checkpoints o historial de ejecución persistido
- renovación de lease
- pruebas automatizadas en esta primera versión
- exposición de nuevas capacidades o controles en frontend

