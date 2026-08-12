import { Inject, Injectable } from '@nestjs/common';

import { GetContactsDto, GetContactsResultDto } from '@application/dto';
import { ContactMapper } from '@application/mappers';
import {
  IContactReadRepository,
  IContactReadRepositoryToken,
} from '@domain/ports/repositories';

@Injectable()
export class GetContactsUseCase {
  constructor(
    @Inject(IContactReadRepositoryToken)
    private readonly contactReadRepository: IContactReadRepository,
  ) {}

  async execute(input: GetContactsDto): Promise<GetContactsResultDto> {
    const { data, total } = await this.contactReadRepository.findAll({
      page: input.page,
      perPage: input.perPage,
      search: input.search,
      status: input.status,
      type: input.type,
      sorts: input.sorts,
    });

    return {
      items: data.map((contact) => ContactMapper.toListItemDto(contact)),
      total,
      page: input.page,
      perPage: input.perPage,
    };
  }
}
