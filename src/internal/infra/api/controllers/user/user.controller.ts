import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';

import { ApiResponseBuilder } from '@infra/api/responses/api-response.builder';
import { CreateUserRequestDto } from '@infra/api/dto/user/create-user.request.dto';
import { TenantAccessUserPresenter } from '@infra/api/presenters/user/user.presenter';
import { CreateUserAndNotifyCmd } from '@infra/cqrs/commands';
import { SuccessMessageService } from '@infra/i18n/services/success-message.service';

@Controller('v1/users')
export class UserController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly presenter: TenantAccessUserPresenter,
    private readonly successMsgService: SuccessMessageService,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() body: CreateUserRequestDto) {
    const command = CreateUserAndNotifyCmd.create(body.toDomain());
    const result = await this.commandBus.execute(command);
    const data = await this.presenter.toUserResponse(result);

    return ApiResponseBuilder.create()
      .withSuccessMessage(this.successMsgService.getMsg('USER.CREATED'))
      .withData(data)
      .withStatus(HttpStatus.CREATED)
      .build();
  }
}
