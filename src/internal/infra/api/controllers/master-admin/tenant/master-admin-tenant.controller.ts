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
import { CreateTenantRequestDto } from '@infra/api/dto/master-admin/tenant';
import { CreateTenantUserForMasterRequestDto } from '@infra/api/dto/master-admin/user';
import { TenantPresenter } from '@infra/api/presenters/tenant';
import { TenantAccessUserPresenter } from '@infra/api/presenters/user/user.presenter';
import { CreateTenantCmd, CreateUserAndNotifyCmd } from '@infra/cqrs/commands';
import { JwtAuthGuard, MasterOnlyGuard } from '@infra/api/guards';
import { SuccessMessageService } from '@infra/i18n/services/success-message.service';

@Controller('v1/master-admin/tenants')
export class MasterAdminTenantController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly tenantPresenter: TenantPresenter,
    private readonly tenantUserPresenter: TenantAccessUserPresenter,
    private readonly successMsgService: SuccessMessageService,
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard, MasterOnlyGuard)
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() body: CreateTenantRequestDto) {
    const command = CreateTenantCmd.create(body.toDomain());
    const result = await this.commandBus.execute(command);
    const data = await this.tenantPresenter.toTenantResponse(result);

    return ApiResponseBuilder.create()
      .withData(data)
      .withStatus(HttpStatus.CREATED)
      .build();
  }

  @Post(':tenantId/users')
  @UseGuards(JwtAuthGuard, MasterOnlyGuard)
  @HttpCode(HttpStatus.CREATED)
  async createTenantUser(
    @Param('tenantId') tenantId: string,
    @Body() body: CreateTenantUserForMasterRequestDto,
  ) {
    const command = CreateUserAndNotifyCmd.create(body.toDomain(tenantId));
    const result = await this.commandBus.execute(command);
    const data = await this.tenantUserPresenter.toUserResponse(result);

    return ApiResponseBuilder.create()
      .withSuccessMessage(this.successMsgService.getMsg('USER.CREATED'))
      .withData(data)
      .withStatus(HttpStatus.CREATED)
      .build();
  }
}
