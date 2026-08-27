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
      full_name: `${result.name} ${result.lastname}`.trim(),
      email: result.email,
      system_role: result.systemRole,
      system_role_name: this.enumNameService.getEnumName(
        `USER.ROLE.${result.systemRole}`,
      ),
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
      ...(result.customers === undefined
        ? {}
        : {
            customers: result.customers.map((customer) => ({
              customer_id: customer.id,
              company_name: customer.companyName,
              status: customer.status,
              status_name: this.enumNameService.getEnumName(
                `CUSTOMER.STATUS.${customer.status}`,
              ),
            })),
          }),
    };
  }

  async toUsersResponse(results: UserViewDto[]) {
    return Promise.all(results.map((result) => this.toUserResponse(result)));
  }
}
