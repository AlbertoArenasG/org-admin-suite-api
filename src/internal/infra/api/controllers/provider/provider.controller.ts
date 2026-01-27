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
import { CreateProviderRequestDto } from '@infra/api/dto/provider';
import { JwtAuthGuard } from '@infra/api/guards';
import { ProviderPresenter } from '@infra/api/presenters/provider';
import { SuccessMessageService } from '@infra/i18n/services/success-message.service';
import { CreateProviderCommandAdapter } from '@infra/cqrs/commands';
import { CurrentUser } from '@src/common/decorators';
import { AuthenticatedUserContextDto } from '@application/dto';
import { AuthorizationException } from '@domain/exceptions';
import { UserRole } from '@domain/entities';

@Controller('v1/providers')
export class ProviderController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly presenter: ProviderPresenter,
    private readonly successMsgService: SuccessMessageService,
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.CREATED)
  async create(
    @CurrentUser() currentUser: AuthenticatedUserContextDto,
    @Body() body: CreateProviderRequestDto,
  ) {
    this.ensureAuthorized(currentUser.role);

    const command = CreateProviderCommandAdapter.create(body.toDomain());
    const result = await this.commandBus.execute(command);
    const data = this.presenter.toCreateResponse(result);

    return ApiResponseBuilder.create()
      .withSuccessMessage(this.successMsgService.getMsg('PROVIDER.CREATED'))
      .withData(data)
      .withStatus(HttpStatus.CREATED)
      .build();
  }

  private ensureAuthorized(role: UserRole): void {
    const allowedRoles: UserRole[] = [
      UserRole.MASTER_ADMIN,
      UserRole.ADMIN,
      UserRole.STAFF,
    ];

    if (!allowedRoles.includes(role)) {
      throw AuthorizationException.rolePrivilegesInsufficient(role);
    }
  }
}
