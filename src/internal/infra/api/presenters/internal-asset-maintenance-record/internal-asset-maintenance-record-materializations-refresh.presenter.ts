import { Injectable } from '@nestjs/common';

import { RefreshInternalAssetMaintenanceRecordMaterializationsResultDto } from '@application/dto';

@Injectable()
export class InternalAssetMaintenanceRecordMaterializationsRefreshPresenter {
  toResponse(
    result: RefreshInternalAssetMaintenanceRecordMaterializationsResultDto,
  ) {
    return {
      processed_records: result.processedRecords,
      materializations: {
        expiration_status: {
          refreshed_records:
            result.materializations.expirationStatus.refreshedRecords,
        },
        expiration_notification: {
          refreshed_records:
            result.materializations.expirationNotification.refreshedRecords,
        },
      },
      duration_ms: result.durationMs,
      next_cursor: result.nextCursor,
    };
  }
}
