import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';

import { CurrentUser } from '@src/common/decorators';
import { AuthenticatedUserContextDto } from '@application/dto';
import { ApiResponseBuilder } from '@infra/api/responses/api-response.builder';
import {
  LoginRequestDto,
  RequestPasswordResetRequestDto,
  ResetPasswordRequestDto,
} from '@infra/api/dto/auth';
import { JwtAuthGuard } from '@infra/api/guards';
import { AuthPresenter } from '@infra/api/presenters/auth';
import {
  AuthenticateUserCommandAdapter,
  RequestPasswordResetCommandAdapter,
  ResetUserPasswordCommandAdapter,
} from '@infra/cqrs/commands';
import { GetMyPermissionsQuery } from '@infra/cqrs/queries';
import { SuccessMessageService } from '@infra/i18n/services/success-message.service';

@Controller('v1/auth')
export class AuthController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
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

  @Get('me/permissions')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async getMyPermissions(
    @CurrentUser() currentUser: AuthenticatedUserContextDto,
  ) {
    const result = await this.queryBus.execute(
      GetMyPermissionsQuery.create({
        userId: currentUser.userId,
        systemRole: currentUser.systemRole,
        roleId: currentUser.roleId,
      }),
    );
    const data = await this.presenter.toPermissionsResponse(result);

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
