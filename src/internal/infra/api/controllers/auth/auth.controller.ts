import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';

import { ApiResponseBuilder } from '@infra/api/responses/api-response.builder';
import {
  LoginRequestDto,
  RequestPasswordResetRequestDto,
  ResetPasswordRequestDto,
} from '@infra/api/dto/auth';
import { AuthPresenter } from '@infra/api/presenters/auth';
import {
  AuthenticateUserCommandAdapter,
  RequestPasswordResetCommandAdapter,
  ResetUserPasswordCommandAdapter,
} from '@infra/cqrs/commands';
import { SuccessMessageService } from '@infra/i18n/services/success-message.service';

@Controller('v1/auth')
export class AuthController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly presenter: AuthPresenter,
    private readonly successMsgService: SuccessMessageService,
  ) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() body: LoginRequestDto) {
    const command = AuthenticateUserCommandAdapter.create(body.toDomain());
    const result = await this.commandBus.execute(command);
    const data = await this.presenter.toLoginResponse(result);

    return ApiResponseBuilder.create()
      .withSuccessMessage(this.successMsgService.getMsg('DEFAULT'))
      .withData(data)
      .withStatus(HttpStatus.OK)
      .build();
  }

  @Post('password-reset/request')
  @HttpCode(HttpStatus.OK)
  async requestPasswordReset(@Body() body: RequestPasswordResetRequestDto) {
    const command = RequestPasswordResetCommandAdapter.create(body.toDomain());

    await this.commandBus.execute(command);

    return ApiResponseBuilder.create()
      .withSuccessMessage(
        this.successMsgService.getMsg('AUTH.PASSWORD_RESET_REQUESTED'),
      )
      .withStatus(HttpStatus.OK)
      .build();
  }

  @Post('password-reset/confirm')
  @HttpCode(HttpStatus.OK)
  async resetPassword(@Body() body: ResetPasswordRequestDto) {
    const command = ResetUserPasswordCommandAdapter.create(body.toDomain());

    await this.commandBus.execute(command);

    return ApiResponseBuilder.create()
      .withSuccessMessage(
        this.successMsgService.getMsg('AUTH.PASSWORD_RESET_COMPLETED'),
      )
      .withStatus(HttpStatus.OK)
      .build();
  }
}
