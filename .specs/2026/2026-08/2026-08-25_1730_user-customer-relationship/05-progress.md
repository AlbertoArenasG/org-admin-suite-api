# Progress

## Current Phase

Phase 3: backend implementation in progress.

## Completed

- Created the spec and documented the current backend state.
- Approved the eligible user scope without adding a system role.
- Approved a pivot entity for the user-customer relationship.
- Approved validation at invitation issuance and immutable materialization at consumption.
- Approved the invitation input and administrative customer representation.
- Approved replacement of effective relationships through the existing user update operation.
- Approved user reads by present or absent customer relationship.
- Approved invitation continuity and boundary behavior.
- Approved atomic materialization and relationship replacement through an infrastructure-owned transaction boundary.
- Approved retention of relationships through user role changes and logical deletion.
- Approved authorization reuse and error semantics for relationship operations.
- Approved lightweight lists and explicit administrative detail reads for relationships.
- Approved visible representation of relationships with deleted customers in administrative details.
- Approved compatibility behavior and Postman-only manual validation scope.
- Approved multiple contact company names and the inclusion of a contact migration.
- Approved contact synchronization events for relationship creation, replacement and logical user deletion.
- Defined `UserCustomerRelationship` as an internal resource with independent domain and persistence layers.
- Defined a persistence-agnostic transaction executor with a Mongoose-only session implementation.
- Defined relationship identity, repository ports, replacement semantics and persistence indexes.
- Defined infrastructure-contained user-list filtering by relationship with correct pagination.
- Defined customer summary reads for administrative details, including localized status names.
- Defined transactional mutation orchestration and contact synchronization boundaries.
- Defined the breaking replacement of the contact company-name contract with a normalized collection.
- Defined the contact company-name search and text-index evolution.
- Defined the contact migration runner and coordinated deployment sequence.
- Defined the administrative invitation detail route, CQRS boundary and response contract.
- Defined optional `customer_ids` request contracts and replacement semantics.
- Defined the complete query-pair contract for user relationship filters.
- Defined conditional customer summaries in the existing user detail query and presenter.
- Defined infrastructure and CQRS registrations, migration scripts, documentation and frontend handoff.
- Defined protection for derived company names in user-linked contacts.
- Defined isolated propagation of customer-name changes to linked user contacts.
- Defined atomic customer-name updates and contact propagation through the infrastructure-owned transaction boundary.
- Defined batch-oriented shared services for deriving and synchronizing user-contact company names.
- Defined batch repository contracts using domain IDs and semantic contact updates.
- Defined a stable ordering for derived contact company names.
- Defined the approved manual validation scope.
- Implemented the transaction port, Mongoose transaction context and internal user-customer relationship resource.
- Persisted validated customer selections in application invitations and materialized them atomically on consumption.
- Implemented isolated resolution and synchronization of user-contact company names.
- Extended user editing with atomic customer relationship replacement and contact synchronization.
- Added optional paired user-list filters for customer relationship presence or absence.
- Added localized customer summaries exclusively to the administrative user detail response.
- Replaced the contact company-name contract with the `company_names` collection and updated its search/index behavior.
- Added the controlled `company_name` to `company_names` migration, including dry-run/apply commands, index replacement and post-apply integrity checks.
- Added atomic customer-name propagation through an isolated batch synchronizer for user-linked contacts.
- Confirmed the existing contact update boundary rejects linked user contacts, protecting their derived company names from direct administrative changes.

## Next

- Expose the administrative invitation detail with selected customer summaries.
