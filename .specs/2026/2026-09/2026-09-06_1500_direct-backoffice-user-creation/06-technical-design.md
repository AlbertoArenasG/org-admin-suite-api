# Technical Design

## HTTP Contract

### Create direct user

```text
POST /v1/users
Authorization: Bearer JWT
Permission: USERS:CREATE
```

Request extends the existing direct-create shape with optional `customer_id`:

```json
{
  "name": "Ana",
  "lastname": "Lopez",
  "email": "ana@example.com",
  "password": "A-secure-password",
  "system_role": "USER",
  "role_id": "ROLE_ID",
  "is_internal_staff": false,
  "customer_id": "CUSTOMER_ID"
}
```

`cell_phone` remains optional. Omit `customer_id` to create without a customer.
The response is the existing `UserPresenter` envelope with `201 Created`.

### Assignable roles for direct creation

```text
GET /v1/users/creation-roles
Authorization: Bearer JWT
Permission: USERS:CREATE
```

Reuses `GetUserRolesQuery` and `UserRolePresenter`; its response contract
matches the existing `/v1/users/roles` lookup. It is deliberately a dedicated
route so invitation management retains its separate authorization boundary.

`creation-roles` is declared before `:userId` in `UserController`.

## Write Flow

1. Controller validates DTO and dispatches the existing
   `CreateUserAndNotifyCommandAdapter` with actor system role.
2. Use case applies existing role-hierarchy, unique-email and password checks.
3. One `ITransactionalExecutor` scope creates the active User.
4. If `customerId` is present, it invokes
   `UserCustomerRelationshipManagerService.replaceForUser` with exactly that
   ID. Existing validation enforces a non-deleted, active Customer and `USER`
   system role.
5. The existing contact synchronization completes inside the same transaction.
6. After commit, the existing welcome notifier runs unchanged; its current
   provider-error behavior is retained.
7. The existing result mapper/presenter builds the response.

## Authorization

`AUTHORIZATION_CATALOG.USERS.operations` gains `CREATE`. The operation is
assigned by the existing role seed to its derived default roles. No new module,
operation family, capability or custom seed is introduced.

Both new routes use `JwtAuthGuard`, `PermissionsGuard` and
`@RequirePermission('users', 'CREATE')`. They do not require
`CUSTOMERS:UPDATE`, `ROLES:READ` or invitation permissions.

## Persistence And Compatibility

- No schema, entity, repository port, index or migration changes.
- The existing transaction-aware user, relationship and contact repositories
  participate in the outer session.
- Invitation creation and completion retain their contracts and existing route.
- Existing `GET /v1/users/roles` remains protected by
  `USER_REGISTRATION_INVITATIONS:CREATE`.

## Contract And Repository Impact

Consumer: `org-admin-suite-frontend`, future direct-user creation view.

| Document | Required update |
| --- | --- |
| `docs/frontend/direct-backoffice-user-creation-handoff.md` | New endpoint, role lookup, payload, validation and permission contract. |
| `docs/icsacv-api.postman_collection.json` | New POST and GET requests with success and invalid examples. |
| `docs/authorization/feature-permission-catalog.md` | `USERS:CREATE` and both ordinary-backoffice routes. |

The frontend must use `creation-roles` for this form and
`GET /v1/customers/options` for its optional Client selector. It must not use
the invitation roles lookup or compose two write calls.

## Registro De Artefactos

| Artifact | Type | Location | Responsibility | Dependencies | State |
| --- | --- | --- | --- | --- | --- |
| `AUTHORIZATION_CATALOG.USERS` | authorization catalog | `src/internal/application/services/authz/authorization.catalog.ts` | Declare `CREATE` as valid Users operation. | existing role seed and `PermissionsGuard` | modify |
| `CreateUserDto` | application DTO | `src/internal/application/dto/user/create-user.dto.ts` | Carry optional `customerId`. | user creation use case | modify |
| `CreateUserRequestDto` | HTTP request DTO | `src/internal/infra/api/dto/user/create-user.request.dto.ts` | Validate and map optional `customer_id`. | class-validator, `CreateUserDto` | modify |
| `CreateUserAndNotifyUseCase` | application use case | `src/internal/application/use-cases/user/create-user-and-notify.use-case.ts` | Orchestrate atomic create, optional relationship and contact sync. | transactional executor, relationship manager, existing repos/notifier | modify |
| `CreateUserAndNotifyCommandAdapter` | CQRS command | `src/internal/infra/cqrs/commands/user/create-user-and-notify.handler.ts` | Transport expanded DTO without a new command family. | modified DTO/use case | reuse |
| `UserCustomerRelationshipManagerService` | application service | `src/internal/application/services/user-customer-relationship/user-customer-relationship-manager.service.ts` | Validate and replace optional customer relation inside inherited transaction. | customer/user relationship repositories | reuse |
| `UserController` | HTTP controller | `src/internal/infra/api/controllers/user/user.controller.ts` | Expose direct creation and creation-role lookup. | command/query buses, presenters, guards | modify |
| `GetUserRolesQuery` and handler | CQRS query | `src/internal/infra/cqrs/queries/user/` | Resolve roles assignable to actor. | roles repository | reuse |
| `UserPresenter`, `UserRolePresenter` | presenters | `src/internal/infra/api/presenters/user/` | Preserve existing response envelopes. | result DTOs | reuse |
| global CQRS module | composition | `src/modules/global-cqrs.module.ts` | Existing handler remains registered. | command/query handlers | reuse |
| Mongoose user/customer/contact/relationship repositories | persistence | `src/internal/infra/persistence/mongoose/repositories/` | Join existing outer transaction. | transaction context | reuse |
| user schema/entity/ports | domain and persistence | `src/internal/domain/`, `src/internal/infra/persistence/mongoose/schemas/` | No data-model change. | not applicable | not_applicable |
| migration/backfill/index | persistence data | `src/internal/infra/persistence/mongoose/migrations/` | No data change required. | not applicable | not_applicable |
| permission seed execution | operational validation | user command: `npm run db:seed:roles` | Materialize `USERS:CREATE` into default roles. | authorization catalog | modify |
| Postman collection | API contract | `docs/icsacv-api.postman_collection.json` | Record both endpoints and examples. | final HTTP contract | modify |
| frontend handoff | integration document | `docs/frontend/direct-backoffice-user-creation-handoff.md` | Give frontend integration rules. | final HTTP contract | new |
| permission catalog documentation | permanent documentation | `docs/authorization/feature-permission-catalog.md` | Record new Users operation/routes. | authorization catalog | modify |
| focused tests | verification | existing test structure or new focused tests beside affected code | Verify transaction/validation/authorization where supported. | implemented flow | modify |

## Validation Strategy

| Risk | Level | Evidence | Owner |
| --- | --- | --- | --- |
| Invalid customer leaves a user behind | focused automated test if repository harness permits; manual API validation | no user or relation after rejected request | user for API environment |
| Role/customer incompatibility | DTO/use-case test and Postman | `400`, no writes | agent/user |
| Permission and role lookup boundary | endpoint test and Postman | `403` without `USERS:CREATE`; `200` with it | user for API environment |
| Catalog materialization | manual seed | seed reports Users CREATE updates as applicable | user |
| Existing invitations regress | focused static/type checks and existing endpoint smoke validation | invitation route remains available | agent/user |
