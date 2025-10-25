import { Inject, Injectable } from '@nestjs/common';

import { UpdateServiceEntryDto, ServiceEntryViewDto } from '@application/dto';
import {
  IServiceEntryRepository,
  IServiceEntryRepositoryToken,
} from '@domain/ports/repositories';
import {
  EntityNotFoundException,
  EntityNotFoundExceptionCode,
  EntityAlreadyExistsException,
  EntityAlreadyExistsExceptionCode,
} from '@domain/exceptions';
import { ServiceEntryMapper } from '@application/mappers';
import { ServiceEntryStatus } from '@domain/entities';

@Injectable()
export class UpdateServiceEntryUseCase {
  constructor(
    @Inject(IServiceEntryRepositoryToken)
    private readonly repository: IServiceEntryRepository,
  ) {}

  async execute(input: UpdateServiceEntryDto): Promise<ServiceEntryViewDto> {
    const { data } = await this.repository.findById(input.id);

    if (!data || data.status === ServiceEntryStatus.DELETED) {
      throw EntityNotFoundException.create(
        EntityNotFoundExceptionCode.SERVICE_ENTRY,
        { id: input.id },
      );
    }

    if (
      input.serviceOrderIdentifier &&
      input.serviceOrderIdentifier !== data.serviceOrderIdentifier
    ) {
      const exists = await this.repository.findByServiceOrderIdentifier(
        input.serviceOrderIdentifier,
      );

      if (exists.data && exists.data.id !== data.id) {
        throw EntityAlreadyExistsException.create(
          EntityAlreadyExistsExceptionCode.SERVICE_ENTRY_ORDER,
          { serviceOrderIdentifier: input.serviceOrderIdentifier },
        );
      }
    }

    data.updateDetails({
      companyName: input.companyName,
      contactName: input.contactName,
      contactEmail: input.contactEmail,
      serviceOrderIdentifier: input.serviceOrderIdentifier,
      category: input.category,
      calibrationCertificateFileId: input.calibrationCertificateFileId,
      attachmentFileIds: input.attachmentFileIds,
    });

    const { data: updated } = await this.repository.update(data);

    if (!updated) {
      throw new Error('Failed to update service entry');
    }

    return ServiceEntryMapper.toViewDto(updated);
  }
}
