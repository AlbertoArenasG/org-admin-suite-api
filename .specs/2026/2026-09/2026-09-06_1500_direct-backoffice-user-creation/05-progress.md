# Progress

## 2026-09-06

- Created the spec and inspected the existing direct creation, invitation,
  customer relationship, authorization and transaction flows.
- Se cerraron definición y diseño técnico, y se completó la implementación.
- Added `USERS:CREATE` to the technical catalog.
- Extended direct creation with optional `customer_id`; user, relationship and
  contact writes now share one outer transaction.
- Exposed `POST /v1/users` and `GET /v1/users/creation-roles`, both under
  `USERS:CREATE`; the invitation role lookup remains unchanged.
- Created the frontend handoff and updated permanent authorization,
  relationship and role-permission documentation, including removal of the
  obsolete Master-only direct-creation rule.
- Updated Postman with direct creation and creation-role lookup requests.
- Se completó la validación de entorno y los escenarios manuales documentados.
- La spec queda cerrada formalmente.
