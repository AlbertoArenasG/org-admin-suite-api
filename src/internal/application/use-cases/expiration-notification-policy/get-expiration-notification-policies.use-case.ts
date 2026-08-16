import { Inject, Injectable } from '@nestjs/common';

import {
  GetExpirationNotificationPoliciesDto,
  GetExpirationNotificationPoliciesResultDto,
} from '@application/dto';
import { ExpirationNotificationPolicyMapper } from '@application/mappers';
import {
  IExpirationNotificationPolicyReadRepository,
  IExpirationNotificationPolicyReadRepositoryToken,
} from '@domain/ports/repositories';

@Injectable()
export class GetExpirationNotificationPoliciesUseCase {
  constructor(
    @Inject(IExpirationNotificationPolicyReadRepositoryToken)
    private readonly readRepository: IExpirationNotificationPolicyReadRepository,
  ) {}

  async execute(
    input: GetExpirationNotificationPoliciesDto,
  ): Promise<GetExpirationNotificationPoliciesResultDto> {
    const { data, total } = await this.readRepository.findAll(input);

    return {
      items: data.map((policy) =>
        ExpirationNotificationPolicyMapper.toListItemDto(policy),
      ),
      total,
      page: input.page,
      perPage: input.perPage,
    };
  }
}
