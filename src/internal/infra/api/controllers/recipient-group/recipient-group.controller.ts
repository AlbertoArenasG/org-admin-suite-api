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
  CreateRecipientGroupRequestDto,
  GetRecipientGroupOptionsRequestDto,
  GetRecipientGroupsRequestDto,
  UpdateRecipientGroupRequestDto,
} from '@infra/api/dto';
import {
  AuxiliaryCapabilitiesGuard,
  JwtAuthGuard,
  PermissionsGuard,
} from '@infra/api/guards';
import { RecipientGroupPresenter } from '@infra/api/presenters/recipient-group';
import { ApiResponseBuilder } from '@infra/api/responses/api-response.builder';
import {
  CreateRecipientGroupCommandAdapter,
  DeleteRecipientGroupCommandAdapter,
  UpdateRecipientGroupCommandAdapter,
} from '@infra/cqrs/commands';
import {
  GetRecipientGroupByIdQuery,
  GetRecipientGroupsQuery,
  GetRecipientGroupOptionsQuery,
} from '@infra/cqrs/queries';
import { SuccessMessageService } from '@infra/i18n/services/success-message.service';

@Controller('v1/recipient-groups')
export class RecipientGroupController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
    private readonly presenter: RecipientGroupPresenter,
    private readonly successMsgService: SuccessMessageService,
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermission('recipient_groups', 'CREATE')
  @HttpCode(HttpStatus.CREATED)
  async create(
    @CurrentUser() currentUser: AuthenticatedUserContextDto,
    @Body() body: CreateRecipientGroupRequestDto,
  ) {
    const command = CreateRecipientGroupCommandAdapter.create(
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

  @Get('options')
  @UseGuards(JwtAuthGuard, AuxiliaryCapabilitiesGuard)
  @RequireAuxiliaryCapability('recipient_groups', 'read_options')
  @HttpCode(HttpStatus.OK)
  async getOptions(@Query() query: GetRecipientGroupOptionsRequestDto) {
    const result = await this.queryBus.execute(
      GetRecipientGroupOptionsQuery.create(query.toDomain()),
    );
    return ApiResponseBuilder.create()
      .withSuccessMessage(this.successMsgService.getMsg('DEFAULT'))
      .withData(this.presenter.toOptionsResponse(result))
      .withStatus(HttpStatus.OK)
      .build();
  }

  @Get()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermission('recipient_groups', 'READ')
  @HttpCode(HttpStatus.OK)
  async findAll(@Query() query: GetRecipientGroupsRequestDto) {
    const result = await this.queryBus.execute(
      GetRecipientGroupsQuery.create(query.toDomain()),
    );
    const data = this.presenter.toCollection(result.items);

    return ApiResponseBuilder.create()
      .withSuccessMessage(this.successMsgService.getMsg('DEFAULT'))
      .withData(data)
      .withPagination(result.page, result.perPage, result.total)
      .withStatus(HttpStatus.OK)
      .build();
  }

  @Get(':recipientGroupId')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermission('recipient_groups', 'READ')
  @HttpCode(HttpStatus.OK)
  async findOne(@Param('recipientGroupId') recipientGroupId: string) {
    const result = await this.queryBus.execute(
      GetRecipientGroupByIdQuery.create(recipientGroupId),
    );
    const data = this.presenter.toViewResponse(result);

    return ApiResponseBuilder.create()
      .withSuccessMessage(this.successMsgService.getMsg('DEFAULT'))
      .withData(data)
      .withStatus(HttpStatus.OK)
      .build();
  }

  @Patch(':recipientGroupId')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermission('recipient_groups', 'UPDATE')
  @HttpCode(HttpStatus.OK)
  async update(
    @CurrentUser() currentUser: AuthenticatedUserContextDto,
    @Param('recipientGroupId') recipientGroupId: string,
    @Body() body: UpdateRecipientGroupRequestDto,
  ) {
    const command = UpdateRecipientGroupCommandAdapter.create(
      body.toDomain(recipientGroupId, currentUser.userId),
    );
    const result = await this.commandBus.execute(command);
    const data = this.presenter.toUpdateResponse(result);

    return ApiResponseBuilder.create()
      .withSuccessMessage(this.successMsgService.getMsg('DEFAULT'))
      .withData(data)
      .withStatus(HttpStatus.OK)
      .build();
  }

  @Delete(':recipientGroupId')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermission('recipient_groups', 'DELETE')
  @HttpCode(HttpStatus.OK)
  async delete(
    @CurrentUser() currentUser: AuthenticatedUserContextDto,
    @Param('recipientGroupId') recipientGroupId: string,
  ) {
    await this.commandBus.execute(
      DeleteRecipientGroupCommandAdapter.create({
        actorUserId: currentUser.userId,
        recipientGroupId,
      }),
    );

    return ApiResponseBuilder.create()
      .withSuccessMessage(this.successMsgService.getMsg('DEFAULT'))
      .withData(null)
      .withStatus(HttpStatus.OK)
      .build();
  }
}
