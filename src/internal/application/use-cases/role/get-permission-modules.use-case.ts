import { Injectable } from '@nestjs/common';

import { GetPermissionModulesResultDto } from '@application/dto';
import { getAuthorizationModules } from '@application/services/authz/authorization-catalog.utils';

@Injectable()
export class GetPermissionModulesUseCase {
  async execute(): Promise<GetPermissionModulesResultDto> {
    return getAuthorizationModules().map((module) => ({
      code: module.code,
      nameKey: module.nameKey,
      status: 'ACTIVE',
      isSystem: true,
    }));
  }
}
