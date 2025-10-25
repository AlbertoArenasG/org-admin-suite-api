import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Param,
  Post,
} from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';

import { ApiResponseBuilder } from '@infra/api/responses/api-response.builder';
import { SubmitServiceEntrySurveyRequestDto } from '@infra/api/dto/service-entry-survey';
import { SubmitServiceEntrySurveyCommandAdapter } from '@infra/cqrs/commands';
import { SuccessMessageService } from '@infra/i18n/services/success-message.service';

@Controller('v1/public/service-entry')
export class ServiceEntrySurveyPublicController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly successMsgService: SuccessMessageService,
  ) {}

  @Post(':token/survey')
  @HttpCode(HttpStatus.CREATED)
  async submitSurvey(
    @Param('token') token: string,
    @Body() body: SubmitServiceEntrySurveyRequestDto,
  ) {
    const command = SubmitServiceEntrySurveyCommandAdapter.create(
      body.toDomain(token),
    );
    const result = await this.commandBus.execute(command);

    return ApiResponseBuilder.create()
      .withSuccessMessage(this.successMsgService.getMsg('DEFAULT'))
      .withData(result)
      .withStatus(HttpStatus.CREATED)
      .build();
  }
}
