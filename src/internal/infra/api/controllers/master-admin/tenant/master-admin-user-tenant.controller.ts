import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';

import { ApiResponseBuilder } from '@infra/api/responses/api-response.builder';
import { CreateTenantUserForMasterRequestDto } from '@infra/api/dto/master-admin/user';
import { TenantAccessUserPresenter } from '@infra/api/presenters/user/user.presenter';
import { CreateUserAndNotifyCommandAdapter } from '@infra/cqrs/commands';
import { JwtAuthGuard, MasterScopeGuard } from '@infra/api/guards';
import { MASTER_SCOPE, Scopes } from '@src/common/decorators';
import { SuccessMessageService } from '@infra/i18n/services/success-message.service';

@Controller('v1/master-admin/tenants/:tenantId/users')
export class MasterAdminUserTenantController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly tenantUserPresenter: TenantAccessUserPresenter,
    private readonly successMsgService: SuccessMessageService,
  ) {}

  @Post()
  @Scopes(MASTER_SCOPE)
  @UseGuards(JwtAuthGuard, MasterScopeGuard)
  @HttpCode(HttpStatus.CREATED)
  async createTenantUser(
    @Param('tenantId') tenantId: string,
    @Body() body: CreateTenantUserForMasterRequestDto,
  ) {
    const command = CreateUserAndNotifyCommandAdapter.create(
      body.toDomain(tenantId),
    );
    const result = await this.commandBus.execute(command);
    const data = await this.tenantUserPresenter.toUserResponse(result);

    return ApiResponseBuilder.create()
      .withSuccessMessage(this.successMsgService.getMsg('USER.CREATED'))
      .withData(data)
      .withStatus(HttpStatus.CREATED)
      .build();
  }
}
