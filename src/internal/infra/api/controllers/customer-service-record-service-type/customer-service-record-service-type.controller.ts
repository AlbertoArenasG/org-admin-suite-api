import {
  Body,
  Controller,
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

import { CurrentUser, RequirePermission } from '@src/common/decorators';
import { AuthenticatedUserContextDto } from '@application/dto';
import {
  CreateCustomerServiceRecordServiceTypeRequestDto,
  GetCustomerServiceRecordServiceTypesRequestDto,
  UpdateCustomerServiceRecordServiceTypeRequestDto,
} from '@infra/api/dto';
import { JwtAuthGuard, PermissionsGuard } from '@infra/api/guards';
import { CustomerServiceRecordServiceTypePresenter } from '@infra/api/presenters';
import { ApiResponseBuilder } from '@infra/api/responses/api-response.builder';
import {
  CreateCustomerServiceRecordServiceTypeCommandAdapter,
  UpdateCustomerServiceRecordServiceTypeCommandAdapter,
} from '@infra/cqrs/commands';
import {
  GetCustomerServiceRecordServiceTypeOptionsQuery,
  GetCustomerServiceRecordServiceTypesQuery,
} from '@infra/cqrs/queries';
import { SuccessMessageService } from '@infra/i18n/services/success-message.service';

@Controller('v1/customer-service-record-service-types')
export class CustomerServiceRecordServiceTypeController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
    private readonly presenter: CustomerServiceRecordServiceTypePresenter,
    private readonly successMessageService: SuccessMessageService,
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermission('customer_service_records', 'MANAGE_SERVICE_TYPES')
  @HttpCode(HttpStatus.CREATED)
  async create(
    @CurrentUser() currentUser: AuthenticatedUserContextDto,
    @Body() body: CreateCustomerServiceRecordServiceTypeRequestDto,
  ) {
    const result = await this.commandBus.execute(
      CreateCustomerServiceRecordServiceTypeCommandAdapter.create(
        body.toDomain(currentUser.userId),
      ),
    );
    return ApiResponseBuilder.create()
      .withSuccessMessage(this.successMessageService.getMsg('DEFAULT'))
      .withData(this.presenter.toResponse(result))
      .withStatus(HttpStatus.CREATED)
      .build();
  }

  @Get()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermission('customer_service_records', 'MANAGE_SERVICE_TYPES')
  @HttpCode(HttpStatus.OK)
  async findAll(
    @Query() query: GetCustomerServiceRecordServiceTypesRequestDto,
  ) {
    const result = await this.queryBus.execute(
      GetCustomerServiceRecordServiceTypesQuery.create(query.toDomain()),
    );
    return ApiResponseBuilder.create()
      .withSuccessMessage(this.successMessageService.getMsg('DEFAULT'))
      .withData(this.presenter.toCollection(result.items))
      .withPagination(result.page, result.perPage, result.total)
      .withStatus(HttpStatus.OK)
      .build();
  }

  @Get('options')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermission('customer_service_records', 'READ')
  @HttpCode(HttpStatus.OK)
  async getOptions() {
    const result = await this.queryBus.execute(
      GetCustomerServiceRecordServiceTypeOptionsQuery.create(),
    );
    return ApiResponseBuilder.create()
      .withSuccessMessage(this.successMessageService.getMsg('DEFAULT'))
      .withData(this.presenter.toOptionsResponse(result))
      .withStatus(HttpStatus.OK)
      .build();
  }

  @Patch(':serviceTypeId')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermission('customer_service_records', 'MANAGE_SERVICE_TYPES')
  @HttpCode(HttpStatus.OK)
  async update(
    @CurrentUser() currentUser: AuthenticatedUserContextDto,
    @Param('serviceTypeId') serviceTypeId: string,
    @Body() body: UpdateCustomerServiceRecordServiceTypeRequestDto,
  ) {
    const result = await this.commandBus.execute(
      UpdateCustomerServiceRecordServiceTypeCommandAdapter.create(
        body.toDomain(serviceTypeId, currentUser.userId),
      ),
    );
    return ApiResponseBuilder.create()
      .withSuccessMessage(this.successMessageService.getMsg('DEFAULT'))
      .withData(this.presenter.toResponse(result))
      .withStatus(HttpStatus.OK)
      .build();
  }
}
