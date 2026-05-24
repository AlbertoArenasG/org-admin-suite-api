import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';

import { ProviderViewDto } from '@application/dto';
import { GetProviderByIdUseCase } from '@application/use-cases';
import { BaseQueryHandler } from '@infra/cqrs/base-query.handler';

export class GetProviderByIdQuery {
  private constructor(public readonly id: string) {}

  static create(id: string) {
    return new GetProviderByIdQuery(id);
  }
}

@QueryHandler(GetProviderByIdQuery)
export class GetProviderByIdHandler
  extends BaseQueryHandler<GetProviderByIdQuery, ProviderViewDto>
  implements IQueryHandler<GetProviderByIdQuery>
{
  constructor(private readonly useCase: GetProviderByIdUseCase) {
    super();
  }

  async execute(query: GetProviderByIdQuery): Promise<ProviderViewDto> {
    return this.run(query, () => this.useCase.execute(query.id));
  }
}
