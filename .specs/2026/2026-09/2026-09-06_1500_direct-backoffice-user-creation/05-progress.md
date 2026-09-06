# Progress

## 2026-09-06

- Created the spec and inspected the existing direct creation, invitation,
  customer relationship, authorization and transaction flows.
- Closed definition and technical design. Implementation has not started.
- Added `USERS:CREATE` to the technical catalog.
- Extended direct creation with optional `customer_id`; user, relationship and
  contact writes now share one outer transaction.
- Exposed `POST /v1/users` and `GET /v1/users/creation-roles`, both under
  `USERS:CREATE`; the invitation role lookup remains unchanged.
- Created the frontend handoff and updated permanent authorization,
  relationship and role-permission documentation, including removal of the
  obsolete Master-only direct-creation rule.
- Updated Postman with direct creation and creation-role lookup requests.
- Added `08-manual-validation.md`; no focused test harness exists for this
  flow, so build and environment validation are pending user execution.
- Next: user runs `npm run build`; if successful, executes
  `npm run db:seed:roles` before manual Postman validation.
