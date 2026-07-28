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

import { CurrentUser, RequirePermission } from '@src/common/decorators';
import { ApiResponseBuilder } from '@infra/api/responses/api-response.builder';
import { CreateRoleRequestDto, GetRolesRequestDto } from '@infra/api/dto';
import { JwtAuthGuard, PermissionsGuard } from '@infra/api/guards';
import { RolePresenter } from '@infra/api/presenters';
import { SuccessMessageService } from '@infra/i18n/services/success-message.service';
import { CreateRoleCommandAdapter } from '@infra/cqrs/commands';
import { GetRoleByIdQuery, GetRolesQuery } from '@infra/cqrs/queries';
import { AuthenticatedUserContextDto } from '@application/dto';

@Controller('v1/roles')
export class RoleController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
    private readonly presenter: RolePresenter,
    private readonly successMsgService: SuccessMessageService,
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermission('roles', 'CREATE')
  @HttpCode(HttpStatus.CREATED)
  async create(
    @CurrentUser() currentUser: AuthenticatedUserContextDto,
    @Body() body: CreateRoleRequestDto,
  ) {
    const command = CreateRoleCommandAdapter.create(
      body.toDomain(currentUser.userId),
    );
    const result = await this.commandBus.execute(command);
    const data = this.presenter.toCreateResponse(result);

    return ApiResponseBuilder.create()
      .withSuccessMessage(this.successMsgService.getMsg('DEFAULT'))
      .withData(data)
      .withStatus(HttpStatus.CREATED)
      .build();
  }

  @Get()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermission('roles', 'READ')
  @HttpCode(HttpStatus.OK)
  async findAll(
    @CurrentUser() _currentUser: AuthenticatedUserContextDto,
    @Query() query: GetRolesRequestDto,
  ) {
    const result = await this.queryBus.execute(
      GetRolesQuery.create(query.toDomain()),
    );
    const data = this.presenter.toCollection(result.items);

    return ApiResponseBuilder.create()
      .withSuccessMessage(this.successMsgService.getMsg('DEFAULT'))
      .withData(data)
      .withPagination(result.page, result.perPage, result.total)
      .withStatus(HttpStatus.OK)
      .build();
  }

  @Get(':roleId')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermission('roles', 'READ')
  @HttpCode(HttpStatus.OK)
  async findOne(
    @CurrentUser() _currentUser: AuthenticatedUserContextDto,
    @Param('roleId') roleId: string,
  ) {
    const result = await this.queryBus.execute(GetRoleByIdQuery.create(roleId));
    const data = this.presenter.toViewResponse(result);

    return ApiResponseBuilder.create()
      .withSuccessMessage(this.successMsgService.getMsg('DEFAULT'))
      .withData(data)
      .withStatus(HttpStatus.OK)
      .build();
  }
}
