import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Patch,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';

import { CurrentUser, RequirePermission } from '@src/common/decorators';
import { ApiResponseBuilder } from '@infra/api/responses/api-response.builder';
import {
  ChangeRoleStatusRequestDto,
  CreateRoleRequestDto,
  GetRolesRequestDto,
  UpdateRoleRequestDto,
} from '@infra/api/dto';
import { JwtAuthGuard, PermissionsGuard } from '@infra/api/guards';
import { RolePresenter } from '@infra/api/presenters';
import { SuccessMessageService } from '@infra/i18n/services/success-message.service';
import {
  ChangeRoleStatusCommandAdapter,
  CreateRoleCommandAdapter,
  DeleteRoleCommandAdapter,
  UpdateRoleCommandAdapter,
} from '@infra/cqrs/commands';
import {
  GetPermissionModulesQuery,
  GetPermissionOperationsQuery,
  GetRoleByIdQuery,
  GetRolesQuery,
} from '@infra/cqrs/queries';
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

  @Get('modules')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermission('roles', 'READ')
  @HttpCode(HttpStatus.OK)
  async getModules() {
    const result = await this.queryBus.execute(
      GetPermissionModulesQuery.create(),
    );
    const data = this.presenter.toPermissionModulesResponse(result);

    return ApiResponseBuilder.create()
      .withSuccessMessage(this.successMsgService.getMsg('DEFAULT'))
      .withData(data)
      .withStatus(HttpStatus.OK)
      .build();
  }

  @Get('operations')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermission('roles', 'READ')
  @HttpCode(HttpStatus.OK)
  async getOperations() {
    const result = await this.queryBus.execute(
      GetPermissionOperationsQuery.create(),
    );
    const data = this.presenter.toPermissionOperationsResponse(result);

    return ApiResponseBuilder.create()
      .withSuccessMessage(this.successMsgService.getMsg('DEFAULT'))
      .withData(data)
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

  @Patch(':roleId')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermission('roles', 'UPDATE')
  @HttpCode(HttpStatus.OK)
  async update(
    @CurrentUser() currentUser: AuthenticatedUserContextDto,
    @Param('roleId') roleId: string,
    @Body() body: UpdateRoleRequestDto,
  ) {
    const command = UpdateRoleCommandAdapter.create(
      body.toDomain(roleId, currentUser.userId),
    );
    const result = await this.commandBus.execute(command);
    const data = this.presenter.toUpdateResponse(result);

    return ApiResponseBuilder.create()
      .withSuccessMessage(this.successMsgService.getMsg('DEFAULT'))
      .withData(data)
      .withStatus(HttpStatus.OK)
      .build();
  }

  @Patch(':roleId/status')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermission('roles', 'UPDATE')
  @HttpCode(HttpStatus.OK)
  async changeStatus(
    @CurrentUser() currentUser: AuthenticatedUserContextDto,
    @Param('roleId') roleId: string,
    @Body() body: ChangeRoleStatusRequestDto,
  ) {
    const command = ChangeRoleStatusCommandAdapter.create(
      body.toDomain(roleId, currentUser.userId),
    );
    const result = await this.commandBus.execute(command);
    const data = this.presenter.toStatusResponse(result);

    return ApiResponseBuilder.create()
      .withSuccessMessage(this.successMsgService.getMsg('DEFAULT'))
      .withData(data)
      .withStatus(HttpStatus.OK)
      .build();
  }

  @Delete(':roleId')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermission('roles', 'DELETE')
  @HttpCode(HttpStatus.OK)
  async delete(
    @CurrentUser() currentUser: AuthenticatedUserContextDto,
    @Param('roleId') roleId: string,
  ) {
    await this.commandBus.execute(
      DeleteRoleCommandAdapter.create({
        roleId,
        actorUserId: currentUser.userId,
      }),
    );

    return ApiResponseBuilder.create()
      .withSuccessMessage(this.successMsgService.getMsg('DEFAULT'))
      .withData(null)
      .withStatus(HttpStatus.OK)
      .build();
  }
}
