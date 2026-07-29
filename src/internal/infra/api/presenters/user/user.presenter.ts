import { Injectable } from '@nestjs/common';

import { UserViewDto } from '@application/dto';
import { EnumNameService } from '@infra/i18n/services';

@Injectable()
export class UserPresenter {
  constructor(private readonly enumNameService: EnumNameService) {}
  async toUserResponse(result: UserViewDto) {
    return {
      id: result.id,
      name: result.name,
      lastname: result.lastname,
      email: result.email,
      system_role: result.systemRole,
      role_id: result.roleId,
      role_name: result.roleName,
      status: result.status,
      status_name: this.enumNameService.getEnumName(
        `USER.STATUS.${result.status}`,
      ),
      cell_phone: {
        country_code: result.cellPhone?.countryCode ?? null,
        number: result.cellPhone?.number ?? null,
      },
      created_at: result.createdAt,
    };
  }

  async toUsersResponse(results: UserViewDto[]) {
    return Promise.all(results.map((result) => this.toUserResponse(result)));
  }
}
