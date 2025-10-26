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
  CreateServiceEntryRequestDto,
  GetServiceEntriesRequestDto,
  UpdateServiceEntryRequestDto,
} from '@infra/api/dto/service-entry';
import {
  ServiceEntryPresenter,
  ServiceEntrySurveyPresenter,
} from '@infra/api/presenters/service-entry';
import {
  CreateServiceEntryCommandAdapter,
  UpdateServiceEntryCommandAdapter,
  DeleteServiceEntryCommandAdapter,
} from '@infra/cqrs/commands';
import {
  GetServiceEntriesQuery,
  GetServiceEntryByIdQuery,
  GetServiceEntrySurveyStatsQuery,
} from '@infra/cqrs/queries';
import { SuccessMessageService } from '@infra/i18n/services/success-message.service';
import { JwtAuthGuard } from '@infra/api/guards';
import { CurrentUser } from '@src/common/decorators';
import { AuthenticatedUserContextDto } from '@application/dto';
import { UserRole } from '@domain/entities';
import { AuthorizationException } from '@domain/exceptions';
import { GetServiceEntrySurveyStatsRequestDto } from '@infra/api/dto/service-entry-survey';

@Controller('v1/services/service-entry')
export class ServiceEntryController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
    private readonly presenter: ServiceEntryPresenter,
    private readonly surveyPresenter: ServiceEntrySurveyPresenter,
    private readonly successMsgService: SuccessMessageService,
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.CREATED)
  async create(
    @CurrentUser() currentUser: AuthenticatedUserContextDto,
    @Body() body: CreateServiceEntryRequestDto,
  ) {
    this.ensureAuthorized(currentUser.role);
    const command = CreateServiceEntryCommandAdapter.create(body.toDomain());
    const result = await this.commandBus.execute(command);
    const data = this.presenter.toCreateResponse(result);

    return ApiResponseBuilder.create()
      .withSuccessMessage(
        this.successMsgService.getMsg('SERVICE_ENTRY.CREATED'),
      )
      .withData(data)
      .withStatus(HttpStatus.CREATED)
      .build();
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async findAll(
    @CurrentUser() currentUser: AuthenticatedUserContextDto,
    @Query() query: GetServiceEntriesRequestDto,
  ) {
    this.ensureAuthorized(currentUser.role);
    const result = await this.queryBus.execute(
      GetServiceEntriesQuery.create(query.toDomain()),
    );
    const data = this.presenter.toCollection(result.items);

    return ApiResponseBuilder.create()
      .withSuccessMessage(this.successMsgService.getMsg('DEFAULT'))
      .withData(data)
      .withPagination(result.page, result.perPage, result.total)
      .withStatus(HttpStatus.OK)
      .build();
  }

  @Get('surveys/stats')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async getSurveyStats(
    @CurrentUser() currentUser: AuthenticatedUserContextDto,
    @Query() query: GetServiceEntrySurveyStatsRequestDto,
  ) {
    this.ensureAuthorized(currentUser.role);
    const result = await this.queryBus.execute(
      GetServiceEntrySurveyStatsQuery.create(query.toDomain()),
    );
    const data = this.surveyPresenter.toSurveyStatsResponse(result);

    return ApiResponseBuilder.create()
      .withSuccessMessage(this.successMsgService.getMsg('DEFAULT'))
      .withData(data)
      .withStatus(HttpStatus.OK)
      .build();
  }

  @Get(':serviceEntryId')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async findOne(
    @CurrentUser() currentUser: AuthenticatedUserContextDto,
    @Param('serviceEntryId') serviceEntryId: string,
  ) {
    this.ensureAuthorized(currentUser.role);
    const result = await this.queryBus.execute(
      GetServiceEntryByIdQuery.create(serviceEntryId),
    );
    const data = this.presenter.toViewResponse(result);

    return ApiResponseBuilder.create()
      .withSuccessMessage(this.successMsgService.getMsg('DEFAULT'))
      .withData(data)
      .withStatus(HttpStatus.OK)
      .build();
  }

  @Patch(':serviceEntryId')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async update(
    @CurrentUser() currentUser: AuthenticatedUserContextDto,
    @Param('serviceEntryId') serviceEntryId: string,
    @Body() body: UpdateServiceEntryRequestDto,
  ) {
    this.ensureAuthorized(currentUser.role);
    const command = UpdateServiceEntryCommandAdapter.create(
      body.toDomain(serviceEntryId),
    );
    const result = await this.commandBus.execute(command);
    const data = this.presenter.toViewResponse(result);

    return ApiResponseBuilder.create()
      .withSuccessMessage(
        this.successMsgService.getMsg('SERVICE_ENTRY.UPDATED'),
      )
      .withData(data)
      .withStatus(HttpStatus.OK)
      .build();
  }

  @Delete(':serviceEntryId')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async delete(
    @CurrentUser() currentUser: AuthenticatedUserContextDto,
    @Param('serviceEntryId') serviceEntryId: string,
  ) {
    this.ensureAuthorized(currentUser.role);
    const command = DeleteServiceEntryCommandAdapter.create(serviceEntryId);
    await this.commandBus.execute(command);

    return ApiResponseBuilder.create()
      .withSuccessMessage(
        this.successMsgService.getMsg('SERVICE_ENTRY.DELETED'),
      )
      .withStatus(HttpStatus.OK)
      .build();
  }

  private ensureAuthorized(role: UserRole): void {
    if (role === UserRole.CUSTOMER) {
      throw AuthorizationException.rolePrivilegesInsufficient(role);
    }
  }
}
