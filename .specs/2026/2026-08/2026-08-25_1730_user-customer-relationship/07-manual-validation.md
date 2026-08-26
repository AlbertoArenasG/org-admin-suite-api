# Manual Validation

## Static Checks

- `npm run build` completed successfully.
- ESLint was executed without autofix and completed successfully.
- `git diff --check` completed without whitespace errors.

## Contact Migration

- The dry run identified 11 legacy `company_name` values.
- Apply mode converted the 11 documents, replaced the legacy text index and completed with successful integrity checks.
- Integrity result: no legacy `company_name` fields, no invalid `company_names`, no legacy index and the canonical index present.

## Role Capability Reconciliation

- The user manually executed `npm run db:seed:roles`.
- The targeted runner executes only role seeds; it does not run `contacts-from-users`.
- The reconciliation covers `MASTER_ADMIN_DEFAULT`, `ADMIN_DEFAULT` and every persisted custom role.
- It updates only divergent `auxiliary_capabilities` and preserves `updatedAt` and `updatedBy`.

## Postman Validation

The user confirmed manual validation in Postman for the approved API contracts, including:

- `GET /v1/customers/options` with backend-derived access from `USERS` and `USER_REGISTRATION_INVITATIONS`.
- Active, non-paginated customer options ordered for selection.
- Application invitations with zero, one and multiple `customer_ids`.
- Invitation consumption and administrative invitation detail.
- User detail, relationship replacement and paired relationship filters.
- Contact company-name synchronization and customer-name propagation.

No automated tests were included by approved scope.
