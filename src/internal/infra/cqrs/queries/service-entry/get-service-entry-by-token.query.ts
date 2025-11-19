import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';

import { ServiceEntryViewDto } from '@application/dto';
import { GetServiceEntryByTokenUseCase } from '@application/use-cases';
import { BaseQueryHandler } from '@infra/cqrs/base-query.handler';

export class GetServiceEntryByTokenQuery {
  private constructor(public readonly token: string) {}

  static create(token: string) {
    return new GetServiceEntryByTokenQuery(token);
  }
}

@QueryHandler(GetServiceEntryByTokenQuery)
export class GetServiceEntryByTokenHandler
  extends BaseQueryHandler<GetServiceEntryByTokenQuery, ServiceEntryViewDto>
  implements IQueryHandler<GetServiceEntryByTokenQuery>
{
  constructor(private readonly useCase: GetServiceEntryByTokenUseCase) {
    super();
  }

  async execute(
    query: GetServiceEntryByTokenQuery,
  ): Promise<ServiceEntryViewDto> {
    return this.run(query, () => this.useCase.execute(query.token));
  }
}
