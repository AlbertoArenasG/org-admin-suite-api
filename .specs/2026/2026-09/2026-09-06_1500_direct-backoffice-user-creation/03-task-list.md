# Task List

## Phase 1. Definition And Design

- [x] Define direct creation, optional customer association, authorization and compatibility.
  Status: done

- [x] Register artifacts, HTTP contracts, documentation impact and validation strategy.
  Status: done

## Phase 2. Authorization And Application Flow

- [x] Add `CREATE` to the `USERS` authorization catalog and preserve existing invitation permissions.
  Status: done

- [x] Make direct user creation and its optional relationship atomic through existing services.
  Status: done

## Phase 3. HTTP And CQRS Exposure

- [x] Expose `POST /v1/users` and `GET /v1/users/creation-roles` with `USERS:CREATE`.
  Status: done

## Phase 4. Contract, Validation And Closure

- [x] Update Postman, frontend handoffs, authorization rules and the permanent permission catalog.
  Status: done

- [ ] Run focused automated checks and record results.
  Status: pending
  Evidence: no focused test harness exists for this flow; user must run the
  documented build before environment validation.

- [ ] Ask the user to execute `npm run db:seed:roles` after the catalog change, then validate endpoint scenarios manually.
  Status: pending

- [ ] Close the spec after user validation and documentation review.
  Status: pending
