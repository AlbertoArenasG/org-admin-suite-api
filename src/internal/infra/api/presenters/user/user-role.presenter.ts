import { Injectable } from '@nestjs/common';

import { GetUserRolesResultDto } from '@application/dto';
import { EnumNameService } from '@infra/i18n/services';

@Injectable()
export class UserRolePresenter {
  constructor(private readonly enumNameService: EnumNameService) {}

  toResponse(result: GetUserRolesResultDto) {
    return result.roles.map((item) => ({
      role_id: item.role,
      role_name: this.enumNameService.getEnumName(`USER.ROLE.${item.role}`),
    }));
  }
}
