import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';

import { CurrentUser, RequirePermission } from '@src/common/decorators';
import { AuthenticatedUserContextDto } from '@application/dto';
import { ConvertServicePackageRecordRequestDto } from '@infra/api/dto';
import { JwtAuthGuard, PermissionsGuard } from '@infra/api/guards';
import { ServicePackageRecordConversionPresenter } from '@infra/api/presenters';
import { ApiResponseBuilder } from '@infra/api/responses/api-response.builder';
import { ConvertServicePackageRecordCommandAdapter } from '@infra/cqrs/commands';
import { SuccessMessageService } from '@infra/i18n/services/success-message.service';

@Controller('v1/service-packages/records')
export class ServicePackageRecordConversionController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly presenter: ServicePackageRecordConversionPresenter,
    private readonly successMessages: SuccessMessageService,
  ) {}

  @Post(':recordId/customer-service-records')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermission('service_packages', 'CONVERT')
  @HttpCode(HttpStatus.CREATED)
  async convert(
    @CurrentUser() currentUser: AuthenticatedUserContextDto,
    @Param('recordId') recordId: string,
    @Body() body: ConvertServicePackageRecordRequestDto,
  ) {
    const result = await this.commandBus.execute(
      ConvertServicePackageRecordCommandAdapter.create(
        body.toDomain(recordId, currentUser.userId),
      ),
    );
    return ApiResponseBuilder.create()
      .withSuccessMessage(this.successMessages.getMsg('DEFAULT'))
      .withData(this.presenter.toResponse(result))
      .withStatus(HttpStatus.CREATED)
      .build();
  }
}
