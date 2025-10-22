import { Injectable } from '@nestjs/common';

import { CreateUserResultDto } from '@application/dto';
import { EnumNameService } from '@infra/i18n/services';

@Injectable()
export class UserPresenter {
  constructor(private readonly enumNameService: EnumNameService) {}
  async toUserResponse(result: CreateUserResultDto) {
    return {
      id: result.id,
      name: result.name,
      lastname: result.lastname,
      email: result.email,
      role: result.role,
      role_name: this.enumNameService.getEnumName(`USER.ROLE.${result.role}`),
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
}
