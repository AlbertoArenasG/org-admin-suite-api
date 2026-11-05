import {
  Body,
  Controller,
  HttpStatus,
  Param,
  Patch,
  Put,
  UseGuards,
} from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { AuthenticatedUserContextDto } from '@application/dto';
import { CurrentUser, RequirePermission } from '@src/common/decorators';
import {
  UpdateBillingCustomerServiceRecordDetailsRequestDto,
  UpdateBillingCustomerServiceRecordInvoiceStatusRequestDto,
  UpdateBillingCustomerServiceRecordPurchaseOrderRequestDto,
} from '@infra/api/dto/customer-service-record-billing';
import { JwtAuthGuard, PermissionsGuard } from '@infra/api/guards';
import { BillingCustomerServiceRecordPresenter } from '@infra/api/presenters/customer-service-record-billing';
import { ApiResponseBuilder } from '@infra/api/responses/api-response.builder';
import {
  UpdateBillingCustomerServiceRecordDetailsCommandAdapter,
  UpdateBillingCustomerServiceRecordInvoiceStatusCommandAdapter,
  UpdateBillingCustomerServiceRecordPurchaseOrderCommandAdapter,
} from '@infra/cqrs/commands/customer-service-record-billing';
import { SuccessMessageService } from '@infra/i18n/services/success-message.service';

@Controller('v1/billing/customer-service-records')
export class BillingCustomerServiceRecordLifecycleController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly presenter: BillingCustomerServiceRecordPresenter,
    private readonly successMsgService: SuccessMessageService,
  ) {}

  @Patch(':recordId/billing-details')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermission('billing_customer_service_records', 'UPDATE')
  async updateDetails(
    @CurrentUser() user: AuthenticatedUserContextDto,
    @Param('recordId') recordId: string,
    @Body() body: UpdateBillingCustomerServiceRecordDetailsRequestDto,
  ) {
    const result = await this.commandBus.execute(
      UpdateBillingCustomerServiceRecordDetailsCommandAdapter.create(
        body.toDomain(recordId, user.userId),
      ),
    );
    return this.response(this.presenter.toViewResponse(result));
  }

  @Patch(':recordId/invoice-status')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermission('billing_customer_service_records', 'UPDATE')
  async updateInvoiceStatus(
    @CurrentUser() user: AuthenticatedUserContextDto,
    @Param('recordId') recordId: string,
    @Body() body: UpdateBillingCustomerServiceRecordInvoiceStatusRequestDto,
  ) {
    const result = await this.commandBus.execute(
      UpdateBillingCustomerServiceRecordInvoiceStatusCommandAdapter.create(
        body.toDomain(recordId, user.userId),
      ),
    );
    return this.response(this.presenter.toViewResponse(result));
  }

  @Put(':recordId/purchase-order')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermission('billing_customer_service_records', 'UPDATE')
  async updatePurchaseOrder(
    @CurrentUser() user: AuthenticatedUserContextDto,
    @Param('recordId') recordId: string,
    @Body() body: UpdateBillingCustomerServiceRecordPurchaseOrderRequestDto,
  ) {
    const result = await this.commandBus.execute(
      UpdateBillingCustomerServiceRecordPurchaseOrderCommandAdapter.create(
        body.toPurchaseOrderDomain(recordId, user.userId),
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
