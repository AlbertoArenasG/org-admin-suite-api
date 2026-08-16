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
import { AuthenticatedUserContextDto } from '@application/dto';
import {
  CreateInternalAssetMaintenanceRecordRequestDto,
  GetInternalAssetMaintenanceRecordsRequestDto,
  UpdateInternalAssetMaintenanceRecordRequestDto,
} from '@infra/api/dto';
import { JwtAuthGuard, PermissionsGuard } from '@infra/api/guards';
import { InternalAssetMaintenanceRecordPresenter } from '@infra/api/presenters/internal-asset-maintenance-record';
import { ApiResponseBuilder } from '@infra/api/responses/api-response.builder';
import {
  CreateInternalAssetMaintenanceRecordCommandAdapter,
  DeleteInternalAssetMaintenanceRecordCommandAdapter,
  SendInternalAssetMaintenanceProviderFollowUpCommandAdapter,
  UpdateInternalAssetMaintenanceRecordCommandAdapter,
} from '@infra/cqrs/commands';
import {
  GetInternalAssetMaintenanceRecordByIdQuery,
  GetInternalAssetMaintenanceRecordCatalogQuery,
  GetInternalAssetMaintenanceRecordsQuery,
} from '@infra/cqrs/queries';
import { SuccessMessageService } from '@infra/i18n/services/success-message.service';

@Controller('v1/internal-asset-maintenance-records')
export class InternalAssetMaintenanceRecordController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
    private readonly presenter: InternalAssetMaintenanceRecordPresenter,
    private readonly successMsgService: SuccessMessageService,
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermission('internal_asset_maintenance_records', 'CREATE')
  @HttpCode(HttpStatus.CREATED)
  async create(
    @CurrentUser() currentUser: AuthenticatedUserContextDto,
    @Body() body: CreateInternalAssetMaintenanceRecordRequestDto,
  ) {
    const result = await this.commandBus.execute(
      CreateInternalAssetMaintenanceRecordCommandAdapter.create(
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
  @RequirePermission('internal_asset_maintenance_records', 'READ')
  @HttpCode(HttpStatus.OK)
  async findAll(@Query() query: GetInternalAssetMaintenanceRecordsRequestDto) {
    const result = await this.queryBus.execute(
      GetInternalAssetMaintenanceRecordsQuery.create(query.toDomain()),
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
  @RequirePermission('internal_asset_maintenance_records', 'READ')
  @HttpCode(HttpStatus.OK)
  async getCatalog() {
    const result = await this.queryBus.execute(
      GetInternalAssetMaintenanceRecordCatalogQuery.create(),
    );
    const data = this.presenter.toCatalogResponse(result);

    return ApiResponseBuilder.create()
      .withSuccessMessage(this.successMsgService.getMsg('DEFAULT'))
      .withData(data)
      .withStatus(HttpStatus.OK)
      .build();
  }

  @Get(':recordId')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermission('internal_asset_maintenance_records', 'READ')
  @HttpCode(HttpStatus.OK)
  async findOne(@Param('recordId') recordId: string) {
    const result = await this.queryBus.execute(
      GetInternalAssetMaintenanceRecordByIdQuery.create(recordId),
    );
    const data = this.presenter.toViewResponse(result);

    return ApiResponseBuilder.create()
      .withSuccessMessage(this.successMsgService.getMsg('DEFAULT'))
      .withData(data)
      .withStatus(HttpStatus.OK)
      .build();
  }

  @Patch(':recordId')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermission('internal_asset_maintenance_records', 'UPDATE')
  @HttpCode(HttpStatus.OK)
  async update(
    @CurrentUser() currentUser: AuthenticatedUserContextDto,
    @Param('recordId') recordId: string,
    @Body() body: UpdateInternalAssetMaintenanceRecordRequestDto,
  ) {
    const result = await this.commandBus.execute(
      UpdateInternalAssetMaintenanceRecordCommandAdapter.create(
        body.toDomain(recordId, currentUser.userId),
      ),
    );
    const data = this.presenter.toUpdateResponse(result);

    return ApiResponseBuilder.create()
      .withSuccessMessage(this.successMsgService.getMsg('DEFAULT'))
      .withData(data)
      .withStatus(HttpStatus.OK)
      .build();
  }

  @Delete(':recordId')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermission('internal_asset_maintenance_records', 'DELETE')
  @HttpCode(HttpStatus.OK)
  async delete(
    @CurrentUser() currentUser: AuthenticatedUserContextDto,
    @Param('recordId') recordId: string,
  ) {
    await this.commandBus.execute(
      DeleteInternalAssetMaintenanceRecordCommandAdapter.create({
        actorUserId: currentUser.userId,
        recordId,
      }),
    );

    return ApiResponseBuilder.create()
      .withSuccessMessage(this.successMsgService.getMsg('DEFAULT'))
      .withData(null)
      .withStatus(HttpStatus.OK)
      .build();
  }

  @Post(':recordId/provider-follow-up/send')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermission('internal_asset_maintenance_records', 'UPDATE')
  @HttpCode(HttpStatus.OK)
  async sendProviderFollowUp(
    @CurrentUser() currentUser: AuthenticatedUserContextDto,
    @Param('recordId') recordId: string,
  ) {
    const result = await this.commandBus.execute(
      SendInternalAssetMaintenanceProviderFollowUpCommandAdapter.create({
        actorUserId: currentUser.userId,
        recordId,
      }),
    );
    const data = this.presenter.toViewResponse(result);

    return ApiResponseBuilder.create()
      .withSuccessMessage(this.successMsgService.getMsg('DEFAULT'))
      .withData(data)
      .withStatus(HttpStatus.OK)
      .build();
  }
}
