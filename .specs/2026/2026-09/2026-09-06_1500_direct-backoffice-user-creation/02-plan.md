# Plan

1. Extend the `USERS` authorization catalog with `CREATE` and document its
   ordinary-backoffice meaning.
2. Extend the existing direct user DTO/application payload with optional
   `customer_id`/`customerId` and make the existing use case transactional.
3. Reuse relationship replacement for the optional one-customer association.
4. Expose direct creation and a local assignable-roles lookup from
   `UserController`, both with `USERS:CREATE`.
5. Finalize Postman, frontend handoff and authorization documentation; request
   the role seed and manual validation from the user.

No legacy route is removed. Invitations remain the alternative self-service
onboarding flow.
