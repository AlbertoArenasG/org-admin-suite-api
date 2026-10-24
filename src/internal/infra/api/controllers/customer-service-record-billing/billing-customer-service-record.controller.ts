import {
  Controller,
  Get,
  HttpStatus,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import { RequirePermission } from '@src/common/decorators';
import { GetBillingCustomerServiceRecordsRequestDto } from '@infra/api/dto/customer-service-record-billing';
import { JwtAuthGuard, PermissionsGuard } from '@infra/api/guards';
import { BillingCustomerServiceRecordPresenter } from '@infra/api/presenters/customer-service-record-billing';
import { ApiResponseBuilder } from '@infra/api/responses/api-response.builder';
import {
  GetBillingCustomerServiceRecordsQuery,
  GetBillingCustomerServiceRecordByIdQuery,
  GetBillingCustomerServiceRecordStatusOptionsQuery,
} from '@infra/cqrs/queries/customer-service-record-billing';
import { SuccessMessageService } from '@infra/i18n/services/success-message.service';

@Controller('v1/billing/customer-service-records')
export class BillingCustomerServiceRecordController {
  constructor(
    private readonly queryBus: QueryBus,
    private readonly presenter: BillingCustomerServiceRecordPresenter,
    private readonly successMsgService: SuccessMessageService,
  ) {}

  @Get()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermission('billing_customer_service_records', 'READ')
  async findAll(@Query() query: GetBillingCustomerServiceRecordsRequestDto) {
    const result = await this.queryBus.execute(
      GetBillingCustomerServiceRecordsQuery.create(query.toDomain()),
    );
    return ApiResponseBuilder.create()
      .withSuccessMessage(this.successMsgService.getMsg('DEFAULT'))
      .withData(this.presenter.toCollection(result.items))
      .withPagination(result.page, result.perPage, result.total)
      .withStatus(HttpStatus.OK)
      .build();
  }

  @Get('billing-statuses/options')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermission('billing_customer_service_records', 'READ')
  async billingStatusOptions() {
    const result = await this.queryBus.execute(
      GetBillingCustomerServiceRecordStatusOptionsQuery.create(),
    );
    return this.response(this.presenter.toBillingStatusOptions(result));
  }

  @Get(':recordId')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermission('billing_customer_service_records', 'READ')
  async findOne(@Param('recordId') recordId: string) {
    const result = await this.queryBus.execute(
      GetBillingCustomerServiceRecordByIdQuery.create(recordId),
    );
    return this.response(this.presenter.toViewResponse(result));
  }

  private response(data: unknown) {
    return ApiResponseBuilder.create()
      .withSuccessMessage(this.successMsgService.getMsg('DEFAULT'))
      .withData(data)
      .withStatus(HttpStatus.OK)
      .build();
  }
}
