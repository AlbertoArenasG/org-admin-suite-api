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
import { CreateMasterUserRequestDto } from '@infra/api/dto/master-admin/user';
import { MasterUserPresenter } from '@infra/api/presenters/user/master-user.presenter';
import { CreateMasterUserCommandAdapter } from '@infra/cqrs/commands';
import { SuccessMessageService } from '@infra/i18n/services/success-message.service';
import {
  JwtAuthGuard,
  MasterScopeGuard,
  PermissionsGuard,
} from '@src/internal/infra/api/guards';
import { AuthenticatedUserContextDto } from '@application/dto';

@Controller('v1/master-admin/users')
export class MasterAdminUserController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly presenter: MasterUserPresenter,
    private readonly successMsgService: SuccessMessageService,
  ) {}

  @Post()
  @Scopes(MASTER_SCOPE)
  @UseGuards(JwtAuthGuard, MasterScopeGuard, PermissionsGuard)
  @RequirePermission('users', 'CREATE')
  @HttpCode(HttpStatus.CREATED)
  async create(
    @CurrentUser() currentUser: AuthenticatedUserContextDto,
    @Body() body: CreateMasterUserRequestDto,
  ) {
    const command = CreateMasterUserCommandAdapter.create(
      body.toDomain(),
      currentUser.systemRole,
    );
    const result = await this.commandBus.execute(command);
    const data = await this.presenter.toUserResponse(result);

    return ApiResponseBuilder.create()
      .withSuccessMessage(this.successMsgService.getMsg('USER.CREATED'))
      .withData(data)
      .withStatus(HttpStatus.CREATED)
      .build();
  }
}
