import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { AuthenticatedUserContextDto } from '@application/dto';
import { CurrentUser, RequirePermission } from '@src/common/decorators';
import { CreateBillingCustomerServiceRecordCommentRequestDto } from '@infra/api/dto/customer-service-record-billing';
import { PaginationRequestDto } from '@infra/api/dto/shared';
import { JwtAuthGuard, PermissionsGuard } from '@infra/api/guards';
import { BillingRecordCommentPresenter } from '@infra/api/presenters/customer-service-record-billing';
import { ApiResponseBuilder } from '@infra/api/responses/api-response.builder';
import { CreateBillingCustomerServiceRecordCommentCommandAdapter } from '@infra/cqrs/commands/customer-service-record-billing';
import { GetBillingCustomerServiceRecordCommentsQuery } from '@infra/cqrs/queries/customer-service-record-billing';
import { SuccessMessageService } from '@infra/i18n/services/success-message.service';

@Controller('v1/billing/customer-service-records')
export class BillingCustomerServiceRecordCommentController {
  constructor(
    private readonly commands: CommandBus,
    private readonly queries: QueryBus,
    private readonly presenter: BillingRecordCommentPresenter,
    private readonly success: SuccessMessageService,
  ) {}

  @Post(':recordId/comments')
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermission('billing_customer_service_records', 'UPDATE')
  async create(
    @CurrentUser() user: AuthenticatedUserContextDto,
    @Param('recordId') recordId: string,
    @Body() body: CreateBillingCustomerServiceRecordCommentRequestDto,
  ) {
    const result = await this.commands.execute(
      CreateBillingCustomerServiceRecordCommentCommandAdapter.create({
        recordId,
        actorUserId: user.userId,
        text: body.text,
        visibility: body.visibility,
      }),
    );
    return ApiResponseBuilder.create()
      .withSuccessMessage(this.success.getMsg('DEFAULT'))
      .withData(this.presenter.toResponse(result))
      .withStatus(HttpStatus.CREATED)
      .build();
  }

  @Get(':recordId/comments')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermission('billing_customer_service_records', 'READ')
  async findAll(
    @Param('recordId') recordId: string,
    @Query() query: PaginationRequestDto,
  ) {
    const page = query.getPage();
    const perPage = query.getPerPage();
    const result = await this.queries.execute(
      GetBillingCustomerServiceRecordCommentsQuery.create(
        recordId,
        page,
        perPage,
      ),
    );
    return ApiResponseBuilder.create()
      .withSuccessMessage(this.success.getMsg('DEFAULT'))
      .withData(result.data.map((item) => this.presenter.toResponse(item)))
      .withPagination(page, perPage, result.total)
      .withStatus(HttpStatus.OK)
      .build();
  }
}
