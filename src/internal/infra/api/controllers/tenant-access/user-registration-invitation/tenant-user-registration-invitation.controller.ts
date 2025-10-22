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
import { CreateTenantUserRegistrationInvitationCommandAdapter } from '@infra/cqrs/commands';
import { CreateTenantUserRegistrationInvitationRequestDto } from '@infra/api/dto';
import { UserRegistrationInvitationPresenter } from '@infra/api/presenters';
import { SuccessMessageService } from '@infra/i18n/services/success-message.service';
import { JwtAuthGuard, TenantScopeGuard } from '@infra/api/guards';
import { ActiveTenant, CurrentUser } from '@src/common/decorators';
import {
  AuthenticatedTenantContextDto,
  AuthenticatedUserContextDto,
} from '@application/dto';

@Controller('v1/user-registration-invitations')
export class TenantUserRegistrationInvitationController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly presenter: UserRegistrationInvitationPresenter,
    private readonly successMsgService: SuccessMessageService,
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard, TenantScopeGuard)
  @HttpCode(HttpStatus.CREATED)
  async create(
    @ActiveTenant() currentTenant: AuthenticatedTenantContextDto,
    @CurrentUser() currentUser: AuthenticatedUserContextDto,
    @Body() body: CreateTenantUserRegistrationInvitationRequestDto,
  ) {
    const command = CreateTenantUserRegistrationInvitationCommandAdapter.create(
      body.toDomain(currentTenant.tenantId, currentUser.userId),
    );

    const result = await this.commandBus.execute(command);
    const data = this.presenter.toTenantResponse(result);

    return ApiResponseBuilder.create()
      .withSuccessMessage(
        this.successMsgService.getMsg('USER_REGISTRATION_INVITATION.CREATED'),
      )
      .withData(data)
      .withStatus(HttpStatus.CREATED)
      .build();
  }
}
