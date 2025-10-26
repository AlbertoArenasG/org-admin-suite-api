import { Entity } from '@src/internal/core/entities/entity';
import { genId } from '@src/common/utils';
import { ServiceEntrySurveyQuestionType } from './service-entry-survey-template.entity';

export interface ServiceEntrySurveyAnswer {
  questionId: string;
  type: ServiceEntrySurveyQuestionType;
  value: string | number | boolean | null;
}

export interface ServiceEntrySurveyProps {
  id?: string;
  serviceEntryId: string;
  accessId: string;
  tokenHash: string;
  templateId: string;
  templateVersion: number;
  answers: ServiceEntrySurveyAnswer[];
  observations?: string | null;
  submittedAt?: Date;
  updatedAt?: Date;
}

export class ServiceEntrySurvey extends Entity<ServiceEntrySurveyProps> {
  constructor(props: ServiceEntrySurveyProps) {
    if (!props.id) {
      props.id = genId();
    }

    props.observations = props.observations ?? null;
    props.submittedAt = props.submittedAt ?? new Date();

    super(props);
  }

  get id(): string {
    return this.props.id!;
  }

  get serviceEntryId(): string {
    return this.props.serviceEntryId;
  }

  get accessId(): string {
    return this.props.accessId;
  }

  get tokenHash(): string {
    return this.props.tokenHash;
  }

  get templateId(): string {
    return this.props.templateId;
  }

  get templateVersion(): number {
    return this.props.templateVersion;
  }

  get answers(): ServiceEntrySurveyAnswer[] {
    return this.props.answers;
  }

  get observations(): string | null {
    return this.props.observations ?? null;
  }

  get submittedAt(): Date {
    return this.props.submittedAt ?? new Date();
  }

  get updatedAt(): Date | undefined {
    return this.props.updatedAt;
  }
}
