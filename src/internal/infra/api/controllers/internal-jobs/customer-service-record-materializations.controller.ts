import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
} from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { RefreshCustomerServiceRecordMaterializationsRequestDto } from '@infra/api/dto';
import { InternalJobsAuthGuard } from '@infra/api/guards';
import { CustomerServiceRecordMaterializationsRefreshPresenter } from '@infra/api/presenters/customer-service-record';
import { ApiResponseBuilder } from '@infra/api/responses/api-response.builder';
import { RefreshCustomerServiceRecordMaterializationsCommandAdapter } from '@infra/cqrs/commands';
import { SuccessMessageService } from '@infra/i18n/services/success-message.service';
@Controller('v1/internal-jobs/customer-service-records/materializations')
@UseGuards(InternalJobsAuthGuard)
export class CustomerServiceRecordMaterializationsController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly presenter: CustomerServiceRecordMaterializationsRefreshPresenter,
    private readonly successMessageService: SuccessMessageService,
  ) {}
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refresh(
    @Body() body: RefreshCustomerServiceRecordMaterializationsRequestDto,
  ) {
    const result = await this.commandBus.execute(
      RefreshCustomerServiceRecordMaterializationsCommandAdapter.create(
        body.toDomain(),
      ),
    );
    return ApiResponseBuilder.create()
      .withSuccessMessage(this.successMessageService.getMsg('DEFAULT'))
      .withData(this.presenter.toResponse(result))
      .withStatus(HttpStatus.OK)
      .build();
  }
}
