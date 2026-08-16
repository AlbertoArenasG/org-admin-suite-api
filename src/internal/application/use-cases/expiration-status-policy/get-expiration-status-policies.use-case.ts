import { Inject, Injectable } from '@nestjs/common';

import {
  GetExpirationStatusPoliciesDto,
  GetExpirationStatusPoliciesResultDto,
} from '@application/dto';
import { ExpirationStatusPolicyMapper } from '@application/mappers';
import {
  IExpirationStatusPolicyReadRepository,
  IExpirationStatusPolicyReadRepositoryToken,
} from '@domain/ports/repositories';

@Injectable()
export class GetExpirationStatusPoliciesUseCase {
  constructor(
    @Inject(IExpirationStatusPolicyReadRepositoryToken)
    private readonly readRepository: IExpirationStatusPolicyReadRepository,
  ) {}

  async execute(
    input: GetExpirationStatusPoliciesDto,
  ): Promise<GetExpirationStatusPoliciesResultDto> {
    const { data, total } = await this.readRepository.findAll(input);

    return {
      items: data.map((policy) =>
        ExpirationStatusPolicyMapper.toListItemDto(policy),
      ),
      total,
      page: input.page,
      perPage: input.perPage,
    };
  }
}
