# Technical Design

## Objective

Add backoffice administration for `APPLICATION` user-registration invitations while preserving the existing public registration flow and the shared `MASTER` creation flow.

This design follows the repository pipeline:

```text
controller -> request DTO -> CQRS command/query -> use case -> repository -> presenter
```

No business logic will be added to controllers, and persistence details such as Mongo `_id` will not cross the domain boundary.

## Scope Boundaries

- New administrative operations are limited to `scope: APPLICATION`.
- Existing creation remains available for `APPLICATION` and `MASTER`.
- Public lookup and completion remain public, but reject `REVOKED` invitations.
- No expiration, physical deletion, migration, outbox, lock, or automated test suite is included.

## 1. Domain And Repository Ports

### 1.1 Invitation record

Extend `user-registration-invitation.types.ts`:

```ts
enum UserRegistrationInvitationStatus {
  PENDING = 'PENDING',
  CONSUMED = 'CONSUMED',
  REVOKED = 'REVOKED',
}

enum UserRegistrationInvitationEmailDeliveryStatus {
  ACCEPTED = 'ACCEPTED',
  FAILED = 'FAILED',
}

interface UserRegistrationInvitationEmailDelivery {
  lastAttemptAt: Date | null;
  lastAttemptStatus: UserRegistrationInvitationEmailDeliveryStatus | null;
}
```

`CreateUserRegistrationInvitationRecord` and `UserRegistrationInvitationRecord` will contain:

```ts
emailDelivery: UserRegistrationInvitationEmailDelivery;
resendCount: number;
revokedAt: Date | null;
revokedByUserId: string | null;
```

`REVOKED` is terminal. Existing invitations stay compatible through mapper defaults, never through migration.

### 1.2 Read port

Retain active-email and token lookups. Add application-only methods to `IUserRegistrationInvitationReadRepository`:

```ts
findAllApplicationInvitations(input): Promise<{
  data: UserRegistrationInvitationRecord[];
  total: number;
}>;

findApplicationInvitationById(
  invitationId: string,
): Promise<{ data: UserRegistrationInvitationRecord | null }>;
```

The list input supports pagination, optional email search, optional status and sort. Only `status` and `createdAt` are sortable; the application layer supplies `createdAt DESC` by default.

### 1.3 Write port

Retain `create` and `markAsConsumed`. Add explicit methods:

```ts
rotatePendingInvitationToken(input): Promise<{
  data: UserRegistrationInvitationRecord | null;
}>;

markInvitationEmailAccepted(input): Promise<{
  data: UserRegistrationInvitationRecord | null;
}>;

revokePendingApplicationInvitation(input): Promise<{
  data: UserRegistrationInvitationRecord | null;
}>;
```

`rotatePendingInvitationToken` compares `invitationId`, `APPLICATION`, `PENDING`, `consumedAt: null`, and expected token hash. It writes the new hash, current `FAILED` attempt metadata and increments `resendCount`.

`markInvitationEmailAccepted` matches a pending invitation and its token hash. A preceding revocation therefore cannot be overwritten by a late delivery confirmation.

`revokePendingApplicationInvitation` conditionally writes `REVOKED`, `revokedAt` and `revokedByUserId` only on pending application invitations.

Repository absence is neutral; use cases map it to `404` or `409` after their preceding read.

## 2. Application Layer

### 2.1 DTOs and mappers

Keep the public `UserRegistrationInvitationDto`. Add administrative DTOs exposing only:

```text
invitationId, email, status, systemRole, roleId, userData,
invitedByUserId, createdAt, consumedAt, revokedAt, revokedByUserId,
emailDelivery, resendCount
```

No DTO or presenter exposes token, hash, URL, provider response, or Mongo `_id`.

### 2.2 Use cases

Add:

- `GetApplicationUserRegistrationInvitationsUseCase`
- `ResendApplicationUserRegistrationInvitationUseCase`
- `RevokeApplicationUserRegistrationInvitationUseCase`

The list delegates normalized filters and sort to the application-only read port.

Re-send reads by public ID, returns `404` when absent, rejects non-pending/consumed state with `UserRegistrationInvitationException` (`409`), generates a token, rotates atomically, sends email, confirms `ACCEPTED`, and returns the administrative DTO.

Revocation reads by public ID, returns `404` when absent, rejects an inoperable state with `409`, conditionally revokes, and returns the administrative DTO.

### 2.3 Existing flows

Both current creation use cases create invitations with:

```ts
emailDelivery: { lastAttemptAt: now, lastAttemptStatus: FAILED }
resendCount: 0
revokedAt: null
revokedByUserId: null
```

After the current notifier accepts the email, both call `markInvitationEmailAccepted`.

Public lookup and completion reject both `CONSUMED` and `REVOKED` invitations, preventing disclosure and completion from a revoked link.

### 2.4 Exceptions

Add `UserRegistrationInvitationException` following the existing domain exception pattern. It covers consumed, revoked and concurrent mutation states, and global exception mapping returns `409 Conflict`.

`EntityAlreadyExistsException` remains for existing user emails and active duplicate invitations.

## 3. Persistence

### 3.1 Schema and mapper

Extend the document with:

```text
email_delivery.last_attempt_at
email_delivery.last_attempt_status
resend_count
revoked_at
revoked_by_user_id
```

`MongooseUserRegistrationInvitationMapper.toDomain` normalizes missing historical metadata to null/zero and maps camelCase to the existing snake_case persistence convention.

### 3.2 Repositories

Implement the new methods in the existing invitation Mongoose repositories. Every administrative filter includes `scope: APPLICATION`; the new methods cannot list or mutate `MASTER` data.

Use one conditional Mongo update for rotation and revocation. Do not replace it with an independent read/write sequence.

### 3.3 Indexes

Add:

```ts
{ scope: 1, createdAt: -1 }
{ scope: 1, status: 1, createdAt: -1 }
```

Existing indexes remain unless schema review identifies an exact duplicate.

## 4. CQRS And HTTP

### 4.1 CQRS

Add a query, adapter and handler for the list, plus command, adapter and handler pairs for re-send and revoke. Register them in `GlobalCqrsModule` following existing invitation conventions.

### 4.2 Controller

Extend authenticated `UserRegistrationInvitationController`:

```text
GET  /v1/user-registration-invitations
POST /v1/user-registration-invitations/:invitationId/resend
POST /v1/user-registration-invitations/:invitationId/revoke
```

| Route | Permission | Response |
| --- | --- | --- |
| `GET` | `user_registration_invitations/READ` | paginated administrative rows |
| `POST .../resend` | `user_registration_invitations/RESEND` | updated administrative row |
| `POST .../revoke` | `user_registration_invitations/REVOKE` | updated administrative row |

The list request DTO validates `page`, `limit`, `search`, `status`, and `sort[]`. Unsupported sort fields/directions are rejected before CQRS. Mutation endpoints receive no body.

### 4.3 Presentation and i18n

Add an administrative presenter method or dedicated presenter while preserving public response shape. Add localized success messages for re-send and revoke. Statuses remain codes; frontend owns display labels.

## 5. Authorization And Seeders

Add `READ`, `RESEND`, and `REVOKE` to the invitation module catalog; add the two new actions to the global operation catalog and ES/EN labels. `UPDATE` remains reserved.

The current system-role seed will be run to grant derived operations only to `MASTER_ADMIN` and `ADMIN`; custom roles remain untouched.

## 6. Documentation And Validation

Update:

- `docs/icsacv-api.postman_collection.json` with authenticated administrative scenarios.
- a new `docs/frontend/` handoff with routes, permissions, query params, response shape, actions, lifecycle and token rotation.
- any relevant existing docs found in the mandatory `docs/` sweep.

Manual Postman validation covers listing, pagination, search, status filters, default/compound sorting, application and master creation metadata, re-send rotation/counter/failures, revocation, invalid public lookup/completion, and system-role seeding without custom-role changes.
