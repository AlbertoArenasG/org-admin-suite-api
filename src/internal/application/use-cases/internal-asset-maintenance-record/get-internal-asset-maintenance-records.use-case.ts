import { Inject, Injectable } from '@nestjs/common';

import {
  GetInternalAssetMaintenanceRecordsDto,
  GetInternalAssetMaintenanceRecordsResultDto,
} from '@application/dto';
import { InternalAssetMaintenanceRecordMapper } from '@application/mappers';
import {
  IInternalAssetMaintenanceRecordReadRepository,
  IInternalAssetMaintenanceRecordReadRepositoryToken,
} from '@domain/ports/repositories';
import {
  collectPolicyIds,
  normalizeInternalAssetMaintenanceRecordFilters,
} from './internal-asset-maintenance-record.shared';

@Injectable()
export class GetInternalAssetMaintenanceRecordsUseCase {
  constructor(
    @Inject(IInternalAssetMaintenanceRecordReadRepositoryToken)
    private readonly readRepository: IInternalAssetMaintenanceRecordReadRepository,
  ) {}

  async execute(
    input: GetInternalAssetMaintenanceRecordsDto,
  ): Promise<GetInternalAssetMaintenanceRecordsResultDto> {
    const filters = normalizeInternalAssetMaintenanceRecordFilters(input);
    const { data, total } = await this.readRepository.findAll({
      page: input.page,
      perPage: input.perPage,
      search: filters.search,
      assetMaintenanceType: filters.assetMaintenanceType,
      status: filters.status,
      expirationStatusPolicyId: filters.expirationStatusPolicyId,
      expirationNotificationPolicyId: filters.expirationNotificationPolicyId,
      sentToProvider: filters.sentToProvider,
      sorts: input.sorts,
    });
    const policyIds = collectPolicyIds(data);
    const policiesById = await this.readRepository.findPoliciesByIds(policyIds);

    return {
      items: data.map((record) =>
        InternalAssetMaintenanceRecordMapper.toListItemDto(
          record,
          policiesById.expirationStatusPoliciesById,
          policiesById.expirationNotificationPoliciesById,
        ),
      ),
      total,
      page: input.page,
      perPage: input.perPage,
    };
  }
}
