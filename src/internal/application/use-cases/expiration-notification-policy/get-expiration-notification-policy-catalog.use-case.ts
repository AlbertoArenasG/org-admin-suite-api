import { Injectable } from '@nestjs/common';

import { GetExpirationNotificationPolicyCatalogResultDto } from '@application/dto';
import { ExpirationNotificationPolicyMapper } from '@application/mappers';

@Injectable()
export class GetExpirationNotificationPolicyCatalogUseCase {
  async execute(): Promise<GetExpirationNotificationPolicyCatalogResultDto> {
    return ExpirationNotificationPolicyMapper.toCatalogDto();
  }
}
