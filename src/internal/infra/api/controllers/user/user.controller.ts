import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { ApiResponseBuilder } from '@infra/api/responses/api-response.builder';
import { CreateUserRequestDto } from '@infra/api/dto/user/create-user.request.dto';
import { UserPresenter } from '@infra/api/presenters/user/user.presenter';
import { CreateUserAndNotifyCmd } from '@infra/cqrs/commands';

@Controller('v1/users')
export class UserController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly presenter: UserPresenter,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() body: CreateUserRequestDto) {
    const command = CreateUserAndNotifyCmd.create(body.toDomain());
    const result = await this.commandBus.execute(command);
    const data = await this.presenter.toUserResponse(result);

    return ApiResponseBuilder.create()
      .withData(data)
      .withStatus(HttpStatus.CREATED)
      .build();
  }
}
