import { Injectable } from '@nestjs/common';

import {
  AuthenticateUserResultDto,
  GetMyPermissionsResultDto,
} from '@application/dto';
import { EnumNameService } from '@infra/i18n/services';

@Injectable()
export class AuthPresenter {
  constructor(private readonly enumNameService: EnumNameService) {}

  async toLoginResponse(result: AuthenticateUserResultDto) {
    return {
      access_token: result.accessToken,
      user: {
        id: result.user.id,
        name: result.user.name,
        lastname: result.user.lastname,
        email: result.user.email,
        system_role: result.user.systemRole,
        role_id: result.user.roleId,
        status: result.user.status,
        cell_phone: {
          country_code: result.user.cellPhone?.countryCode ?? null,
          number: result.user.cellPhone?.number ?? null,
        },
      },
    };
  }

  async toPermissionsResponse(result: GetMyPermissionsResultDto) {
    return {
      system_role: result.systemRole,
      role: result.role
        ? {
            id: result.role.id,
            code: result.role.code,
            name: result.role.name,
            scope: result.role.scope,
            is_system: result.role.isSystem,
            is_default: result.role.isDefault,
            is_immutable: result.role.isImmutable,
            status: result.role.status,
          }
        : null,
      modules: result.modules.map((module) => ({
        code: module.code,
        name: this.enumNameService.getEnumName(module.nameKey),
        name_key: module.nameKey,
      })),
      permissions: result.permissions.map((permission) => ({
        module: permission.module,
        module_name: this.enumNameService.getEnumName(permission.moduleNameKey),
        module_name_key: permission.moduleNameKey,
        operation: permission.operation,
        operation_name: this.enumNameService.getEnumName(
          permission.operationNameKey,
        ),
        operation_name_key: permission.operationNameKey,
      })),
    };
  }
}
