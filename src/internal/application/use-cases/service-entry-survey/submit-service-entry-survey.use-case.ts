import { Inject, Injectable } from '@nestjs/common';
import { createHash } from 'crypto';

import {
  SubmitServiceEntrySurveyDto,
  ServiceEntrySurveyViewDto,
} from '@application/dto';
import {
  IServiceEntryAccessReadRepository,
  IServiceEntryAccessReadRepositoryToken,
  IServiceEntryReadRepository,
  IServiceEntryReadRepositoryToken,
  IServiceEntrySurveyReadRepository,
  IServiceEntrySurveyReadRepositoryToken,
  IServiceEntrySurveyWriteRepository,
  IServiceEntrySurveyWriteRepositoryToken,
  IServiceEntrySurveyTemplateReadRepository,
  IServiceEntrySurveyTemplateReadRepositoryToken,
} from '@domain/ports/repositories';
import {
  EntityNotFoundException,
  EntityNotFoundExceptionCode,
  EntityAlreadyExistsException,
  EntityAlreadyExistsExceptionCode,
} from '@domain/exceptions';
import {
  ServiceEntry,
  ServiceEntrySurvey,
  ServiceEntrySurveyAnswer,
  ServiceEntrySurveyQuestion,
  ServiceEntrySurveyQuestionType,
  ServiceEntrySurveyTemplate,
} from '@domain/entities';

@Injectable()
export class SubmitServiceEntrySurveyUseCase {
  constructor(
    @Inject(IServiceEntryAccessReadRepositoryToken)
    private readonly accessReadRepository: IServiceEntryAccessReadRepository,
    @Inject(IServiceEntryReadRepositoryToken)
    private readonly serviceEntryReadRepository: IServiceEntryReadRepository,
    @Inject(IServiceEntrySurveyReadRepositoryToken)
    private readonly surveyReadRepository: IServiceEntrySurveyReadRepository,
    @Inject(IServiceEntrySurveyWriteRepositoryToken)
    private readonly surveyWriteRepository: IServiceEntrySurveyWriteRepository,
    @Inject(IServiceEntrySurveyTemplateReadRepositoryToken)
    private readonly templateReadRepository: IServiceEntrySurveyTemplateReadRepository,
  ) {}

  async execute(
    input: SubmitServiceEntrySurveyDto,
  ): Promise<ServiceEntrySurveyViewDto> {
    const tokenHash = createHash('sha256').update(input.token).digest('hex');

    const { data: access } =
      await this.accessReadRepository.findByTokenHash(tokenHash);

    if (!access) {
      throw EntityNotFoundException.create(
        EntityNotFoundExceptionCode.SERVICE_ENTRY,
        { token: input.token },
      );
    }

    const { data: existingSurvey } =
      await this.surveyReadRepository.findByAccessId(access.id);

    if (existingSurvey) {
      throw EntityAlreadyExistsException.create(
        EntityAlreadyExistsExceptionCode.SERVICE_ENTRY_SURVEY,
        { token: input.token },
      );
    }

    const { data: entry } = await this.serviceEntryReadRepository.findById(
      access.serviceEntryId,
    );

    if (!entry) {
      throw EntityNotFoundException.create(
        EntityNotFoundExceptionCode.SERVICE_ENTRY,
        { id: access.serviceEntryId },
      );
    }

    const template = await this.resolveTemplate(entry);

    const answers = this.validateAnswers(template, input.answers);

    const survey = new ServiceEntrySurvey({
      serviceEntryId: entry.id,
      accessId: access.id,
      tokenHash,
      templateId: template.id,
      templateVersion: template.version,
      answers,
      observations: input.observations ?? null,
    });

    const { data } = await this.surveyWriteRepository.create(survey);

    if (!data) {
      throw new Error('Failed to create survey');
    }

    return {
      id: data.id,
      serviceEntryId: data.serviceEntryId,
      accessId: data.accessId,
      templateId: data.templateId,
      templateVersion: data.templateVersion,
      answers: data.answers,
      observations: data.observations,
      submittedAt: data.submittedAt,
    };
  }

  private async resolveTemplate(
    entry: ServiceEntry,
  ): Promise<ServiceEntrySurveyTemplate> {
    if (!entry.surveyTemplateId || entry.surveyTemplateVersion === null) {
      throw EntityNotFoundException.create(
        EntityNotFoundExceptionCode.SERVICE_ENTRY,
        { id: entry.id, reason: 'survey template missing' },
      );
    }

    const { data } = await this.templateReadRepository.findByIdAndVersion(
      entry.surveyTemplateId,
      entry.surveyTemplateVersion,
    );

    if (!data) {
      throw EntityNotFoundException.create(
        EntityNotFoundExceptionCode.SERVICE_ENTRY,
        { id: entry.id, reason: 'survey template not found' },
      );
    }

    return data;
  }

  private validateAnswers(
    template: ServiceEntrySurveyTemplate,
    answers: SubmitServiceEntrySurveyDto['answers'],
  ): ServiceEntrySurveyAnswer[] {
    const questionMap = new Map(
      template.questions.map((question) => [question.id, question]),
    );

    const normalizedAnswers: ServiceEntrySurveyAnswer[] = [];

    for (const answer of answers) {
      const question = questionMap.get(answer.questionId);
      if (!question) {
        continue;
      }

      if (answer.type !== question.type) {
        throw new Error(`Invalid answer type for question ${question.id}`);
      }

      const isEmptyValue =
        answer.value === undefined ||
        answer.value === null ||
        (typeof answer.value === 'string' && answer.value.trim().length === 0);

      if (question.required && isEmptyValue) {
        throw new Error(`Answer required for question ${question.id}`);
      }

      this.ensureAnswerValueValid(question, answer.value);

      normalizedAnswers.push({
        questionId: question.id,
        type: question.type,
        value: answer.value ?? null,
      });
    }

    template.questions
      .filter((question) => question.required)
      .forEach((question) => {
        const exists = normalizedAnswers.some(
          (answer) => answer.questionId === question.id,
        );
        if (!exists) {
          throw new Error(`Missing answer for question ${question.id}`);
        }
      });

    return normalizedAnswers;
  }

  private ensureAnswerValueValid(
    question: ServiceEntrySurveyQuestion,
    value: string | number | boolean | null | undefined,
  ): void {
    if (value === undefined || value === null) {
      return;
    }

    switch (question.type) {
      case ServiceEntrySurveyQuestionType.RATING: {
        if (typeof value !== 'string') {
          throw new Error(`Invalid rating value for question ${question.id}`);
        }

        const allowed = question.options ?? [];
        if (allowed.length > 0) {
          const match = allowed.some(
            (option) => option.toString() === value.toString(),
          );
          if (!match) {
            throw new Error(
              `Invalid rating option for question ${question.id}`,
            );
          }
        }
        break;
      }
      case ServiceEntrySurveyQuestionType.TEXT: {
        if (typeof value !== 'string') {
          throw new Error(`Invalid text value for question ${question.id}`);
        }
        break;
      }
      default: {
        const validTypes = ['string', 'number', 'boolean'];
        if (!validTypes.includes(typeof value)) {
          throw new Error(
            `Unsupported answer type for question ${question.id}`,
          );
        }
      }
    }
  }
}
