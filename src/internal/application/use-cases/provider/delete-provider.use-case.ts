import { Inject, Injectable } from '@nestjs/common';

import {
  IProviderReadRepository,
  IProviderReadRepositoryToken,
  IProviderWriteRepository,
  IProviderWriteRepositoryToken,
} from '@domain/ports/repositories';
import {
  EntityNotFoundException,
  EntityNotFoundExceptionCode,
} from '@domain/exceptions';
import { ProviderStatus } from '@domain/entities';

@Injectable()
export class DeleteProviderUseCase {
  constructor(
    @Inject(IProviderReadRepositoryToken)
    private readonly providerReadRepository: IProviderReadRepository,
    @Inject(IProviderWriteRepositoryToken)
    private readonly providerWriteRepository: IProviderWriteRepository,
  ) {}

  async execute(providerId: string): Promise<void> {
    const { data: provider } =
      await this.providerReadRepository.findById(providerId);

    if (!provider || provider.status === ProviderStatus.DELETED) {
      throw EntityNotFoundException.create(
        EntityNotFoundExceptionCode.PROVIDER,
        { id: providerId },
      );
    }

    provider.markAsDeleted();
    await this.providerWriteRepository.update(provider);
  }
}
