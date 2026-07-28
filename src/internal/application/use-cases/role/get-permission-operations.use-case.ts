import { Injectable } from '@nestjs/common';

import { GetPermissionOperationsResultDto } from '@application/dto';
import { getAuthorizationOperations } from '@application/services/authz/authorization-catalog.utils';

@Injectable()
export class GetPermissionOperationsUseCase {
  async execute(): Promise<GetPermissionOperationsResultDto> {
    return getAuthorizationOperations().map((operation) => ({
      code: operation.code,
      nameKey: operation.nameKey,
      status: 'ACTIVE',
      isSystem: true,
    }));
  }
}
