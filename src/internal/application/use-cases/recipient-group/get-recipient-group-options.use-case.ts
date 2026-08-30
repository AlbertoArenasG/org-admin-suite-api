import { Inject, Injectable } from '@nestjs/common';

import {
  GetRecipientGroupOptionsDto,
  GetRecipientGroupOptionsResultDto,
} from '@application/dto';
import {
  IRecipientGroupReadRepository,
  IRecipientGroupReadRepositoryToken,
} from '@domain/ports/repositories';

@Injectable()
export class GetRecipientGroupOptionsUseCase {
  constructor(
    @Inject(IRecipientGroupReadRepositoryToken)
    private readonly readRepository: IRecipientGroupReadRepository,
  ) {}

  async execute(
    input: GetRecipientGroupOptionsDto,
  ): Promise<GetRecipientGroupOptionsResultDto> {
    const { data } = await this.readRepository.findOptions(input.search);
    return data.map((group) => ({
      id: group.id,
      code: group.code,
      name: group.name,
    }));
  }
}
