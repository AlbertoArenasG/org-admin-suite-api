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
import { CreateServiceEntryRequestDto } from '@infra/api/dto/service-entry';
import { ServiceEntryPresenter } from '@infra/api/presenters/service-entry';
import { CreateServiceEntryCommandAdapter } from '@infra/cqrs/commands';
import { SuccessMessageService } from '@infra/i18n/services/success-message.service';
import { JwtAuthGuard } from '@infra/api/guards';
import { CurrentUser } from '@src/common/decorators';
import { AuthenticatedUserContextDto } from '@application/dto';

@Controller('v1/services/service-entry')
export class ServiceEntryController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly presenter: ServiceEntryPresenter,
    private readonly successMsgService: SuccessMessageService,
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.CREATED)
  async create(
    @CurrentUser() _currentUser: AuthenticatedUserContextDto,
    @Body() body: CreateServiceEntryRequestDto,
  ) {
    const command = CreateServiceEntryCommandAdapter.create(body.toDomain());
    const result = await this.commandBus.execute(command);
    const data = this.presenter.toResponse(result);

    return ApiResponseBuilder.create()
      .withSuccessMessage(
        this.successMsgService.getMsg('SERVICE_ENTRY.CREATED'),
      )
      .withData(data)
      .withStatus(HttpStatus.CREATED)
      .build();
  }
}
