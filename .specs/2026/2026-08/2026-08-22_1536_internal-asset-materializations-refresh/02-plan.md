# Implementation Plan

## Phase 1. Technical Foundations

- Define the `internal-jobs` bearer-token guard and add `INTERNAL_JOBS_TOKEN` to validated environment configuration.
- Define the lock port and its Mongo persistence implementation under the approved structural design.
- Register the new infrastructure pieces using the existing global Mongoose and repository patterns.

## Phase 2. Materialization Refactor

- Split business materialization calculation from technical persistence.
- Add independent status and notification refreshers.
- Add a technical partial write path that only persists materializations and preserves user audit fields.
- Add the operational cursor query and compound index.

## Phase 3. Trigger Integration

- Route normal record CRUD through the refactored materialization components while keeping its existing backoffice audit semantics.
- Route policy updates through the shared operational refresh orchestration.
- Preserve policy deletion reference cleanup for all associated non-deleted records, then refresh operational records where applicable.

## Phase 4. Internal Job Endpoint

- Implement the composed refresh use case, CQRS command and `internal-jobs` controller endpoint.
- Apply the fixed batch size, opaque cursor protocol, lock behavior, response contract and Nest logging approved in definition.

## Phase 5. Documentation And Manual Validation

- Add `docs/runbooks/internal-jobs.md`.
- Execute the manual validation scope defined in `00-definition.md`.
- Record the validation result and formally close the spec.
