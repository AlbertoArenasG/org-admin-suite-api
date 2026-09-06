# Manual Validation

## Preconditions

1. Integrate the implementation in the environment to validate.
2. Run the technical check before modifying persisted permissions:

   ```bash
   npm run build
   ```

3. If the build succeeds, execute the role seed:

   ```bash
   npm run db:seed:roles
   ```

The seed is required after the `USERS` catalog includes `CREATE` and before
testing authorization. It synchronizes default roles. Custom roles require
`USERS:CREATE` to be assigned intentionally from role management.

## Postman Scenarios

Use the `Users` folder in `docs/icsacv-api.postman_collection.json`.

| Scenario | Request and expected result |
| --- | --- |
| Creation roles | `GET /v1/users/creation-roles` with `USERS:CREATE` returns `200`; token without it returns `403`. |
| User without customer | `POST /v1/users` with a unique email and omitted `customer_id` returns `201`; user has no customer relationships. |
| User with customer | Same request with valid active `customer_id` returns `201`; User and exactly one relationship are present. |
| Invalid customer | Missing/deleted or inactive `customer_id` returns existing `404`/`400`; verify no User was created with that email. |
| Invalid pairing | `ADMIN` plus `customer_id` returns `400`; verify no User was created. |
| Duplicate email | Existing email returns conflict; no relationship is added. |
| Compatibility | `POST /v1/user-registration-invitations` and `GET /v1/users/roles` preserve their previous permission boundary and response. |

## Evidence To Return

- Successful `npm run build` output.
- Role seed summary.
- Confirmation of the seven scenarios, or the failing request/response when a
  scenario differs from the table.
