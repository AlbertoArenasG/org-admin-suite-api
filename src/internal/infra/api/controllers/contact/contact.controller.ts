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
  CreateContactRequestDto,
  GetContactsRequestDto,
  SearchContactsRequestDto,
  UpdateContactRequestDto,
} from '@infra/api/dto';
import {
  AuxiliaryCapabilitiesGuard,
  JwtAuthGuard,
  PermissionsGuard,
} from '@infra/api/guards';
import { ContactPresenter } from '@infra/api/presenters/contact';
import { ApiResponseBuilder } from '@infra/api/responses/api-response.builder';
import {
  CreateContactCommandAdapter,
  DeleteContactCommandAdapter,
  UpdateContactCommandAdapter,
} from '@infra/cqrs/commands';
import {
  GetContactByIdQuery,
  GetContactsQuery,
  SearchContactsQuery,
} from '@infra/cqrs/queries';
import { SuccessMessageService } from '@infra/i18n/services/success-message.service';

@Controller('v1/contacts')
export class ContactController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
    private readonly presenter: ContactPresenter,
    private readonly successMsgService: SuccessMessageService,
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermission('contacts', 'CREATE')
  @HttpCode(HttpStatus.CREATED)
  async create(
    @CurrentUser() currentUser: AuthenticatedUserContextDto,
    @Body() body: CreateContactRequestDto,
  ) {
    const command = CreateContactCommandAdapter.create(
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
  @RequirePermission('contacts', 'READ')
  @HttpCode(HttpStatus.OK)
  async findAll(@Query() query: GetContactsRequestDto) {
    const result = await this.queryBus.execute(
      GetContactsQuery.create(query.toDomain()),
    );
    const data = this.presenter.toCollection(result.items);

    return ApiResponseBuilder.create()
      .withSuccessMessage(this.successMsgService.getMsg('DEFAULT'))
      .withData(data)
      .withPagination(result.page, result.perPage, result.total)
      .withStatus(HttpStatus.OK)
      .build();
  }

  @Get('search')
  @UseGuards(JwtAuthGuard, AuxiliaryCapabilitiesGuard)
  @RequireAuxiliaryCapability('contacts', 'search')
  @HttpCode(HttpStatus.OK)
  async search(@Query() query: SearchContactsRequestDto) {
    const result = await this.queryBus.execute(
      SearchContactsQuery.create(query.toDomain()),
    );
    const data = this.presenter.toSearchCollection(result);

    return ApiResponseBuilder.create()
      .withSuccessMessage(this.successMsgService.getMsg('DEFAULT'))
      .withData(data)
      .withStatus(HttpStatus.OK)
      .build();
  }

  @Get(':contactId')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermission('contacts', 'READ')
  @HttpCode(HttpStatus.OK)
  async findOne(@Param('contactId') contactId: string) {
    const result = await this.queryBus.execute(
      GetContactByIdQuery.create(contactId),
    );
    const data = this.presenter.toViewResponse(result);

    return ApiResponseBuilder.create()
      .withSuccessMessage(this.successMsgService.getMsg('DEFAULT'))
      .withData(data)
      .withStatus(HttpStatus.OK)
      .build();
  }

  @Patch(':contactId')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermission('contacts', 'UPDATE')
  @HttpCode(HttpStatus.OK)
  async update(
    @CurrentUser() currentUser: AuthenticatedUserContextDto,
    @Param('contactId') contactId: string,
    @Body() body: UpdateContactRequestDto,
  ) {
    const command = UpdateContactCommandAdapter.create(
      body.toDomain(contactId, currentUser.userId),
    );
    const result = await this.commandBus.execute(command);
    const data = this.presenter.toUpdateResponse(result);

    return ApiResponseBuilder.create()
      .withSuccessMessage(this.successMsgService.getMsg('DEFAULT'))
      .withData(data)
      .withStatus(HttpStatus.OK)
      .build();
  }

  @Delete(':contactId')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermission('contacts', 'DELETE')
  @HttpCode(HttpStatus.OK)
  async delete(
    @CurrentUser() currentUser: AuthenticatedUserContextDto,
    @Param('contactId') contactId: string,
  ) {
    await this.commandBus.execute(
      DeleteContactCommandAdapter.create({
        actorUserId: currentUser.userId,
        contactId,
      }),
    );

    return ApiResponseBuilder.create()
      .withSuccessMessage(this.successMsgService.getMsg('DEFAULT'))
      .withData(null)
      .withStatus(HttpStatus.OK)
      .build();
  }
}
