import { Inject, Injectable } from '@nestjs/common';

import { ServiceEntryMapper } from '@application/mappers';
import { ServiceEntryViewDto } from '@application/dto';
import {
  IServiceEntryRepository,
  IServiceEntryRepositoryToken,
  IServiceEntryAccessRepository,
  IServiceEntryAccessRepositoryToken,
} from '@domain/ports/repositories';
import {
  EntityNotFoundException,
  EntityNotFoundExceptionCode,
} from '@domain/exceptions';
import { ServiceEntryStatus } from '@domain/entities';
import { createHash } from 'crypto';

@Injectable()
export class GetServiceEntryByTokenUseCase {
  constructor(
    @Inject(IServiceEntryRepositoryToken)
    private readonly repository: IServiceEntryRepository,
    @Inject(IServiceEntryAccessRepositoryToken)
    private readonly accessRepository: IServiceEntryAccessRepository,
  ) {}

  async execute(token: string): Promise<ServiceEntryViewDto> {
    const tokenHash = createHash('sha256').update(token).digest('hex');
    const { data: access } =
      await this.accessRepository.findByTokenHash(tokenHash);

    if (!access) {
      throw EntityNotFoundException.create(
        EntityNotFoundExceptionCode.SERVICE_ENTRY,
        { token },
      );
    }

    const { data: entry } = await this.repository.findById(
      access.serviceEntryId,
    );

    if (!entry || entry.status === ServiceEntryStatus.DELETED) {
      throw EntityNotFoundException.create(
        EntityNotFoundExceptionCode.SERVICE_ENTRY,
        { token },
      );
    }

    access.markViewed();
    await this.accessRepository.update(access);

    return ServiceEntryMapper.toViewDto(entry);
  }
}
