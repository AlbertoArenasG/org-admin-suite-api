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
  CreateExpirationStatusPolicyRequestDto,
  GetExpirationStatusPoliciesRequestDto,
  GetExpirationStatusPolicyOptionsRequestDto,
  UpdateExpirationStatusPolicyRequestDto,
} from '@infra/api/dto';
import {
  AuxiliaryCapabilitiesGuard,
  JwtAuthGuard,
  PermissionsGuard,
} from '@infra/api/guards';
import { ExpirationStatusPolicyPresenter } from '@infra/api/presenters/expiration-status-policy';
import { ApiResponseBuilder } from '@infra/api/responses/api-response.builder';
import {
  CreateExpirationStatusPolicyCommandAdapter,
  DeleteExpirationStatusPolicyCommandAdapter,
  UpdateExpirationStatusPolicyCommandAdapter,
} from '@infra/cqrs/commands';
import {
  GetExpirationStatusPoliciesQuery,
  GetExpirationStatusPolicyByIdQuery,
  GetExpirationStatusPolicyCatalogQuery,
  GetExpirationStatusPolicyOptionsQuery,
} from '@infra/cqrs/queries';
import { SuccessMessageService } from '@infra/i18n/services/success-message.service';

@Controller('v1/expiration-status-policies')
export class ExpirationStatusPolicyController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
    private readonly presenter: ExpirationStatusPolicyPresenter,
    private readonly successMsgService: SuccessMessageService,
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermission('expiration_status_policies', 'CREATE')
  @HttpCode(HttpStatus.CREATED)
  async create(
    @CurrentUser() currentUser: AuthenticatedUserContextDto,
    @Body() body: CreateExpirationStatusPolicyRequestDto,
  ) {
    const result = await this.commandBus.execute(
      CreateExpirationStatusPolicyCommandAdapter.create(
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
  @RequirePermission('expiration_status_policies', 'READ')
  @HttpCode(HttpStatus.OK)
  async findAll(@Query() query: GetExpirationStatusPoliciesRequestDto) {
    const result = await this.queryBus.execute(
      GetExpirationStatusPoliciesQuery.create(query.toDomain()),
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
  @RequirePermission('expiration_status_policies', 'READ')
  @HttpCode(HttpStatus.OK)
  async getCatalog() {
    const result = await this.queryBus.execute(
      GetExpirationStatusPolicyCatalogQuery.create(),
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
  @RequireAuxiliaryCapability('expiration_status_policies', 'read_options')
  @HttpCode(HttpStatus.OK)
  async getOptions(@Query() query: GetExpirationStatusPolicyOptionsRequestDto) {
    const result = await this.queryBus.execute(
      GetExpirationStatusPolicyOptionsQuery.create(query.toDomain()),
    );
    const data = this.presenter.toOptionsResponse(result);

    return ApiResponseBuilder.create()
      .withSuccessMessage(this.successMsgService.getMsg('DEFAULT'))
      .withData(data)
      .withStatus(HttpStatus.OK)
      .build();
  }

  @Get(':expirationStatusPolicyId')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermission('expiration_status_policies', 'READ')
  @HttpCode(HttpStatus.OK)
  async findOne(
    @Param('expirationStatusPolicyId') expirationStatusPolicyId: string,
  ) {
    const result = await this.queryBus.execute(
      GetExpirationStatusPolicyByIdQuery.create(expirationStatusPolicyId),
    );
    const data = this.presenter.toViewResponse(result);

    return ApiResponseBuilder.create()
      .withSuccessMessage(this.successMsgService.getMsg('DEFAULT'))
      .withData(data)
      .withStatus(HttpStatus.OK)
      .build();
  }

  @Patch(':expirationStatusPolicyId')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermission('expiration_status_policies', 'UPDATE')
  @HttpCode(HttpStatus.OK)
  async update(
    @CurrentUser() currentUser: AuthenticatedUserContextDto,
    @Param('expirationStatusPolicyId') expirationStatusPolicyId: string,
    @Body() body: UpdateExpirationStatusPolicyRequestDto,
  ) {
    const result = await this.commandBus.execute(
      UpdateExpirationStatusPolicyCommandAdapter.create(
        body.toDomain(expirationStatusPolicyId, currentUser.userId),
      ),
    );
    const data = this.presenter.toUpdateResponse(result);

    return ApiResponseBuilder.create()
      .withSuccessMessage(this.successMsgService.getMsg('DEFAULT'))
      .withData(data)
      .withStatus(HttpStatus.OK)
      .build();
  }

  @Delete(':expirationStatusPolicyId')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermission('expiration_status_policies', 'DELETE')
  @HttpCode(HttpStatus.OK)
  async delete(
    @CurrentUser() currentUser: AuthenticatedUserContextDto,
    @Param('expirationStatusPolicyId') expirationStatusPolicyId: string,
  ) {
    await this.commandBus.execute(
      DeleteExpirationStatusPolicyCommandAdapter.create({
        actorUserId: currentUser.userId,
        expirationStatusPolicyId,
      }),
    );

    return ApiResponseBuilder.create()
      .withSuccessMessage(this.successMsgService.getMsg('DEFAULT'))
      .withData(null)
      .withStatus(HttpStatus.OK)
      .build();
  }
}
