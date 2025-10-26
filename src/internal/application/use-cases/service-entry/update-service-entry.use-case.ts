import { Inject, Injectable } from '@nestjs/common';
import { createHash } from 'crypto';

import { UpdateServiceEntryDto, ServiceEntryViewDto } from '@application/dto';
import {
  IServiceEntryReadRepository,
  IServiceEntryReadRepositoryToken,
  IServiceEntryWriteRepository,
  IServiceEntryWriteRepositoryToken,
  IServiceEntryAccessReadRepository,
  IServiceEntryAccessReadRepositoryToken,
  IServiceEntryAccessWriteRepository,
  IServiceEntryAccessWriteRepositoryToken,
  IServiceEntrySurveyTemplateReadRepository,
  IServiceEntrySurveyTemplateReadRepositoryToken,
  IFileReadRepository,
  IFileReadRepositoryToken,
} from '@domain/ports/repositories';
import {
  EntityNotFoundException,
  EntityNotFoundExceptionCode,
  EntityAlreadyExistsException,
  EntityAlreadyExistsExceptionCode,
} from '@domain/exceptions';
import { ServiceEntryMapper } from '@application/mappers';
import {
  ServiceEntry,
  ServiceEntryAccess,
  ServiceEntryStatus,
  ServiceEntrySurveyTemplate,
} from '@domain/entities';
import { ServiceEntryNotifierService } from '@application/services/notification';
import { EnvService } from '@infra/env';
import { genId } from '@src/common/utils';
import { buildFilesMetadataForEntry } from '@application/utils';

@Injectable()
export class UpdateServiceEntryUseCase {
  constructor(
    @Inject(IServiceEntryReadRepositoryToken)
    private readonly serviceEntryReadRepository: IServiceEntryReadRepository,
    @Inject(IServiceEntryWriteRepositoryToken)
    private readonly serviceEntryWriteRepository: IServiceEntryWriteRepository,
    @Inject(IServiceEntryAccessReadRepositoryToken)
    private readonly accessReadRepository: IServiceEntryAccessReadRepository,
    @Inject(IServiceEntryAccessWriteRepositoryToken)
    private readonly accessWriteRepository: IServiceEntryAccessWriteRepository,
    @Inject(IServiceEntrySurveyTemplateReadRepositoryToken)
    private readonly templateReadRepository: IServiceEntrySurveyTemplateReadRepository,
    @Inject(IFileReadRepositoryToken)
    private readonly fileReadRepository: IFileReadRepository,
    private readonly notifier: ServiceEntryNotifierService,
    private readonly envService: EnvService,
  ) {}

  async execute(input: UpdateServiceEntryDto): Promise<ServiceEntryViewDto> {
    const { data } = await this.serviceEntryReadRepository.findById(input.id);

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
      const exists =
        await this.serviceEntryReadRepository.findByServiceOrderIdentifier(
          input.serviceOrderIdentifier,
        );

      if (exists.data && exists.data.id !== data.id) {
        throw EntityAlreadyExistsException.create(
          EntityAlreadyExistsExceptionCode.SERVICE_ENTRY_ORDER,
          { serviceOrderIdentifier: input.serviceOrderIdentifier },
        );
      }
    }

    const emailChanged =
      input.contactEmail !== undefined &&
      input.contactEmail !== data.contactEmail;

    const templateResolution = await this.resolveTemplateForUpdate(data, input);

    data.updateDetails({
      companyName: input.companyName,
      contactName: input.contactName,
      contactEmail: input.contactEmail,
      serviceOrderIdentifier: input.serviceOrderIdentifier,
      category: input.category,
      calibrationCertificateFileId: input.calibrationCertificateFileId,
      attachmentFileIds: input.attachmentFileIds,
      ...(templateResolution.resolved
        ? {
            surveyTemplateId: templateResolution.template?.id ?? null,
            surveyTemplateVersion: templateResolution.template?.version ?? null,
          }
        : {}),
    });

    const { data: updated } =
      await this.serviceEntryWriteRepository.update(data);

    if (!updated) {
      throw new Error('Failed to update service entry');
    }

    if (emailChanged) {
      await this.refreshAccessTokenAndNotify(updated);
    }

    const filesMetadata = await buildFilesMetadataForEntry({
      entry: updated,
      fileReadRepository: this.fileReadRepository,
    });

    return ServiceEntryMapper.toViewDto(updated, filesMetadata);
  }

  private async refreshAccessTokenAndNotify(
    entry: ServiceEntry,
  ): Promise<void> {
    let accessRecord = entry.surveyAccessId
      ? (await this.accessReadRepository.findByServiceEntryId(entry.id)).data
      : null;

    const rawToken = genId(36);
    const tokenHash = createHash('sha256').update(rawToken).digest('hex');

    if (accessRecord) {
      accessRecord.updateTokenHash(tokenHash);
      await this.accessWriteRepository.update(accessRecord);
    } else {
      const newAccess = new ServiceEntryAccess({
        serviceEntryId: entry.id,
        tokenHash,
        createdAt: new Date(),
      });
      const { data } = await this.accessWriteRepository.create(newAccess);
      entry.updateDetails({ surveyAccessId: data?.id ?? newAccess.id });
      await this.serviceEntryWriteRepository.update(entry);
      accessRecord = data ?? newAccess;
    }

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

  private async resolveTemplateForUpdate(
    current: ServiceEntry,
    input: UpdateServiceEntryDto,
  ): Promise<{
    resolved: boolean;
    template: ServiceEntrySurveyTemplate | null;
  }> {
    const categoryChanged =
      input.category !== undefined && input.category !== current.category;
    const templateMissing =
      !current.surveyTemplateId || current.surveyTemplateVersion === null;

    if (!categoryChanged && !templateMissing) {
      return { resolved: false, template: null };
    }

    const categoryToUse = input.category ?? current.category;
    const { data } =
      await this.templateReadRepository.findActiveByCategory(categoryToUse);

    return { resolved: true, template: data ?? null };
  }
}
