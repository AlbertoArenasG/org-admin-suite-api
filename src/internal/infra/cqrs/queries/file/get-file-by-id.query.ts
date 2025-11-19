import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';

import { GetFileByIdDto, GetFileByIdResultDto } from '@application/dto';
import { GetFileByIdUseCase } from '@application/use-cases';
import { BaseQueryHandler } from '@infra/cqrs/base-query.handler';

export class GetFileByIdQuery {
  private constructor(public readonly payload: GetFileByIdDto) {}

  static create(payload: GetFileByIdDto) {
    return new GetFileByIdQuery(payload);
  }
}

@QueryHandler(GetFileByIdQuery)
export class GetFileByIdHandler
  extends BaseQueryHandler<GetFileByIdQuery, GetFileByIdResultDto>
  implements IQueryHandler<GetFileByIdQuery>
{
  constructor(private readonly useCase: GetFileByIdUseCase) {
    super();
  }

  async execute(query: GetFileByIdQuery): Promise<GetFileByIdResultDto> {
    return this.run(query, () => this.useCase.execute(query.payload));
  }
}
