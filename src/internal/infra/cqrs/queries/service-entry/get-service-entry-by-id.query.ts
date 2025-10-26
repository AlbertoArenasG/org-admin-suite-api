import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';

import { ServiceEntryViewDto } from '@application/dto';
import { GetServiceEntryByIdUseCase } from '@application/use-cases';
import { BaseQueryHandler } from '@infra/cqrs/base-query.handler';

export class GetServiceEntryByIdQuery {
  private constructor(public readonly serviceEntryId: string) {}

  static create(serviceEntryId: string) {
    return new GetServiceEntryByIdQuery(serviceEntryId);
  }
}

@QueryHandler(GetServiceEntryByIdQuery)
export class GetServiceEntryByIdHandler
  extends BaseQueryHandler<GetServiceEntryByIdQuery, ServiceEntryViewDto>
  implements IQueryHandler<GetServiceEntryByIdQuery>
{
  constructor(private readonly useCase: GetServiceEntryByIdUseCase) {
    super();
  }

  async execute(query: GetServiceEntryByIdQuery): Promise<ServiceEntryViewDto> {
    return this.run(query, () => this.useCase.execute(query.serviceEntryId));
  }
}
