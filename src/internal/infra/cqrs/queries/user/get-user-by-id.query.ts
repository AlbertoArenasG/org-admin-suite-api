import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';

import { UserViewDto } from '@application/dto';
import { GetUserByIdUseCase } from '@application/use-cases';
import { BaseQueryHandler } from '@infra/cqrs/base-query.handler';
import { SystemRole } from '@domain/entities';

export class GetUserByIdQuery {
  private constructor(
    public readonly userId: string,
    public readonly actorSystemRole: SystemRole,
  ) {}

  static create(userId: string, actorSystemRole: SystemRole) {
    return new GetUserByIdQuery(userId, actorSystemRole);
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
      this.useCase.execute(query.userId, query.actorSystemRole),
    );
  }
}
