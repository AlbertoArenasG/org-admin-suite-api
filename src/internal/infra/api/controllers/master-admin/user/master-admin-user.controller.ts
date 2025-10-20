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
import { CreateMasterUserRequestDto } from '@infra/api/dto/master-admin/user';
import { MasterUserPresenter } from '@infra/api/presenters/user/master-user.presenter';
import { CreateMasterUserCmd } from '@infra/cqrs/commands';
import { SuccessMessageService } from '@infra/i18n/services/success-message.service';
import { JwtAuthGuard, MasterOnlyGuard } from '@src/internal/infra/api/guards';

@Controller('v1/master-admin/users')
export class MasterAdminUserController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly presenter: MasterUserPresenter,
    private readonly successMsgService: SuccessMessageService,
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard, MasterOnlyGuard)
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() body: CreateMasterUserRequestDto) {
    const command = CreateMasterUserCmd.create(body.toDomain());
    const result = await this.commandBus.execute(command);
    const data = await this.presenter.toUserResponse(result);

    return ApiResponseBuilder.create()
      .withSuccessMessage(this.successMsgService.getMsg('USER.CREATED'))
      .withData(data)
      .withStatus(HttpStatus.CREATED)
      .build();
  }
}
