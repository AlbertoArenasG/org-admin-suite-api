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

import {
  CurrentUser,
  RequireAuxiliaryCapability,
  RequirePermission,
} from '@src/common/decorators';
import { AuthenticatedUserContextDto } from '@application/dto';
import {
  CreateExpirationNotificationPolicyRequestDto,
  GetExpirationNotificationPoliciesRequestDto,
  GetExpirationNotificationPolicyOptionsRequestDto,
  UpdateExpirationNotificationPolicyRequestDto,
} from '@infra/api/dto';
import {
  AuxiliaryCapabilitiesGuard,
  JwtAuthGuard,
  PermissionsGuard,
} from '@infra/api/guards';
import { ExpirationNotificationPolicyPresenter } from '@infra/api/presenters/expiration-notification-policy';
import { ApiResponseBuilder } from '@infra/api/responses/api-response.builder';
import {
  CreateExpirationNotificationPolicyCommandAdapter,
  DeleteExpirationNotificationPolicyCommandAdapter,
  UpdateExpirationNotificationPolicyCommandAdapter,
} from '@infra/cqrs/commands';
import {
  GetExpirationNotificationPoliciesQuery,
  GetExpirationNotificationPolicyByIdQuery,
  GetExpirationNotificationPolicyCatalogQuery,
  GetExpirationNotificationPolicyOptionsQuery,
} from '@infra/cqrs/queries';
import { SuccessMessageService } from '@infra/i18n/services/success-message.service';

@Controller('v1/expiration-notification-policies')
export class ExpirationNotificationPolicyController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
    private readonly presenter: ExpirationNotificationPolicyPresenter,
    private readonly successMsgService: SuccessMessageService,
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermission('expiration_notification_policies', 'CREATE')
  @HttpCode(HttpStatus.CREATED)
  async create(
    @CurrentUser() currentUser: AuthenticatedUserContextDto,
    @Body() body: CreateExpirationNotificationPolicyRequestDto,
  ) {
    const result = await this.commandBus.execute(
      CreateExpirationNotificationPolicyCommandAdapter.create(
        body.toDomain(currentUser.userId),
      ),
    );
    const data = this.presenter.toCreateResponse(result);

    return ApiResponseBuilder.create()
      .withSuccessMessage(this.successMsgService.getMsg('DEFAULT'))
      .withData(data)
      .withStatus(HttpStatus.CREATED)
      .build();
  }

  @Get()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermission('expiration_notification_policies', 'READ')
  @HttpCode(HttpStatus.OK)
  async findAll(@Query() query: GetExpirationNotificationPoliciesRequestDto) {
    const result = await this.queryBus.execute(
      GetExpirationNotificationPoliciesQuery.create(query.toDomain()),
    );
    const data = this.presenter.toCollection(result.items);

    return ApiResponseBuilder.create()
      .withSuccessMessage(this.successMsgService.getMsg('DEFAULT'))
      .withData(data)
      .withPagination(result.page, result.perPage, result.total)
      .withStatus(HttpStatus.OK)
      .build();
  }

  @Get('catalog')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermission('expiration_notification_policies', 'READ')
  @HttpCode(HttpStatus.OK)
  async getCatalog() {
    const result = await this.queryBus.execute(
      GetExpirationNotificationPolicyCatalogQuery.create(),
    );
    const data = this.presenter.toCatalogResponse(result);

    return ApiResponseBuilder.create()
      .withSuccessMessage(this.successMsgService.getMsg('DEFAULT'))
      .withData(data)
      .withStatus(HttpStatus.OK)
      .build();
  }

  @Get('options')
  @UseGuards(JwtAuthGuard, AuxiliaryCapabilitiesGuard)
  @RequireAuxiliaryCapability(
    'expiration_notification_policies',
    'read_options',
  )
  @HttpCode(HttpStatus.OK)
  async getOptions(
    @Query() query: GetExpirationNotificationPolicyOptionsRequestDto,
  ) {
    const result = await this.queryBus.execute(
      GetExpirationNotificationPolicyOptionsQuery.create(query.toDomain()),
    );
    const data = this.presenter.toOptionsResponse(result);

    return ApiResponseBuilder.create()
      .withSuccessMessage(this.successMsgService.getMsg('DEFAULT'))
      .withData(data)
      .withStatus(HttpStatus.OK)
      .build();
  }

  @Get(':expirationNotificationPolicyId')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermission('expiration_notification_policies', 'READ')
  @HttpCode(HttpStatus.OK)
  async findOne(
    @Param('expirationNotificationPolicyId')
    expirationNotificationPolicyId: string,
  ) {
    const result = await this.queryBus.execute(
      GetExpirationNotificationPolicyByIdQuery.create(
        expirationNotificationPolicyId,
      ),
    );
    const data = this.presenter.toViewResponse(result);

    return ApiResponseBuilder.create()
      .withSuccessMessage(this.successMsgService.getMsg('DEFAULT'))
      .withData(data)
      .withStatus(HttpStatus.OK)
      .build();
  }

  @Patch(':expirationNotificationPolicyId')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermission('expiration_notification_policies', 'UPDATE')
  @HttpCode(HttpStatus.OK)
  async update(
    @CurrentUser() currentUser: AuthenticatedUserContextDto,
    @Param('expirationNotificationPolicyId')
    expirationNotificationPolicyId: string,
    @Body() body: UpdateExpirationNotificationPolicyRequestDto,
  ) {
    const result = await this.commandBus.execute(
      UpdateExpirationNotificationPolicyCommandAdapter.create(
        body.toDomain(expirationNotificationPolicyId, currentUser.userId),
      ),
    );
    const data = this.presenter.toUpdateResponse(result);

    return ApiResponseBuilder.create()
      .withSuccessMessage(this.successMsgService.getMsg('DEFAULT'))
      .withData(data)
      .withStatus(HttpStatus.OK)
      .build();
  }

  @Delete(':expirationNotificationPolicyId')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermission('expiration_notification_policies', 'DELETE')
  @HttpCode(HttpStatus.OK)
  async delete(
    @CurrentUser() currentUser: AuthenticatedUserContextDto,
    @Param('expirationNotificationPolicyId')
    expirationNotificationPolicyId: string,
  ) {
    await this.commandBus.execute(
      DeleteExpirationNotificationPolicyCommandAdapter.create({
        actorUserId: currentUser.userId,
        expirationNotificationPolicyId,
      }),
    );

    return ApiResponseBuilder.create()
      .withSuccessMessage(this.successMsgService.getMsg('DEFAULT'))
      .withData(null)
      .withStatus(HttpStatus.OK)
      .build();
  }
}
