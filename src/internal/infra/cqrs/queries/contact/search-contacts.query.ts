import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';

import { ContactSearchItemDto, SearchContactsDto } from '@application/dto';
import { SearchContactsUseCase } from '@application/use-cases';
import { BaseQueryHandler } from '@infra/cqrs/base-query.handler';

export class SearchContactsQuery {
  private constructor(public readonly payload: SearchContactsDto) {}

  static create(payload: SearchContactsDto) {
    return new SearchContactsQuery(payload);
  }
}

@QueryHandler(SearchContactsQuery)
export class SearchContactsHandler
  extends BaseQueryHandler<SearchContactsQuery, ContactSearchItemDto[]>
  implements IQueryHandler<SearchContactsQuery>
{
  constructor(private readonly useCase: SearchContactsUseCase) {
    super();
  }

  async execute(query: SearchContactsQuery): Promise<ContactSearchItemDto[]> {
    return this.run(query, () => this.useCase.execute(query.payload));
  }
}
