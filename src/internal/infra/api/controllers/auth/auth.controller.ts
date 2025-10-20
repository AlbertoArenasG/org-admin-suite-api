import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';

import { ApiResponseBuilder } from '@infra/api/responses/api-response.builder';
import { LoginRequestDto } from '@infra/api/dto/auth';
import { AuthPresenter } from '@infra/api/presenters/auth';
import { AuthenticateUserCmd } from '@infra/cqrs/commands';

@Controller('v1/auth')
export class AuthController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly presenter: AuthPresenter,
  ) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() body: LoginRequestDto) {
    const command = AuthenticateUserCmd.create(body.toDomain());
    const result = await this.commandBus.execute(command);
    const data = await this.presenter.toLoginResponse(result);

    return ApiResponseBuilder.create()
      .withData(data)
      .withStatus(HttpStatus.OK)
      .build();
  }
}
