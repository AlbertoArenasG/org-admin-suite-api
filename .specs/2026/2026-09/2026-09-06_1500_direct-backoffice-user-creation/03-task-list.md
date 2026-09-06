# Task List

## Phase 1. Definition And Design

- [x] Define direct creation, optional customer association, authorization and compatibility.
  Status: done

- [x] Register artifacts, HTTP contracts, documentation impact and validation strategy.
  Status: done

## Phase 2. Authorization And Application Flow

- [ ] Add `CREATE` to the `USERS` authorization catalog and preserve existing invitation permissions.
  Status: pending

- [ ] Make direct user creation and its optional relationship atomic through existing services.
  Status: pending

## Phase 3. HTTP And CQRS Exposure

- [ ] Expose `POST /v1/users` and `GET /v1/users/creation-roles` with `USERS:CREATE`.
  Status: pending

## Phase 4. Contract, Validation And Closure

- [ ] Update Postman, frontend handoff and the permanent permission catalog.
  Status: pending

- [ ] Run focused automated checks and record results.
  Status: pending

- [ ] Ask the user to execute `npm run db:seed:roles` after the catalog change, then validate endpoint scenarios manually.
  Status: pending

- [ ] Close the spec after user validation and documentation review.
  Status: pending
