import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';

import { DownloadFileDto, DownloadFileResultDto } from '@application/dto';
import { DownloadFileUseCase } from '@application/use-cases';
import { BaseQueryHandler } from '@infra/cqrs/base-query.handler';

export class DownloadFileQuery {
  private constructor(public readonly payload: DownloadFileDto) {}

  static create(payload: DownloadFileDto) {
    return new DownloadFileQuery(payload);
  }
}

@QueryHandler(DownloadFileQuery)
export class DownloadFileHandler
  extends BaseQueryHandler<DownloadFileQuery, DownloadFileResultDto>
  implements IQueryHandler<DownloadFileQuery>
{
  constructor(private readonly useCase: DownloadFileUseCase) {
    super();
  }

  async execute(query: DownloadFileQuery): Promise<DownloadFileResultDto> {
    return this.run(query, () => this.useCase.execute(query.payload));
  }
}
