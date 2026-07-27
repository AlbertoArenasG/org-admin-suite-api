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
  CreateUserRequestDto,
  GetUsersRequestDto,
  UpdateMyProfileRequestDto,
  UpdateUserRequestDto,
} from '@infra/api/dto/user';
import { UserPresenter, UserRolePresenter } from '@infra/api/presenters/user';
import {
  CreateUserAndNotifyCommandAdapter,
  DeleteUserCommandAdapter,
  UpdateMyProfileCommandAdapter,
  UpdateUserCommandAdapter,
} from '@infra/cqrs/commands';
import {
  GetUserByIdQuery,
  GetUserRolesQuery,
  GetUsersQuery,
} from '@infra/cqrs/queries';
import { SuccessMessageService } from '@infra/i18n/services/success-message.service';
import { JwtAuthGuard, PermissionsGuard } from '@infra/api/guards';
import { AuthenticatedUserContextDto } from '@application/dto';
import { SystemRole } from '@domain/entities';

@Controller('v1/users')
export class UserController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
    private readonly presenter: UserPresenter,
    private readonly rolePresenter: UserRolePresenter,
    private readonly successMsgService: SuccessMessageService,
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermission('users', 'CREATE')
  @HttpCode(HttpStatus.CREATED)
  async create(
    @CurrentUser() currentUser: AuthenticatedUserContextDto,
    @Body() body: CreateUserRequestDto,
  ) {
    const command = CreateUserAndNotifyCommandAdapter.create(
      body.toDomain(),
      currentUser.role,
    );
    const result = await this.commandBus.execute(command);
    const data = await this.presenter.toUserResponse(result);

    return ApiResponseBuilder.create()
      .withSuccessMessage(this.successMsgService.getMsg('USER.CREATED'))
      .withData(data)
      .withStatus(HttpStatus.CREATED)
      .build();
  }

  @Patch('me')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermission('users', 'UPDATE')
  @HttpCode(HttpStatus.OK)
  async updateProfile(
    @CurrentUser() currentUser: AuthenticatedUserContextDto,
    @Body() body: UpdateMyProfileRequestDto,
  ) {
    const command = UpdateMyProfileCommandAdapter.create(
      body.toDomain(currentUser.userId),
    );
    const result = await this.commandBus.execute(command);
    const data = await this.presenter.toUserResponse(result);

    return ApiResponseBuilder.create()
      .withSuccessMessage(this.successMsgService.getMsg('USER.UPDATED'))
      .withData(data)
      .withStatus(HttpStatus.OK)
      .build();
  }

  @Get('me')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermission('users', 'READ')
  @HttpCode(HttpStatus.OK)
  async getProfile(@CurrentUser() currentUser: AuthenticatedUserContextDto) {
    const result = await this.queryBus.execute(
      GetUserByIdQuery.create(currentUser.userId, true),
    );
    const data = await this.presenter.toUserResponse(result);

    return ApiResponseBuilder.create()
      .withSuccessMessage(this.successMsgService.getMsg('DEFAULT'))
      .withData(data)
      .withStatus(HttpStatus.OK)
      .build();
  }

  @Get()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermission('users', 'READ')
  @HttpCode(HttpStatus.OK)
  async findAll(
    @CurrentUser() currentUser: AuthenticatedUserContextDto,
    @Query() query: GetUsersRequestDto,
  ) {
    const result = await this.queryBus.execute(
      GetUsersQuery.create(
        query.toDomain(currentUser.systemRole === SystemRole.MASTER_ADMIN),
      ),
    );

    const data = await this.presenter.toUsersResponse(result.items);

    return ApiResponseBuilder.create()
      .withSuccessMessage(this.successMsgService.getMsg('DEFAULT'))
      .withData(data)
      .withPagination(result.page, result.perPage, result.total)
      .withStatus(HttpStatus.OK)
      .build();
  }

  @Get('roles')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermission('users', 'READ')
  @HttpCode(HttpStatus.OK)
  async roles(@CurrentUser() currentUser: AuthenticatedUserContextDto) {
    const result = await this.queryBus.execute(
      GetUserRolesQuery.create({
        actorRole: currentUser.role,
        actorSystemRole: currentUser.systemRole,
      }),
    );

    const data = this.rolePresenter.toResponse(result);

    return ApiResponseBuilder.create()
      .withSuccessMessage(this.successMsgService.getMsg('DEFAULT'))
      .withData(data)
      .withStatus(HttpStatus.OK)
      .build();
  }

  @Get(':userId')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermission('users', 'READ')
  @HttpCode(HttpStatus.OK)
  async findOne(
    @CurrentUser() currentUser: AuthenticatedUserContextDto,
    @Param('userId') userId: string,
  ) {
    const result = await this.queryBus.execute(
      GetUserByIdQuery.create(
        userId,
        currentUser.systemRole === SystemRole.MASTER_ADMIN,
      ),
    );
    const data = await this.presenter.toUserResponse(result);

    return ApiResponseBuilder.create()
      .withSuccessMessage(this.successMsgService.getMsg('DEFAULT'))
      .withData(data)
      .withStatus(HttpStatus.OK)
      .build();
  }

  @Patch(':userId')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermission('users', 'UPDATE')
  @HttpCode(HttpStatus.OK)
  async update(
    @CurrentUser() currentUser: AuthenticatedUserContextDto,
    @Param('userId') userId: string,
    @Body() body: UpdateUserRequestDto,
  ) {
    const command = UpdateUserCommandAdapter.create(
      body.toDomain(userId, currentUser.role, currentUser.userId),
    );
    const result = await this.commandBus.execute(command);
    const data = await this.presenter.toUserResponse(result);

    return ApiResponseBuilder.create()
      .withSuccessMessage(this.successMsgService.getMsg('USER.UPDATED'))
      .withData(data)
      .withStatus(HttpStatus.OK)
      .build();
  }

  @Delete(':userId')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermission('users', 'DELETE')
  @HttpCode(HttpStatus.OK)
  async delete(
    @CurrentUser() currentUser: AuthenticatedUserContextDto,
    @Param('userId') userId: string,
  ) {
    const command = DeleteUserCommandAdapter.create({
      userId,
      actorRole: currentUser.role,
    });

    await this.commandBus.execute(command);

    return ApiResponseBuilder.create()
      .withSuccessMessage(this.successMsgService.getMsg('USER.DELETED'))
      .withStatus(HttpStatus.OK)
      .build();
  }
}
