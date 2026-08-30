import { Injectable } from '@nestjs/common';
import { RefreshCustomerServiceRecordMaterializationsResultDto } from '@application/dto';
@Injectable()
export class CustomerServiceRecordMaterializationsRefreshPresenter {
  toResponse(result: RefreshCustomerServiceRecordMaterializationsResultDto) {
    return {
      processed_records: result.processedRecords,
      materializations: {
        customer_delivery_status: {
          refreshed_records:
            result.materializations.customerDeliveryStatus.refreshedRecords,
        },
        customer_delivery_notification: {
          refreshed_records:
            result.materializations.customerDeliveryNotification
              .refreshedRecords,
        },
        provider_status: {
          refreshed_records:
            result.materializations.providerStatus.refreshedRecords,
        },
        provider_notification: {
          refreshed_records:
            result.materializations.providerNotification.refreshedRecords,
        },
        provider_follow_up: {
          refreshed_records:
            result.materializations.providerFollowUp.refreshedRecords,
        },
      },
      duration_ms: result.durationMs,
      next_cursor: result.nextCursor,
    };
  }
}
