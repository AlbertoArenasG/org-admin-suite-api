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

import { ApiResponseBuilder } from '@infra/api/responses/api-response.builder';
import { CreateUserRequestDto, GetUsersRequestDto } from '@infra/api/dto/user';
import { UserPresenter } from '@infra/api/presenters/user/user.presenter';
import { CreateUserAndNotifyCommandAdapter } from '@infra/cqrs/commands';
import { GetUserByIdQuery, GetUsersQuery } from '@infra/cqrs/queries';
import { SuccessMessageService } from '@infra/i18n/services/success-message.service';
import { JwtAuthGuard } from '@infra/api/guards';
import { CurrentUser } from '@src/common/decorators';
import { AuthenticatedUserContextDto } from '@application/dto';

@Controller('v1/users')
export class UserController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
    private readonly presenter: UserPresenter,
    private readonly successMsgService: SuccessMessageService,
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard)
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

  @Get()
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async findAll(
    @CurrentUser() currentUser: AuthenticatedUserContextDto,
    @Query() query: GetUsersRequestDto,
  ) {
    const result = await this.queryBus.execute(
      GetUsersQuery.create(query.toDomain(currentUser.isMaster)),
    );

    const data = await this.presenter.toUsersResponse(result.items);

    return ApiResponseBuilder.create()
      .withSuccessMessage(this.successMsgService.getMsg('DEFAULT'))
      .withData(data)
      .withPagination(result.page, result.perPage, result.total)
      .withStatus(HttpStatus.OK)
      .build();
  }

  @Get(':userId')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async findOne(
    @CurrentUser() currentUser: AuthenticatedUserContextDto,
    @Param('userId') userId: string,
  ) {
    const result = await this.queryBus.execute(
      GetUserByIdQuery.create(userId, currentUser.isMaster),
    );
    const data = await this.presenter.toUserResponse(result);

    return ApiResponseBuilder.create()
      .withSuccessMessage(this.successMsgService.getMsg('DEFAULT'))
      .withData(data)
      .withStatus(HttpStatus.OK)
      .build();
  }
}
