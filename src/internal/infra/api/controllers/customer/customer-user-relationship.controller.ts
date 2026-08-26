import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';

import { RequirePermission } from '@src/common/decorators';
import {
  AssociateCustomerUserRequestDto,
  GetCustomerRelatedUsersRequestDto,
} from '@infra/api/dto/customer';
import { JwtAuthGuard, PermissionsGuard } from '@infra/api/guards';
import { UserLookupPresenter, UserPresenter } from '@infra/api/presenters/user';
import { ApiResponseBuilder } from '@infra/api/responses/api-response.builder';
import {
  AssociateCustomerUserCommandAdapter,
  DisassociateCustomerUserCommandAdapter,
} from '@infra/cqrs/commands';
import {
  GetCustomerAvailableUsersQuery,
  GetCustomerRelatedUsersQuery,
} from '@infra/cqrs/queries';
import { SuccessMessageService } from '@infra/i18n/services/success-message.service';

@Controller('v1/customers')
export class CustomerUserRelationshipController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
    private readonly userPresenter: UserPresenter,
    private readonly userLookupPresenter: UserLookupPresenter,
    private readonly successMessageService: SuccessMessageService,
  ) {}

  @Get(':customerId/users')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermission('customers', 'READ')
  @HttpCode(HttpStatus.OK)
  async getRelatedUsers(
    @Param('customerId') customerId: string,
    @Query() query: GetCustomerRelatedUsersRequestDto,
  ) {
    const result = await this.queryBus.execute(
      GetCustomerRelatedUsersQuery.create(query.toDomain(customerId)),
    );
    const data = await this.userPresenter.toUsersResponse(result.items);

    return ApiResponseBuilder.create()
      .withSuccessMessage(this.successMessageService.getMsg('DEFAULT'))
      .withData(data)
      .withPagination(result.page, result.perPage, result.total)
      .withStatus(HttpStatus.OK)
      .build();
  }

  @Get(':customerId/available-users')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermission('customers', 'UPDATE')
  @HttpCode(HttpStatus.OK)
  async getAvailableUsers(@Param('customerId') customerId: string) {
    const result = await this.queryBus.execute(
      GetCustomerAvailableUsersQuery.create(customerId),
    );
    const data = this.userLookupPresenter.toCollectionResponse(result);

    return ApiResponseBuilder.create()
      .withSuccessMessage(this.successMessageService.getMsg('DEFAULT'))
      .withData(data)
      .withStatus(HttpStatus.OK)
      .build();
  }

  @Post(':customerId/users')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermission('customers', 'UPDATE')
  @HttpCode(HttpStatus.CREATED)
  async associateUser(
    @Param('customerId') customerId: string,
    @Body() body: AssociateCustomerUserRequestDto,
  ) {
    const result = await this.commandBus.execute(
      AssociateCustomerUserCommandAdapter.create(body.toDomain(customerId)),
    );
    const data = await this.userPresenter.toUserResponse(result);

    return ApiResponseBuilder.create()
      .withSuccessMessage(
        this.successMessageService.getMsg('CUSTOMER.USER_ASSOCIATED'),
      )
      .withData(data)
      .withStatus(HttpStatus.CREATED)
      .build();
  }

  @Delete(':customerId/users/:userId')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermission('customers', 'UPDATE')
  @HttpCode(HttpStatus.NO_CONTENT)
  async disassociateUser(
    @Param('customerId') customerId: string,
    @Param('userId') userId: string,
  ) {
    await this.commandBus.execute(
      DisassociateCustomerUserCommandAdapter.create({ customerId, userId }),
    );
  }
}
