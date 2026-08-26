# Technical Design

## Objective

Add optional many-to-many relationships between application users and customers, materialized from invitations and maintained through the existing user update flow. Evolve contacts to support multiple company names derived from those relationships when applicable.

## 1. Internal Relationship Resource

`UserCustomerRelationship` will be an internal resource with its own layers:

```text
domain/entity
  -> domain/ports/repositories/user-customer-relationship
  -> infrastructure/mongoose schema, mapper and repositories
```

It will not have an HTTP controller, request DTO, presenter, CQRS command or CQRS query of its own. Invitation and user use cases will consume its ports.

The entity and its ports use domain IDs only. MongoDB `_id`, sessions and query details remain inside infrastructure.

## 2. Transaction Boundary

Add one generic transaction port, for example:

```ts
interface ITransactionalExecutor {
  execute<T>(work: () => Promise<T>): Promise<T>;
}
```

The application use cases will only execute their atomic work through this port. They will not receive sessions, transaction contexts, `ObjectId` values or Mongoose types.

Its Mongoose adapter will open and commit or roll back the MongoDB transaction. Infrastructure will retain the active Mongoose session internally so the repositories participating in the work use it automatically. Repository port signatures remain free of persistence-specific session parameters.

## 3. Relationship Entity And Repository Ports

`UserCustomerRelationship` will have its own domain ID and the following state:

```ts
interface UserCustomerRelationshipProps {
  id: string;
  userId: string;
  customerId: string;
}
```

Its read port will provide:

```ts
findByUserId(userId);
findByUserIds(userIds);
findByCustomerId(customerId);
```

Its write port will provide:

```ts
createMany(relationships);
replaceForUser(userId, relationships);
```

`createMany` materializes the initial relationships during invitation consumption. `replaceForUser` removes the user’s current relationships and persists exactly the supplied set; the use case invokes it inside the transaction boundary.

The Mongoose collection will enforce and optimize the relationship with:

```ts
{ user_id: 1, customer_id: 1 } // unique
{ customer_id: 1, user_id: 1 }
```

`ICustomerReadRepository.findByIds(customerIds)` resolves all customers needed by the batch resolver. `IContactWriteRepository` adds a semantic batch operation equivalent to:

```ts
replaceCompanyNamesForUsers(
  updates: Array<{ userId: string; companyNames: string[] }>,
): Promise<void>;
```

The contract uses domain IDs and normalized company-name collections only; the concrete bulk persistence strategy remains private to infrastructure.

## 4. User List Relationship Filters

Extend `FindUsersParams` and the application DTO with optional fields:

```ts
customerId?: string | null;
hasCustomerRelationship?: boolean | null;
```

When both fields are present, `MongooseUserReadRepositoryImpl.findAll` will use an aggregation internal to infrastructure to determine whether each user has a relationship with the requested customer. The filter applies only to `system_role: USER`, supports both related and unrelated users, and preserves existing search, authorization scope, sorting and pagination.

The aggregation is only a filtering implementation detail: the user list response will not include customer summaries or MongoDB relationship data. If neither filter is supplied, the existing `find()` path remains unchanged.

## 5. Customer Summaries In Administrative Details

Add `findByIds(customerIds)` to `ICustomerReadRepository`. It returns customers of every status, including `DELETED`.

Invitation and user mutation use cases will use the returned customers to verify that every requested ID exists and is `ACTIVE`. Detail use cases will use the same method to resolve relationship summaries without hiding deleted customers.

The application detail DTO will contain summaries ordered by `companyName` ascending:

```ts
{
  customerId: string;
  companyName: string;
  status: CustomerStatus;
}
```

The API presenter maps the summary to snake case and includes `status_name` through `EnumNameService`, following the existing localized enum pattern.

## 6. Mutation Orchestration

### 6.1 Application invitation creation

`CreateApplicationUserRegistrationInvitationUseCase` validates the optional `customerIds` against active customers and persists the normalized IDs in the invitation record. Email delivery remains outside a database transaction because it depends on the external provider.

### 6.2 Invitation consumption

After preparing the password hash and input, `CompleteNewUserRegistrationInvitationUseCase` executes the following inside `ITransactionalExecutor`:

1. Re-read and validate the pending invitation and email availability.
2. Create the user.
3. For `APPLICATION`, create its `UserCustomerRelationship` records.
4. Create or synchronize its contact with customer company names, or `['ICSACV']` when the invitation selected none.
5. Mark the invitation consumed.

The same transaction boundary applies to `MASTER` completion, omitting only relationship creation and customer-derived names.

### 6.3 User update and deletion

When `UpdateUserUseCase` receives `customerIds`, it validates active customers and executes the user update, full relationship replacement and contact company-name synchronization in one transaction. An explicit empty array produces `companyNames: []`.

When `customerIds` is omitted, the existing user/contact profile synchronization continues but preserves `companyNames`.

`DeleteUserUseCase` keeps the current logical deletion behavior. It does not mutate relationships or contact company names.

## 7. Contact Company Names Contract

Replace `companyName` / `company_name` completely with `companyNames: string[]` / `company_names: string[]` across the contact domain entity, application DTOs and mappers, HTTP request DTOs and presenters, Mongoose schema and mapper, seed, migration, documentation and frontend handoff.

The API will not retain a temporary compatibility field. `companyNames` normalizes values by trimming text, removing empty values and de-duplicating entries.

The corresponding frontend change must be deployed with this backend contract change.

## 8. Contact Search And Indexes

The Mongoose contact schema will persist `company_names` as a string array with `[]` as its default. Contact search filters will move from `company_name` to `company_names`; MongoDB regex matching against the array preserves the current functional search behavior.

Replace the contact text index:

```ts
{ full_name: 'text', company_name: 'text' }
```

with:

```ts
{ full_name: 'text', company_names: 'text' }
```

## 9. Contact Migration And Deployment Sequence

Add the historical script `migrate-contact-company-name-to-company-names` with package commands for `dry-run` and `apply`, following the existing Mongoose migration utilities.

Its apply mode will convert every legacy `company_name` value to `company_names`, remove `company_name`, replace the text index, and verify that no legacy field or invalid normalized collection remains.

There is no temporary compatibility field. The migration must run in the deployment window while the previous API is stopped or unused; then deploy the backend and frontend that use `company_names`.

## 10. Invitation Administrative Detail HTTP Contract

Add the authenticated route:

```text
GET /v1/user-registration-invitations/:invitationId
```

It uses `JwtAuthGuard`, `PermissionsGuard` and `user_registration_invitations/READ`. It will have a dedicated CQRS query, adapter, handler and application use case. The query only resolves `APPLICATION` invitations; an ID belonging to `MASTER` is indistinguishable from an absent resource and returns `404`.

The response extends the existing administrative invitation representation with `customers`:

```json
{
  "customer_id": "...",
  "company_name": "...",
  "status": "ACTIVE",
  "status_name": "Activo"
}
```

The invitation list and creation, resend and revoke responses remain without customer summaries.

## 11. `customer_ids` Request Contracts

`POST /v1/user-registration-invitations` accepts optional `customer_ids: string[]`. When omitted, its application DTO receives an empty selection.

`PATCH /v1/users/:userId` accepts optional `customer_ids: string[]` with distinct semantics:

- omitted: preserve effective relationships;
- `[]`: remove all effective relationships;
- populated: replace all effective relationships.

Both request DTOs validate an array of non-empty strings. Duplicate IDs, customer existence and status, and target system-role validation remain application concerns. Master invitation routes and DTOs will not accept this field.

## 12. User List Relationship Filter Contract

`GET /v1/users` accepts the pair:

```text
customer_id=:customerId
has_customer_relationship=true|false
```

Both query parameters are mandatory when either is supplied. The request DTO rejects an incomplete pair with `400`, preventing `customer_id` from acquiring an implicit meaning.

The query does not validate that `customer_id` identifies an existing customer. A syntactically valid ID without relationships, including one that does not exist, produces an empty list.

## 13. User Administrative Detail Contract

Reuse `GetUserByIdQuery` and its use case with the internal option:

```ts
includeCustomerRelationships: boolean;
```

`GET /v1/users/:userId` sets it to `true`, resolves customer summaries and exposes `customers` through `UserPresenter`. `GET /v1/users/me` sets it to `false`, preserving its current response shape. User lists and update responses also omit `customers`.

`UserPresenter` includes the snake-case customer summaries only when the use case resolved them, avoiding a duplicated query or detail use case.

## 14. Registrations And Deliverables

Register the `UserCustomerRelationship` schema, mapper and repositories in the existing global Mongoose infrastructure. Register `ITransactionalExecutor` with its Mongoose adapter in the same infrastructure boundary.

Register the invitation-detail query, adapter and handler in the existing CQRS structure and `GlobalCqrsModule`.

This feature does not modify the module catalog, operation catalog, authorization guards or system-role seed. It reuses existing permissions.

Add `db:migrate:contact-company-names:dry-run` and `db:migrate:contact-company-names:apply` package scripts. Update the Postman collection, add a `docs/frontend/` handoff covering API contracts and coordinated deployment, and perform a complete `docs/` sweep for contacts, users and invitations.

## 15. Derived Contact Company-Name Protection

`UpdateContactUseCase` rejects an explicit `companyNames` update when the target contact has `userId`. The existing update behavior for its other permitted fields remains unchanged. This preserves user-customer relationships as the sole source of company names for user-linked contacts.

## 16. Shared Synchronization Services

Keep invitation, user and customer use cases as orchestrators. Extract small shared application services for relationship validation and for resolving and synchronizing the company names of user-linked contacts.

Compose the company-name synchronization with three narrow application services:

- `UserCustomerCompanyNamesResolver`: receives one or more domain user IDs and resolves the current company names from their relationships.
- `UserContactCompanyNamesSynchronizer`: applies resolved names to the linked contacts.
- `CustomerContactCompanyNamesSynchronizer`: receives a customer ID, locates affected users and delegates to the resolver and contact synchronizer.

Invitation consumption and user relationship replacement use the resolver and contact synchronizer for one user. `UpdateCustomerUseCase` invokes the customer-oriented synchronizer when a company-name change is requested. The customer update and the propagation to affected contacts run inside the same `ITransactionalExecutor` boundary: a propagation failure rolls back the customer-name update as well.

The required reads and writes operate on sets of domain IDs, avoiding one query per user. Their concrete grouping and bulk persistence behavior remain inside infrastructure. This composition introduces no public endpoint, event or listener.

The resolver returns a deterministic collection of `{ userId, companyNames }`; users without relationships resolve to an empty collection. Derived names are ordered by company name ascending and then customer ID, before contact normalization. `CompleteNewUserRegistrationInvitationUseCase` alone replaces that empty result with `['ICSACV']` when consuming an application invitation that selected no customers. Explicit empty replacements through `UpdateUserUseCase` remain `[]`.

## 17. Manual Validation Scope

No automated tests are included in this delivery. The approved manual validation checklist covers migration, invitation lifecycle, detail and filter contracts, relationship replacement, contact synchronization, derived-field protection, user lifecycle retention and scope boundaries. The exact Postman requests and database verification steps will be documented during implementation and closure.

## 18. Reusable Customer Options

Add a dedicated `GetCustomerOptionsUseCase` under the customer boundary. It will call an explicit `ICustomerReadRepository.findOptions()` port method; it will not load fiscal profiles or simulate an unpaginated administrative list.

The Mongoose adapter will select only `ACTIVE` customers, sort by `company_name` and `customer_id` ascending, and map them through a minimal application DTO. The HTTP route `GET /v1/customers/options` will be declared before `:customerId`, use `JwtAuthGuard` plus `AuxiliaryCapabilitiesGuard`, and require `CUSTOMERS/READ_OPTIONS`.

Register the capability in the existing auxiliary catalog and derive it from `USER_REGISTRATION_INVITATIONS` and `USERS`. System roles receive the new derived capability when the existing role seed runs; a custom role receives it when its direct permissions are saved again, following the established derivation lifecycle.
