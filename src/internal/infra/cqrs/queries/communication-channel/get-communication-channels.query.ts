import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';

import { CommunicationChannelViewDto } from '@application/dto';
import { GetCommunicationChannelsUseCase } from '@application/use-cases';
import { BaseQueryHandler } from '@infra/cqrs/base-query.handler';

export class GetCommunicationChannelsQuery {
  static create() {
    return new GetCommunicationChannelsQuery();
  }
}

@QueryHandler(GetCommunicationChannelsQuery)
export class GetCommunicationChannelsHandler
  extends BaseQueryHandler<
    GetCommunicationChannelsQuery,
    CommunicationChannelViewDto[]
  >
  implements IQueryHandler<GetCommunicationChannelsQuery>
{
  constructor(private readonly useCase: GetCommunicationChannelsUseCase) {
    super();
  }

  async execute(
    query: GetCommunicationChannelsQuery,
  ): Promise<CommunicationChannelViewDto[]> {
    return this.run(query, () => Promise.resolve(this.useCase.execute()));
  }
}
