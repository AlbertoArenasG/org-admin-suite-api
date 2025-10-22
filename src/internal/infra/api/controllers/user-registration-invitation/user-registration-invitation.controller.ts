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
import { CreateUserRegistrationInvitationCommandAdapter } from '@infra/cqrs/commands';
import { CreateUserRegistrationInvitationRequestDto } from '@infra/api/dto';
import { UserRegistrationInvitationPresenter } from '@infra/api/presenters';
import { SuccessMessageService } from '@infra/i18n/services/success-message.service';
import { JwtAuthGuard } from '@infra/api/guards';
import { CurrentUser } from '@src/common/decorators';
import { AuthenticatedUserContextDto } from '@application/dto';

@Controller('v1/user-registration-invitations')
export class UserRegistrationInvitationController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly presenter: UserRegistrationInvitationPresenter,
    private readonly successMsgService: SuccessMessageService,
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.CREATED)
  async create(
    @CurrentUser() currentUser: AuthenticatedUserContextDto,
    @Body() body: CreateUserRegistrationInvitationRequestDto,
  ) {
    const command = CreateUserRegistrationInvitationCommandAdapter.create(
      body.toDomain(currentUser.userId),
      currentUser.role,
    );

    const result = await this.commandBus.execute(command);
    const data = this.presenter.toApplicationResponse(result);

    return ApiResponseBuilder.create()
      .withSuccessMessage(
        this.successMsgService.getMsg('USER_REGISTRATION_INVITATION.CREATED'),
      )
      .withData(data)
      .withStatus(HttpStatus.CREATED)
      .build();
  }
}
