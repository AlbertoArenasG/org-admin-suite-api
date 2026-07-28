import { Injectable } from '@nestjs/common';

import { GetUserRolesResultDto } from '@application/dto';

@Injectable()
export class UserRolePresenter {
  toResponse(result: GetUserRolesResultDto) {
    return result.roles.map((item) => ({
      role_id: item.roleId,
      role_code: item.code,
      role_name: item.name,
      role_scope: item.scope,
      is_system: item.isSystem,
      is_default: item.isDefault,
    }));
  }
}
