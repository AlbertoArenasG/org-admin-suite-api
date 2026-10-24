import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Param,
  Patch,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { AuthenticatedUserContextDto } from '@application/dto';
import { CurrentUser, RequirePermission } from '@src/common/decorators';
import {
  GetBillingCustomerServiceRecordsRequestDto,
  UpdateBillingCustomerServiceRecordInvoiceRequestDto,
  UpdateBillingCustomerServiceRecordStatusRequestDto,
} from '@infra/api/dto/customer-service-record-billing';
import { JwtAuthGuard, PermissionsGuard } from '@infra/api/guards';
import { BillingCustomerServiceRecordPresenter } from '@infra/api/presenters/customer-service-record-billing';
import { ApiResponseBuilder } from '@infra/api/responses/api-response.builder';
import {
  UpdateBillingCustomerServiceRecordInvoiceCommandAdapter,
  UpdateBillingCustomerServiceRecordStatusCommandAdapter,
} from '@infra/cqrs/commands/customer-service-record-billing';
import {
  GetBillingCustomerServiceRecordsQuery,
  GetBillingCustomerServiceRecordByIdQuery,
  GetBillingCustomerServiceRecordStatusOptionsQuery,
} from '@infra/cqrs/queries/customer-service-record-billing';
import { SuccessMessageService } from '@infra/i18n/services/success-message.service';

@Controller('v1/billing/customer-service-records')
export class BillingCustomerServiceRecordController {
  constructor(
    private readonly commandBus: CommandBus,
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

  @Patch(':recordId/billing-status')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermission('billing_customer_service_records', 'UPDATE')
  async updateBillingStatus(
    @CurrentUser() user: AuthenticatedUserContextDto,
    @Param('recordId') recordId: string,
    @Body() body: UpdateBillingCustomerServiceRecordStatusRequestDto,
  ) {
    const result = await this.commandBus.execute(
      UpdateBillingCustomerServiceRecordStatusCommandAdapter.create(
        body.toDomain(recordId, user.userId),
      ),
    );
    return this.response(this.presenter.toViewResponse(result));
  }

  @Put(':recordId/invoice')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermission('billing_customer_service_records', 'UPDATE')
  async updateInvoice(
    @CurrentUser() user: AuthenticatedUserContextDto,
    @Param('recordId') recordId: string,
    @Body() body: UpdateBillingCustomerServiceRecordInvoiceRequestDto,
  ) {
    const result = await this.commandBus.execute(
      UpdateBillingCustomerServiceRecordInvoiceCommandAdapter.create(
        body.toDomain(recordId, user.userId),
      ),
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
