# Internal Jobs Runbook

## Purpose

This document describes the common operating boundary for technical jobs invoked through the API. These jobs do not use JWT users, roles, or backoffice permissions.

## Authentication

Every internal job requires the `INTERNAL_JOBS_TOKEN` environment variable and an HTTP Bearer token:

```bash
export API_URL='https://api.example.com'
export INTERNAL_JOBS_TOKEN='replace-with-the-configured-secret'
```

Never place the real token in source control, logs, terminal history shared with others, or support tickets.

## Internal Asset Materializations Refresh

Endpoint:

```text
POST /v1/internal-jobs/internal-asset-maintenance-records/refresh-materializations
```

Each call refreshes both materializations for up to 100 operational records (`PENDING` and `IN_PROGRESS`). The endpoint is stateless between calls: retain `data.next_cursor` and send it in the next request until it is `null`.

Start a run:

```bash
curl --request POST "$API_URL/v1/internal-jobs/internal-asset-maintenance-records/refresh-materializations" \
  --header "Authorization: Bearer $INTERNAL_JOBS_TOKEN" \
  --header 'Content-Type: application/json' \
  --data '{}'
```

Continue a run with the cursor returned by the previous response:

```bash
curl --request POST "$API_URL/v1/internal-jobs/internal-asset-maintenance-records/refresh-materializations" \
  --header "Authorization: Bearer $INTERNAL_JOBS_TOKEN" \
  --header 'Content-Type: application/json' \
  --data '{"cursor":"<data.next_cursor>"}'
```

The run is complete only when `data.next_cursor` is `null`. The response includes `processed_records`, separate refreshed-record metrics for expiration status and notification materializations, and `duration_ms`.

## Recovery

| Response | Meaning | Operator action |
| --- | --- | --- |
| `400` | Cursor malformed or invalid. | Restart from a known confirmed cursor. If none exists, start without a cursor. |
| `401` | Missing or invalid technical token. | Verify `INTERNAL_JOBS_TOKEN` in the invoking environment and API deployment. |
| `409` | Another execution holds the job lock. | Wait until `error_details.locked_until`, then retry with the last confirmed cursor. |
| `5xx` or interrupted request | The batch failed before returning a new cursor. Earlier writes in that batch may have completed. | Retry from the last confirmed cursor. Reprocessing is safe because materializations are recalculated deterministically. |

Do not invent, edit, or decode cursors manually. A cursor identifies a stable position by record creation time and domain record ID.

## Operational Verification

After a controlled run, verify the following:

- API logs contain `internal_job.start` and `internal_job.complete` with the same `executionId`; failures include the record ID and failed stage when applicable.
- Records processed by the job have updated `last_materialized_at` values under both materialization groups.
- The job did not change a record's `updatedAt` or `updatedBy`.
- The `internal_job_locks` collection does not retain an active lock after a completed request.
- A policy update refreshes only its corresponding materialization for operational records; policy deletion clears the relevant policy reference without changing record backoffice audit fields.

## Token Rotation

1. Generate a new high-entropy value outside source control.
2. Replace `INTERNAL_JOBS_TOKEN` in the API deployment and every authorized invoker together.
3. Restart or redeploy the API so environment validation loads the new value.
4. Execute one controlled request with the new token and confirm the old token returns `401`.

Future internal jobs should reuse this authentication and recovery guidance and add only their endpoint-specific invocation and verification details.
