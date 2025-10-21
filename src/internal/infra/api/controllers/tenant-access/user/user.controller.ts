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
import { CreateUserRequestDto } from '@infra/api/dto/user/create-user.request.dto';
import { TenantAccessUserPresenter } from '@infra/api/presenters/user/user.presenter';
import { CreateUserAndNotifyCommandAdapter } from '@infra/cqrs/commands';
import { SuccessMessageService } from '@infra/i18n/services/success-message.service';
import { JwtAuthGuard, TenantAccessGuard } from '@infra/api/guards';
import { CurrentTenant } from '@src/common/decorators';
import { AuthenticatedTenantDto } from '@application/dto';

@Controller('v1/users')
export class UserController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly presenter: TenantAccessUserPresenter,
    private readonly successMsgService: SuccessMessageService,
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard, TenantAccessGuard)
  @HttpCode(HttpStatus.CREATED)
  async create(
    @CurrentTenant() currentTenant: AuthenticatedTenantDto,
    @Body() body: CreateUserRequestDto,
  ) {
    const command = CreateUserAndNotifyCommandAdapter.create(
      body.toDomain(currentTenant.tenantId),
    );
    const result = await this.commandBus.execute(command);
    const data = await this.presenter.toUserResponse(result);

    return ApiResponseBuilder.create()
      .withSuccessMessage(this.successMsgService.getMsg('USER.CREATED'))
      .withData(data)
      .withStatus(HttpStatus.CREATED)
      .build();
  }
}
