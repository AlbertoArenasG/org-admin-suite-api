import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';

import {
  DownloadServicePackageRecordFileDto,
  DownloadServicePackageRecordFileResultDto,
} from '@application/dto';
import { DownloadServicePackageRecordFileUseCase } from '@application/use-cases';
import { BaseQueryHandler } from '@infra/cqrs/base-query.handler';

export class DownloadServicePackageRecordFileQuery {
  private constructor(
    public readonly payload: DownloadServicePackageRecordFileDto,
  ) {}

  static create(payload: DownloadServicePackageRecordFileDto) {
    return new DownloadServicePackageRecordFileQuery(payload);
  }
}

@QueryHandler(DownloadServicePackageRecordFileQuery)
export class DownloadServicePackageRecordFileHandler
  extends BaseQueryHandler<
    DownloadServicePackageRecordFileQuery,
    DownloadServicePackageRecordFileResultDto
  >
  implements IQueryHandler<DownloadServicePackageRecordFileQuery>
{
  constructor(
    private readonly useCase: DownloadServicePackageRecordFileUseCase,
  ) {
    super();
  }

  async execute(
    query: DownloadServicePackageRecordFileQuery,
  ): Promise<DownloadServicePackageRecordFileResultDto> {
    return this.run(query, () => this.useCase.execute(query.payload));
  }
}
