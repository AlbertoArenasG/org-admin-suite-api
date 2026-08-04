import { Inject, Injectable } from '@nestjs/common';
import { createHash } from 'crypto';

import {
  CreateServiceEntryDto,
  CreateServiceEntryResultDto,
} from '@application/dto';
import {
  ServiceEntry,
  ServiceEntryAccess,
  ServiceEntrySurveyTemplate,
} from '@domain/entities';
import {
  IServiceEntryReadRepository,
  IServiceEntryReadRepositoryToken,
  IServiceEntryWriteRepository,
  IServiceEntryWriteRepositoryToken,
  IServiceEntryAccessWriteRepository,
  IServiceEntryAccessWriteRepositoryToken,
  IServiceEntrySurveyTemplateReadRepository,
  IServiceEntrySurveyTemplateReadRepositoryToken,
  IFileReadRepository,
  IFileReadRepositoryToken,
} from '@domain/ports/repositories';
import {
  EntityAlreadyExistsException,
  EntityAlreadyExistsExceptionCode,
  InvalidValueException,
  InvalidValueExceptionCode,
} from '@domain/exceptions';
import { ServiceEntryMapper } from '@application/mappers';
import { genId } from '@src/common/utils';
import { ServiceEntryNotifierService } from '@application/services/notification';
import { EnvService } from '@infra/env';
import {
  buildFilesMetadataForEntry,
  createEmptyServiceEntryInteractionStatus,
} from '@application/utils';

@Injectable()
export class CreateServiceEntryUseCase {
  constructor(
    @Inject(IServiceEntryReadRepositoryToken)
    private readonly serviceEntryReadRepository: IServiceEntryReadRepository,
    @Inject(IServiceEntryWriteRepositoryToken)
    private readonly serviceEntryWriteRepository: IServiceEntryWriteRepository,
    @Inject(IServiceEntryAccessWriteRepositoryToken)
    private readonly serviceEntryAccessWriteRepository: IServiceEntryAccessWriteRepository,
    @Inject(IServiceEntrySurveyTemplateReadRepositoryToken)
    private readonly templateReadRepository: IServiceEntrySurveyTemplateReadRepository,
    @Inject(IFileReadRepositoryToken)
    private readonly fileReadRepository: IFileReadRepository,
    private readonly notifier: ServiceEntryNotifierService,
    private readonly envService: EnvService,
  ) {}

  async execute(
    input: CreateServiceEntryDto,
  ): Promise<CreateServiceEntryResultDto> {
    await this.ensureOrderIdentifierUnique(input.serviceOrderIdentifier);

    const template = await this.resolveTemplate(input.category);

    if (
      input.category === ServiceEntryCategory.CALIBRATION &&
      (!input.calibrationCertificateFileId ||
        input.calibrationCertificateFileId.length === 0)
    ) {
      throw InvalidValueException.create(InvalidValueExceptionCode.DEFAULT, {
        field: 'calibration_certificate_file_id',
      });
    }

    const entry = new ServiceEntry({
      companyName: input.companyName,
      contactName: input.contactName,
      contactEmail: input.contactEmail,
      serviceOrderIdentifier: input.serviceOrderIdentifier,
      category: input.category,
      calibrationCertificateFileId:
        input.category === ServiceEntryCategory.CALIBRATION
          ? (input.calibrationCertificateFileId ?? null)
          : (input.calibrationCertificateFileId ?? null),
      attachmentFileIds: input.attachmentFileIds ?? [],
      surveyTemplateId: template?.id ?? null,
      surveyTemplateVersion: template?.version ?? null,
      createdAt: new Date(),
    });

    const { data } = await this.serviceEntryWriteRepository.create(entry);

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

    const accessResult =
      await this.serviceEntryAccessWriteRepository.create(access);
    const publicToken = rawToken;
    data.updateDetails({
      surveyAccessId: accessResult.data?.id ?? access.id,
    });
    await this.serviceEntryWriteRepository.update(data);

    await this.notifyServiceEntryCreated(data, publicToken);

    const filesMetadata = await buildFilesMetadataForEntry({
      entry: data,
      fileReadRepository: this.fileReadRepository,
    });

    return ServiceEntryMapper.toCreateResultDto(
      data,
      filesMetadata,
      createEmptyServiceEntryInteractionStatus(),
    );
  }

  private async ensureOrderIdentifierUnique(serviceOrderIdentifier: string) {
    const { data } =
      await this.serviceEntryReadRepository.findByServiceOrderIdentifier(
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

  private async resolveTemplate(
    category: string,
  ): Promise<ServiceEntrySurveyTemplate | null> {
    const { data } = await this.templateReadRepository.findActiveByCategory(
      category ?? null,
    );
    return data;
  }
}
import { ServiceEntryCategory } from '@domain/entities';
