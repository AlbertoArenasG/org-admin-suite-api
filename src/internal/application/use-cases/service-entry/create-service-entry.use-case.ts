import { Inject, Injectable } from '@nestjs/common';

import {
  CreateServiceEntryDto,
  CreateServiceEntryResultDto,
} from '@application/dto';
import { ServiceEntry } from '@domain/entities';
import {
  IServiceEntryRepository,
  IServiceEntryRepositoryToken,
} from '@domain/ports/repositories';
import {
  EntityAlreadyExistsException,
  EntityAlreadyExistsExceptionCode,
} from '@domain/exceptions';
import { ServiceEntryMapper } from '@application/mappers';

@Injectable()
export class CreateServiceEntryUseCase {
  constructor(
    @Inject(IServiceEntryRepositoryToken)
    private readonly repository: IServiceEntryRepository,
  ) {}

  async execute(
    input: CreateServiceEntryDto,
  ): Promise<CreateServiceEntryResultDto> {
    await this.ensureOrderIdentifierUnique(input.serviceOrderIdentifier);

    const entry = new ServiceEntry({
      companyName: input.companyName,
      contactName: input.contactName,
      contactEmail: input.contactEmail,
      serviceOrderIdentifier: input.serviceOrderIdentifier,
      category: input.category,
      calibrationCertificateFileId: input.calibrationCertificateFileId,
      attachmentFileIds: input.attachmentFileIds ?? [],
      createdAt: new Date(),
    });

    const { data } = await this.repository.create(entry);

    if (!data) {
      throw new Error('Failed to create service entry');
    }

    return ServiceEntryMapper.toCreateResultDto(data);
  }

  private async ensureOrderIdentifierUnique(serviceOrderIdentifier: string) {
    const { data } = await this.repository.findByServiceOrderIdentifier(
      serviceOrderIdentifier,
    );

    if (data) {
      throw EntityAlreadyExistsException.create(
        EntityAlreadyExistsExceptionCode.SERVICE_ENTRY_ORDER,
        { serviceOrderIdentifier },
      );
    }
  }
}
