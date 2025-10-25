import { Entity } from '@src/internal/core/entities/entity';
import { genId } from '@src/common/utils';

export enum ServiceEntrySurveyRating {
  EXCELLENT = 'EXCELLENT',
  VERY_GOOD = 'VERY_GOOD',
  GOOD = 'GOOD',
  REGULAR = 'REGULAR',
  BAD = 'BAD',
}

export interface ServiceEntrySurveyProps {
  id?: string;
  serviceEntryId: string;
  accessId: string;
  tokenHash: string;
  staffTreatment: ServiceEntrySurveyRating;
  responseTime: ServiceEntrySurveyRating;
  appearanceAttitude: ServiceEntrySurveyRating;
  documentationDelivery: ServiceEntrySurveyRating;
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

  get staffTreatment(): ServiceEntrySurveyRating {
    return this.props.staffTreatment;
  }

  get responseTime(): ServiceEntrySurveyRating {
    return this.props.responseTime;
  }

  get appearanceAttitude(): ServiceEntrySurveyRating {
    return this.props.appearanceAttitude;
  }

  get documentationDelivery(): ServiceEntrySurveyRating {
    return this.props.documentationDelivery;
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
