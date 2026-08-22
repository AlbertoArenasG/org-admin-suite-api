import { Injectable } from '@nestjs/common';

import {
  ExpirationStatusPolicy,
  InternalAssetMaintenanceRecord,
} from '@domain/entities';
import { materializeInternalAssetExpirationStatus } from './internal-asset-maintenance.utils';

@Injectable()
export class InternalAssetStatusMaterializationRefresher {
  refresh(input: {
    record: InternalAssetMaintenanceRecord;
    policy: ExpirationStatusPolicy | null;
  }) {
    return materializeInternalAssetExpirationStatus(input);
  }
}
