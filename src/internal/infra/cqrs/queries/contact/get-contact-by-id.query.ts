import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';

import { ContactViewDto } from '@application/dto';
import { GetContactByIdUseCase } from '@application/use-cases';
import { BaseQueryHandler } from '@infra/cqrs/base-query.handler';

export class GetContactByIdQuery {
  private constructor(public readonly payload: string) {}

  static create(contactId: string) {
    return new GetContactByIdQuery(contactId);
  }
}

@QueryHandler(GetContactByIdQuery)
export class GetContactByIdHandler
  extends BaseQueryHandler<GetContactByIdQuery, ContactViewDto>
  implements IQueryHandler<GetContactByIdQuery>
{
  constructor(private readonly useCase: GetContactByIdUseCase) {
    super();
  }

  async execute(query: GetContactByIdQuery): Promise<ContactViewDto> {
    return this.run(query, () => this.useCase.execute(query.payload));
  }
}
