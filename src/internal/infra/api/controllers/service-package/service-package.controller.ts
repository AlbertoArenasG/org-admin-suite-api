import {
  BadRequestException,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { FileInterceptor } from '@nestjs/platform-express';
import { Multer, memoryStorage } from 'multer';

import { ApiResponseBuilder } from '@infra/api/responses/api-response.builder';
import { IngestServicePackageCommandAdapter } from '@infra/cqrs/commands';
import { ServicePackagePresenter } from '@infra/api/presenters/service-package';
import { SuccessMessageService } from '@infra/i18n/services/success-message.service';

@Controller('v1/service-packages')
export class ServicePackageController {
  constructor(
    private readonly commandBus: CommandBus,
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

    console.log('\n\n\n\n\n\n\n');
    console.log('uploadedFile.originalname =>');
    console.log(uploadedFile.originalname);
    console.log('\n');
    console.log('uploadedFile.buffer =>');
    console.log(uploadedFile.buffer);
    console.log('\n\n\n\n\n\n\n');

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
}
