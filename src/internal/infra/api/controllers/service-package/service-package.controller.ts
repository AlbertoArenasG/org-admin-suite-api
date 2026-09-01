import {
  BadRequestException,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { FileInterceptor } from '@nestjs/platform-express';
import { Multer, memoryStorage } from 'multer';

import { RequirePermission } from '@src/common/decorators';
import { ApiResponseBuilder } from '@infra/api/responses/api-response.builder';
import {
  DeleteServicePackageRecordCommandAdapter,
  IngestServicePackageCommandAdapter,
} from '@infra/cqrs/commands';
import { ServicePackagePresenter } from '@infra/api/presenters/service-package';
import { SuccessMessageService } from '@infra/i18n/services/success-message.service';
import {
  GetServicePackageRecordsQuery,
  GetServicePackageRecordByIdQuery,
  GetServicePackageRecordServiceTypeOptionsQuery,
} from '@infra/cqrs/queries';
import { GetServicePackageRecordsRequestDto } from '@infra/api/dto';
import { JwtAuthGuard, PermissionsGuard } from '@infra/api/guards';

@Controller('v1/service-packages')
export class ServicePackageController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
    private readonly presenter: ServicePackagePresenter,
    private readonly successMsgService: SuccessMessageService,
  ) {}

  @Post('uploads')
  @UseInterceptors(
    FileInterceptor('package', {
      storage: memoryStorage(),
    }),
  )
  @HttpCode(HttpStatus.CREATED)
  async ingest(@UploadedFile() uploadedFile?: Multer.File) {
    if (!uploadedFile) {
      throw new BadRequestException('No package file uploaded');
    }

    const command = IngestServicePackageCommandAdapter.create({
      filename: uploadedFile.originalname ?? null,
      buffer: uploadedFile.buffer,
    });

    const result = await this.commandBus.execute(command);
    const data = this.presenter.toIngestResponse(result);

    return ApiResponseBuilder.create()
      .withSuccessMessage(
        this.successMsgService.getMsg('SERVICE_PACKAGE.UPLOADED'),
      )
      .withData(data)
      .withStatus(HttpStatus.CREATED)
      .build();
  }

  @Get('records')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermission('service_packages', 'READ')
  @HttpCode(HttpStatus.OK)
  async findAll(@Query() query: GetServicePackageRecordsRequestDto) {
    const result = await this.queryBus.execute(
      GetServicePackageRecordsQuery.create(query.toDomain()),
    );
    const data = this.presenter.toCollection(result);

    return ApiResponseBuilder.create()
      .withSuccessMessage(this.successMsgService.getMsg('DEFAULT'))
      .withData(data)
      .withPagination(result.page, result.perPage, result.total)
      .withStatus(HttpStatus.OK)
      .build();
  }

  @Get('records/options')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermission('service_packages', 'READ')
  @HttpCode(HttpStatus.OK)
  async getRecordOptions() {
    const data = await this.queryBus.execute(
      GetServicePackageRecordServiceTypeOptionsQuery.create(),
    );

    return ApiResponseBuilder.create()
      .withSuccessMessage(this.successMsgService.getMsg('DEFAULT'))
      .withData({ service_types: data })
      .withStatus(HttpStatus.OK)
      .build();
  }

  @Get('records/:recordId')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermission('service_packages', 'READ')
  @HttpCode(HttpStatus.OK)
  async findOne(@Param('recordId') recordId: string) {
    const result = await this.queryBus.execute(
      GetServicePackageRecordByIdQuery.create(recordId),
    );
    const data = this.presenter.toViewResponse(result);

    return ApiResponseBuilder.create()
      .withSuccessMessage(this.successMsgService.getMsg('DEFAULT'))
      .withData(data)
      .withStatus(HttpStatus.OK)
      .build();
  }

  @Delete('records/:recordId')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermission('service_packages', 'DELETE')
  @HttpCode(HttpStatus.OK)
  async delete(@Param('recordId') recordId: string) {
    const command = DeleteServicePackageRecordCommandAdapter.create({
      recordId,
    });
    const result = await this.commandBus.execute(command);
    const data = this.presenter.toViewResponse(result);

    return ApiResponseBuilder.create()
      .withSuccessMessage(
        this.successMsgService.getMsg('SERVICE_PACKAGE.DELETED'),
      )
      .withData(data)
      .withStatus(HttpStatus.OK)
      .build();
  }
}
