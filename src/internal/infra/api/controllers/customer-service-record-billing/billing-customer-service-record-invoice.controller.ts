import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Query,
  Put,
  UseGuards,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { AuthenticatedUserContextDto } from '@application/dto';
import { CurrentUser, RequirePermission } from '@src/common/decorators';
import {
  CreateBillingCustomerServiceRecordPaymentComplementRequestDto,
  UpdateBillingCustomerServiceRecordPaymentComplementRequestDto,
} from '@infra/api/dto/customer-service-record-billing';
import { JwtAuthGuard, PermissionsGuard } from '@infra/api/guards';
import {
  BillingCustomerServiceRecordPresenter,
  BillingRecordArchivePresenter,
} from '@infra/api/presenters/customer-service-record-billing';
import { PaginationRequestDto } from '@infra/api/dto/shared';
import {
  GetBillingCustomerServiceRecordArchiveByIdQuery,
  GetBillingCustomerServiceRecordArchivesQuery,
} from '@infra/cqrs/queries/customer-service-record-billing';
import { ApiResponseBuilder } from '@infra/api/responses/api-response.builder';
import {
  CreateBillingCustomerServiceRecordPaymentComplementCommandAdapter,
  ArchiveBillingCustomerServiceRecordInvoiceCommandAdapter,
  UpdateBillingCustomerServiceRecordPaymentComplementCommandAdapter,
} from '@infra/cqrs/commands/customer-service-record-billing';
import { SuccessMessageService } from '@infra/i18n/services/success-message.service';

@Controller('v1/billing/customer-service-records')
export class BillingCustomerServiceRecordInvoiceController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
    private readonly presenter: BillingCustomerServiceRecordPresenter,
    private readonly archivePresenter: BillingRecordArchivePresenter,
    private readonly successMsgService: SuccessMessageService,
  ) {}

  @Post(':recordId/invoice/archive')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermission('billing_customer_service_records', 'UPDATE')
  async archive(
    @CurrentUser() user: AuthenticatedUserContextDto,
    @Param('recordId') recordId: string,
  ) {
    const result = await this.commandBus.execute(
      ArchiveBillingCustomerServiceRecordInvoiceCommandAdapter.create(
        recordId,
        user.userId,
      ),
    );
    return this.response(
      {
        archive_id: result.archiveId,
        record: this.presenter.toViewResponse(result.record),
      },
      HttpStatus.OK,
    );
  }

  @Get(':recordId/invoice/archives')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermission('billing_customer_service_records', 'READ')
  async findArchives(
    @Param('recordId') recordId: string,
    @Query() query: PaginationRequestDto,
  ) {
    const page = query.getPage();
    const perPage = query.getPerPage();
    const result = await this.queryBus.execute(
      GetBillingCustomerServiceRecordArchivesQuery.create(
        recordId,
        page,
        perPage,
      ),
    );
    return ApiResponseBuilder.create()
      .withSuccessMessage(this.successMsgService.getMsg('DEFAULT'))
      .withData(
        result.data.map((item) => this.archivePresenter.toSummary(item)),
      )
      .withPagination(page, perPage, result.total)
      .withStatus(HttpStatus.OK)
      .build();
  }

  @Get(':recordId/invoice/archives/:archiveId')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermission('billing_customer_service_records', 'READ')
  async findArchive(
    @Param('recordId') recordId: string,
    @Param('archiveId') archiveId: string,
  ) {
    const result = await this.queryBus.execute(
      GetBillingCustomerServiceRecordArchiveByIdQuery.create(
        recordId,
        archiveId,
      ),
    );
    return this.response(this.archivePresenter.toDetail(result), HttpStatus.OK);
  }

  @Post(':recordId/invoice/payment-complements')
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermission('billing_customer_service_records', 'UPDATE')
  async createComplement(
    @CurrentUser() user: AuthenticatedUserContextDto,
    @Param('recordId') recordId: string,
    @Body() body: CreateBillingCustomerServiceRecordPaymentComplementRequestDto,
  ) {
    const result = await this.commandBus.execute(
      CreateBillingCustomerServiceRecordPaymentComplementCommandAdapter.create(
        body.toDomain(recordId, user.userId),
      ),
    );
    return this.response(
      this.presenter.toViewResponse(result),
      HttpStatus.CREATED,
    );
  }

  @Put(':recordId/invoice/payment-complements/:complementId')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermission('billing_customer_service_records', 'UPDATE')
  async updateComplement(
    @CurrentUser() user: AuthenticatedUserContextDto,
    @Param('recordId') recordId: string,
    @Param('complementId') complementId: string,
    @Body() body: UpdateBillingCustomerServiceRecordPaymentComplementRequestDto,
  ) {
    const result = await this.commandBus.execute(
      UpdateBillingCustomerServiceRecordPaymentComplementCommandAdapter.create(
        body.toUpdateDomain(recordId, complementId, user.userId),
      ),
    );
    return this.response(this.presenter.toViewResponse(result), HttpStatus.OK);
  }

  private response(data: unknown, status: HttpStatus) {
    return ApiResponseBuilder.create()
      .withSuccessMessage(this.successMsgService.getMsg('DEFAULT'))
      .withData(data)
      .withStatus(status)
      .build();
  }
}
