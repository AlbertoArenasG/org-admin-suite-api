import { Injectable } from '@nestjs/common';

import { GetExpirationStatusPolicyCatalogResultDto } from '@application/dto';
import { ExpirationStatusPolicyMapper } from '@application/mappers';

@Injectable()
export class GetExpirationStatusPolicyCatalogUseCase {
  async execute(): Promise<GetExpirationStatusPolicyCatalogResultDto> {
    return ExpirationStatusPolicyMapper.toCatalogDto();
  }
}
