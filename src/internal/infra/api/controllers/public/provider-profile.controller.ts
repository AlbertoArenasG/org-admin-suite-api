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
import { ProviderPresenter } from '@infra/api/presenters/provider';
import { SuccessMessageService } from '@infra/i18n/services/success-message.service';
import { SubmitProviderProfileRequestDto } from '@infra/api/dto/provider';
import { SubmitProviderProfileCommandAdapter } from '@infra/cqrs/commands';
import { GetProviderByTokenQuery } from '@infra/cqrs/queries';

@Controller('v1/public/provider-profiles')
export class ProviderProfilePublicController {
  constructor(
    private readonly queryBus: QueryBus,
    private readonly commandBus: CommandBus,
    private readonly presenter: ProviderPresenter,
    private readonly successMsgService: SuccessMessageService,
  ) {}

  @Get(':token')
  @HttpCode(HttpStatus.OK)
  async getByToken(@Param('token') token: string) {
    const result = await this.queryBus.execute(
      GetProviderByTokenQuery.create(token),
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
    @Body() body: SubmitProviderProfileRequestDto,
  ) {
    const command = SubmitProviderProfileCommandAdapter.create(
      body.toDomain(token),
    );

    const result = await this.commandBus.execute(command);
    const data = this.presenter.toViewResponse(result);

    return ApiResponseBuilder.create()
      .withSuccessMessage(
        this.successMsgService.getMsg('PROVIDER_PROFILE.SUBMITTED'),
      )
      .withData(data)
      .withStatus(HttpStatus.CREATED)
      .build();
  }
}
