import { Inject, Injectable } from '@nestjs/common';

import { ContactSearchItemDto, SearchContactsDto } from '@application/dto';
import { ContactMapper } from '@application/mappers';
import {
  IContactReadRepository,
  IContactReadRepositoryToken,
} from '@domain/ports/repositories';

@Injectable()
export class SearchContactsUseCase {
  constructor(
    @Inject(IContactReadRepositoryToken)
    private readonly contactReadRepository: IContactReadRepository,
  ) {}

  async execute(input: SearchContactsDto): Promise<ContactSearchItemDto[]> {
    const { data } = await this.contactReadRepository.search({
      q: input.q,
      limit: input.limit,
    });

    return data.map((contact) => ContactMapper.toSearchItemDto(contact));
  }
}
