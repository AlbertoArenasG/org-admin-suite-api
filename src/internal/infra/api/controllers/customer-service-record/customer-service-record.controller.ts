import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import {
  AuthenticatedUserContextDto,
  CustomerServiceRecordDocumentType,
} from '@application/dto';
import { CurrentUser, RequirePermission } from '@src/common/decorators';
import {
  CreateCustomerServiceRecordRequestDto,
  GetCustomerServiceRecordsRequestDto,
  UpdateCustomerServiceRecordAssetRequestDto,
  UpdateCustomerServiceRecordCustomerRequestDto,
  UpdateCustomerServiceRecordDetailsRequestDto,
  UpdateCustomerServiceRecordDocumentRequestDto,
  UpdateCustomerServiceRecordProviderRequestDto,
} from '@infra/api/dto';
import { JwtAuthGuard, PermissionsGuard } from '@infra/api/guards';
import { CustomerServiceRecordPresenter } from '@infra/api/presenters/customer-service-record';
import { ApiResponseBuilder } from '@infra/api/responses/api-response.builder';
import {
  CreateCustomerServiceRecordCommandAdapter,
  DeleteCustomerServiceRecordCommandAdapter,
  UpdateCustomerServiceRecordAssetCommandAdapter,
  UpdateCustomerServiceRecordCustomerCommandAdapter,
  UpdateCustomerServiceRecordDetailsCommandAdapter,
  UpdateCustomerServiceRecordDocumentCommandAdapter,
  UpdateCustomerServiceRecordProviderCommandAdapter,
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
  @Put(':recordId/details')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermission('customer_service_records', 'UPDATE')
  async updateDetails(
    @CurrentUser() user: AuthenticatedUserContextDto,
    @Param('recordId') recordId: string,
    @Body() body: UpdateCustomerServiceRecordDetailsRequestDto,
  ) {
    const result = await this.commandBus.execute(
      UpdateCustomerServiceRecordDetailsCommandAdapter.create(
        body.toDomain(recordId, user.userId),
      ),
    );
    return this.response(this.presenter.toViewResponse(result), HttpStatus.OK);
  }
  @Put(':recordId/customer')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermission('customer_service_records', 'UPDATE')
  async updateCustomer(
    @CurrentUser() user: AuthenticatedUserContextDto,
    @Param('recordId') recordId: string,
    @Body() body: UpdateCustomerServiceRecordCustomerRequestDto,
  ) {
    const result = await this.commandBus.execute(
      UpdateCustomerServiceRecordCustomerCommandAdapter.create(
        body.toDomain(recordId, user.userId),
      ),
    );
    return this.response(this.presenter.toViewResponse(result), HttpStatus.OK);
  }
  @Put(':recordId/provider')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermission('customer_service_records', 'UPDATE')
  async updateProvider(
    @CurrentUser() user: AuthenticatedUserContextDto,
    @Param('recordId') recordId: string,
    @Body() body: UpdateCustomerServiceRecordProviderRequestDto,
  ) {
    const result = await this.commandBus.execute(
      UpdateCustomerServiceRecordProviderCommandAdapter.create(
        body.toDomain(recordId, user.userId),
      ),
    );
    return this.response(this.presenter.toViewResponse(result), HttpStatus.OK);
  }
  @Put(':recordId/assets/:assetId')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermission('customer_service_records', 'UPDATE')
  async updateAsset(
    @CurrentUser() user: AuthenticatedUserContextDto,
    @Param('recordId') recordId: string,
    @Param('assetId') assetId: string,
    @Body() body: UpdateCustomerServiceRecordAssetRequestDto,
  ) {
    const result = await this.commandBus.execute(
      UpdateCustomerServiceRecordAssetCommandAdapter.create(
        body.toDomain(recordId, assetId, user.userId),
      ),
    );
    return this.response(this.presenter.toViewResponse(result), HttpStatus.OK);
  }
  @Put(':recordId/documents/:documentType')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermission('customer_service_records', 'UPDATE')
  async updateDocument(
    @CurrentUser() user: AuthenticatedUserContextDto,
    @Param('recordId') recordId: string,
    @Param('documentType') documentType: string,
    @Body() body: UpdateCustomerServiceRecordDocumentRequestDto,
  ) {
    const result = await this.commandBus.execute(
      UpdateCustomerServiceRecordDocumentCommandAdapter.create(
        body.toDomain(
          recordId,
          documentType as CustomerServiceRecordDocumentType,
          user.userId,
        ),
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
