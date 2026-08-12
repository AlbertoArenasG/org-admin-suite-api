import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';

import { RequirePermission } from '@src/common/decorators';
import { JwtAuthGuard, PermissionsGuard } from '@infra/api/guards';
import { CommunicationChannelPresenter } from '@infra/api/presenters/communication-channel';
import { ApiResponseBuilder } from '@infra/api/responses/api-response.builder';
import { GetCommunicationChannelsQuery } from '@infra/cqrs/queries';
import { SuccessMessageService } from '@infra/i18n/services/success-message.service';

@Controller('v1/communication-channels')
export class CommunicationChannelController {
  constructor(
    private readonly queryBus: QueryBus,
    private readonly presenter: CommunicationChannelPresenter,
    private readonly successMsgService: SuccessMessageService,
  ) {}

  @Get()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermission('recipient_groups', 'READ')
  @HttpCode(HttpStatus.OK)
  async findAll() {
    const result = await this.queryBus.execute(
      GetCommunicationChannelsQuery.create(),
    );
    const data = this.presenter.toResponse(result);

    return ApiResponseBuilder.create()
      .withSuccessMessage(this.successMsgService.getMsg('DEFAULT'))
      .withData(data)
      .withStatus(HttpStatus.OK)
      .build();
  }
}
