# Decisions

## Decision 01. Ordinary Backoffice Boundary

**Approved.** Direct user creation belongs to `POST /v1/users`, not to the
Master Admin boundary. It is protected by `USERS:CREATE` and accepts only
`ADMIN` and `USER`, as enforced by the existing request DTO and authorization
service.

## Decision 02. Optional Singular Customer

**Approved.** `customer_id` is optional and singular at creation time. It may
only accompany `USER`; `ADMIN` remains an internal user without customer
relationships. Multiple-customer management remains the explicit edit flow.

## Decision 03. Atomic Write

**Approved.** The use case owns one outer transaction for user creation,
optional `replaceForUser({ customerIds: [customerId] })` and contact
synchronization. `replaceForUser` reuses that session through the existing
transaction context.

## Decision 04. Role Lookup

**Approved.** A local `GET /v1/users/creation-roles` endpoint reuses
`GetUserRolesQuery` but requires `USERS:CREATE`. The invitation-specific
`GET /v1/users/roles` keeps its current invitation permission and behavior.

## Decision 05. Notifications

**Approved.** Welcome notifications remain unchanged and are attempted after
the database transaction, as they are today in the existing direct-create use
case. This spec does not add retries, an outbox or a new failure contract.
