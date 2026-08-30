import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { AuthenticatedUserContextDto } from '@application/dto';
import { CurrentUser, RequirePermission } from '@src/common/decorators';
import {
  CreateCustomerServiceRecordRequestDto,
  GetCustomerServiceRecordsRequestDto,
  UpdateCustomerServiceRecordRequestDto,
} from '@infra/api/dto';
import { JwtAuthGuard, PermissionsGuard } from '@infra/api/guards';
import { CustomerServiceRecordPresenter } from '@infra/api/presenters/customer-service-record';
import { ApiResponseBuilder } from '@infra/api/responses/api-response.builder';
import {
  CreateCustomerServiceRecordCommandAdapter,
  DeleteCustomerServiceRecordCommandAdapter,
  UpdateCustomerServiceRecordCommandAdapter,
} from '@infra/cqrs/commands';
import {
  GetCustomerServiceRecordByIdQuery,
  GetCustomerServiceRecordsQuery,
} from '@infra/cqrs/queries';
import { SuccessMessageService } from '@infra/i18n/services/success-message.service';
@Controller('v1/customer-service-records')
export class CustomerServiceRecordController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
    private readonly presenter: CustomerServiceRecordPresenter,
    private readonly successMsgService: SuccessMessageService,
  ) {}
  @Post()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermission('customer_service_records', 'CREATE')
  @HttpCode(HttpStatus.CREATED)
  async create(
    @CurrentUser() user: AuthenticatedUserContextDto,
    @Body() body: CreateCustomerServiceRecordRequestDto,
  ) {
    const result = await this.commandBus.execute(
      CreateCustomerServiceRecordCommandAdapter.create(
        body.toDomain(user.userId),
      ),
    );
    return this.response(
      this.presenter.toViewResponse(result),
      HttpStatus.CREATED,
    );
  }
  @Get()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermission('customer_service_records', 'READ')
  async findAll(@Query() query: GetCustomerServiceRecordsRequestDto) {
    const result = await this.queryBus.execute(
      GetCustomerServiceRecordsQuery.create(query.toDomain()),
    );
    return ApiResponseBuilder.create()
      .withSuccessMessage(this.successMsgService.getMsg('DEFAULT'))
      .withData(this.presenter.toCollection(result.items))
      .withPagination(result.page, result.perPage, result.total)
      .withStatus(HttpStatus.OK)
      .build();
  }
  @Get(':recordId')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermission('customer_service_records', 'READ')
  async findOne(@Param('recordId') recordId: string) {
    const result = await this.queryBus.execute(
      GetCustomerServiceRecordByIdQuery.create(recordId),
    );
    return this.response(this.presenter.toViewResponse(result), HttpStatus.OK);
  }
  @Patch(':recordId')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermission('customer_service_records', 'UPDATE')
  async update(
    @CurrentUser() user: AuthenticatedUserContextDto,
    @Param('recordId') recordId: string,
    @Body() body: UpdateCustomerServiceRecordRequestDto,
  ) {
    const result = await this.commandBus.execute(
      UpdateCustomerServiceRecordCommandAdapter.create(
        body.toDomain(recordId, user.userId),
      ),
    );
    return this.response(this.presenter.toViewResponse(result), HttpStatus.OK);
  }
  @Delete(':recordId')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermission('customer_service_records', 'DELETE')
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(
    @CurrentUser() user: AuthenticatedUserContextDto,
    @Param('recordId') recordId: string,
  ) {
    await this.commandBus.execute(
      DeleteCustomerServiceRecordCommandAdapter.create({
        recordId,
        actorUserId: user.userId,
      }),
    );
  }
  private response(data: unknown, status: HttpStatus) {
    return ApiResponseBuilder.create()
      .withSuccessMessage(this.successMsgService.getMsg('DEFAULT'))
      .withData(data)
      .withStatus(status)
      .build();
  }
}
