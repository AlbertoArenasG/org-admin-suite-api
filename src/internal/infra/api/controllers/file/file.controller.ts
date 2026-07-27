import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
  StreamableFile,
  Res,
  BadRequestException,
  Query,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { Response } from 'express';
import { memoryStorage } from 'multer';

import { CurrentUser, RequirePermission } from '@src/common/decorators';
import { ApiResponseBuilder } from '@infra/api/responses/api-response.builder';
import { FilePresenter } from '@infra/api/presenters/file';
import { UploadFilesCommandAdapter } from '@infra/cqrs/commands';
import { DownloadFileQuery, GetFileByIdQuery } from '@infra/cqrs/queries';
import { SuccessMessageService } from '@infra/i18n/services/success-message.service';
import { JwtAuthGuard, PermissionsGuard } from '@infra/api/guards';
import { AuthenticatedUserContextDto } from '@application/dto';

@Controller('v1/files')
export class FileController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
    private readonly presenter: FilePresenter,
    private readonly successMsgService: SuccessMessageService,
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermission('files', 'CREATE')
  @UseInterceptors(
    FilesInterceptor('files', 10, {
      storage: memoryStorage(),
    }),
  )
  @HttpCode(HttpStatus.CREATED)
  async upload(
    @CurrentUser() currentUser: AuthenticatedUserContextDto,
    @Body() body: Record<string, any>,
    @UploadedFiles()
    files: Array<{
      originalname: string;
      mimetype: string;
      size: number;
      buffer: Buffer;
    }>,
  ) {
    return this.handleUpload(body, files, currentUser?.userId ?? null);
  }

  @Post('public')
  @UseInterceptors(
    FilesInterceptor('files', 10, {
      storage: memoryStorage(),
    }),
  )
  @HttpCode(HttpStatus.CREATED)
  async publicUpload(
    @Body() body: Record<string, any>,
    @UploadedFiles()
    files: Array<{
      originalname: string;
      mimetype: string;
      size: number;
      buffer: Buffer;
    }>,
  ) {
    return this.handleUpload(body, files, null);
  }

  private async handleUpload(
    body: Record<string, any>,
    files: Array<{
      originalname: string;
      mimetype: string;
      size: number;
      buffer: Buffer;
    }>,
    uploadedBy: string | null,
  ) {
    if (!files || files.length === 0) {
      throw new BadRequestException('No files uploaded');
    }

    const metadataList = this.extractMetadata(body, files.length);

    const command = UploadFilesCommandAdapter.create({
      files: files.map((file, index) => ({
        originalName: file.originalname,
        mimeType: file.mimetype,
        size: file.size,
        buffer: file.buffer,
        metadata: metadataList[index] ?? {},
      })),
      uploadedBy,
    });

    const result = await this.commandBus.execute(command);
    const data = this.presenter.toCollection(result.files);

    return ApiResponseBuilder.create()
      .withSuccessMessage(this.successMsgService.getMsg('FILE.UPLOADED'))
      .withData(data)
      .withStatus(HttpStatus.CREATED)
      .build();
  }

  @Get(':fileId')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermission('files', 'READ')
  @HttpCode(HttpStatus.OK)
  async getMetadata(@Param('fileId') fileId: string) {
    const result = await this.queryBus.execute(
      GetFileByIdQuery.create({ fileId }),
    );

    const data = this.presenter.toResponse(result);

    return ApiResponseBuilder.create()
      .withSuccessMessage(this.successMsgService.getMsg('DEFAULT'))
      .withData(data)
      .withStatus(HttpStatus.OK)
      .build();
  }

  @Get(':fileId/download')
  // @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async download(
    @Param('fileId') fileId: string,
    @Query('service_entry_id') serviceEntryId: string | undefined,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.queryBus.execute(
      DownloadFileQuery.create({
        fileId,
        serviceEntryId: serviceEntryId ?? null,
      }),
    );

    res.set({
      'Content-Type': result.mimeType,
      'Content-Length': result.size,
      'Content-Disposition': `attachment; filename="${encodeURIComponent(result.filename)}"`,
    });

    return new StreamableFile(result.stream);
  }

  private extractMetadata(
    body: Record<string, any>,
    length: number,
  ): Record<string, unknown>[] {
    const metadata: Record<string, unknown>[] = Array.from({ length }).map(
      () => ({}),
    );

    if (!body) {
      return metadata;
    }

    const assign = (index: number, value: unknown) => {
      if (Number.isNaN(index) || index < 0 || index >= length) {
        return;
      }

      if (typeof value === 'string') {
        try {
          metadata[index] = JSON.parse(value);
        } catch {
          metadata[index] = {};
        }
      } else if (typeof value === 'object' && value !== null) {
        metadata[index] = value as Record<string, unknown>;
      }
    };

    if (body.metadata !== undefined) {
      const value = body.metadata;

      if (Array.isArray(value)) {
        value.forEach((item, idx) => assign(idx, item));
      } else {
        assign(0, value);
      }
    }

    Object.entries(body).forEach(([key, value]) => {
      const match = key.match(/^metadata\[(\d+)\]$/);
      if (match) {
        assign(Number(match[1]), value);
      }
    });

    return metadata;
  }
}
