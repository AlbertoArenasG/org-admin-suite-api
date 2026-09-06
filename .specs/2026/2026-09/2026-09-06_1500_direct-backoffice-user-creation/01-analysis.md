# Analysis

## Current State

- `CreateUserAndNotifyUseCase` already validates hierarchy, email uniqueness
  and password policy; hashes the password, creates an `ACTIVE` user,
  synchronizes its Contact and requests the welcome notification.
- `CreateUserRequestDto` and `CreateUserAndNotifyCommandAdapter` already
  exist, but `UserController` does not expose a `POST /v1/users` route.
- `UserCustomerRelationshipManagerService.replaceForUser` validates Client
  eligibility, creates relationships and synchronizes contact company names
  inside `ITransactionalExecutor`.
- Completing an application invitation already composes user creation and
  relationship replacement in one outer transaction. That is the direct
  creation reference flow.
- `GET /v1/users/roles` currently uses
  `USER_REGISTRATION_INVITATIONS:CREATE`; a direct-creation form cannot rely
  on it while claiming `USERS:CREATE` as its only functional permission.
- `AUTHORIZATION_CATALOG.USERS` currently omits `CREATE`, so the operation and
  its default-role seed must be added.

## Risks And Controls

| Risk | Control |
| --- | --- |
| User persists if customer association fails | Wrap creation, optional replacement and contact synchronization in one outer transaction. |
| User role receives a Client relation | Reuse `replaceForUser`, which rejects non-`USER` roles with customer IDs. |
| New screen needs unrelated permissions for role choices | Add a local creation-role endpoint using only `USERS:CREATE`. |
| Notification fails after database commit | Preserve existing direct-creation behavior; do not change notification semantics in this scoped feature. |
| Default roles lack the new operation | User runs the documented role seed before permission validation. |

## Alternatives Rejected

- Reuse `POST /v1/master-admin/users`: violates the ordinary backoffice
  boundary and cannot own the optional customer relationship.
- Create the user, then call the existing customer association endpoint from
  frontend: exposes a partial-state failure and requires `CUSTOMERS:UPDATE`.
- Add a new permission or auxiliary capability: `USERS:CREATE` is the approved
  product boundary for both direct creation and its role lookup.
