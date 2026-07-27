import { Injectable } from '@nestjs/common';

import { CreateMasterUserResultDto } from '@application/dto';
import { EnumNameService } from '@infra/i18n/services';

@Injectable()
export class MasterUserPresenter {
  constructor(private readonly enumNameService: EnumNameService) {}

  async toUserResponse(result: CreateMasterUserResultDto) {
    return {
      id: result.id,
      name: result.name,
      lastname: result.lastname,
      email: result.email,
      role: result.role,
      role_name: this.enumNameService.getEnumName(`USER.ROLE.${result.role}`),
      system_role: result.systemRole,
      role_id: result.roleId,
      status: result.status,
      status_name: this.enumNameService.getEnumName(
        `USER.STATUS.${result.status}`,
      ),
      created_at: result.createdAt,
    };
  }
}
