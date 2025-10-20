import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';

import { ApiResponseBuilder } from '@infra/api/responses/api-response.builder';
import { CreateTenantRequestDto } from '@infra/api/dto/master-admin/tenant';
import { TenantPresenter } from '@infra/api/presenters/master-admin/tenant';
import { CreateTenantCmd } from '@infra/cqrs/commands';

@Controller('v1/master-admin/tenants')
export class MasterAdminTenantController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly presenter: TenantPresenter,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() body: CreateTenantRequestDto) {
    const command = CreateTenantCmd.create(body.toDomain());
    const result = await this.commandBus.execute(command);
    const data = await this.presenter.toTenantResponse(result);

    return ApiResponseBuilder.create()
      .withData(data)
      .withStatus(HttpStatus.CREATED)
      .build();
  }
}
