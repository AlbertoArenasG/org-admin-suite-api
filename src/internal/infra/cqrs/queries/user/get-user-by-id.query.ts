import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';

import { UserViewDto } from '@application/dto';
import { GetUserByIdUseCase } from '@application/use-cases';
import { BaseQueryHandler } from '@infra/cqrs/base-query.handler';

export class GetUserByIdQuery {
  private constructor(
    public readonly userId: string,
    public readonly actorIsMaster: boolean,
  ) {}

  static create(userId: string, actorIsMaster: boolean) {
    return new GetUserByIdQuery(userId, actorIsMaster);
  }
}

@QueryHandler(GetUserByIdQuery)
export class GetUserByIdHandler
  extends BaseQueryHandler<GetUserByIdQuery, UserViewDto>
  implements IQueryHandler<GetUserByIdQuery>
{
  constructor(private readonly useCase: GetUserByIdUseCase) {
    super();
  }

  async execute(query: GetUserByIdQuery): Promise<UserViewDto> {
    return this.run(query, () =>
      this.useCase.execute(query.userId, query.actorIsMaster),
    );
  }
}
