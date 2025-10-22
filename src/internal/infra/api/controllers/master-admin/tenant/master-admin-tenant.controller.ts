import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
} from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';

import { ApiResponseBuilder } from '@infra/api/responses/api-response.builder';
import { CreateTenantRequestDto } from '@infra/api/dto/master-admin/tenant';
import { TenantPresenter } from '@infra/api/presenters/tenant';
import { CreateTenantCommandAdapter } from '@infra/cqrs/commands';
import { JwtAuthGuard, MasterScopeGuard } from '@infra/api/guards';
import { MASTER_SCOPE, Scopes } from '@src/common/decorators';
import { SuccessMessageService } from '@infra/i18n/services/success-message.service';

@Controller('v1/master-admin/tenants')
export class MasterAdminTenantController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly tenantPresenter: TenantPresenter,
    private readonly successMsgService: SuccessMessageService,
  ) {}

  @Post()
  @Scopes(MASTER_SCOPE)
  @UseGuards(JwtAuthGuard, MasterScopeGuard)
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() body: CreateTenantRequestDto) {
    const command = CreateTenantCommandAdapter.create(body.toDomain());
    const result = await this.commandBus.execute(command);
    const data = await this.tenantPresenter.toTenantResponse(result);

    return ApiResponseBuilder.create()
      .withSuccessMessage(this.successMsgService.getMsg('DEFAULT'))
      .withData(data)
      .withStatus(HttpStatus.CREATED)
      .build();
  }
}
