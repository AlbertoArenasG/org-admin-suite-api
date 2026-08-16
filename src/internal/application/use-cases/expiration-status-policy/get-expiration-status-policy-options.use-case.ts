import { Inject, Injectable } from '@nestjs/common';

import {
  GetExpirationStatusPolicyOptionsDto,
  GetExpirationStatusPolicyOptionsResultDto,
} from '@application/dto';
import { ExpirationStatusPolicyMapper } from '@application/mappers';
import { ExpirationStatusPolicyStatus } from '@domain/entities';
import {
  IExpirationStatusPolicyReadRepository,
  IExpirationStatusPolicyReadRepositoryToken,
} from '@domain/ports/repositories';

@Injectable()
export class GetExpirationStatusPolicyOptionsUseCase {
  constructor(
    @Inject(IExpirationStatusPolicyReadRepositoryToken)
    private readonly readRepository: IExpirationStatusPolicyReadRepository,
  ) {}

  async execute(
    input: GetExpirationStatusPolicyOptionsDto,
  ): Promise<GetExpirationStatusPolicyOptionsResultDto> {
    const { data } = await this.readRepository.findOptions({
      search: input.search,
      status: input.status ?? ExpirationStatusPolicyStatus.ACTIVE,
    });

    return data.map((policy) =>
      ExpirationStatusPolicyMapper.toOptionDto(policy),
    );
  }
}
