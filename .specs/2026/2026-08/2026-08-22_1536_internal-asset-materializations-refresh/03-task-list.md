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

- [ ] Approve the lock port, entity model and Mongoose persistence structure.
      Status: pending

- [ ] Finalize concrete contracts for cursor DTO, refresh result, technical materialization update and operational query.
      Status: pending

## Phase 3. Implementation

- [ ] Implement the `internal-jobs` boundary and technical authentication guard.
      Status: pending

- [ ] Implement lock persistence and atomic lease acquisition.
      Status: pending

- [ ] Refactor materialization refreshers, operational query and technical persistence.
      Status: pending

- [ ] Integrate policy update and deletion triggers with the approved criteria.
      Status: pending

- [ ] Implement the manual refresh use case, CQRS command and endpoint.
      Status: pending

## Phase 4. Documentation And Validation

- [ ] Add the internal-jobs runbook.
      Status: pending

- [ ] Perform the approved manual validation and verify resulting Mongo data.
      Status: pending

- [ ] Close the spec and update the specs index.
      Status: pending
