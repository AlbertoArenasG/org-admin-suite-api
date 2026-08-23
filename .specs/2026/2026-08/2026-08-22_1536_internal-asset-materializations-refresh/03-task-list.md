# Task List

## Phase 1. Definition

- [x] Define execution, authentication, batching, locking and response semantics.
      Status: completed

- [x] Define refresh eligibility, policy-update consistency and technical audit semantics.
      Status: completed

- [x] Define observability, manual validation and runbook scope.
      Status: completed

## Phase 2. Technical Design

- [x] Audit the existing controller, configuration, CQRS, repository and materialization structure.
      Status: completed

- [x] Approve the reusable lock port and Mongoose persistence structure.
      Status: completed

- [x] Finalize the concrete refresh result, endpoint DTO and presenter contracts.
      Status: completed

- [x] Define the independent refreshers and shared technical refresh orchestration.
      Status: completed

- [x] Revise and approve the expanded technical write contract for policy-deletion cascades.
      Status: completed

## Phase 3. Implementation

- [x] Implement the `internal-jobs` boundary and technical authentication guard.
      Status: completed

- [x] Implement lock persistence and atomic lease acquisition.
      Status: completed

- [x] Refactor materialization refreshers and policy triggers.
      Status: completed

- [x] Implement the operational query and technical persistence.
      Status: completed

- [x] Integrate policy update and deletion triggers with the approved criteria.
      Status: completed

- [x] Implement the manual refresh use case, CQRS command and endpoint.
      Status: completed

## Phase 4. Documentation And Validation

- [x] Add the internal-jobs runbook.
      Status: completed

- [ ] Perform the approved manual validation and verify resulting Mongo data.
      Status: pending

- [ ] Close the spec and update the specs index.
      Status: pending
