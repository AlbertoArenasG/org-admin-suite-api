# Implementation Breakdown

## Slice 1. Authorization Catalog

**Phase:** 2.

**Scope:** Add `CREATE` to `USERS` and align permanent authorization
documentation. No endpoint is exposed yet.

**Artifacts:** `AUTHORIZATION_CATALOG.USERS`, feature permission catalog.

**Validation:** inspect catalog-derived roles; run focused static checks after
the following slices.

**Close when:** `USERS:CREATE` is a valid operation without changing invitation
permissions.

## Slice 2. Atomic Application Flow

**Phase:** 2.

**Scope:** Extend direct-create input with optional `customerId`; wrap user
creation, optional relationship replacement and contact sync in the outer
transaction.

**Artifacts:** `CreateUserDto`, `CreateUserRequestDto`,
`CreateUserAndNotifyUseCase`; reuse command, manager and repositories.

**Limits:** no schema, migration, notification-policy or invitation changes.

**Validation:** focused behavior checks for no customer, valid customer,
invalid/inactive customer and `ADMIN` plus `customer_id`.

**Close when:** any rejected optional relationship rolls back newly created
user and contact writes.

## Slice 3. Backoffice API Surface

**Phase:** 3.

**Scope:** Add `POST /v1/users` and `GET /v1/users/creation-roles` before
dynamic `:userId`; protect both with `USERS:CREATE`.

**Artifacts:** `UserController`; reuse CQRS adapters, query, presenters and
global registrations.

**Limits:** retain `GET /v1/users/roles` under invitation permission.

**Validation:** request DTO/error envelope, 201 response, role lookup response
and 403 boundary.

**Close when:** both routes use the approved permission and no dynamic route
captures `creation-roles`.

## Slice 4. Consumer Contract And Manual Validation

**Phase:** 4.

**Scope:** finalize Postman, frontend handoff and permanent catalog docs.

**Artifacts:** Postman collection, frontend handoff, authorization catalog,
spec progress and task list.

**User command:**

```bash
npm run db:seed:roles
```

**When:** after Slice 1 is integrated and before validating role permissions in
an environment with persisted roles.

**Purpose:** materialize the catalog-derived `USERS:CREATE` operation into
default roles.

**Preconditions:** deployed or locally running code connected to the target
database; approval to modify persisted role permissions.

**Risk:** default role permissions are synchronized. Custom roles are not
automatically granted the new operation and must be configured intentionally.

**Expected evidence:** seed output indicating role updates or unchanged state;
then Postman confirms the acceptance matrix.

**Close when:** documentation reflects actual responses and the user confirms
seed plus manual endpoint validation.
