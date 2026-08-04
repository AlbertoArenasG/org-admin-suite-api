import { Injectable } from '@nestjs/common';

import {
  ChangeRoleStatusResultDto,
  CreateRoleResultDto,
  GetPermissionModulesResultDto,
  GetRoleByIdResultDto,
  RoleViewDto,
} from '@application/dto';
import { EnumNameService } from '@infra/i18n/services';

@Injectable()
export class RolePresenter {
  constructor(private readonly enumNameService: EnumNameService) {}

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

  toPermissionModulesResponse(results: GetPermissionModulesResultDto) {
    return results.map((result) => ({
      module_id: result.code,
      module_code: result.code,
      module_name: this.enumNameService.getEnumName(result.nameKey),
      module_name_key: result.nameKey,
      status_id: result.status,
      is_system: result.isSystem,
      operations: result.operations.map((operation) => ({
        operation_id: operation.code,
        operation_code: operation.code,
        operation_name: this.enumNameService.getEnumName(operation.nameKey),
        operation_name_key: operation.nameKey,
        status_id: operation.status,
        is_system: operation.isSystem,
      })),
    }));
  }
}
