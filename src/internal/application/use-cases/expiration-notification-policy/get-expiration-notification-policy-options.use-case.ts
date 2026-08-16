import { Inject, Injectable } from '@nestjs/common';

import {
  GetExpirationNotificationPolicyOptionsDto,
  GetExpirationNotificationPolicyOptionsResultDto,
} from '@application/dto';
import { ExpirationNotificationPolicyMapper } from '@application/mappers';
import { ExpirationNotificationPolicyStatus } from '@domain/entities';
import {
  IExpirationNotificationPolicyReadRepository,
  IExpirationNotificationPolicyReadRepositoryToken,
} from '@domain/ports/repositories';

@Injectable()
export class GetExpirationNotificationPolicyOptionsUseCase {
  constructor(
    @Inject(IExpirationNotificationPolicyReadRepositoryToken)
    private readonly readRepository: IExpirationNotificationPolicyReadRepository,
  ) {}

  async execute(
    input: GetExpirationNotificationPolicyOptionsDto,
  ): Promise<GetExpirationNotificationPolicyOptionsResultDto> {
    const { data } = await this.readRepository.findOptions({
      search: input.search,
      status: input.status ?? ExpirationNotificationPolicyStatus.ACTIVE,
    });

    return data.map((policy) =>
      ExpirationNotificationPolicyMapper.toOptionDto(policy),
    );
  }
}
