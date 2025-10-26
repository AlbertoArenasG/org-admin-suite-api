import { Inject, Injectable } from '@nestjs/common';

import {
  IServiceEntryReadRepository,
  IServiceEntryReadRepositoryToken,
  IServiceEntryWriteRepository,
  IServiceEntryWriteRepositoryToken,
} from '@domain/ports/repositories';
import {
  EntityNotFoundException,
  EntityNotFoundExceptionCode,
} from '@domain/exceptions';
import { ServiceEntryStatus } from '@domain/entities';

@Injectable()
export class DeleteServiceEntryUseCase {
  constructor(
    @Inject(IServiceEntryReadRepositoryToken)
    private readonly serviceEntryReadRepository: IServiceEntryReadRepository,
    @Inject(IServiceEntryWriteRepositoryToken)
    private readonly serviceEntryWriteRepository: IServiceEntryWriteRepository,
  ) {}

  async execute(id: string): Promise<void> {
    const { data } = await this.serviceEntryReadRepository.findById(id);

    if (!data || data.status === ServiceEntryStatus.DELETED) {
      throw EntityNotFoundException.create(
        EntityNotFoundExceptionCode.SERVICE_ENTRY,
        { id },
      );
    }

    data.markAsDeleted();

    await this.serviceEntryWriteRepository.update(data);
  }
}
