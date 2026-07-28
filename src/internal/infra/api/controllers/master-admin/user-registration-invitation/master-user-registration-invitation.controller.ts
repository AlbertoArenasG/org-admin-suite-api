import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
} from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';

import {
  CurrentUser,
  MASTER_SCOPE,
  RequirePermission,
  Scopes,
} from '@src/common/decorators';
import { ApiResponseBuilder } from '@infra/api/responses/api-response.builder';
import { CreateMasterUserRegistrationInvitationRequestDto } from '@infra/api/dto';
import { CreateMasterUserRegistrationInvitationCommandAdapter } from '@infra/cqrs/commands';
import { UserRegistrationInvitationPresenter } from '@infra/api/presenters';
import { SuccessMessageService } from '@infra/i18n/services/success-message.service';
import {
  JwtAuthGuard,
  MasterScopeGuard,
  PermissionsGuard,
} from '@infra/api/guards';
import { AuthenticatedUserContextDto } from '@application/dto';

@Controller('v1/master-admin/user-registration-invitations')
export class MasterUserRegistrationInvitationController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly presenter: UserRegistrationInvitationPresenter,
    private readonly successMsgService: SuccessMessageService,
  ) {}

  @Post()
  @Scopes(MASTER_SCOPE)
  @UseGuards(JwtAuthGuard, MasterScopeGuard, PermissionsGuard)
  @RequirePermission('user_registration_invitations', 'CREATE')
  @HttpCode(HttpStatus.CREATED)
  async create(
    @CurrentUser() currentUser: AuthenticatedUserContextDto,
    @Body() body: CreateMasterUserRegistrationInvitationRequestDto,
  ) {
    const command = CreateMasterUserRegistrationInvitationCommandAdapter.create(
      body.toDomain(currentUser.userId),
      currentUser.systemRole,
    );

    const result = await this.commandBus.execute(command);
    const data = this.presenter.toMasterResponse(result);

    return ApiResponseBuilder.create()
      .withSuccessMessage(
        this.successMsgService.getMsg('USER_REGISTRATION_INVITATION.CREATED'),
      )
      .withData(data)
      .withStatus(HttpStatus.CREATED)
      .build();
  }
}
