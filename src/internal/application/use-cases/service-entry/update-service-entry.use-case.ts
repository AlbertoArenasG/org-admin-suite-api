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
  IServiceEntrySurveyReadRepository,
  IServiceEntrySurveyReadRepositoryToken,
  IFileReadRepository,
  IFileReadRepositoryToken,
} from '@domain/ports/repositories';
import {
  EntityNotFoundException,
  EntityNotFoundExceptionCode,
  EntityAlreadyExistsException,
  EntityAlreadyExistsExceptionCode,
  InvalidValueException,
  InvalidValueExceptionCode,
} from '@domain/exceptions';
import { ServiceEntryMapper } from '@application/mappers';
import {
  ServiceEntry,
  ServiceEntryAccess,
  ServiceEntryStatus,
  ServiceEntrySurveyTemplate,
  ServiceEntryCategory,
} from '@domain/entities';
import { ServiceEntryNotifierService } from '@application/services/notification';
import { EnvService } from '@infra/env';
import { genId } from '@src/common/utils';
import {
  buildFilesMetadataForEntry,
  buildInteractionStatusForEntry,
} from '@application/utils';

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
    @Inject(IServiceEntrySurveyReadRepositoryToken)
    private readonly surveyReadRepository: IServiceEntrySurveyReadRepository,
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

    const targetCategory = input.category ?? data.category;

    let calibrationCertificateFileId =
      input.calibrationCertificateFileId !== undefined
        ? input.calibrationCertificateFileId
        : data.calibrationCertificateFileId;

    if (
      targetCategory === ServiceEntryCategory.CALIBRATION &&
      (!calibrationCertificateFileId ||
        calibrationCertificateFileId.length === 0)
    ) {
      throw InvalidValueException.create(InvalidValueExceptionCode.DEFAULT, {
        field: 'calibration_certificate_file_id',
      });
    }

    if (
      targetCategory !== ServiceEntryCategory.CALIBRATION &&
      input.calibrationCertificateFileId === undefined
    ) {
      calibrationCertificateFileId = null;
    }

    const details: Parameters<ServiceEntry['updateDetails']>[0] = {
      companyName: input.companyName,
      contactName: input.contactName,
      contactEmail: input.contactEmail,
      serviceOrderIdentifier: input.serviceOrderIdentifier,
      category: input.category,
      attachmentFileIds: input.attachmentFileIds,
      calibrationCertificateFileId: calibrationCertificateFileId ?? null,
      ...(templateResolution.resolved
        ? {
            surveyTemplateId: templateResolution.template?.id ?? null,
            surveyTemplateVersion: templateResolution.template?.version ?? null,
          }
        : {}),
    };

    data.updateDetails(details);

    const { data: updated } =
      await this.serviceEntryWriteRepository.update(data);

    if (!updated) {
      throw new Error('Failed to update service entry');
    }

    if (emailChanged) {
      await this.refreshAccessTokenAndNotify(updated);
    }

    const [filesMetadata, interactionStatus] = await Promise.all([
      buildFilesMetadataForEntry({
        entry: updated,
        fileReadRepository: this.fileReadRepository,
      }),
      buildInteractionStatusForEntry({
        entry: updated,
        accessReadRepository: this.accessReadRepository,
        surveyReadRepository: this.surveyReadRepository,
      }),
    ]);

    return ServiceEntryMapper.toViewDto(
      updated,
      filesMetadata,
      interactionStatus,
    );
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
