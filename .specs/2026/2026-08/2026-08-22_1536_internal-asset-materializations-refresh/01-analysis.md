# Technical Analysis

## Existing Structure

- HTTP controllers are grouped by boundary under `src/internal/infra/api/controllers/`.
- `public` and `master-admin` already have their own controller folders and barrel exports.
- Backoffice endpoints use JWT plus the permission guards. `master-admin` adds `MasterScopeGuard`.
- Environment configuration is validated centrally through `envSchema` and accessed through `EnvService`.
- Mongoose schemas and repository implementations are registered globally through their respective configuration files.
- Application commands are invoked from controllers through CQRS handlers, which delegate to use cases.
- API responses use `ApiResponseBuilder` and uncaught domain exceptions are mapped by `GlobalExceptionFilter`.

## Relevant Internal Asset Behavior

### Materialization

- `buildInternalAssetMaintenanceRecordMaterializations` currently produces both expiration materializations.
- `applyInternalAssetMaintenanceRecordMaterializations` currently delegates to `record.updateDetails(...)`.
- That mutation is appropriate for normal backoffice changes but updates the record audit fields, so it cannot be reused unchanged by a technical refresh.

### Policy Updates And Deletes

- Policy updates currently fetch every non-deleted associated record and rematerialize each one.
- Policy deletion fetches every non-deleted associated record to remove the policy reference.
- The approved target behavior requires policy updates to query only operational records, while policy deletion must still unlink every associated non-deleted record.

### Persistence

- The record uses the domain identifier `internal_asset_maintenance_record_id`; Mongo `_id` is not exposed at application boundaries.
- The regular write repository performs a full document update and allows Mongoose timestamps.
- A dedicated partial technical update is therefore required for materializations, with `timestamps: false`.
- The read repository has policy-specific methods but no shared operational cursor query.

## Integration Implications

### `internal-jobs` Boundary

The new controller group can follow the existing controller export and global module patterns, but it will use a dedicated bearer-token guard rather than `JwtAuthGuard` or role guards.

`INTERNAL_JOBS_TOKEN` must be added to the validated environment contract. The guard should reuse the existing bearer-header parsing utility, but compare the parsed token with the configured technical secret.

### Job Lock

Cross-instance coordination requires a persistence-backed abstraction. The application layer must depend on a lock port, while Mongo atomic acquisition and release remain in the Mongoose implementation.

The exact shape and placement of that port, schema and repository remains the first technical-structure decision before implementation.

### Refresh Flow

The composed job use case should:

1. Validate and decode the optional opaque cursor.
2. Acquire the technical lock.
3. Retrieve at most 100 operational records in stable cursor order.
4. Resolve required policies for the batch.
5. Invoke the independent status and notification refreshers.
6. Persist both resulting materializations in one technical update per record.
7. Return metrics and the next opaque cursor.
8. Release the lock in `finally`.

Policy update use cases will reuse the refresh orchestration without depending on cursors, locks, controller concerns or `internal-jobs` authentication.

## Technical Risks To Address

- The atomic lock must handle an expired lease as acquirable across concurrent API instances.
- The normal update path and technical refresh path must remain distinct so technical runs never alter `updatedAt` or `updatedBy`.
- Cursor predicates must be based on `createdAt` and domain record ID to match the approved stable sort.
- A compound index must support the operational status filter and cursor ordering.
- Errors after partially processing a batch must preserve retry from the last confirmed cursor, as approved.

