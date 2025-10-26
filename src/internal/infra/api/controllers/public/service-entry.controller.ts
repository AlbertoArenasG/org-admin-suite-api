import { Controller, Get, HttpCode, HttpStatus, Param } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';

import { ApiResponseBuilder } from '@infra/api/responses/api-response.builder';
import { ServiceEntryPresenter } from '@infra/api/presenters/service-entry';
import { GetServiceEntryByTokenQuery } from '@infra/cqrs/queries';
import { SuccessMessageService } from '@infra/i18n/services/success-message.service';

@Controller('v1/public/service-entry')
export class ServiceEntryPublicController {
  constructor(
    private readonly queryBus: QueryBus,
    private readonly presenter: ServiceEntryPresenter,
    private readonly successMsgService: SuccessMessageService,
  ) {}

  @Get(':token')
  @HttpCode(HttpStatus.OK)
  async getByToken(@Param('token') token: string) {
    const result = await this.queryBus.execute(
      GetServiceEntryByTokenQuery.create(token),
    );

    const data = this.presenter.toViewResponse(result);

    return ApiResponseBuilder.create()
      .withSuccessMessage(this.successMsgService.getMsg('DEFAULT'))
      .withData(data)
      .withStatus(HttpStatus.OK)
      .build();
  }
}
