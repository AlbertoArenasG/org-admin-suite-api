import { Inject, Injectable } from '@nestjs/common';

import {
  IServiceEntryRepository,
  IServiceEntryRepositoryToken,
} from '@domain/ports/repositories';
import {
  EntityNotFoundException,
  EntityNotFoundExceptionCode,
} from '@domain/exceptions';
import { ServiceEntryStatus } from '@domain/entities';

@Injectable()
export class DeleteServiceEntryUseCase {
  constructor(
    @Inject(IServiceEntryRepositoryToken)
    private readonly repository: IServiceEntryRepository,
  ) {}

  async execute(id: string): Promise<void> {
    const { data } = await this.repository.findById(id);

    if (!data || data.status === ServiceEntryStatus.DELETED) {
      throw EntityNotFoundException.create(
        EntityNotFoundExceptionCode.SERVICE_ENTRY,
        { id },
      );
    }

    data.markAsDeleted();

    await this.repository.update(data);
  }
}
