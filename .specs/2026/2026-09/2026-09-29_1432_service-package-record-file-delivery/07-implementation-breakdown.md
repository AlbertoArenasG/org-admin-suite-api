# Implementation Breakdown

## Slice 1. Secure File Contract And Delivery

Implements task-list phases 1 and 2, plus the mandatory endpoint handoff.
Status: completed

Artifacts created or modified:

- the named request/application DTOs and their barrels;
- `DownloadServicePackageRecordFileUseCase`;
- `DownloadServicePackageRecordFileQuery` and handler, its barrel and
  `GlobalCqrsModule` registration;
- `ServicePackageController` and `ServicePackagePresenter`;
- Postman, authorization catalog documentation and frontend handoff.

Execution order:

1. Create DTOs and exports.
2. Implement the use case: record lookup, active-status and membership checks,
   then storage lookup with metadata fallback.
3. Add and register the thin CQRS adapter.
4. Add the guarded route before `records/:recordId`, headers and stream.
5. Adapt the shared presenter and build URLs from `API_BASE_URL` for list and
   detail responses.
6. Update the three contract documents during this slice, not at global close.

Compatibility and limits:

- no entity, domain port, Mongo schema/repository, index, migration, ZIP
  ingestion or PWA behavior changes;
- list and detail normalize the public file descriptor without changing the
  persisted shape;
- existing `service_packages.READ` remains the only authorization requirement;
- no unit tests are created or executed.

Validation: run `npm run build` and `git diff --check`. Prepare Postman/manual
scenarios for attachment, inline PDF/image, accented filename, missing/foreign
file, deleted record, missing JWT and missing permission.

Closure: static commands passed; endpoint, presenter and mandatory handoff
documents match the technical contract. The user confirmed manual validation.

## Slice 2. Manual Validation And Formal Closure

Implements task-list phase 3 verification after slice 1 is complete.
Status: completed

Artifacts updated: `03-task-list.md`, `05-progress.md`, `00-definition.md` and
`.specs/index.md` only after evidence exists.

The user runs the prepared manual scenarios against their API environment. No
server, seed, migration or test command is required from the user. The agent
records the outcomes without inferring success.

Compatibility: does not alter code, contracts or persisted data.

Closure: the user confirmed all manual scenarios; task checkboxes and lifecycle
statuses are completed, with no residual risks identified in approved scope.
