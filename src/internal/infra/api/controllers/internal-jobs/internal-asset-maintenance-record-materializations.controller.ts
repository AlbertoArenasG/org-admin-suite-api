import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
} from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';

import { RefreshInternalAssetMaintenanceRecordMaterializationsRequestDto } from '@infra/api/dto';
import { InternalJobsAuthGuard } from '@infra/api/guards';
import { InternalAssetMaintenanceRecordMaterializationsRefreshPresenter } from '@infra/api/presenters/internal-asset-maintenance-record';
import { ApiResponseBuilder } from '@infra/api/responses/api-response.builder';
import { RefreshInternalAssetMaintenanceRecordMaterializationsCommandAdapter } from '@infra/cqrs/commands';
import { SuccessMessageService } from '@infra/i18n/services/success-message.service';

@Controller('v1/internal-jobs/internal-asset-maintenance-records')
@UseGuards(InternalJobsAuthGuard)
export class InternalAssetMaintenanceRecordMaterializationsController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly presenter: InternalAssetMaintenanceRecordMaterializationsRefreshPresenter,
    private readonly successMsgService: SuccessMessageService,
  ) {}

  @Post('refresh-materializations')
  @HttpCode(HttpStatus.OK)
  async refresh(
    @Body()
    body: RefreshInternalAssetMaintenanceRecordMaterializationsRequestDto,
  ) {
    const result = await this.commandBus.execute(
      RefreshInternalAssetMaintenanceRecordMaterializationsCommandAdapter.create(
        body.toDomain(),
      ),
    );
    const data = this.presenter.toResponse(result);

    return ApiResponseBuilder.create()
      .withSuccessMessage(this.successMsgService.getMsg('DEFAULT'))
      .withData(data)
      .withStatus(HttpStatus.OK)
      .build();
  }
}
