import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';

import { ApiResponseBuilder } from '@infra/api/responses/api-response.builder';
import { CompleteNewUserRegistrationInvitationRequestDto } from '@infra/api/dto';
import { CompleteNewUserRegistrationInvitationCommandAdapter } from '@infra/cqrs/commands';
import { GetUserRegistrationInvitationQuery } from '@infra/cqrs/queries';
import { SuccessMessageService } from '@infra/i18n/services/success-message.service';
import { UserRegistrationInvitationPresenter } from '@infra/api/presenters';
import { MasterUserPresenter, UserPresenter } from '@infra/api/presenters/user';
import { CompleteNewUserRegistrationInvitationResultDto } from '@application/dto';
import { UserRegistrationInvitationScope } from '@domain/ports/repositories';

@Controller('v1/user-registration-invitations')
export class UserRegistrationInvitationPublicController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
    private readonly presenter: UserRegistrationInvitationPresenter,
    private readonly userPresenter: UserPresenter,
    private readonly masterUserPresenter: MasterUserPresenter,
    private readonly successMsgService: SuccessMessageService,
  ) {}

  @Get(':token')
  @HttpCode(HttpStatus.OK)
  async getInvitation(@Param('token') token: string) {
    const invitation = await this.queryBus.execute(
      GetUserRegistrationInvitationQuery.create(token),
    );
    const data = this.presenter.toPublicResponse(invitation);

    return ApiResponseBuilder.create()
      .withSuccessMessage(this.successMsgService.getMsg('DEFAULT'))
      .withData(data)
      .withStatus(HttpStatus.OK)
      .build();
  }

  @Post(':token/complete-registration')
  @HttpCode(HttpStatus.CREATED)
  async completeRegistration(
    @Param('token') token: string,
    @Body() body: CompleteNewUserRegistrationInvitationRequestDto,
  ) {
    const command = CompleteNewUserRegistrationInvitationCommandAdapter.create(
      body.toDomain(token),
    );

    const result = await this.commandBus.execute(command);
    const data = await this.presentRegistrationCompletion(result);

    return ApiResponseBuilder.create()
      .withSuccessMessage(
        this.successMsgService.getMsg('USER_REGISTRATION_INVITATION.COMPLETED'),
      )
      .withData(data)
      .withStatus(HttpStatus.CREATED)
      .build();
  }

  private async presentRegistrationCompletion(
    result: CompleteNewUserRegistrationInvitationResultDto,
  ) {
    if (result.scope === UserRegistrationInvitationScope.APPLICATION) {
      return this.userPresenter.toPublicUserResponse(result.user);
    }

    return this.masterUserPresenter.toPublicUserResponse(result.user);
  }
}
