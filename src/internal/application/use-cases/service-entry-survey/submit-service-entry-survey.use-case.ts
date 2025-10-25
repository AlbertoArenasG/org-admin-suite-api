import { Inject, Injectable } from '@nestjs/common';
import { createHash } from 'crypto';

import {
  SubmitServiceEntrySurveyDto,
  ServiceEntrySurveyViewDto,
} from '@application/dto';
import {
  IServiceEntryAccessRepository,
  IServiceEntryAccessRepositoryToken,
  IServiceEntryRepository,
  IServiceEntryRepositoryToken,
  IServiceEntrySurveyRepository,
  IServiceEntrySurveyRepositoryToken,
} from '@domain/ports/repositories';
import {
  EntityNotFoundException,
  EntityNotFoundExceptionCode,
  EntityAlreadyExistsException,
  EntityAlreadyExistsExceptionCode,
} from '@domain/exceptions';
import { ServiceEntrySurvey } from '@domain/entities';

@Injectable()
export class SubmitServiceEntrySurveyUseCase {
  constructor(
    @Inject(IServiceEntryAccessRepositoryToken)
    private readonly accessRepository: IServiceEntryAccessRepository,
    @Inject(IServiceEntryRepositoryToken)
    private readonly entryRepository: IServiceEntryRepository,
    @Inject(IServiceEntrySurveyRepositoryToken)
    private readonly surveyRepository: IServiceEntrySurveyRepository,
  ) {}

  async execute(
    input: SubmitServiceEntrySurveyDto,
  ): Promise<ServiceEntrySurveyViewDto> {
    const tokenHash = createHash('sha256').update(input.token).digest('hex');

    const { data: existingSurvey } =
      await this.surveyRepository.findByTokenHash(tokenHash);

    if (existingSurvey) {
      throw EntityAlreadyExistsException.create(
        EntityAlreadyExistsExceptionCode.SERVICE_ENTRY_SURVEY,
        { token: input.token },
      );
    }

    const { data: access } =
      await this.accessRepository.findByTokenHash(tokenHash);

    if (!access) {
      throw EntityNotFoundException.create(
        EntityNotFoundExceptionCode.SERVICE_ENTRY,
        { token: input.token },
      );
    }

    const { data: entry } = await this.entryRepository.findById(
      access.serviceEntryId,
    );

    if (!entry) {
      throw EntityNotFoundException.create(
        EntityNotFoundExceptionCode.SERVICE_ENTRY,
        { id: access.serviceEntryId },
      );
    }

    const survey = new ServiceEntrySurvey({
      serviceEntryId: entry.id,
      accessId: access.id,
      tokenHash,
      staffTreatment: input.staffTreatment,
      responseTime: input.responseTime,
      appearanceAttitude: input.appearanceAttitude,
      documentationDelivery: input.documentationDelivery,
      observations: input.observations ?? null,
    });

    const { data } = await this.surveyRepository.create(survey);

    if (!data) {
      throw new Error('Failed to create survey');
    }

    return {
      id: data.id,
      serviceEntryId: data.serviceEntryId,
      accessId: data.accessId,
      staffTreatment: data.staffTreatment,
      responseTime: data.responseTime,
      appearanceAttitude: data.appearanceAttitude,
      documentationDelivery: data.documentationDelivery,
      observations: data.observations,
      submittedAt: data.submittedAt,
    };
  }
}
