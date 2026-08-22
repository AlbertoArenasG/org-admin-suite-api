import { Injectable } from '@nestjs/common';

import {
  ExpirationNotificationPolicy,
  InternalAssetMaintenanceRecord,
} from '@domain/entities';
import { materializeInternalAssetExpirationNotification } from './internal-asset-maintenance.utils';

@Injectable()
export class InternalAssetNotificationMaterializationRefresher {
  refresh(input: {
    record: InternalAssetMaintenanceRecord;
    policy: ExpirationNotificationPolicy | null;
  }) {
    return materializeInternalAssetExpirationNotification({
      ...input,
      previous: input.record.expirationNotificationMaterialization,
    });
  }
}
