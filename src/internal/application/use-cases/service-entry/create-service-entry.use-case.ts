import { Inject, Injectable } from '@nestjs/common';
import { createHash } from 'crypto';

import {
  CreateServiceEntryDto,
  CreateServiceEntryResultDto,
} from '@application/dto';
import { ServiceEntry, ServiceEntryAccess } from '@domain/entities';
import {
  IServiceEntryRepository,
  IServiceEntryRepositoryToken,
  IServiceEntryAccessRepository,
  IServiceEntryAccessRepositoryToken,
} from '@domain/ports/repositories';
import {
  EntityAlreadyExistsException,
  EntityAlreadyExistsExceptionCode,
} from '@domain/exceptions';
import { ServiceEntryMapper } from '@application/mappers';
import { genId } from '@src/common/utils';
import { ServiceEntryNotifierService } from '@application/services/notification';
import { EnvService } from '@infra/env';

@Injectable()
export class CreateServiceEntryUseCase {
  constructor(
    @Inject(IServiceEntryRepositoryToken)
    private readonly repository: IServiceEntryRepository,
    @Inject(IServiceEntryAccessRepositoryToken)
    private readonly accessRepository: IServiceEntryAccessRepository,
    private readonly notifier: ServiceEntryNotifierService,
    private readonly envService: EnvService,
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

    const rawToken = this.generateToken();
    const hashedToken = this.hashToken(rawToken);

    const access = new ServiceEntryAccess({
      serviceEntryId: data.id,
      tokenHash: hashedToken,
      createdAt: new Date(),
    });

    const accessResult = await this.accessRepository.create(access);
    const publicToken = rawToken;
    data.updateDetails({
      surveyAccessId: accessResult.data?.id ?? access.id,
    });
    await this.repository.update(data);

    await this.notifyServiceEntryCreated(data, publicToken);

    return ServiceEntryMapper.toCreateResultDto(data, publicToken);
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

  private generateToken(): string {
    return genId(36);
  }

  private hashToken(token: string): string {
    return createHash('sha256').update(token).digest('hex');
  }

  private async notifyServiceEntryCreated(
    entry: ServiceEntry,
    rawToken: string,
  ): Promise<void> {
    const baseUrl = this.envService.get('SERVICE_ENTRY_PUBLIC_BASE_URL');
    const publicUrl = `${baseUrl.replace(/\/$/, '')}/${rawToken}`;

    await this.notifier.notifyServiceEntryCreated({
      companyName: entry.companyName,
      contactName: entry.contactName,
      contactEmail: entry.contactEmail,
      contactPhone: null,
      serviceOrderIdentifier: entry.serviceOrderIdentifier,
      publicUrl,
    });
  }
}
