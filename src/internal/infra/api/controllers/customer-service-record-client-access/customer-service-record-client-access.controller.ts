import {
  Controller,
  Get,
  Param,
  Query,
  UseGuards,
  HttpStatus,
} from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import {
  AuthenticatedUserContextDto,
  GetCustomerServiceRecordClientAccessListResultDto,
  CustomerServiceRecordClientAccessViewDto,
  CustomerServiceRecordClientAccessCustomerOptionDto,
  CustomerServiceRecordClientAccessServiceTypeOptionDto,
} from '@application/dto';
import { CurrentUser, RequirePermission } from '@src/common/decorators';
import { JwtAuthGuard, PermissionsGuard } from '@infra/api/guards';
import {
  GetCustomerServiceRecordClientAccessListRequestDto,
  GetCustomerServiceRecordClientAccessCustomerOptionsRequestDto,
  GetCustomerServiceRecordClientAccessServiceTypeOptionsRequestDto,
} from '@infra/api/dto';
import { CustomerServiceRecordClientAccessPresenter } from '@infra/api/presenters/customer-service-record-client-access';
import {
  GetCustomerServiceRecordClientAccessListQuery,
  GetCustomerServiceRecordClientAccessByIdQuery,
  GetCustomerServiceRecordClientAccessCustomerOptionsQuery,
  GetCustomerServiceRecordClientAccessServiceTypeOptionsQuery,
} from '@infra/cqrs/queries';
import { ApiResponseBuilder } from '@infra/api/responses/api-response.builder';
import { SuccessMessageService } from '@infra/i18n/services/success-message.service';

@Controller('v1/customer-service-records-client-access')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class CustomerServiceRecordClientAccessController {
  constructor(
    private readonly queryBus: QueryBus,
    private readonly presenter: CustomerServiceRecordClientAccessPresenter,
    private readonly successMsgService: SuccessMessageService,
  ) {}
  @Get()
  @RequirePermission('customer_service_records_client_access', 'READ')
  async findAll(
    @CurrentUser() user: AuthenticatedUserContextDto,
    @Query() query: GetCustomerServiceRecordClientAccessListRequestDto,
  ) {
    const result = await this.queryBus.execute<
      GetCustomerServiceRecordClientAccessListQuery,
      GetCustomerServiceRecordClientAccessListResultDto
    >(
      GetCustomerServiceRecordClientAccessListQuery.create(
        query.toDomain(user.userId),
      ),
    );
    return this.response(this.presenter.toCollection(result.items))
      .withPagination(result.page, result.perPage, result.total)
      .build();
  }
  @Get('customers/options')
  @RequirePermission('customer_service_records_client_access', 'READ')
  async customerOptions(
    @CurrentUser() user: AuthenticatedUserContextDto,
    @Query()
    query: GetCustomerServiceRecordClientAccessCustomerOptionsRequestDto,
  ) {
    const result = await this.queryBus.execute<
      GetCustomerServiceRecordClientAccessCustomerOptionsQuery,
      CustomerServiceRecordClientAccessCustomerOptionDto[]
    >(
      GetCustomerServiceRecordClientAccessCustomerOptionsQuery.create(
        query.toDomain(user.userId),
      ),
    );
    return this.response(this.presenter.toCustomerOptions(result)).build();
  }
  @Get('service-types/options')
  @RequirePermission('customer_service_records_client_access', 'READ')
  async serviceTypeOptions(
    @CurrentUser() user: AuthenticatedUserContextDto,
    @Query()
    query: GetCustomerServiceRecordClientAccessServiceTypeOptionsRequestDto,
  ) {
    const result = await this.queryBus.execute<
      GetCustomerServiceRecordClientAccessServiceTypeOptionsQuery,
      CustomerServiceRecordClientAccessServiceTypeOptionDto[]
    >(
      GetCustomerServiceRecordClientAccessServiceTypeOptionsQuery.create(
        query.toDomain(user.userId),
      ),
    );
    return this.response(this.presenter.toServiceTypeOptions(result)).build();
  }
  @Get(':recordId')
  @RequirePermission('customer_service_records_client_access', 'READ')
  async findOne(
    @CurrentUser() user: AuthenticatedUserContextDto,
    @Param('recordId') recordId: string,
  ) {
    const result = await this.queryBus.execute<
      GetCustomerServiceRecordClientAccessByIdQuery,
      CustomerServiceRecordClientAccessViewDto
    >(
      GetCustomerServiceRecordClientAccessByIdQuery.create(
        user.userId,
        recordId,
      ),
    );
    return this.response(this.presenter.toViewResponse(result)).build();
  }
  private response(data: unknown) {
    return ApiResponseBuilder.create()
      .withData(data)
      .withStatus(HttpStatus.OK)
      .withSuccessMessage(this.successMsgService.getMsg('DEFAULT'));
  }
}
