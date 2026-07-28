import { Injectable } from '@nestjs/common';

import {
  ChangeRoleStatusResultDto,
  CreateRoleResultDto,
  GetRoleByIdResultDto,
  RoleViewDto,
} from '@application/dto';

@Injectable()
export class RolePresenter {
  toCreateResponse(result: CreateRoleResultDto) {
    return this.toViewResponse(result);
  }

  toUpdateResponse(result: RoleViewDto) {
    return this.toViewResponse(result);
  }

  toStatusResponse(result: ChangeRoleStatusResultDto) {
    return this.toViewResponse(result);
  }

  toViewResponse(result: GetRoleByIdResultDto) {
    return {
      role_id: result.id,
      name: result.name,
      code: result.code,
      scope: result.scope,
      is_system: result.isSystem,
      is_immutable: result.isImmutable,
      is_default: result.isDefault,
      status_id: result.status,
      permissions: result.permissions.map((permission) => ({
        module: permission.module,
        operation: permission.operation,
      })),
      created_by: result.createdBy
        ? {
            user_id: result.createdBy.userId,
            name: result.createdBy.name,
            email: result.createdBy.email,
          }
        : null,
      updated_by: result.updatedBy
        ? {
            user_id: result.updatedBy.userId,
            name: result.updatedBy.name,
            email: result.updatedBy.email,
          }
        : null,
      created_at: result.createdAt ?? null,
      updated_at: result.updatedAt ?? null,
    };
  }

  toCollection(results: RoleViewDto[]) {
    return results.map((result) => this.toViewResponse(result));
  }
}
