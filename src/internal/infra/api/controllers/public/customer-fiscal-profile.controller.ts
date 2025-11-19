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
import { CustomerFiscalProfilePresenter } from '@infra/api/presenters/customer-fiscal-profile';
import { SuccessMessageService } from '@infra/i18n/services/success-message.service';
import { SubmitCustomerFiscalProfileRequestDto } from '@infra/api/dto/customer-fiscal-profile';
import { SubmitCustomerFiscalProfileCommandAdapter } from '@infra/cqrs/commands';
import { GetCustomerFiscalProfileByTokenQuery } from '@infra/cqrs/queries';

@Controller('v1/public/customer-fiscal-profiles')
export class CustomerFiscalProfilePublicController {
  constructor(
    private readonly queryBus: QueryBus,
    private readonly commandBus: CommandBus,
    private readonly presenter: CustomerFiscalProfilePresenter,
    private readonly successMsgService: SuccessMessageService,
  ) {}

  @Get(':token')
  @HttpCode(HttpStatus.OK)
  async getByToken(@Param('token') token: string) {
    const result = await this.queryBus.execute(
      GetCustomerFiscalProfileByTokenQuery.create(token),
    );
    const data = this.presenter.toViewResponse(result);

    return ApiResponseBuilder.create()
      .withSuccessMessage(this.successMsgService.getMsg('DEFAULT'))
      .withData(data)
      .withStatus(HttpStatus.OK)
      .build();
  }

  @Post(':token/submit')
  @HttpCode(HttpStatus.CREATED)
  async submit(
    @Param('token') token: string,
    @Body() body: SubmitCustomerFiscalProfileRequestDto,
  ) {
    const command = SubmitCustomerFiscalProfileCommandAdapter.create(
      body.toDomain(token),
    );

    const result = await this.commandBus.execute(command);
    const data = this.presenter.toViewResponse(result);

    return ApiResponseBuilder.create()
      .withSuccessMessage(
        this.successMsgService.getMsg('CUSTOMER_FISCAL_PROFILE.SUBMITTED'),
      )
      .withData(data)
      .withStatus(HttpStatus.CREATED)
      .build();
  }
}
