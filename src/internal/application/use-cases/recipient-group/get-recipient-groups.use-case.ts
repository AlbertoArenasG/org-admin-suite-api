import { Inject, Injectable } from '@nestjs/common';

import {
  GetRecipientGroupsDto,
  GetRecipientGroupsResultDto,
} from '@application/dto';
import { RecipientGroupMapper } from '@application/mappers';
import {
  IRecipientGroupReadRepository,
  IRecipientGroupReadRepositoryToken,
} from '@domain/ports/repositories';

@Injectable()
export class GetRecipientGroupsUseCase {
  constructor(
    @Inject(IRecipientGroupReadRepositoryToken)
    private readonly recipientGroupReadRepository: IRecipientGroupReadRepository,
  ) {}

  async execute(
    input: GetRecipientGroupsDto,
  ): Promise<GetRecipientGroupsResultDto> {
    const { data, total } = await this.recipientGroupReadRepository.findAll({
      page: input.page,
      perPage: input.perPage,
      search: input.search,
      status: input.status,
      sorts: input.sorts,
    });

    return {
      items: data.map((recipientGroup) =>
        RecipientGroupMapper.toListItemDto(recipientGroup),
      ),
      total,
      page: input.page,
      perPage: input.perPage,
    };
  }
}
