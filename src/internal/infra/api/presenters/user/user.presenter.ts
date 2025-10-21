import { Injectable } from '@nestjs/common';

import { CreateUserResultDto } from '@application/dto';
import { EnumNameService } from '@infra/i18n/services';

@Injectable()
export class TenantAccessUserPresenter {
  constructor(private readonly enumNameService: EnumNameService) {}
  async toUserResponse(result: CreateUserResultDto) {
    return {
      id: result.id,
      tenant_id: result.tenantId,
      user_tenant_id: result.userTenantId,
      name: result.name,
      lastname: result.lastname,
      email: result.email,
      role: result.role,
      role_name: this.enumNameService.getEnumName(
        `TENANT.USER.ROLE.${result.role}`,
      ),
      status: result.status,
      status_name: this.enumNameService.getEnumName(
        `TENANT.USER.STATUS.${result.status}`,
      ),
      created_at: result.createdAt,
    };
  }
}
