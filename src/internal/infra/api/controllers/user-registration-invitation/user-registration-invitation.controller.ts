import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';

import { CurrentUser, RequirePermission } from '@src/common/decorators';
import { ApiResponseBuilder } from '@infra/api/responses/api-response.builder';
import {
  CreateUserRegistrationInvitationCommandAdapter,
  ResendApplicationUserRegistrationInvitationCommandAdapter,
  RevokeApplicationUserRegistrationInvitationCommandAdapter,
} from '@infra/cqrs/commands';
import {
  CreateUserRegistrationInvitationRequestDto,
  GetApplicationUserRegistrationInvitationsRequestDto,
} from '@infra/api/dto';
import { GetApplicationUserRegistrationInvitationsQuery } from '@infra/cqrs/queries';
import { UserRegistrationInvitationPresenter } from '@infra/api/presenters';
import { SuccessMessageService } from '@infra/i18n/services/success-message.service';
import { JwtAuthGuard, PermissionsGuard } from '@infra/api/guards';
import { AuthenticatedUserContextDto } from '@application/dto';

@Controller('v1/user-registration-invitations')
export class UserRegistrationInvitationController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
    private readonly presenter: UserRegistrationInvitationPresenter,
    private readonly successMsgService: SuccessMessageService,
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermission('user_registration_invitations', 'CREATE')
  @HttpCode(HttpStatus.CREATED)
  async create(
    @CurrentUser() currentUser: AuthenticatedUserContextDto,
    @Body() body: CreateUserRegistrationInvitationRequestDto,
  ) {
    const command = CreateUserRegistrationInvitationCommandAdapter.create(
      body.toDomain(currentUser.userId),
      currentUser.systemRole,
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

  @Get()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermission('user_registration_invitations', 'READ')
  @HttpCode(HttpStatus.OK)
  async findAll(
    @Query() query: GetApplicationUserRegistrationInvitationsRequestDto,
  ) {
    const result = await this.queryBus.execute(
      GetApplicationUserRegistrationInvitationsQuery.create(query.toDomain()),
    );
    const data = this.presenter.toApplicationManagementCollection(result.data);

    return ApiResponseBuilder.create()
      .withSuccessMessage(this.successMsgService.getMsg('DEFAULT'))
      .withData(data)
      .withPagination(query.getPage(), query.getPerPage(), result.total)
      .withStatus(HttpStatus.OK)
      .build();
  }

  @Post(':invitationId/resend')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermission('user_registration_invitations', 'RESEND')
  @HttpCode(HttpStatus.OK)
  async resend(@Param('invitationId') invitationId: string) {
    const result = await this.commandBus.execute(
      ResendApplicationUserRegistrationInvitationCommandAdapter.create({
        invitationId,
      }),
    );
    const data = this.presenter.toApplicationManagementResponse(result);

    return ApiResponseBuilder.create()
      .withSuccessMessage(
        this.successMsgService.getMsg('USER_REGISTRATION_INVITATION.RESENT'),
      )
      .withData(data)
      .withStatus(HttpStatus.OK)
      .build();
  }

  @Post(':invitationId/revoke')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermission('user_registration_invitations', 'REVOKE')
  @HttpCode(HttpStatus.OK)
  async revoke(
    @CurrentUser() currentUser: AuthenticatedUserContextDto,
    @Param('invitationId') invitationId: string,
  ) {
    const result = await this.commandBus.execute(
      RevokeApplicationUserRegistrationInvitationCommandAdapter.create({
        invitationId,
        revokedByUserId: currentUser.userId,
      }),
    );
    const data = this.presenter.toApplicationManagementResponse(result);

    return ApiResponseBuilder.create()
      .withSuccessMessage(
        this.successMsgService.getMsg('USER_REGISTRATION_INVITATION.REVOKED'),
      )
      .withData(data)
      .withStatus(HttpStatus.OK)
      .build();
  }
}
