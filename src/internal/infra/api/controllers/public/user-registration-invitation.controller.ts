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
import {
  CompleteNewUserRegistrationInvitationRequestDto,
  RespondUserRegistrationInvitationRequestDto,
} from '@infra/api/dto';
import {
  CompleteNewUserRegistrationInvitationCommandAdapter,
  RespondUserRegistrationInvitationCommandAdapter,
} from '@infra/cqrs/commands';
import { GetUserRegistrationInvitationQuery } from '@infra/cqrs/queries';
import { SuccessMessageService } from '@infra/i18n/services/success-message.service';
import { UserRegistrationInvitationPresenter } from '@infra/api/presenters';
import {
  MasterUserPresenter,
  TenantAccessUserPresenter,
} from '@infra/api/presenters/user';
import {
  CompleteNewUserRegistrationInvitationResultDto,
  RespondUserRegistrationInvitationResultDto,
} from '@application/dto';
import { UserRegistrationInvitationScope } from '@domain/ports/repositories';

@Controller('v1/user-registration-invitations')
export class UserRegistrationInvitationPublicController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
    private readonly presenter: UserRegistrationInvitationPresenter,
    private readonly tenantUserPresenter: TenantAccessUserPresenter,
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

  @Post(':token/respond')
  @HttpCode(HttpStatus.OK)
  async respondInvitation(
    @Param('token') token: string,
    @Body() body: RespondUserRegistrationInvitationRequestDto,
  ) {
    const command = RespondUserRegistrationInvitationCommandAdapter.create(
      body.toDomain(token),
    );

    const result = await this.commandBus.execute(command);

    const response = await this.presentResponse(result);

    return ApiResponseBuilder.create()
      .withSuccessMessage(
        this.successMsgService.getMsg(
          result.status === 'ACCEPTED'
            ? 'USER_REGISTRATION_INVITATION.ACCEPTED'
            : 'USER_REGISTRATION_INVITATION.DECLINED',
        ),
      )
      .withData(response)
      .withStatus(HttpStatus.OK)
      .build();
  }

  private async presentRegistrationCompletion(
    result: CompleteNewUserRegistrationInvitationResultDto,
  ) {
    if (result.scope === UserRegistrationInvitationScope.TENANT) {
      return this.tenantUserPresenter.toUserResponse(result.user);
    }

    return this.masterUserPresenter.toUserResponse(result.user);
  }

  private async presentResponse(
    result: RespondUserRegistrationInvitationResultDto,
  ) {
    if (result.status === 'ACCEPTED') {
      const user = await this.tenantUserPresenter.toUserResponse(result.user);
      return {
        status: result.status,
        user,
      };
    }

    return { status: result.status };
  }
}
