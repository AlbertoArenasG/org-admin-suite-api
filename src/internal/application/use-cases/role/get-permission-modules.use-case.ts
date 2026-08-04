import { Injectable } from '@nestjs/common';

import { GetPermissionModulesResultDto } from '@application/dto';
import {
  getAuthorizationModules,
  getAuthorizationOperation,
} from '@application/services/authz/authorization-catalog.utils';

@Injectable()
export class GetPermissionModulesUseCase {
  async execute(): Promise<GetPermissionModulesResultDto> {
    return getAuthorizationModules().map((module) => ({
      code: module.code,
      nameKey: module.nameKey,
      status: 'ACTIVE',
      isSystem: true,
      operations: module.operations.map((operationCode) => {
        const operation = getAuthorizationOperation(operationCode);

        if (!operation) {
          throw new Error(
            `Authorization operation "${operationCode}" is missing from the catalog.`,
          );
        }

        return {
          code: operation.code,
          nameKey: operation.nameKey,
          status: 'ACTIVE',
          isSystem: true,
        };
      }),
    }));
  }
}
