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

import { CurrentUser, RequirePermission } from '@src/common/decorators';
import { ApiResponseBuilder } from '@infra/api/responses/api-response.builder';
import {
  CreateCustomerFiscalProfileRequestDto,
  GetCustomerFiscalProfilesRequestDto,
  UpdateCustomerRequestDto,
} from '@infra/api/dto/customer-fiscal-profile';
import { JwtAuthGuard, PermissionsGuard } from '@infra/api/guards';
import { CustomerFiscalProfilePresenter } from '@infra/api/presenters/customer-fiscal-profile';
import { SuccessMessageService } from '@infra/i18n/services/success-message.service';
import {
  CreateCustomerFiscalProfileCommandAdapter,
  UpdateCustomerCommandAdapter,
  DeleteCustomerCommandAdapter,
} from '@infra/cqrs/commands';
import {
  GetCustomerFiscalProfilesQuery,
  GetCustomerFiscalProfileByIdQuery,
} from '@infra/cqrs/queries';
import { AuthenticatedUserContextDto } from '@application/dto';

@Controller('v1/customers')
export class CustomerController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
    private readonly presenter: CustomerFiscalProfilePresenter,
    private readonly successMsgService: SuccessMessageService,
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermission('customers', 'CREATE')
  @HttpCode(HttpStatus.CREATED)
  async create(
    @CurrentUser() currentUser: AuthenticatedUserContextDto,
    @Body() body: CreateCustomerFiscalProfileRequestDto,
  ) {
    const command = CreateCustomerFiscalProfileCommandAdapter.create(
      body.toDomain(currentUser.userId),
    );
    const result = await this.commandBus.execute(command);
    const data = this.presenter.toCreateResponse(result);

    return ApiResponseBuilder.create()
      .withSuccessMessage(this.successMsgService.getMsg('CUSTOMER.CREATED'))
      .withData(data)
      .withStatus(HttpStatus.CREATED)
      .build();
  }

  @Get()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermission('customers', 'READ')
  @HttpCode(HttpStatus.OK)
  async findAll(
    @CurrentUser() _currentUser: AuthenticatedUserContextDto,
    @Query() query: GetCustomerFiscalProfilesRequestDto,
  ) {
    const result = await this.queryBus.execute(
      GetCustomerFiscalProfilesQuery.create(query.toDomain()),
    );
    const data = this.presenter.toCollection(result.items);

    return ApiResponseBuilder.create()
      .withSuccessMessage(this.successMsgService.getMsg('DEFAULT'))
      .withData(data)
      .withPagination(result.page, result.perPage, result.total)
      .withStatus(HttpStatus.OK)
      .build();
  }

  @Get(':customerId')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermission('customers', 'READ')
  @HttpCode(HttpStatus.OK)
  async findOne(
    @CurrentUser() _currentUser: AuthenticatedUserContextDto,
    @Param('customerId') customerId: string,
  ) {
    const result = await this.queryBus.execute(
      GetCustomerFiscalProfileByIdQuery.create(customerId),
    );
    const data = this.presenter.toViewResponse(result);

    return ApiResponseBuilder.create()
      .withSuccessMessage(this.successMsgService.getMsg('DEFAULT'))
      .withData(data)
      .withStatus(HttpStatus.OK)
      .build();
  }

  @Patch(':customerId')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermission('customers', 'UPDATE')
  @HttpCode(HttpStatus.OK)
  async update(
    @CurrentUser() currentUser: AuthenticatedUserContextDto,
    @Param('customerId') customerId: string,
    @Body() body: UpdateCustomerRequestDto,
  ) {
    const command = UpdateCustomerCommandAdapter.create(
      body.toDomain(customerId, currentUser.userId),
    );
    const result = await this.commandBus.execute(command);
    const data = this.presenter.toViewResponse(result);

    return ApiResponseBuilder.create()
      .withSuccessMessage(this.successMsgService.getMsg('CUSTOMER.UPDATED'))
      .withData(data)
      .withStatus(HttpStatus.OK)
      .build();
  }

  @Delete(':customerId')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermission('customers', 'DELETE')
  @HttpCode(HttpStatus.OK)
  async delete(
    @CurrentUser() _currentUser: AuthenticatedUserContextDto,
    @Param('customerId') customerId: string,
  ) {
    const command = DeleteCustomerCommandAdapter.create(customerId);
    await this.commandBus.execute(command);

    return ApiResponseBuilder.create()
      .withSuccessMessage(this.successMsgService.getMsg('CUSTOMER.DELETED'))
      .withStatus(HttpStatus.OK)
      .build();
  }
}
