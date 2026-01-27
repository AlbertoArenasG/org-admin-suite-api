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

import { ApiResponseBuilder } from '@infra/api/responses/api-response.builder';
import {
  CreateProviderRequestDto,
  GetProvidersRequestDto,
  UpdateProviderRequestDto,
} from '@infra/api/dto/provider';
import { JwtAuthGuard } from '@infra/api/guards';
import { ProviderPresenter } from '@infra/api/presenters/provider';
import { SuccessMessageService } from '@infra/i18n/services/success-message.service';
import {
  CreateProviderCommandAdapter,
  UpdateProviderCommandAdapter,
  DeleteProviderCommandAdapter,
} from '@infra/cqrs/commands';
import { GetProvidersQuery, GetProviderByIdQuery } from '@infra/cqrs/queries';
import { CurrentUser } from '@src/common/decorators';
import { AuthenticatedUserContextDto } from '@application/dto';
import { AuthorizationException } from '@domain/exceptions';
import { UserRole } from '@domain/entities';

@Controller('v1/providers')
export class ProviderController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
    private readonly presenter: ProviderPresenter,
    private readonly successMsgService: SuccessMessageService,
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.CREATED)
  async create(
    @CurrentUser() currentUser: AuthenticatedUserContextDto,
    @Body() body: CreateProviderRequestDto,
  ) {
    this.ensureAuthorized(currentUser.role);

    const command = CreateProviderCommandAdapter.create(body.toDomain());
    const result = await this.commandBus.execute(command);
    const data = this.presenter.toCreateResponse(result);

    return ApiResponseBuilder.create()
      .withSuccessMessage(this.successMsgService.getMsg('PROVIDER.CREATED'))
      .withData(data)
      .withStatus(HttpStatus.CREATED)
      .build();
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async findAll(
    @CurrentUser() currentUser: AuthenticatedUserContextDto,
    @Query() query: GetProvidersRequestDto,
  ) {
    this.ensureAuthorized(currentUser.role);

    const result = await this.queryBus.execute(
      GetProvidersQuery.create(query.toDomain()),
    );
    const data = this.presenter.toCollection(result.items);

    return ApiResponseBuilder.create()
      .withSuccessMessage(this.successMsgService.getMsg('DEFAULT'))
      .withData(data)
      .withPagination(result.page, result.perPage, result.total)
      .withStatus(HttpStatus.OK)
      .build();
  }

  @Get(':providerId')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async findOne(
    @CurrentUser() currentUser: AuthenticatedUserContextDto,
    @Param('providerId') providerId: string,
  ) {
    this.ensureAuthorized(currentUser.role);

    const result = await this.queryBus.execute(
      GetProviderByIdQuery.create(providerId),
    );
    const data = this.presenter.toViewResponse(result);

    return ApiResponseBuilder.create()
      .withSuccessMessage(this.successMsgService.getMsg('DEFAULT'))
      .withData(data)
      .withStatus(HttpStatus.OK)
      .build();
  }

  @Patch(':providerId')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async update(
    @CurrentUser() currentUser: AuthenticatedUserContextDto,
    @Param('providerId') providerId: string,
    @Body() body: UpdateProviderRequestDto,
  ) {
    this.ensureAuthorized(currentUser.role);

    const command = UpdateProviderCommandAdapter.create(
      body.toDomain(providerId),
    );
    const result = await this.commandBus.execute(command);
    const data = this.presenter.toViewResponse(result);

    return ApiResponseBuilder.create()
      .withSuccessMessage(this.successMsgService.getMsg('PROVIDER.UPDATED'))
      .withData(data)
      .withStatus(HttpStatus.OK)
      .build();
  }

  @Delete(':providerId')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async delete(
    @CurrentUser() currentUser: AuthenticatedUserContextDto,
    @Param('providerId') providerId: string,
  ) {
    this.ensureAuthorized(currentUser.role);

    const command = DeleteProviderCommandAdapter.create(providerId);
    await this.commandBus.execute(command);

    return ApiResponseBuilder.create()
      .withSuccessMessage(this.successMsgService.getMsg('PROVIDER.DELETED'))
      .withStatus(HttpStatus.OK)
      .build();
  }

  private ensureAuthorized(role: UserRole): void {
    const allowedRoles: UserRole[] = [
      UserRole.MASTER_ADMIN,
      UserRole.ADMIN,
      UserRole.STAFF,
    ];

    if (!allowedRoles.includes(role)) {
      throw AuthorizationException.rolePrivilegesInsufficient(role);
    }
  }
}
