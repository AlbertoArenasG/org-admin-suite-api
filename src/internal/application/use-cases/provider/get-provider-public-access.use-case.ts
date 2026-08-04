import { Inject, Injectable } from '@nestjs/common';

import { ProviderPublicAccessViewDto } from '@application/dto';
import {
  IProviderReadRepository,
  IProviderReadRepositoryToken,
} from '@domain/ports/repositories';
import {
  EntityNotFoundException,
  EntityNotFoundExceptionCode,
} from '@domain/exceptions';
import { ProviderStatus } from '@domain/entities';

@Injectable()
export class GetProviderPublicAccessUseCase {
  constructor(
    @Inject(IProviderReadRepositoryToken)
    private readonly providerReadRepository: IProviderReadRepository,
  ) {}

  async execute(providerId: string): Promise<ProviderPublicAccessViewDto> {
    const { data: provider } =
      await this.providerReadRepository.findById(providerId);

    if (!provider || provider.status === ProviderStatus.DELETED) {
      throw EntityNotFoundException.create(
        EntityNotFoundExceptionCode.PROVIDER,
        { id: providerId },
      );
    }

    return {
      providerId: provider.id,
      publicAccessToken: provider.accessToken ?? null,
    };
  }
}
