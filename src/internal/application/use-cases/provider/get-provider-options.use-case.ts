import { Inject, Injectable } from '@nestjs/common';

import {
  GetProviderOptionsDto,
  GetProviderOptionsResultDto,
} from '@application/dto';
import {
  IProviderReadRepository,
  IProviderReadRepositoryToken,
} from '@domain/ports/repositories';

@Injectable()
export class GetProviderOptionsUseCase {
  constructor(
    @Inject(IProviderReadRepositoryToken)
    private readonly readRepository: IProviderReadRepository,
  ) {}

  async execute(
    input: GetProviderOptionsDto,
  ): Promise<GetProviderOptionsResultDto> {
    const { data } = await this.readRepository.findOptions(input.search);
    return data.map((provider) => ({
      id: provider.id,
      code: provider.providerCode,
      name: provider.companyName,
    }));
  }
}
